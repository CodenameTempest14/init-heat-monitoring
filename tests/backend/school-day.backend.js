// P04-07 (F-12, D-033): school_day(day, for_device) summarises one school day (Monday to Friday, 6:00 AM to 7:15 PM
// Philippine time) in the database, so the page only draws what it gets. Uses its own throwaway devices only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anon, service, makeDevice } from './_helpers.js';

const DAY_MS = 86_400_000;
const WINDOW_S = 13 * 3600 + 15 * 60; // 6:00 to 19:15
const manilaToday = () => new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);
const shift = (iso, days) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
const isoDow = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDay() || 7; // Mon 1 .. Sun 7
/** The latest Mon-Fri strictly before today (Manila): a finished school day. */
function pastSchoolDay() { let d = shift(manilaToday(), -1); while (isoDow(d) > 5) d = shift(d, -1); return d; }
const pastWeekend = () => { let d = shift(manilaToday(), -1); while (isoDow(d) < 6) d = shift(d, -1); return d; };
const at = (day, hms) => new Date(`${day}T${hms}+08:00`).toISOString();
const row = (device, day, hms, temp_c, heat_index_c) =>
  ({ device_id: device.id, room: 'Room 204', recorded_at: at(day, hms), temp_c, rh_pct: 60, heat_index_c });

async function insertReadings(rows) {
  const res = await service('readings', { method: 'POST', body: rows });
  assert.equal(res.status, 201, JSON.stringify(res.body));
}
const schoolDay = (day, device) => anon('rpc/school_day', { method: 'POST', body: { day, for_device: device.id } });
const sum = (levels) => Object.values(levels).reduce((a, b) => a + b, 0);

test('a finished school day: extremes, hottest hour, average and seconds in each level', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  const day = pastSchoolDay();
  try {
    await insertReadings([
      row(device, day, '05:59:00', 40, 60.0),  // before 6:00: ignored
      row(device, day, '06:00:00', 25, null),  // below range, counts 60 s (until the next reading)
      row(device, day, '06:01:00', 30, 28.4),  // rounds to 28: caution, counts 120 s (a gap of exactly 2 min)
      row(device, day, '12:00:00', 33, 34.6),  // rounds to 35: extreme caution, next is 10 min away: capped at 120 s
      row(device, day, '12:10:00', 38, 43.0),  // danger, 30 s
      row(device, day, '12:10:30', 45, 52.4),  // rounds to 52: extreme danger, last reading: 120 s, not until the window end
      row(device, day, '12:30:00', 31, 32.5),  // rounds to 33 (half up): extreme caution, 10 s
      row(device, day, '12:30:10', 24, null),  // below range, 120 s
      row(device, day, '19:15:00', 40, 60.0),  // the window is half open: 19:15 is out
      row(device, day, '19:30:00', 40, 60.0),
    ]);
    const res = await schoolDay(day, device);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const b = res.body;
    assert.equal(b.day, day);
    assert.equal(Date.parse(b.window_start), Date.parse(at(day, '06:00:00')));
    assert.equal(Date.parse(b.window_end), Date.parse(at(day, '19:15:00')));
    assert.equal(b.window_seconds, WINDOW_S);
    assert.equal(b.readings, 7);
    assert.equal(b.highest.heat_index_c, 52.4);
    assert.equal(Date.parse(b.highest.at), Date.parse(at(day, '12:10:30')));
    assert.equal(b.lowest.heat_index_c, 28.4);
    assert.equal(Date.parse(b.lowest.at), Date.parse(at(day, '06:01:00')));
    assert.equal(b.average, 38.2);                                  // (28.4 + 34.6 + 43 + 52.4 + 32.5) / 5, nulls left out
    assert.equal(Date.parse(b.hottest_hour.starts_at), Date.parse(at(day, '12:00:00')));
    assert.equal(b.hottest_hour.average, 40.6);                     // (34.6 + 43 + 52.4 + 32.5) / 4
    assert.deepEqual(b.levels, {
      'extreme-danger': 120, 'danger': 30, 'extreme-caution': 130, 'caution': 120, 'below-range': 180,
      'no-reading': WINDOW_S - 580,
    });
    assert.equal(sum(b.levels), b.window_seconds);
  } finally { await device.cleanup(); }
});

test('a day with no readings: no numbers, and all of it is "no reading"', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  const day = pastSchoolDay();
  try {
    const res = await schoolDay(day, device);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.readings, 0);
    assert.equal(res.body.highest, null);
    assert.equal(res.body.lowest, null);
    assert.equal(res.body.hottest_hour, null);
    assert.equal(res.body.average, null);
    assert.deepEqual(res.body.levels, {
      'extreme-danger': 0, 'danger': 0, 'extreme-caution': 0, 'caution': 0, 'below-range': 0, 'no-reading': WINDOW_S,
    });
  } finally { await device.cleanup(); }
});

test('a day where every reading is below the heat index range has no heat index numbers', async () => {
  const device = await makeDevice({ room: 'Room 204' });
  const day = pastSchoolDay();
  try {
    await insertReadings([row(device, day, '08:00:00', 24, null), row(device, day, '08:01:00', 25, null)]);
    const { body } = await schoolDay(day, device);
    assert.equal(body.readings, 2);
    assert.equal(body.highest, null);
    assert.equal(body.average, null);
    assert.equal(body.hottest_hour, null);
    assert.equal(body.levels['below-range'], 180);
    assert.equal(sum(body.levels), WINDOW_S);
  } finally { await device.cleanup(); }
});

test('other devices and other days are left out', async () => {
  const mine = await makeDevice({ room: 'Room 204' });
  const other = await makeDevice({ room: 'Room 105' });
  const day = pastSchoolDay();
  try {
    await insertReadings([
      row(mine, day, '09:00:00', 30, 30.0),
      row(other, day, '09:00:00', 40, 50.0),
      row(mine, shift(day, -1), '09:00:00', 40, 55.0),
    ]);
    const { body } = await schoolDay(day, mine);
    assert.equal(body.readings, 1);
    assert.equal(body.highest.heat_index_c, 30);
  } finally { await mine.cleanup(); await other.cleanup(); }
});

test('today: the window ends at now, and the seconds still add up to it', async (t) => {
  const device = await makeDevice({ room: 'Room 204' });
  const today = manilaToday();
  try {
    if (isoDow(today) > 5) { t.skip('today is a weekend'); return; }
    const res = await schoolDay(today, device);
    const manilaNow = new Date(Date.now() + 8 * 3_600_000).toISOString().slice(11, 19);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.ok(Date.parse(res.body.window_end) <= Date.now() + 1000);
    assert.equal(sum(res.body.levels), res.body.window_seconds);
    if (manilaNow < '06:00:10') assert.equal(res.body.window_seconds, 0);
    else if (manilaNow < '19:15:00') assert.ok(res.body.window_seconds > 0 && res.body.window_seconds < WINDOW_S);
    else assert.equal(res.body.window_seconds, WINDOW_S);
  } finally { await device.cleanup(); }
});

test('weekends, the future, days older than 90 days and missing values are refused', async () => {
  const device = await makeDevice();
  try {
    const today = manilaToday();
    let oldDay = shift(today, -91); while (isoDow(oldDay) > 5) oldDay = shift(oldDay, -1);
    let ninety = shift(today, -90); while (isoDow(ninety) > 5) ninety = shift(ninety, 1);
    for (const bad of [pastWeekend(), shift(today, 1), shift(today, 30), oldDay, null]) {
      const res = await schoolDay(bad, device);
      assert.equal(res.status, 400, `day ${bad}: ${JSON.stringify(res.body)}`);
    }
    const nobody = await anon('rpc/school_day', { method: 'POST', body: { day: pastSchoolDay(), for_device: null } });
    assert.equal(nobody.status, 400);
    if (ninety < today) assert.equal((await schoolDay(ninety, device)).status, 200); // 90 days back is still offered
  } finally { await device.cleanup(); }
});
