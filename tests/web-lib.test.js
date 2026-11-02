// P04-01: the page's text helpers (web/src/lib.js) give the right words for fixed inputs. No network, no browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ageText, readingView } from '../web/src/lib.js';

const T = Date.parse('2026-11-02T10:00:00Z');
const ago = (s) => new Date(T - s * 1000).toISOString();

test('ageText: seconds, minutes, hours, days', () => {
  assert.equal(ageText(ago(0), T), 'just now');
  assert.equal(ageText(ago(59), T), 'just now');
  assert.equal(ageText(ago(60), T), '1 min ago');
  assert.equal(ageText(ago(119), T), '1 min ago');
  assert.equal(ageText(ago(12 * 60), T), '12 min ago');
  assert.equal(ageText(ago(59 * 60 + 59), T), '59 min ago');
  assert.equal(ageText(ago(3600), T), '1 h ago');
  assert.equal(ageText(ago(5 * 3600 + 1800), T), '5 h ago');
  assert.equal(ageText(ago(24 * 3600), T), '1 day ago');
  assert.equal(ageText(ago(3 * 86400), T), '3 days ago');
});

test('ageText: a time slightly in the future (clock skew) is "just now"; junk is "unknown"', () => {
  assert.equal(ageText(ago(-20), T), 'just now');
  assert.equal(ageText('not a date', T), 'unknown');
  assert.equal(ageText(null, T), 'unknown');
});

test('readingView: units, one decimal for temperature, whole degrees for the heat index (D-019)', () => {
  const v = readingView({ temp_c: '29.5', rh_pct: '71.0', heat_index_c: '34.1', recorded_at: ago(120), room: 'Room 1' }, T);
  assert.deepEqual(v, { room: 'Room 1', temp: '29.5 °C', rh: '71 %', heatIndex: '34', category: 'extreme-caution', updated: 'updated 2 min ago' });
});

test('readingView: numbers may arrive as numbers; rounds half up like the OLED', () => {
  const v = readingView({ temp_c: 31.14, rh_pct: 57.5, heat_index_c: 34.5, recorded_at: ago(5), room: 'Room 204' }, T);
  assert.equal(v.temp, '31.1 °C');
  assert.equal(v.rh, '58 %');
  assert.equal(v.heatIndex, '35');
});

test('readingView: category follows the rounded heat index', () => {
  const row = (hi) => ({ temp_c: 30, rh_pct: 60, heat_index_c: hi, recorded_at: ago(5), room: 'R' });
  assert.equal(readingView(row('24.0'), T).category, 'below-range');
  assert.equal(readingView(row('44.0'), T).category, 'danger');
  assert.equal(readingView(row('53'), T).category, 'extreme-danger');
});

test('readingView: a null heat index shows a dash, not 0', () => {
  const v = readingView({ temp_c: 20, rh_pct: 50, heat_index_c: null, recorded_at: ago(5), room: 'R' }, T);
  assert.equal(v.heatIndex, '—');
  assert.equal(v.category, 'below-range');
});

test('readingView: no row yet gives a clear message, not a crash', () => {
  assert.equal(readingView(null, T).updated, 'no readings yet');
  assert.equal(readingView(undefined, T).temp, '—');
  assert.equal(readingView(null, T).category, null);
});
