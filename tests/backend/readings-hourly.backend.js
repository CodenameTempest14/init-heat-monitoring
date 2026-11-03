// F-24 (s27): readings_hourly(from_day, to_day, for_device, before_hour, page_size) gives hourly averages for the
// readings table under the history charts, picked by a from-to range of Philippine days; readings_span(for_device)
// gives the first and last reading time so the date pickers only offer days with data. Public read like history().
// Uses its own throwaway devices only, so it can run alone at any time.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anon, service, makeDevice } from './_helpers.js';

const at = (day, hms) => new Date(`${day}T${hms}+08:00`).toISOString();
const row = (device, day, hms, temp_c, rh_pct, heat_index_c, room = 'Room 204') =>
  ({ device_id: device.id, room, recorded_at: at(day, hms), temp_c, rh_pct, heat_index_c });
async function insertReadings(rows) {
  const res = await service('readings', { method: 'POST', body: rows });
  assert.equal(res.status, 201, JSON.stringify(res.body));
}
const hourly = (device, from_day, to_day, extra = {}) =>
  anon('rpc/readings_hourly', { method: 'POST', body: { from_day, to_day, for_device: device.id, ...extra } });
const DAY = '2026-01-15';
const NEXT = '2026-01-16';

test('hourly averages for a from-to range of Manila days, newest first, one row per hour and room', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  try {
    await insertReadings([
      row(device, '2026-01-14', '23:59:00', 30, 60, 33),     // the day before: out
      row(device, DAY, '00:10:00', 30, 60, 33),              // 00:00 hour, average of two
      row(device, DAY, '00:50:00', 31, 70, 35),
      row(device, DAY, '13:05:00', 24, 50, null),            // below range: heat index null
      row(device, NEXT, '23:59:00', 32, 80, 40),             // last minute of the last day: in
      row(device, '2026-01-17', '00:00:00', 30, 60, 33),     // the day after: out
    ]);
    const res = await hourly(device, DAY, NEXT);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.deepEqual(res.body.map((r) => Date.parse(r.hour)), [at(NEXT, '23:00:00'), at(DAY, '13:00:00'), at(DAY, '00:00:00')].map(Date.parse), 'newest first, 3 hours');
    const [last, mid, first] = res.body;
    assert.deepEqual([last.temp_c, last.rh_pct, last.heat_index_c, last.n], [32, 80, 40, 1]);
    assert.deepEqual([mid.temp_c, mid.rh_pct, mid.heat_index_c], [24, 50, null], 'below range stays null');
    assert.deepEqual([first.temp_c, first.rh_pct, first.heat_index_c, first.n], [30.5, 65, 34, 2]);
    assert.equal(first.room, 'Room 204');
  } finally { await device.cleanup(); }
});

test('an hour in which the device moved gives one row per room (F-21)', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  try {
    await insertReadings([row(device, DAY, '10:05:00', 30, 60, 33, 'Room 204'), row(device, DAY, '10:40:00', 32, 60, 37, 'Room 305')]);
    const res = await hourly(device, DAY, DAY);
    assert.deepEqual(res.body.map((r) => r.room).sort(), ['Room 204', 'Room 305']);
  } finally { await device.cleanup(); }
});

test('paging: before_hour continues where the last page ended; page_size is capped at 500', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  try {
    await insertReadings(Array.from({ length: 24 }, (_, h) => row(device, DAY, `${String(h).padStart(2, '0')}:30:00`, 30, 60, 33)));
    const p1 = await hourly(device, DAY, DAY, { page_size: 10 });
    assert.equal(p1.body.length, 10);
    const p2 = await hourly(device, DAY, DAY, { page_size: 10, before_hour: p1.body.at(-1).hour });
    assert.equal(p2.body.length, 10);
    assert.ok(Date.parse(p2.body[0].hour) < Date.parse(p1.body.at(-1).hour));
    const p3 = await hourly(device, DAY, DAY, { page_size: 10, before_hour: p2.body.at(-1).hour });
    assert.equal(p3.body.length, 4);
    for (const bad of [0, 501, -1]) assert.ok((await hourly(device, DAY, DAY, { page_size: bad })).status >= 400, `page_size ${bad}`);
  } finally { await device.cleanup(); }
});

test('bad input is refused: to before from, missing dates; another device gives nothing', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  const other = await makeDevice({ room: 'Room 9' });
  try {
    await insertReadings([row(other, DAY, '10:00:00', 30, 60, 33)]);
    assert.ok((await hourly(device, NEXT, DAY)).status >= 400, 'to before from');
    assert.ok((await anon('rpc/readings_hourly', { method: 'POST', body: { from_day: null, to_day: DAY, for_device: device.id } })).status >= 400, 'null from');
    assert.deepEqual((await hourly(device, DAY, DAY)).body, [], 'a device sees only its own readings');
  } finally { await device.cleanup(); await other.cleanup(); }
});

test('readings_span gives the first and last reading time, or nulls with no readings', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  try {
    const none = await anon('rpc/readings_span', { method: 'POST', body: { for_device: device.id } });
    assert.equal(none.status, 200, JSON.stringify(none.body));
    assert.deepEqual([none.body.first_at, none.body.last_at], [null, null]);
    await insertReadings([row(device, DAY, '10:00:00', 30, 60, 33), row(device, NEXT, '11:00:00', 30, 60, 33)]);
    const res = await anon('rpc/readings_span', { method: 'POST', body: { for_device: device.id } });
    assert.equal(Date.parse(res.body.first_at), Date.parse(at(DAY, '10:00:00')));
    assert.equal(Date.parse(res.body.last_at), Date.parse(at(NEXT, '11:00:00')));
  } finally { await device.cleanup(); }
});

test('a stranger can read but not write through the new functions\' tables', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  try {
    const write = await anon('readings', { method: 'POST', body: row(device, DAY, '10:00:00', 30, 60, 33) });
    assert.ok(write.status >= 400, 'anon wrote a reading');
  } finally { await device.cleanup(); }
});
