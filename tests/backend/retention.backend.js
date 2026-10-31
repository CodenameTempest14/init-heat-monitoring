// P02-05 (F-20) and P02-07 (F-21): readings older than 90 days become one row per device, hour
// and room in readings_hourly, and are then deleted. Old readings are written with the secret key
// (ingest_reading refuses anything older than 7 days) and the job function is run directly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anon, service, makeDevice } from './_helpers.js';

const HOUR = 3_600_000;
// A whole UTC hour about 100 days ago: well past the 90-day cut-off.
const H = Math.floor((Date.now() - 100 * 24 * HOUR) / HOUR) * HOUR;
const at = (minutes) => new Date(H + minutes * 60_000).toISOString();

const runJob = () => service('rpc/rollup_old_readings', { method: 'POST', body: {} });

/** Rows as the job would find them: the server normally fills these in from ingest_reading. */
const old = (device, room, minutes, temp_c, rh_pct, heat_index_c) =>
  ({ device_id: device.id, room, recorded_at: at(minutes), temp_c, rh_pct, heat_index_c });

async function insertReadings(rows) {
  const res = await service('readings', { method: 'POST', body: rows });
  assert.equal(res.status, 201, JSON.stringify(res.body));
}

const hourly = (device) =>
  service(`readings_hourly?device_id=eq.${device.id}&order=hour,room`).then((r) => r.body);

test('old readings are rolled up per hour and room, then deleted; recent ones stay', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  try {
    const recentAt = new Date(Date.now() - 89 * 24 * HOUR).toISOString();
    await insertReadings([
      // Hour H, Room 204. Temperature max 32.5 twice: the earlier time (:10) is kept.
      old(device, 'Room 204', 5, 30.0, 60, 32.8),
      old(device, 'Room 204', 10, 32.5, 55, 36.7),
      old(device, 'Room 204', 20, 32.5, 70, 41.9),
      old(device, 'Room 204', 40, 25.0, 50, null),
      // Hour H+1: the device was moved from Room 204 to Room 105 → two rows (F-21).
      old(device, 'Room 204', 65, 31.0, 65, 36.2),
      old(device, 'Room 105', 70, 29.0, 60, 31.0),
      old(device, 'Room 105', 75, 28.0, 60, 29.4),
      // Hour H+2: below the heat index range only.
      old(device, 'Room 204', 125, 25.0, 50, null),
      // 89 days old: must not be touched.
      { device_id: device.id, room: 'Room 204', recorded_at: recentAt, temp_c: 30.0, rh_pct: 60, heat_index_c: 32.8 },
    ]);

    const res = await runJob();
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.deepEqual(res.body, { hours: 4, deleted: 8 });

    const rows = (await hourly(device)).map((r) => ({
      ...r,
      hour: new Date(r.hour).toISOString(),
      temp_max_at: new Date(r.temp_max_at).toISOString(),
      rh_max_at: new Date(r.rh_max_at).toISOString(),
      hi_max_at: r.hi_max_at && new Date(r.hi_max_at).toISOString(),
    }));
    const row = (minutes, room, values) => ({ device_id: device.id, hour: at(minutes), room, ...values });
    // Ordered by hour, then room: at H+1, "Room 105" sorts before "Room 204".
    assert.deepEqual(rows, [
      row(0, 'Room 204', {
        temp_avg: 30.0, temp_min: 25.0, temp_max: 32.5, temp_max_at: at(10),
        rh_avg: 58.8, rh_min: 50, rh_max: 70, rh_max_at: at(20),
        hi_avg: 37.1, hi_max: 41.9, hi_max_at: at(20), n: 4,
      }),
      row(60, 'Room 105', {
        temp_avg: 28.5, temp_min: 28.0, temp_max: 29.0, temp_max_at: at(70),
        rh_avg: 60, rh_min: 60, rh_max: 60, rh_max_at: at(70),
        hi_avg: 30.2, hi_max: 31.0, hi_max_at: at(70), n: 2,
      }),
      row(60, 'Room 204', {
        temp_avg: 31.0, temp_min: 31.0, temp_max: 31.0, temp_max_at: at(65),
        rh_avg: 65, rh_min: 65, rh_max: 65, rh_max_at: at(65),
        hi_avg: 36.2, hi_max: 36.2, hi_max_at: at(65), n: 1,
      }),
      row(120, 'Room 204', {
        temp_avg: 25.0, temp_min: 25.0, temp_max: 25.0, temp_max_at: at(125),
        rh_avg: 50, rh_min: 50, rh_max: 50, rh_max_at: at(125),
        hi_avg: null, hi_max: null, hi_max_at: null, n: 1,
      }),
    ]);

    const left = await device.readings();
    assert.equal(left.length, 1, 'only the 89-day-old reading is left');
    assert.equal(new Date(left[0].recorded_at).toISOString(), recentAt);

    // Running it again (tomorrow's job) changes nothing.
    assert.deepEqual((await runJob()).body, { hours: 0, deleted: 0 });
    assert.equal((await hourly(device)).length, 4);
    assert.equal((await device.readings()).length, 1);
  } finally {
    await device.cleanup();
  }
});

test('only whole hours before the cut-off hour are rolled up', async () => {
  // Cut-off = start of the UTC hour 90 days ago. A reading in that hour is already older than
  // 90 days but waits for the next run, so the hour is never split over two runs.
  const cutoff = Math.floor((Date.now() - 90 * 24 * HOUR) / HOUR) * HOUR;
  const device = await makeDevice({ room: 'Room 204' });
  try {
    const before = new Date(cutoff - 1000).toISOString();
    const inCutoffHour = new Date(cutoff).toISOString();
    await insertReadings([
      { device_id: device.id, room: 'Room 204', recorded_at: before, temp_c: 30, rh_pct: 60, heat_index_c: 32.8 },
      { device_id: device.id, room: 'Room 204', recorded_at: inCutoffHour, temp_c: 30, rh_pct: 60, heat_index_c: 32.8 },
    ]);
    assert.equal((await runJob()).status, 200);

    const left = await device.readings();
    assert.deepEqual(left.map((r) => new Date(r.recorded_at).toISOString()), [inCutoffHour]);
    assert.deepEqual((await hourly(device)).map((r) => new Date(r.hour).toISOString()),
      [new Date(cutoff - HOUR).toISOString()]);
  } finally {
    await device.cleanup();
  }
});

test('if an hour was already rolled up, the job stops and deletes nothing', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  try {
    const existing = {
      device_id: device.id, hour: at(0), room: 'Room 204',
      temp_avg: 30, temp_min: 30, temp_max: 30, temp_max_at: at(0),
      rh_avg: 60, rh_min: 60, rh_max: 60, rh_max_at: at(0), n: 1,
    };
    assert.equal((await service('readings_hourly', { method: 'POST', body: existing })).status, 201);
    await insertReadings([old(device, 'Room 204', 5, 31.0, 65, 36.2)]);

    const res = await runJob();
    assert.notEqual(res.status, 200, 'the job must fail, not drop the reading');
    assert.equal(res.body?.code, '23505', JSON.stringify(res.body)); // unique violation
    assert.equal((await device.readings()).length, 1, 'the raw reading is still there');
    assert.equal((await hourly(device)).length, 1, 'the existing hourly row is unchanged');
  } finally {
    await device.cleanup();
  }
});

test('the public cannot run the job', async () => {
  const res = await anon('rpc/rollup_old_readings', { method: 'POST', body: {} });
  // 42501 = permission denied. A missing function (404) must not count as a pass.
  assert.equal(res.body?.code, '42501', `got ${res.status} ${JSON.stringify(res.body)}`);
});
