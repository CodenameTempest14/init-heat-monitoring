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
  assert.deepEqual(v, { room: 'Room 1', temp: '29.5 °C', rh: '71 %', heatIndex: '34', category: 'extreme-caution', label: 'Heat index', updated: 'updated 2 min ago' });
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

// P04-03: online/offline badge (F-03). Offline = newest reading more than 3 min old by the SERVER's clock (received_at).
import { deviceStatus, durationText } from '../web/src/lib.js';
const rowAt = (s, extra = {}) => ({ temp_c: 30, rh_pct: 60, heat_index_c: 40, recorded_at: ago(s), received_at: ago(s), room: 'R', ...extra });

test('durationText: min, h, days with no "ago"', () => {
  assert.equal(durationText(ago(12 * 60), T), '12 min');
  assert.equal(durationText(ago(3 * 3600 + 600), T), '3 h');
  assert.equal(durationText(ago(86400), T), '1 day');
  assert.equal(durationText(ago(3 * 86400), T), '3 days');
});

test('deviceStatus: online up to and including 3 min, offline after', () => {
  assert.deepEqual(deviceStatus(rowAt(0), T), { kind: 'online', text: 'Online' });
  assert.equal(deviceStatus(rowAt(180), T).kind, 'online');
  assert.deepEqual(deviceStatus(rowAt(181), T), { kind: 'offline', text: 'Offline: no reading for 3 min' });
  assert.equal(deviceStatus(rowAt(12 * 60), T).text, 'Offline: no reading for 12 min');
  assert.equal(deviceStatus(rowAt(3 * 3600), T).text, 'Offline: no reading for 3 h');
});

test('deviceStatus: uses received_at (server clock), not the device clock; falls back to recorded_at', () => {
  assert.equal(deviceStatus(rowAt(0, { recorded_at: ago(86400) }), T).kind, 'online');
  assert.equal(deviceStatus(rowAt(0, { received_at: ago(900) }), T).kind, 'offline');
  const noReceived = rowAt(600); delete noReceived.received_at;
  assert.equal(deviceStatus(noReceived, T).kind, 'offline');
});

test('deviceStatus: no row means waiting; an unreadable time never claims online', () => {
  assert.deepEqual(deviceStatus(null, T), { kind: 'wait', text: 'Waiting for the first reading' });
  assert.equal(deviceStatus(rowAt(0, { received_at: 'junk', recorded_at: 'junk' }), T).kind, 'offline');
});

test('readingView: offline changes the label and the line below; online keeps them', () => {
  assert.equal(readingView(rowAt(60), T).label, 'Heat index');
  assert.equal(readingView(rowAt(60), T).updated, 'updated 1 min ago');
  const off = readingView(rowAt(12 * 60), T);
  assert.equal(off.label, 'Last heat index');
  assert.equal(off.updated, 'last reading 12 min ago');
  assert.equal(readingView(null, T).label, 'Heat index');
});
