// P05-01 / P05-02 / P05-06: the pure parts of the admin view. The page checks the same ranges as the database CHECKs
// (supabase/migrations/20261031120000_core_schema.sql) so the admin sees a clear message; the database still decides.
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRoom, checkSettings, sessionFrom, needsRefresh, initialOf, SETTING_RANGES, signalState, restartState, reportState, agoText, RESET_ROOM, canReset } from '../web/src/admin.js';

const GOOD = { interval_s: '60', temp_offset_c: '0.0', rh_offset_pct: '0', alert_heat_index_c: '42', alert_quiet_min: '60' };

test('checkRoom trims and keeps 1 to 60 characters', () => {
  assert.deepEqual(checkRoom('  Room 305  '), { ok: true, value: 'Room 305' });
  assert.deepEqual(checkRoom('x'.repeat(60)), { ok: true, value: 'x'.repeat(60) });
  assert.equal(checkRoom('').ok, false);
  assert.equal(checkRoom('    ').ok, false);
  assert.equal(checkRoom('x'.repeat(61)).ok, false);
  assert.equal(checkRoom(undefined).ok, false);
});

test('checkSettings accepts the defaults and turns text into numbers', () => {
  const r = checkSettings(GOOD);
  assert.equal(r.ok, true);
  assert.deepEqual(r.values, { interval_s: 60, temp_offset_c: 0, rh_offset_pct: 0, alert_heat_index_c: 42, alert_quiet_min: 60 });
  assert.deepEqual(r.errors, {});
});

test('checkSettings: the edges of each range are allowed, one step outside is refused', () => {
  for (const [key, [min, max, step]] of Object.entries(SETTING_RANGES)) {
    for (const v of [min, max]) assert.equal(checkSettings({ ...GOOD, [key]: String(v) }).ok, true, `${key}=${v}`);
    for (const v of [min - step, max + step]) {
      const r = checkSettings({ ...GOOD, [key]: String(Number((v).toFixed(1))) });
      assert.equal(r.ok, false, `${key}=${v} accepted`);
      assert.match(r.errors[key], /to/);
    }
  }
});

test('checkSettings refuses empty, non-numbers, and too many decimals', () => {
  assert.equal(checkSettings({ ...GOOD, interval_s: '' }).ok, false);
  assert.equal(checkSettings({ ...GOOD, interval_s: 'abc' }).ok, false);
  assert.equal(checkSettings({ ...GOOD, interval_s: '60.5' }).ok, false);        // whole seconds only
  assert.equal(checkSettings({ ...GOOD, alert_quiet_min: '30.5' }).ok, false);   // whole minutes only
  assert.equal(checkSettings({ ...GOOD, alert_heat_index_c: '41.5' }).ok, true); // numeric(4,1)
  assert.equal(checkSettings({ ...GOOD, temp_offset_c: '1.25' }).ok, false);     // numeric(3,1): one decimal
  assert.equal(checkSettings({ ...GOOD, temp_offset_c: '-1.5' }).ok, true);
  assert.equal(checkSettings({ ...GOOD, temp_offset_c: '−1.5' }).ok, true);      // a typed minus sign (U+2212) counts
});

test('sessionFrom keeps only what the page needs and when it ends', () => {
  const now = Date.parse('2026-11-02T13:00:00Z');
  const s = sessionFrom({ access_token: 'a', refresh_token: 'r', expires_in: 3600, user: { email: 'admin@example.com', id: 'u' }, extra: 1 }, now);
  assert.deepEqual(s, { token: 'a', refresh: 'r', email: 'admin@example.com', expiresAt: now + 3600_000 });
  assert.equal(sessionFrom({}, now), null);
});

test('needsRefresh: in the last minute before the end, or after it', () => {
  const s = { token: 'a', refresh: 'r', email: 'x', expiresAt: 1_000_000 };
  assert.equal(needsRefresh(s, 1_000_000 - 61_000), false);
  assert.equal(needsRefresh(s, 1_000_000 - 60_000), true);
  assert.equal(needsRefresh(s, 1_000_001), true);
  assert.equal(needsRefresh(null, 0), false);
});

test('initialOf: first letter of the email, upper case', () => {
  assert.equal(initialOf('admin@example.com'), 'A');
  assert.equal(initialOf(''), '?');
});

// P05-04 device health panel: words for the numbers the device sends (the approved wording, design/admin/health/README.md).
test('signalState: Good at -65 dBm or stronger, Fair -66 to -75, Weak below -75', () => {
  assert.deepEqual(signalState(-58), { word: 'Good', kind: 'ok', dbm: '−58 dBm' });
  assert.equal(signalState(-65).word, 'Good');
  assert.equal(signalState(-66).word, 'Fair');
  assert.equal(signalState(-75).word, 'Fair');
  assert.deepEqual(signalState(-81), { word: 'Weak', kind: 'warn', dbm: '−81 dBm' });
  assert.equal(signalState(0).word, 'Good');
  assert.equal(signalState(0).dbm, '0 dBm');
});

test('restartState: plain words, the raw code kept, and a warning only when the device stopped, crashed or lost power', () => {
  assert.deepEqual(restartState('POWERON'), { word: 'Power on', kind: null, code: 'POWERON' });
  assert.equal(restartState('EXT').word, 'Reset pin');
  assert.equal(restartState('SW').word, 'Software restart');
  assert.equal(restartState('DEEPSLEEP').word, 'Woke from sleep');
  assert.deepEqual(restartState('TASK_WDT'), { word: 'Stopped responding', kind: 'warn', code: 'TASK_WDT' });
  for (const c of ['INT_WDT', 'WDT']) assert.deepEqual([restartState(c).word, restartState(c).kind], ['Stopped responding', 'warn']);
  assert.deepEqual([restartState('PANIC').word, restartState('PANIC').kind], ['Crash', 'warn']);
  assert.deepEqual([restartState('BROWNOUT').word, restartState('BROWNOUT').kind], ['Power dipped', 'warn']);
  for (const c of ['SDIO', 'UNKNOWN', 'SOMETHING_NEW', '', undefined]) assert.deepEqual([restartState(c).word, restartState(c).kind], ['Unknown', null]);
});

test('agoText: seconds, minutes, hours, days', () => {
  assert.equal(agoText(0), '0 s ago');
  assert.equal(agoText(59_000), '59 s ago');
  assert.equal(agoText(60_000), '1 min ago');
  assert.equal(agoText(6 * 60_000 + 20_000), '6 min ago');
  assert.equal(agoText(59 * 60_000), '59 min ago');
  assert.equal(agoText(2 * 3600_000), '2 h ago');
  assert.equal(agoText(23 * 3600_000), '23 h ago');
  assert.equal(agoText(47 * 3600_000), '1 d ago');
  assert.equal(agoText(3 * 86400_000), '3 d ago');
  assert.equal(agoText(-5000), '0 s ago'); // a clock a little behind
});

test('reportState: Just now up to 120 s (the offline rule of the live page), Late after that', () => {
  const now = Date.parse('2026-11-02T13:00:00Z');
  const at = (ms) => new Date(now - ms).toISOString();
  assert.deepEqual(reportState(at(60_000), now), { word: 'Just now', kind: 'ok', ago: '1 min ago' });
  assert.equal(reportState(at(120_000), now).word, 'Just now');
  assert.deepEqual(reportState(at(120_001), now), { word: 'Late', kind: 'bad', ago: '2 min ago' });
  assert.deepEqual(reportState(at(6 * 60_000), now), { word: 'Late', kind: 'bad', ago: '6 min ago' });
  assert.equal(reportState('not a date', now), null);
  assert.equal(reportState(undefined, now), null);
});

// F-23: Reset puts the default room name back in the box; Save then writes it.
test('F-23: the reset name is Unassigned, it passes the room check, and Reset is only on when the box says something else', () => {
  assert.equal(RESET_ROOM, 'Unassigned');
  assert.deepEqual(checkRoom(RESET_ROOM), { ok: true, value: 'Unassigned' });
  assert.ok(RESET_ROOM.length <= 12, 'must fit the 12 characters of the OLED');
  assert.equal(canReset('Room 204'), true);
  assert.equal(canReset(''), true, 'an empty box can be reset');
  assert.equal(canReset('Unassigned'), false);
  assert.equal(canReset('  Unassigned  '), false, 'spaces around it do not count');
});
