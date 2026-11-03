// F-24 (s27): the pure parts of the readings table under the history charts (web/src/readings.js): Manila days, the
// from-to check, one table row, the CSV. No browser or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PAGE_SIZE, manilaDay, spanDays, defaultRange, checkRange, timeLabel, rowView, hasMore, csvOf, csvName } from '../web/src/readings.js';

const SPAN = { first_at: '2026-11-02T10:04:52+00:00', last_at: '2026-11-03T10:03:10+00:00' }; // Manila: 2 Nov 18:04 to 3 Nov 18:03

test('a Manila day is the date at UTC+8: 16:30 UTC is already the next day', () => {
  assert.equal(manilaDay(Date.parse('2026-11-02T10:00:00Z')), '2026-11-02');
  assert.equal(manilaDay(Date.parse('2026-11-02T15:59:59Z')), '2026-11-02');
  assert.equal(manilaDay(Date.parse('2026-11-02T16:00:00Z')), '2026-11-03');
});

test('spanDays gives the first and last day with data; no data gives null', () => {
  assert.deepEqual(spanDays(SPAN), { min: '2026-11-02', max: '2026-11-03' });
  assert.equal(spanDays({ first_at: null, last_at: null }), null);
  assert.equal(spanDays(null), null);
});

test('the default range is the newest day with data, both ends', () => {
  assert.deepEqual(defaultRange(spanDays(SPAN)), { from: '2026-11-03', to: '2026-11-03' });
});

test('checkRange: both days needed, to not before from, both inside the days that have data', () => {
  const d = spanDays(SPAN);
  assert.deepEqual(checkRange('2026-11-02', '2026-11-03', d), { ok: true });
  assert.deepEqual(checkRange('2026-11-03', '2026-11-03', d), { ok: true });
  assert.equal(checkRange('', '2026-11-03', d).ok, false);
  assert.equal(checkRange('2026-11-03', '', d).ok, false);
  assert.equal(checkRange('2026-11-03', '2026-11-02', d).error, 'The To day must not be before the From day.');
  assert.equal(checkRange('2026-11-01', '2026-11-03', d).ok, false, 'before the first reading');
  assert.equal(checkRange('2026-11-02', '2026-11-04', d).ok, false, 'after the last reading');
  assert.equal(checkRange('2026-11-02', '2026-11-03', null).ok, false, 'no data at all');
});

test('timeLabel shows the Manila hour: 3 Nov, 16:00 for 08:00 UTC', () => {
  assert.equal(timeLabel('2026-11-03T08:00:00+00:00'), '3 Nov, 16:00');
  assert.equal(timeLabel('2026-12-31T16:00:00Z'), '1 Jan, 00:00');
});

test('rowView: values, one decimal for temperature and humidity, whole heat index, PAGASA level from the rounded average', () => {
  const v = rowView({ hour: '2026-11-03T08:00:00+00:00', room: 'Room 204', temp_c: 32, rh_pct: 58.1, heat_index_c: 41.4, n: 60 });
  assert.deepEqual(v, { key: '2026-11-03T08:00:00+00:00|Room 204', time: '3 Nov, 16:00', room: 'Room 204', temp: '32.0 °C', rh: '58.1 %', hi: '41 °C', level: 'Extreme caution', levelKey: 'extreme-caution' });
  const below = rowView({ hour: '2026-11-03T02:00:00Z', room: 'Room 204', temp_c: 24.6, rh_pct: 72.3, heat_index_c: null, n: 60 });
  assert.equal(below.hi, '—');
  assert.equal(below.level, 'Below range', 'short, so it fits the phone table');
  assert.equal(rowView({ hour: '2026-11-03T08:00:00Z', room: 'R', temp_c: 30, rh_pct: 60, heat_index_c: 41.6, n: 1 }).level, 'Danger', '41.6 rounds to 42');
});

test('hasMore: a full page means there may be more, a short page means the end', () => {
  assert.equal(PAGE_SIZE, 500);
  assert.equal(hasMore(500), true);
  assert.equal(hasMore(499), false);
  assert.equal(hasMore(0), false);
});

test('csvOf: a header line, one line per row, text in quotes only when it needs them, Philippine time', () => {
  const rows = [
    { hour: '2026-11-03T08:00:00+00:00', room: 'Room 204', temp_c: 32, rh_pct: 58.1, heat_index_c: 41.4, n: 60 },
    { hour: '2026-11-03T02:00:00+00:00', room: 'Room "A", 2nd', temp_c: 24.6, rh_pct: 72.3, heat_index_c: null, n: 58 },
  ];
  assert.equal(csvOf(rows), [
    'hour_manila,room,temp_c,rh_pct,heat_index_c,level,readings_in_hour',
    '2026-11-03 16:00,Room 204,32.0,58.1,41.4,Extreme caution,60',
    '2026-11-03 10:00,"Room ""A"", 2nd",24.6,72.3,,Below heat-index range,58',
    '',
  ].join('\r\n'));
});

test('csvOf guards against spreadsheet formulas in a room name', () => {
  const out = csvOf([{ hour: '2026-11-03T08:00:00Z', room: '=1+1', temp_c: 30, rh_pct: 60, heat_index_c: null, n: 1 }]);
  assert.ok(out.includes("'=1+1"), out);
});

test('csvName names the file by the days', () => {
  assert.equal(csvName('2026-11-02', '2026-11-03'), 'init-readings_2026-11-02_to_2026-11-03.csv');
});
