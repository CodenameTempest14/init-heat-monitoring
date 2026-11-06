// P06-01 kiosk (F-13) and P06-02 QR poster (F-14): the plain parts. The QR must be the same picture as the owner-approved
// mock (design/qr-kiosk/poster.html), which was drawn by the same library; the kiosk words come from readingView/deviceStatus.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { qrModel, APP_URL, LEVELS } from '../web/src/poster.js';
import { kioskModel } from '../web/src/kiosk.js';
import { readingView, deviceStatus } from '../web/src/lib.js';

const NOW = Date.parse('2026-11-02T13:00:00Z');
const row = (o = {}) => ({ recorded_at: new Date(NOW).toISOString(), received_at: new Date(NOW).toISOString(), temp_c: 34.1, rh_pct: 62, heat_index_c: 43, room: 'Room 204', ...o });
const model = (r, failed = false, now = NOW) => kioskModel(readingView(r, now), r ? deviceStatus(r, now) : null, failed);

test('the QR picture is the same as the approved mock', () => {
  const mock = readFileSync(new URL('../design/qr-kiosk/poster.html', import.meta.url), 'utf8');
  const d = /class="qr-code"[^>]*viewBox="0 0 (\d+) \d+"[\s\S]*?<path d="([^"]+)"/.exec(mock);
  assert.ok(d, 'mock QR not found');
  const m = qrModel(APP_URL);
  assert.equal(m.size, Number(d[1]));
  assert.equal(m.d, d[2]);
});

test('the QR points at the hosted app and has a four-module quiet zone', () => {
  assert.equal(APP_URL, 'https://init-heat-monitoring.vercel.app');
  const m = qrModel(APP_URL);
  assert.ok(m.d.startsWith('M'), 'path starts with a move');
  assert.match(m.d, /^(M\d+ \d+h1v1h-1z)+$/);
  const xs = [...m.d.matchAll(/M(\d+) (\d+)h/g)].flatMap((x) => [Number(x[1]), Number(x[2])]);
  assert.ok(Math.min(...xs) >= 4 && Math.max(...xs) < m.size - 4, 'no dark module in the quiet zone');
});

test('the poster lists the four PAGASA levels with the ranges of category.js (27, 33, 42, 52)', () => {
  assert.deepEqual(LEVELS, ['Caution 27–32 °C', 'Extreme caution 33–41 °C', 'Danger 42–51 °C', 'Extreme danger 52 °C +']);
});

test('kiosk: online reading shows the level colour class, big number, words and a dot + Online', () => {
  const k = model(row());
  assert.equal(k.cls, 'kiosk kiosk-danger');
  assert.equal(k.room, 'Room 204');
  assert.equal(k.num, '43');
  assert.equal(k.unit, true);
  assert.equal(k.cat, 'danger');
  assert.equal(k.catLabel, 'Danger');
  assert.equal(k.temp, 'Temperature 34.1 °C');
  assert.equal(k.rh, 'Humidity 62 %');
  assert.equal(k.updated, 'updated just now');
  assert.equal(k.status, 'Online');
});

test('kiosk: offline keeps the last numbers but says so (same 120 s rule as the badge)', () => {
  const k = model(row(), false, NOW + 5 * 60 * 1000);
  assert.equal(k.status, 'Offline: no reading for 5 min');
  assert.equal(k.statusKind, 'offline');
  assert.equal(k.label, 'Last heat index');
});

test('kiosk: no reading yet shows dashes on the neutral colour, never a made-up level', () => {
  const k = model(null);
  assert.equal(k.num, '—');
  assert.equal(k.unit, false);
  assert.equal(k.cat, null);
  assert.equal(k.cls, 'kiosk kiosk-none');
});

test('kiosk: below the heat index range and a failed request are shown plainly', () => {
  assert.equal(model(row({ heat_index_c: null })).cls, 'kiosk kiosk-below-range');
  assert.equal(model(row(), true).updated, 'Could not load the readings. Will try again.');
});
