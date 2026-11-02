// P04-04 (F-04): history(range_hours, for_device) gives the charts averaged buckets, so the page never downloads the
// raw one-a-minute rows: 24 h -> 15 minute buckets (at most 97), 168 h -> hourly buckets (at most 169).
// Uses its own throwaway device only; it does not touch the board's rows in the test project.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anon, service, makeDevice } from './_helpers.js';

const MIN = 60_000, HOUR = 3_600_000;
// The start of a UTC hour 3 h ago: a whole 15 minute and a whole hour boundary, well inside both windows.
const H = Math.floor((Date.now() - 3 * HOUR) / HOUR) * HOUR;
const at = (minutes) => new Date(H + minutes * MIN).toISOString();
const row = (device, minutes, temp_c, rh_pct, heat_index_c) =>
  ({ device_id: device.id, room: 'Room 204', recorded_at: at(minutes), temp_c, rh_pct, heat_index_c });

async function insertReadings(rows) {
  const res = await service('readings', { method: 'POST', body: rows });
  assert.equal(res.status, 201, JSON.stringify(res.body));
}
const history = (range_hours, device) => anon('rpc/history', { method: 'POST', body: { range_hours, for_device: device.id } });

test('24 h: readings are averaged per 15 minute bucket, oldest first; a bucket with no heat index gives null', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  try {
    await insertReadings([
      row(device, 1, 30.0, 60, 33.0),   // bucket H+0:00
      row(device, 5, 31.0, 62, 35.0),   // same bucket: avg 30.5, 61, 34.0
      row(device, 16, 25.0, 50, null),  // bucket H+0:15, below the heat index range
      row(device, 59, 26.0, 52, null),  // bucket H+0:45
    ]);
    const res = await history(24, device);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.deepEqual(res.body, [
      { bucket: at(0).replace('.000Z', '+00:00'), temp_c: 30.5, rh_pct: 61, heat_index_c: 34 },
      { bucket: at(15).replace('.000Z', '+00:00'), temp_c: 25, rh_pct: 50, heat_index_c: null },
      { bucket: at(45).replace('.000Z', '+00:00'), temp_c: 26, rh_pct: 52, heat_index_c: null },
    ]);
  } finally { await device.cleanup(); }
});

test('168 h: readings are averaged per hour', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  try {
    await insertReadings([row(device, 1, 30.0, 60, 33.0), row(device, 40, 32.0, 64, 37.0), row(device, 61, 28.0, 70, null)]);
    const res = await history(168, device);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.length, 2);
    assert.deepEqual(res.body.map((b) => [b.temp_c, b.rh_pct, b.heat_index_c]), [[31, 62, 35], [28, 70, null]]);
  } finally { await device.cleanup(); }
});

test('readings older than the window and other devices are left out', async () => {
  const mine = await makeDevice({ room: 'Room 204' });
  const other = await makeDevice({ room: 'Room 105' });
  try {
    await insertReadings([
      row(mine, 1, 30.0, 60, 33.0),
      { device_id: mine.id, room: 'Room 204', recorded_at: new Date(Date.now() - 30 * HOUR).toISOString(), temp_c: 20, rh_pct: 40, heat_index_c: null },
      row(other, 1, 35.0, 80, 50.0),
    ]);
    const day = await history(24, mine);
    assert.equal(day.body.length, 1);
    assert.equal(day.body[0].temp_c, 30);
    assert.equal((await history(168, mine)).body.length, 2); // the 30 h old one is inside 7 days
  } finally { await mine.cleanup(); await other.cleanup(); }
});

test('only 24 and 168 hours are allowed, so nobody can ask for the whole table', async () => {
  const device = await makeDevice();
  try {
    for (const bad of [0, 1, 25, 169, 2000, -24, null]) {
      const res = await history(bad, device);
      assert.equal(res.status, 400, `range ${bad}: ${JSON.stringify(res.body)}`);
    }
  } finally { await device.cleanup(); }
});

test('a device with no readings gives an empty list', async () => {
  const device = await makeDevice();
  try {
    const res = await history(24, device);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  } finally { await device.cleanup(); }
});
