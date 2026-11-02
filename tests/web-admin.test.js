// P05-01 / P05-02 / P05-06: the pure parts of the admin view. The page checks the same ranges as the database CHECKs
// (supabase/migrations/20261031120000_core_schema.sql) so the admin sees a clear message; the database still decides.
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRoom, checkSettings, sessionFrom, needsRefresh, initialOf, SETTING_RANGES } from '../web/src/admin.js';

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
