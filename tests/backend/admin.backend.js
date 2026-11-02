// P05-01 / P05-05 (S-4, S-10): who may change settings and the room. Three callers: a stranger (anon), a signed-in user
// who is NOT the admin, and the admin. Admin = a user id in the `admins` table, never just "signed in".
// Uses its own throwaway devices and users only, so it can run alone at any time (it does not wipe init-test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anon, service, asUser, makeDevice, makeUser, ingest, minutesFromNow } from './_helpers.js';

/** A write was refused: an error status, or a row-level rule that matched no row (empty answer). */
const refused = (res) => res.status >= 400 || (Array.isArray(res.body) && res.body.length === 0);
const patchSettings = (who, deviceId, body) =>
  who(`settings?device_id=eq.${deviceId}`, { method: 'PATCH', body });
const asAnon = anon;
const readSettings = async (deviceId) => (await service(`settings?device_id=eq.${deviceId}`)).body[0];
const readRoom = async (deviceId) => (await service(`devices?id=eq.${deviceId}`)).body[0].room;

/** Run fn with a device that has settings, one non-admin user and one admin user; always clean up. */
async function withActors(fn) {
  const device = await makeDevice({ room: 'Room 204', settings: { interval_s: 60 } });
  const stranger = await makeUser();
  const admin = await makeUser();
  try {
    assert.ok([200, 201, 204].includes((await admin.makeAdmin()).status), 'could not make the test admin');
    await fn({
      device,
      asStranger: (path, opts) => asUser(stranger.token, path, opts),
      asAdmin: (path, opts) => asUser(admin.token, path, opts),
      stranger,
      admin,
    });
  } finally {
    await device.cleanup();
    await stranger.cleanup();
    await admin.cleanup();
  }
}

test('settings: anon and a signed-in non-admin are refused; the values do not change', async () => {
  await withActors(async ({ device, asStranger }) => {
    for (const [name, who] of [['anon', asAnon], ['non-admin', asStranger]]) {
      for (const body of [
        { interval_s: 120 }, { temp_offset_c: 1.5 }, { rh_offset_pct: 2 }, { alert_heat_index_c: 33 }, { alert_quiet_min: 30 },
      ]) {
        assert.ok(refused(await patchSettings(who, device.id, body)), `${name} changed ${JSON.stringify(body)}`);
      }
      assert.ok(refused(await who('settings', { method: 'POST', body: { device_id: device.id } })), `${name} inserted`);
      assert.ok(refused(await who(`settings?device_id=eq.${device.id}`, { method: 'DELETE' })), `${name} deleted`);
    }
    const s = await readSettings(device.id);
    assert.equal(s.interval_s, 60);
    assert.equal(Number(s.temp_offset_c), 0);
    assert.equal(Number(s.rh_offset_pct), 0);
    assert.equal(Number(s.alert_heat_index_c), 42);
    assert.equal(s.alert_quiet_min, 60);
  });
});

test('settings: the admin may change each value in range, and nothing else', async () => {
  await withActors(async ({ device, asAdmin }) => {
    const ok = await patchSettings(asAdmin, device.id, {
      interval_s: 120, temp_offset_c: -1.5, rh_offset_pct: 2, alert_heat_index_c: 38, alert_quiet_min: 30,
    });
    assert.equal(ok.status, 200, JSON.stringify(ok.body));
    const s = await readSettings(device.id);
    assert.equal(s.interval_s, 120);
    assert.equal(Number(s.temp_offset_c), -1.5);
    assert.equal(Number(s.rh_offset_pct), 2);
    assert.equal(Number(s.alert_heat_index_c), 38);
    assert.equal(s.alert_quiet_min, 30);
    // The device id cannot be moved to another device, and rows cannot be added or removed.
    assert.ok(refused(await patchSettings(asAdmin, device.id, { device_id: crypto.randomUUID() })), 'moved device_id');
    assert.ok(refused(await asAdmin(`settings?device_id=eq.${device.id}`, { method: 'DELETE' })), 'admin deleted a row');
    assert.ok(refused(await asAdmin('settings', { method: 'POST', body: { device_id: device.id } })), 'admin inserted');
  });
});

test('settings: even the admin is refused out-of-range values (database CHECK)', async () => {
  await withActors(async ({ device, asAdmin }) => {
    for (const body of [
      { interval_s: 59 }, { interval_s: 3601 }, { temp_offset_c: 5.1 }, { temp_offset_c: -5.1 },
      { rh_offset_pct: 10.1 }, { rh_offset_pct: -10.1 }, { alert_heat_index_c: 26 }, { alert_heat_index_c: 61 },
      { alert_quiet_min: 9 }, { alert_quiet_min: 1441 },
    ]) {
      const res = await patchSettings(asAdmin, device.id, body);
      assert.ok(res.status >= 400, `admin saved ${JSON.stringify(body)}: ${res.status}`);
    }
    assert.equal((await readSettings(device.id)).interval_s, 60);
  });
});

test('room: only the admin can change it; text is trimmed and kept to 1-60 characters', async () => {
  await withActors(async ({ device, asStranger, asAdmin }) => {
    const set = (who, room) => who('rpc/admin_set_room', { method: 'POST', body: { p_device: device.id, p_room: room } });
    assert.ok(refused(await set(asAnon, 'Room 1')), 'anon changed the room');
    assert.ok(refused(await set(asStranger, 'Room 1')), 'non-admin changed the room');
    assert.equal(await readRoom(device.id), 'Room 204');

    for (const bad of ['', '   ', 'x'.repeat(61)]) {
      assert.ok((await set(asAdmin, bad)).status >= 400, `admin saved ${JSON.stringify(bad)}`);
    }
    assert.equal(await readRoom(device.id), 'Room 204');

    const ok = await set(asAdmin, '  Room 305  ');
    assert.ok(ok.status < 300, JSON.stringify(ok.body));
    assert.equal(await readRoom(device.id), 'Room 305');
    assert.ok((await set(asAdmin, 'x'.repeat(60))).status < 300);
  });
});

test('room: new readings get the new room, old readings keep theirs (F-21)', async () => {
  await withActors(async ({ device, asAdmin }) => {
    const first = await ingest(device.key, [{ recorded_at: minutesFromNow(-3), temp_c: 30, rh_pct: 60 }]);
    assert.equal(first.status, 200, JSON.stringify(first.body));
    await service(`devices?id=eq.${device.id}`, { method: 'PATCH', body: { last_seen_at: minutesFromNow(-5) } }); // clear the rate check
    const moved = await asAdmin('rpc/admin_set_room', { method: 'POST', body: { p_device: device.id, p_room: 'Room 305' } });
    assert.ok(moved.status < 300, JSON.stringify(moved.body));
    const second = await ingest(device.key, [{ recorded_at: minutesFromNow(-1), temp_c: 31, rh_pct: 60 }]);
    assert.equal(second.status, 200, JSON.stringify(second.body));
    assert.deepEqual((await device.readings()).map((r) => r.room), ['Room 204', 'Room 305']);
  });
});

test('admins table and is_admin(): no one can read or write the list; is_admin answers only the signed-in', async () => {
  await withActors(async ({ stranger, admin, asStranger, asAdmin }) => {
    for (const [name, who] of [['anon', asAnon], ['non-admin', asStranger], ['admin', asAdmin]]) {
      assert.ok(refused(await who('admins')), `${name} read admins`);
      assert.ok(refused(await who('admins', { method: 'POST', body: { user_id: stranger.id } })), `${name} added an admin`);
      assert.ok(refused(await who(`admins?user_id=eq.${admin.id}`, { method: 'DELETE' })), `${name} removed an admin`);
    }
    assert.ok((await service('admins')).body.some((r) => r.user_id === admin.id), 'the admin row was removed');
    assert.ok(!(await service('admins')).body.some((r) => r.user_id === stranger.id), 'a stranger became admin');

    assert.ok((await asAnon('rpc/is_admin', { method: 'POST', body: {} })).status >= 400, 'anon may call is_admin');
    const s = await asStranger('rpc/is_admin', { method: 'POST', body: {} });
    assert.equal(s.status, 200);
    assert.equal(s.body, false);
    const a = await asAdmin('rpc/is_admin', { method: 'POST', body: {} });
    assert.equal(a.status, 200);
    assert.equal(a.body, true);
  });
});

test('data tables: nobody, not even the admin, can write readings or read the device key', async () => {
  await withActors(async ({ device, asStranger, asAdmin }) => {
    const row = { device_id: device.id, room: 'x', recorded_at: minutesFromNow(-1), temp_c: 30, rh_pct: 60 };
    for (const [name, who] of [['anon', asAnon], ['non-admin', asStranger], ['admin', asAdmin]]) {
      assert.ok(refused(await who('readings', { method: 'POST', body: row })), `${name} inserted a reading`);
      assert.ok(refused(await who(`readings?device_id=eq.${device.id}`, { method: 'PATCH', body: { temp_c: 1 } })), `${name} edited readings`);
      assert.ok(refused(await who(`readings?device_id=eq.${device.id}`, { method: 'DELETE' })), `${name} deleted readings`);
      assert.ok(refused(await who('devices?select=key_hash')), `${name} read key_hash`);
      assert.ok(refused(await who(`devices?id=eq.${device.id}`, { method: 'PATCH', body: { room: 'hack' } })), `${name} edited devices`);
    }
    assert.equal(await readRoom(device.id), 'Room 204');
  });
});

test('admin access ends when the admin row is removed, and a forged token is refused', async () => {
  await withActors(async ({ device, admin, asAdmin }) => {
    assert.equal((await patchSettings(asAdmin, device.id, { interval_s: 90 })).status, 200);
    await admin.removeAdmin();
    assert.ok(refused(await patchSettings(asAdmin, device.id, { interval_s: 100 })), 'removed admin still changed settings');
    assert.equal((await readSettings(device.id)).interval_s, 90);
    const forged = (path, opts) => asUser(`${admin.token.slice(0, -4)}AAAA`, path, opts);
    assert.ok(refused(await patchSettings(forged, device.id, { interval_s: 110 })), 'forged token changed settings');
  });
});
