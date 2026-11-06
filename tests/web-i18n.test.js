// P06-05 (F-18): English / Filipino. The word lists, the helpers that take a language, and the remembered choice.
// The Filipino is a DRAFT until a teacher reviews it (D-034); these tests check that nothing is missing or mismatched, not the quality of the words.
import test from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS, LANGS, normalizeLang, translate, categoryLabel, readLang, saveLang, richParts } from '../web/src/i18n.js';
import { ageText, deviceStatus, readingView } from '../web/src/lib.js';
import { dayLabel, durationText, hourText, windowText, statsView, bandsView, LEVEL_NAME } from '../web/src/school.js';
import { ruleView } from '../web/src/alerts.js';

const T = Date.parse('2026-11-02T10:00:00Z');
const ago = (s) => new Date(T - s * 1000).toISOString();
const holes = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

test('both languages have the same keys, none empty, and the same {placeholders}', () => {
  assert.deepEqual(LANGS, ['en', 'fil']);
  assert.deepEqual(Object.keys(STRINGS.fil).sort(), Object.keys(STRINGS.en).sort());
  for (const key of Object.keys(STRINGS.en)) {
    assert.ok(STRINGS.en[key].trim() && STRINGS.fil[key].trim(), `${key} is empty`);
    assert.equal(holes(STRINGS.fil[key]), holes(STRINGS.en[key]), `${key}: placeholders differ`);
  }
});

test('normalizeLang and translate: unknown language falls back to English; {holes} are filled', () => {
  assert.equal(normalizeLang('fil'), 'fil');
  assert.equal(normalizeLang('en'), 'en');
  assert.equal(normalizeLang('xx'), 'en');
  assert.equal(normalizeLang(null), 'en');
  assert.equal(translate('xx', 'home.humidity'), 'Humidity');
  assert.equal(translate('fil', 'home.humidity'), 'Halumigmig');
  assert.equal(translate('en', 'home.room', { room: 'Room 204' }), 'Room: Room 204');
  assert.equal(translate('fil', 'home.room', { room: 'Room 204' }), 'Silid: Room 204');
  assert.equal(translate('en', 'no.such.key'), 'no.such.key'); // a missing key shows itself, so the gap is easy to see
});

test('categoryLabel: the four PAGASA levels in both languages; English is the default', () => {
  assert.equal(categoryLabel('extreme-caution'), 'Extreme caution');
  assert.equal(categoryLabel('extreme-caution', 'fil'), 'Matinding pag-iingat');
  assert.equal(categoryLabel('extreme-danger', 'fil'), 'Matinding panganib');
  assert.equal(categoryLabel('danger', 'fil'), 'Panganib');
  assert.equal(categoryLabel('caution', 'fil'), 'Pag-iingat');
});

test('the remembered choice: stored value is used, junk or a broken store means English', () => {
  const mem = new Map();
  const store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  assert.equal(readLang(store), 'en');
  saveLang(store, 'fil');
  assert.equal(readLang(store), 'fil');
  mem.set('init-lang', 'klingon');
  assert.equal(readLang(store), 'en');
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(readLang(broken), 'en');
  assert.doesNotThrow(() => saveLang(broken, 'fil'));
  assert.equal(readLang(undefined), 'en');
});

test('richParts: **bold** pieces are marked, the rest is plain', () => {
  assert.deepEqual(richParts('a **b** c'), [{ text: 'a ', bold: false }, { text: 'b', bold: true }, { text: ' c', bold: false }]);
  assert.deepEqual(richParts('plain'), [{ text: 'plain', bold: false }]);
});

test('ageText and deviceStatus in Filipino; English stays exactly as before', () => {
  assert.equal(ageText(ago(0), T), 'just now');
  assert.equal(ageText(ago(0), T, 'fil'), 'ngayon lang');
  assert.equal(ageText(ago(12 * 60), T, 'fil'), '12 min na ang nakalipas');
  assert.equal(ageText(ago(5 * 3600 + 1800), T, 'fil'), '5 h na ang nakalipas');
  assert.equal(ageText(ago(24 * 3600), T, 'fil'), '1 araw na ang nakalipas');
  assert.equal(ageText(ago(3 * 86400), T, 'fil'), '3 araw na ang nakalipas');
  assert.equal(ageText(null, T, 'fil'), 'hindi alam');
  assert.deepEqual(deviceStatus(null, T, 'fil'), { kind: 'wait', text: 'Hinihintay ang unang reading' });
  assert.deepEqual(deviceStatus({ recorded_at: ago(600), received_at: ago(600) }, T, 'fil'), { kind: 'offline', text: 'Offline: walang reading sa loob ng 10 min' });
  assert.deepEqual(deviceStatus({ recorded_at: ago(10), received_at: ago(10) }, T, 'fil'), { kind: 'online', text: 'Online' });
});

test('readingView in Filipino: label and the "updated" line; numbers are the same', () => {
  const row = { temp_c: '29.5', rh_pct: '71.0', heat_index_c: '34.1', recorded_at: ago(120), received_at: ago(120), room: 'Room 1' };
  const v = readingView(row, T, 'fil');
  assert.equal(v.updated, 'na-update 2 min na ang nakalipas');
  assert.equal(v.label, 'Heat index');
  assert.equal(v.temp, '29.5 °C');
  const off = readingView({ ...row, recorded_at: ago(600), received_at: ago(600) }, T, 'fil');
  assert.equal(off.label, 'Huling heat index');
  assert.equal(off.updated, 'huling reading 10 min na ang nakalipas');
  assert.equal(readingView(undefined, T, 'fil').updated, 'wala pang reading');
});

test('school.js words in Filipino', () => {
  assert.equal(dayLabel('2026-11-06', '2026-11-06'), 'Today, Fri 6 Nov');
  assert.equal(dayLabel('2026-11-06', '2026-11-06', 'fil'), 'Ngayon, Biy 6 Nob');
  assert.equal(dayLabel('2026-11-05', '2026-11-06', 'fil'), 'Huw 5 Nob');
  assert.equal(durationText(12, 'fil'), 'wala pang 1 min');
  assert.equal(durationText(12000, 'fil'), '3 h 20 min');
  assert.equal(hourText('2026-11-02T05:00:00Z', 'fil'), '1:00 hanggang 2:00 PM');
  assert.equal(hourText('2026-11-02T03:00:00Z', 'fil'), '11:00 AM hanggang 12:00 PM');
  assert.equal(windowText({ window_end: '2026-11-02T06:42:00Z' }, 'fil'), '6:00 AM hanggang ngayon (2:42 PM)');
  assert.equal(windowText({ window_end: '2026-11-02T11:15:00Z' }, 'fil'), '6:00 AM hanggang 7:15 PM');
  const s = statsView({ highest: { heat_index_c: 41.6, at: '2026-11-02T05:20:00Z' }, hottest_hour: { average: 40, starts_at: '2026-11-02T05:00:00Z' }, lowest: null, average: 38 }, 'fil');
  assert.deepEqual(s.highest, ['42 °C', 'nang 1:20 PM']);
  assert.deepEqual(s.hour, ['40 °C average', '1:00 hanggang 2:00 PM']);
  assert.deepEqual(s.lowest, ['—', '']);
  const b = bandsView({ 'extreme-danger': 0, danger: 60, 'extreme-caution': 0, caution: 0, 'below-range': 0, 'no-reading': 0 }, 'fil');
  assert.equal(b[1].name, 'Panganib');
  assert.equal(bandsView({ 'extreme-danger': 0, danger: 0, 'extreme-caution': 0, caution: 0, 'below-range': 0, 'no-reading': 0 })[4].name, LEVEL_NAME['below-range']);
});

test('ruleView in Filipino: level name and the reminder gap', () => {
  const v = ruleView({ alert_heat_index_c: 42, alert_quiet_min: 120 }, 'Room 204', 'fil');
  assert.equal(v.level, 'Panganib');
  assert.equal(v.quiet, '2 oras');
  assert.equal(ruleView({ alert_heat_index_c: 42, alert_quiet_min: 45 }, 'Room 204', 'fil').quiet, '45 minuto');
  assert.equal(ruleView({ alert_heat_index_c: 42, alert_quiet_min: 120 }, 'Room 204').quiet, '2 hours');
});

// ---- stage 2 (s36): history charts and readings table ----
import { xTicks, pointLabel } from '../web/src/history.js';
import { checkRange, timeLabel, rowView } from '../web/src/readings.js';

test('history.js: day names follow the language; English unchanged', () => {
  const sunday = new Date(2026, 10, 1, 13, 5).getTime(); // 1 Nov 2026 is a Sunday, viewer's clock
  assert.equal(pointLabel(sunday, '7d'), 'Sun 13:05');
  assert.equal(pointLabel(sunday, '7d', 'fil'), 'Lin 13:05');
  assert.equal(pointLabel(sunday, '24h', 'fil'), '13:05');
  const now = new Date(2026, 10, 4, 12, 0).getTime();
  assert.deepEqual(xTicks('7d', now).map((t) => t.label), xTicks('7d', now, 'en').map((t) => t.label));
  assert.ok(xTicks('7d', now, 'fil').every((t) => ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'].includes(t.label)));
});

test('readings.js: range errors, time label and level in Filipino; English unchanged', () => {
  const days = { min: '2026-11-01', max: '2026-11-05' };
  assert.equal(checkRange('2026-11-03', '2026-11-02', days).error, 'The To day must not be before the From day.');
  assert.equal(checkRange('2026-11-03', '2026-11-02', days, 'fil').error, 'Hindi dapat mas maaga ang araw ng Hanggang kaysa sa araw ng Mula.');
  assert.equal(checkRange('', '', days, 'fil').error, 'Pumili ng dalawang araw.');
  assert.equal(checkRange('2026-10-01', '2026-11-02', days, 'fil').error, 'May mga reading mula 2026-11-01 hanggang 2026-11-05.');
  assert.equal(checkRange('2026-11-01', '2026-11-02', null, 'fil').error, 'Wala pang reading.');
  assert.equal(timeLabel('2026-11-03T08:00:00Z'), '3 Nov, 16:00');
  assert.equal(timeLabel('2026-11-03T08:00:00Z', 'fil'), '3 Nob, 16:00');
  const row = { hour: '2026-11-03T08:00:00Z', room: 'Room 1', temp_c: 30, rh_pct: 60, heat_index_c: null, n: 3 };
  assert.equal(rowView(row).level, 'Below range');
  assert.equal(rowView(row, 'fil').level, 'Mababa sa saklaw');
  assert.equal(rowView({ ...row, heat_index_c: 43 }, 'fil').level, 'Panganib');
});
