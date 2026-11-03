// P05-04 (F-17, P5-i): device health. The device may add a `health` object to an upload: Wi-Fi signal (rssi_dbm),
// reset_reason and fw_version. The server validates it, keeps only the latest per device, and only the admin may read it.
// Uses its own throwaway devices and users only, so it can run alone at any time (it does not wipe init-test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anon, service, asUser, makeDevice, makeUser, minutesFromNow } from './_helpers.js';

const reading = (minutes = -1) => ({ recorded_at: minutesFromNow(minutes), temp_c: 30.1, rh_pct: 60 });
const good = { rssi_dbm: -67, reset_reason: 'POWERON', fw_version: '0.5.0' };
const upload = (device, health, readings = [reading()]) =>
  anon('rpc/ingest_reading', {
    method: 'POST',
    body: { device_key: device.key, readings, ...(health !== undefined && { health }) },
  });
const readHealth = async (deviceId) => (await service(`device_health?device_id=eq.${deviceId}`)).body;
/** The 30 s rate limit looks at last_seen_at: move it back so the same device can upload again. */
const letRateLimitPass = (deviceId) =>
  service(`devices?id=eq.${deviceId}`, { method: 'PATCH', body: { last_seen_at: minutesFromNow(-5) } });

test('health: a valid upload stores the three values and the reply is unchanged', async () => {
  const device = await makeDevice({ settings: { interval_s: 60 } });
  try {
    const res = await upload(device, good);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.deepEqual(Object.keys(res.body).sort(), ['duplicates', 'interval_s', 'room', 'saved']);
    const rows = await readHealth(device.id);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].rssi_dbm, -67);
    assert.equal(rows[0].reset_reason, 'POWERON');
    assert.equal(rows[0].fw_version, '0.5.0');
    assert.ok(rows[0].reported_at);
  } finally {
    await device.cleanup();
  }
});

test('health: only the latest is kept (a second upload replaces the first)', async () => {
  const device = await makeDevice();
  try {
    assert.equal((await upload(device, good)).status, 200);
    await letRateLimitPass(device.id);
    const res = await upload(device, { rssi_dbm: -82, reset_reason: 'TASK_WDT', fw_version: '0.5.1' }, [reading(-0.5)]);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const rows = await readHealth(device.id);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].rssi_dbm, -82);
    assert.equal(rows[0].reset_reason, 'TASK_WDT');
    assert.equal(rows[0].fw_version, '0.5.1');
  } finally {
    await device.cleanup();
  }
});

test('health: an upload without health still works (current firmware) and leaves the old health alone', async () => {
  const device = await makeDevice();
  try {
    const first = await upload(device); // no health key at all
    assert.equal(first.status, 200, JSON.stringify(first.body));
    assert.equal((await readHealth(device.id)).length, 0);
    assert.equal((await upload(device, good, [reading(-3)])).status, 429, 'rate limit still applies');
    await letRateLimitPass(device.id);
    assert.equal((await upload(device, good, [reading(-2)])).status, 200);
    await letRateLimitPass(device.id);
    assert.equal((await upload(device, undefined, [reading(-1)])).status, 200);
    const rows = await readHealth(device.id);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].rssi_dbm, -67);
  } finally {
    await device.cleanup();
  }
});

test('health: bad values refuse the whole call (nothing saved, no health row)', async () => {
  const bad = {
    'rssi above 0': { ...good, rssi_dbm: 5 },
    'rssi below -120': { ...good, rssi_dbm: -121 },
    'rssi not a whole number': { ...good, rssi_dbm: -67.5 },
    'rssi as text': { ...good, rssi_dbm: '-67' },
    'unknown reset reason': { ...good, reset_reason: 'MAGIC' },
    'reset reason not text': { ...good, reset_reason: 3 },
    'version with markup': { ...good, fw_version: '<b>1</b>' },
    'version too long': { ...good, fw_version: '1'.repeat(21) },
    'version empty': { ...good, fw_version: '' },
    'extra field': { ...good, uptime_s: 5 },
    'missing field': { rssi_dbm: -67, reset_reason: 'POWERON' },
    'not an object': 'POWERON',
    'an array': [good],
  };
  for (const [name, health] of Object.entries(bad)) {
    const device = await makeDevice();
    try {
      const res = await upload(device, health);
      assert.equal(res.status, 400, `${name}: ${res.status} ${JSON.stringify(res.body)}`);
      assert.equal(res.body.message, 'bad_health', name);
      assert.equal((await device.readings()).length, 0, `${name}: a reading was saved`);
      assert.equal((await readHealth(device.id)).length, 0, `${name}: health was saved`);
    } finally {
      await device.cleanup();
    }
  }
});

test('health: a wrong key stores nothing and a bad reading with good health stores no health', async () => {
  const device = await makeDevice();
  try {
    const wrong = await anon('rpc/ingest_reading', {
      method: 'POST', body: { device_key: 'x'.repeat(64), readings: [reading()], health: good },
    });
    assert.equal(wrong.status, 403);
    const hot = await upload(device, good, [{ ...reading(), temp_c: 99 }]);
    assert.equal(hot.status, 400);
    assert.equal((await readHealth(device.id)).length, 0);
  } finally {
    await device.cleanup();
  }
});

test('health: only the admin reads it; nobody writes it from outside', async () => {
  const device = await makeDevice();
  const stranger = await makeUser();
  const admin = await makeUser();
  try {
    assert.equal((await upload(device, good)).status, 200);
    assert.ok([200, 201, 204].includes((await admin.makeAdmin()).status), 'could not make the test admin');
    const path = `device_health?device_id=eq.${device.id}`;
    const seen = (res) => res.status === 200 && res.body.length > 0;
    assert.ok(!seen(await anon(path)), 'anon read health');
    assert.ok(!seen(await asUser(stranger.token, path)), 'a non-admin read health');
    const asAdmin = await asUser(admin.token, path);
    assert.ok(seen(asAdmin), `admin could not read health: ${JSON.stringify(asAdmin.body)}`);
    assert.equal(asAdmin.body[0].rssi_dbm, -67);
    // Writes from outside: refused for everyone, the admin included (only ingest_reading writes it).
    const refused = (res) => res.status >= 400 || (Array.isArray(res.body) && res.body.length === 0);
    for (const [name, who] of [['anon', anon], ['non-admin', (p, o) => asUser(stranger.token, p, o)], ['admin', (p, o) => asUser(admin.token, p, o)]]) {
      assert.ok(refused(await who(path, { method: 'PATCH', body: { rssi_dbm: -1 } })), `${name} changed health`);
      assert.ok(refused(await who('device_health', { method: 'POST', body: { device_id: device.id, ...good } })), `${name} inserted health`);
      assert.ok(refused(await who(path, { method: 'DELETE' })), `${name} deleted health`);
    }
    assert.equal((await readHealth(device.id))[0].rssi_dbm, -67);
  } finally {
    await device.cleanup();
    await stranger.cleanup();
    await admin.cleanup();
  }
});
