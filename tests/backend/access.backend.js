// P02-02: row-level rules, checked from outside like a stranger with only the public key.
// Runs against the TEST project only: npm run test:backend (reads .env).
import { test } from 'node:test';
import assert from 'node:assert/strict';

const url = process.env.SUPABASE_TEST_URL;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;
if (!url || !anonKey) throw new Error('SUPABASE_TEST_URL / SUPABASE_TEST_ANON_KEY missing: fill .env (see .env.example)');

// Calls the REST API as the anonymous role.
async function anon(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { apikey: anonKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

// Postgres "insufficient privilege". A missing table gives PGRST205 instead, so
// "denied" can't pass by accident before the tables exist.
function assertDenied(res) {
  assert.equal(res.body?.code, '42501', `expected permission denied, got ${res.status} ${JSON.stringify(res.body)}`);
}

const fakeReading = {
  device_id: '00000000-0000-0000-0000-000000000000',
  recorded_at: new Date().toISOString(),
  temp_c: 30, rh_pct: 60, temp_offset_c: 0, rh_offset_pct: 0, heat_index_c: 33, room: 'Unassigned',
};

test('anyone can read readings', async () => {
  const res = await anon('readings?select=recorded_at,temp_c,rh_pct,heat_index_c&limit=1');
  assert.equal(res.status, 200, JSON.stringify(res.body));
});

test('anyone can read hourly summaries, settings and device status', async () => {
  for (const path of ['readings_hourly?limit=1', 'settings?limit=1', 'device_status?limit=1']) {
    const res = await anon(path);
    assert.equal(res.status, 200, `${path}: ${JSON.stringify(res.body)}`);
  }
});

test('an anonymous insert into readings is denied', async () => {
  assertDenied(await anon('readings', { method: 'POST', body: fakeReading }));
});

test('an anonymous insert into readings_hourly is denied', async () => {
  assertDenied(await anon('readings_hourly', { method: 'POST', body: { device_id: fakeReading.device_id, hour: '2026-01-01T00:00:00Z', n: 1 } }));
});

test('an anonymous update of settings is denied', async () => {
  assertDenied(await anon('settings?interval_s=gt.0', { method: 'PATCH', body: { interval_s: 60 } }));
});

test('an anonymous delete of readings is denied', async () => {
  assertDenied(await anon('readings?id=gt.0', { method: 'DELETE' }));
});

test('the devices table (with key hashes) cannot be read', async () => {
  assertDenied(await anon('devices?select=key_hash'));
});

// The secret key bypasses row-level rules, like the ingest function will. If it can write and
// anon can then read the row, the denials above are about the role, not a broken table.
test('a row written with the secret key is visible to anyone, but not its key hash', async () => {
  const serviceKey = process.env.SUPABASE_TEST_SERVICE_KEY;
  assert.ok(serviceKey, 'SUPABASE_TEST_SERVICE_KEY missing in .env');
  const admin = (path, method, body) => fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: body && JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => null) }));

  const device = await admin('devices', 'POST', { name: 'test device', key_hash: 'a'.repeat(64) });
  assert.equal(device.status, 201, JSON.stringify(device.body));
  const id = device.body[0].id;
  try {
    const reading = await admin('readings', 'POST', { ...fakeReading, device_id: id });
    assert.equal(reading.status, 201, JSON.stringify(reading.body));

    const seen = await anon(`readings?device_id=eq.${id}&select=temp_c,rh_pct`);
    assert.deepEqual(seen.body, [{ temp_c: 30, rh_pct: 60 }]);
    const status = await anon(`device_status?id=eq.${id}`);
    assert.equal(status.body[0]?.name, 'test device');
    assert.equal(status.body[0]?.room, 'Unassigned', 'a new device starts in "Unassigned" (F-21)');
    assertDenied(await anon(`devices?id=eq.${id}&select=key_hash`));
  } finally {
    await admin(`devices?id=eq.${id}`, 'DELETE'); // cascades to its readings
  }
});

test('the public can read the room, and every reading keeps its room (F-21)', async () => {
  for (const path of ['device_status?select=room&limit=1', 'readings?select=room&limit=1', 'readings_hourly?select=room&limit=1']) {
    const res = await anon(path);
    assert.equal(res.status, 200, `${path}: ${JSON.stringify(res.body)}`);
  }
});

test('an anonymous change of the device room is denied (F-21)', async () => {
  assertDenied(await anon('devices?room=neq.x', { method: 'PATCH', body: { room: 'Hacked' } }));
});

test('an anonymous insert of a device is denied', async () => {
  assertDenied(await anon('devices', { method: 'POST', body: { name: 'fake', key_hash: 'x' } }));
});
