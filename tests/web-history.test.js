// P04-04: the pure parts of the history charts (F-04): axis scale, series from the server's buckets, line breaks, ticks, hover lookup.
// Dates are built with local-time constructors so the tests pass in any time zone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { niceScale, buildSeries, linePath, xTicks, pointLabel, nearestIndex, latestWith } from '../web/src/history.js';

const NOW = new Date(2026, 10, 2, 14, 0).getTime(); // Monday 2 Nov 2026, 14:00 local
const iso = (ms) => new Date(ms).toISOString();
const MIN = 60_000;
const row = (minAgo, temp, rh, hi) => ({ bucket: iso(NOW - minAgo * MIN), temp_c: temp, rh_pct: rh, heat_index_c: hi });

test('niceScale: round ticks around the data, about 4 steps', () => {
  assert.deepEqual(niceScale(27, 41), { lo: 25, hi: 45, ticks: [25, 30, 35, 40, 45] });
  assert.deepEqual(niceScale(24.5, 31.1), { lo: 24, hi: 32, ticks: [24, 26, 28, 30, 32] });
  assert.deepEqual(niceScale(52, 88).ticks, [50, 60, 70, 80, 90]);
});

test('niceScale: a flat line still gets a usable scale (no divide by zero)', () => {
  const s = niceScale(30, 30);
  assert.ok(s.hi > s.lo && s.ticks.length >= 2 && s.lo <= 30 && s.hi >= 30);
});

test('buildSeries: time in hours from the window start; rows before the window are dropped; strings become numbers', () => {
  const s = buildSeries([row(25 * 60, 20, 50, null), row(24 * 60, 30, 60, 33), row(15, '31.5', '62', '35.0'), row(0, 32, 64, 36)], '24h', NOW);
  assert.equal(s.hours, 24);
  assert.deepEqual(s.pts.map((p) => p.t), [0, 23.75, 24]);
  assert.deepEqual(s.pts[1], { t: 23.75, ms: NOW - 15 * MIN, temp: 31.5, rh: 62, hi: 35 });
});

test('buildSeries: a missing heat index stays null, never 0', () => {
  const s = buildSeries([row(0, 25, 50, null)], '24h', NOW);
  assert.equal(s.pts[0].hi, null);
});

test('buildSeries: 7 days uses 168 hours and hourly steps', () => {
  const s = buildSeries([row(0, 32, 64, 36)], '7d', NOW);
  assert.equal(s.hours, 168);
  assert.equal(s.stepMs, 3_600_000);
});

const x10 = (t) => t * 10, id = (v) => v; // x = 10 t, y = value: makes the path text easy to read
test('linePath: one run of buckets is one line', () => {
  const s = buildSeries([row(30, 30, 60, 33), row(15, 31, 60, 34), row(0, 32, 60, 35)], '24h', NOW);
  assert.equal(linePath(s.pts, 'temp', x10, id, s.stepMs), 'M235 30L237.5 31L240 32');
});

test('linePath: a missing bucket (no readings) breaks the line, nothing is drawn across it', () => {
  const s = buildSeries([row(60, 30, 60, 33), row(45, 31, 60, 34), row(0, 32, 60, 35)], '24h', NOW);
  assert.equal(linePath(s.pts, 'temp', x10, id, s.stepMs), 'M230 30L232.5 31M240 32');
});

test('linePath: a bucket without a heat index breaks the heat index line only', () => {
  const s = buildSeries([row(30, 30, 60, 33), row(15, 25, 50, null), row(0, 32, 60, 35)], '24h', NOW);
  assert.equal(linePath(s.pts, 'hi', x10, id, s.stepMs), 'M235 33M240 35');
  assert.equal(linePath(s.pts, 'temp', x10, id, s.stepMs), 'M235 30L237.5 25L240 32');
});

test('xTicks 24h: every 6 hours on the local clock', () => {
  assert.deepEqual(xTicks('24h', NOW), [{ t: 4, label: '18:00' }, { t: 10, label: '00:00' }, { t: 16, label: '06:00' }, { t: 22, label: '12:00' }]);
});

test('xTicks 7d: every local midnight, named by weekday', () => {
  const ticks = xTicks('7d', NOW);
  assert.deepEqual(ticks.map((k) => k.label), ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon']);
  assert.equal(ticks[0].t, 10);
  assert.equal(ticks[6].t, 154);
});

test('pointLabel: clock time for 24 h, weekday and hour for 7 d', () => {
  assert.equal(pointLabel(new Date(2026, 10, 1, 16, 0).getTime(), '24h'), '16:00');
  assert.equal(pointLabel(new Date(2026, 10, 1, 16, 15).getTime(), '24h'), '16:15');
  assert.equal(pointLabel(new Date(2026, 10, 1, 16, 0).getTime(), '7d'), 'Sun 16:00');
});

test('nearestIndex: the point closest in time; -1 for no points', () => {
  const s = buildSeries([row(30, 30, 60, 33), row(15, 31, 60, 34), row(0, 32, 60, 35)], '24h', NOW);
  assert.equal(nearestIndex(s.pts, 23.6), 0);
  assert.equal(nearestIndex(s.pts, 23.7), 1);
  assert.equal(nearestIndex(s.pts, 99), 2);
  assert.equal(nearestIndex([], 3), -1);
});

test('latestWith: the newest point that has that value', () => {
  const s = buildSeries([row(30, 30, 60, 33), row(0, 25, 50, null)], '24h', NOW);
  assert.equal(latestWith(s.pts, 'hi').hi, 33);
  assert.equal(latestWith(s.pts, 'temp').temp, 25);
  assert.equal(latestWith([], 'hi'), null);
});
