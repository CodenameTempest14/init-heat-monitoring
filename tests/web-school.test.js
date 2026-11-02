// P04-07: the pure parts of the school-day view (F-12): Philippine-time days, the day picker, and the words and bar for
// what the database function school_day() returns (supabase/migrations/20261104120000_school_day.sql).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  manilaDay, isSchoolDay, prevSchoolDay, nextSchoolDay, startDay, dayLabel, durationText, clockText, hourText, windowText,
  statsView, bandsView, barSegments, MAX_DAYS_BACK,
} from '../web/src/school.js';

const at = (iso) => Date.parse(iso);
// Mon 2 Nov 2026 14:42 in Manila is 06:42Z.
const MON_AFTERNOON = at('2026-11-02T06:42:00Z');

test('manilaDay: the date in the Philippines, whatever the phone says', () => {
  assert.equal(manilaDay(at('2026-11-02T06:42:00Z')), '2026-11-02');
  assert.equal(manilaDay(at('2026-11-02T15:59:59Z')), '2026-11-02'); // 23:59:59 Manila
  assert.equal(manilaDay(at('2026-11-02T16:00:00Z')), '2026-11-03'); // midnight Manila
});

test('isSchoolDay: Monday to Friday only', () => {
  assert.deepEqual(['2026-10-26', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'].map(isSchoolDay), [true, true, false, false, true]);
});

test('prevSchoolDay skips weekends and stops 90 days back', () => {
  assert.equal(prevSchoolDay('2026-11-02', '2026-11-02'), '2026-10-30');
  assert.equal(prevSchoolDay('2026-10-30', '2026-11-02'), '2026-10-29');
  const oldest = '2026-08-04'; // 90 days before Mon 2 Nov
  assert.equal(MAX_DAYS_BACK, 90);
  assert.equal(prevSchoolDay('2026-08-05', '2026-11-02'), oldest);
  assert.equal(prevSchoolDay(oldest, '2026-11-02'), null);
});

test('nextSchoolDay skips weekends and never goes past today', () => {
  assert.equal(nextSchoolDay('2026-10-30', '2026-11-02'), '2026-11-02');
  assert.equal(nextSchoolDay('2026-10-29', '2026-11-02'), '2026-10-30');
  assert.equal(nextSchoolDay('2026-11-02', '2026-11-02'), null);
  assert.equal(nextSchoolDay('2026-10-30', '2026-11-01'), null); // Sunday: the next school day is still in the future
});

test('startDay: today on a school day after 6:00 AM, else the last school day, with a weekend note', () => {
  assert.deepEqual(startDay(MON_AFTERNOON), { day: '2026-11-02', weekend: false });
  assert.deepEqual(startDay(at('2026-11-02T21:30:00Z')), { day: '2026-11-02', weekend: false });          // Tue 05:30 Manila: nothing yet today
  assert.deepEqual(startDay(at('2026-11-03T21:30:00Z')), { day: '2026-11-03', weekend: false }); // Wed 05:30 Manila: Tuesday
  assert.deepEqual(startDay(at('2026-11-01T22:00:00Z')), { day: '2026-11-02', weekend: false });          // Mon 06:00 Manila exactly
  assert.deepEqual(startDay(at('2026-11-01T21:59:00Z')), { day: '2026-10-30', weekend: false });          // Mon 05:59 Manila: nothing yet today
  assert.deepEqual(startDay(at('2026-11-01T06:00:00Z')), { day: '2026-10-30', weekend: true });           // Sunday
  assert.deepEqual(startDay(at('2026-10-31T06:00:00Z')), { day: '2026-10-30', weekend: true });           // Saturday
});

test('dayLabel', () => {
  assert.equal(dayLabel('2026-10-30', '2026-11-02'), 'Fri 30 Oct');
  assert.equal(dayLabel('2026-11-02', '2026-11-02'), 'Today, Mon 2 Nov');
});

test('durationText: whole minutes, hours and minutes', () => {
  assert.equal(durationText(0), '0 min');
  assert.equal(durationText(20 * 60), '20 min');
  assert.equal(durationText(3 * 3600 + 20 * 60), '3 h 20 min');
  assert.equal(durationText(2 * 3600), '2 h');
  assert.equal(durationText(10), 'under 1 min');
  assert.equal(durationText(89), '1 min');
});

test('clockText and hourText are in Philippine time', () => {
  assert.equal(clockText('2026-10-30T05:20:00+00:00'), '1:20 PM');
  assert.equal(clockText('2026-10-29T22:01:00+00:00'), '6:01 AM');
  assert.equal(clockText('2026-10-30T04:05:00+00:00'), '12:05 PM');
  assert.equal(hourText('2026-10-30T05:00:00+00:00'), '1:00 to 2:00 PM');
  assert.equal(hourText('2026-10-30T03:00:00+00:00'), '11:00 AM to 12:00 PM');
  assert.equal(hourText('2026-10-30T11:00:00+00:00'), '7:00 to 8:00 PM');
});

test('windowText: the full window, or up to now for today', () => {
  assert.equal(windowText({ window_end: '2026-10-30T11:15:00+00:00' }), '6:00 AM to 7:15 PM');
  assert.equal(windowText({ window_end: '2026-11-02T06:42:00+00:00' }), '6:00 AM to now (2:42 PM)');
});

const FULL = {
  day: '2026-10-30', window_start: '2026-10-29T22:00:00+00:00', window_end: '2026-10-30T11:15:00+00:00', window_seconds: 47700, readings: 700,
  highest: { heat_index_c: 43.4, at: '2026-10-30T05:20:00+00:00' },
  lowest: { heat_index_c: 27.2, at: '2026-10-29T22:20:00+00:00' },
  hottest_hour: { starts_at: '2026-10-30T05:00:00+00:00', average: 41.6 },
  average: 36.5,
  levels: { 'extreme-danger': 0, 'danger': 12000, 'extreme-caution': 22800, 'caution': 9000, 'below-range': 1200, 'no-reading': 2700 },
};

test('statsView: whole degrees, Philippine clock; nothing is made up when there is no heat index', () => {
  assert.deepEqual(statsView(FULL), {
    highest: ['43 °C', 'at 1:20 PM'], hour: ['42 °C average', '1:00 to 2:00 PM'], lowest: ['27 °C', 'at 6:20 AM'], average: ['37 °C', ''],
  });
  const none = statsView({ ...FULL, highest: null, lowest: null, hottest_hour: null, average: null });
  assert.deepEqual(none, { highest: ['—', ''], hour: ['—', ''], lowest: ['—', ''], average: ['—', ''] });
});

test('bandsView: hottest first, every level present, with durations', () => {
  const bands = bandsView(FULL.levels);
  assert.deepEqual(bands.map((b) => b.key), ['extreme-danger', 'danger', 'extreme-caution', 'caution', 'below-range', 'no-reading']);
  assert.deepEqual(bands.map((b) => b.text), ['0 min', '3 h 20 min', '6 h 20 min', '2 h 30 min', '20 min', '45 min']);
  assert.equal(bands[1].name, 'Danger');
  assert.equal(bands[4].name, 'Below heat-index range');
  assert.equal(bands[5].name, 'No reading');
});

test('barSegments: coolest to hottest then No reading, widths add up to the bar, zero levels are left out', () => {
  const segs = barSegments(FULL.levels, 326);
  assert.deepEqual(segs.map((s) => s.key), ['below-range', 'caution', 'extreme-caution', 'danger', 'no-reading']);
  assert.ok(Math.abs(segs.reduce((a, s) => a + s.w, 0) - 326) < 1e-9);
  assert.equal(segs[0].x, 0);
  assert.ok(Math.abs(segs[1].x - (segs[0].x + segs[0].w)) < 1e-9);
  assert.deepEqual(barSegments({ ...FULL.levels, 'no-reading': 0, danger: 0, caution: 0, 'extreme-caution': 0, 'below-range': 0 }, 326), []);
});
