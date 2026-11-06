// P05 admin view: the pure parts (form checks, session timing). No browser or network code, so tests/web-admin.test.js
// can run them. The ranges equal the database CHECKs; the database stays the one that decides.

// [min, max, step]; the step is also the number of decimals the column keeps (whole numbers or one decimal).
export const SETTING_RANGES = {
  interval_s: [60, 3600, 1],
  temp_offset_c: [-5, 5, 0.1],
  rh_offset_pct: [-10, 10, 0.1],
  alert_heat_index_c: [27, 60, 0.1],
  alert_quiet_min: [10, 1440, 1],
};

import { translate } from './i18n.js';

const show = (n) => String(n).replace('-', '−');

// F-23: what Reset puts in the room box (the database default; 10 characters, fits the OLED's 12). Save still has to be pressed.
export const RESET_ROOM = 'Unassigned';
export const canReset = (text) => String(text ?? '').trim() !== RESET_ROOM;

export function checkRoom(text, lang = 'en') {
  const value = String(text ?? '').trim();
  if (value.length < 1) return { ok: false, error: translate(lang, 'admin.errRoomNone') };
  if (value.length > 60) return { ok: false, error: translate(lang, 'admin.errRoomLong') };
  return { ok: true, value };
}

export function checkSettings(form, lang = 'en') {
  const values = {};
  const errors = {};
  for (const [key, [min, max, step]] of Object.entries(SETTING_RANGES)) {
    const raw = String(form[key] ?? '').trim().replace('−', '-'); // a typed minus sign (U+2212) counts
    const pattern = step === 1 ? /^-?\d+$/ : /^-?\d+(\.\d)?$/;
    const n = Number(raw);
    if (!pattern.test(raw) || n < min || n > max) {
      errors[key] = translate(lang, step === 1 ? 'admin.rangeWhole' : 'admin.rangeDecimal', { min: show(min), max: show(max) });
    } else {
      values[key] = n;
    }
  }
  const ok = Object.keys(errors).length === 0;
  return { ok, values: ok ? values : {}, errors };
}

// What the sign-in answer (POST /auth/v1/token) gives, cut down to what the page keeps.
export function sessionFrom(json, nowMs) {
  if (!json || !json.access_token || !json.refresh_token) return null;
  return { token: json.access_token, refresh: json.refresh_token, email: json.user?.email || '', expiresAt: nowMs + json.expires_in * 1000 };
}

// Refresh in the last minute before the token ends (or after it ended).
export function needsRefresh(session, nowMs) {
  return Boolean(session) && nowMs >= session.expiresAt - 60_000;
}

export const initialOf = (email) => (email ? email[0].toUpperCase() : '?');

// P05-04 device health panel: words for what the device sent. Wording and bands as approved in design/admin/health/README.md.
// Good at -65 dBm or stronger, Fair -66 to -75, Weak below -75. `kind` picks the icon: ok (tick), warn (triangle), bad (cross), null (none).
export function signalState(rssiDbm, lang = 'en') {
  const level = rssiDbm >= -65 ? 'good' : rssiDbm >= -75 ? 'fair' : 'weak';
  return { word: translate(lang, `signal.${level}`), kind: level === 'weak' ? 'warn' : 'ok', dbm: `${show(rssiDbm)} dBm` };
}

// code from the chip -> [key of its words, icon kind]
const RESTART = {
  POWERON: ['POWERON', null],
  EXT: ['EXT', null],
  SW: ['SW', null],
  DEEPSLEEP: ['DEEPSLEEP', null],
  PANIC: ['PANIC', 'warn'],
  INT_WDT: ['WDT', 'warn'],
  TASK_WDT: ['WDT', 'warn'],
  WDT: ['WDT', 'warn'],
  BROWNOUT: ['BROWNOUT', 'warn'],
};
export function restartState(code, lang = 'en') {
  const [key, kind] = Object.hasOwn(RESTART, code) ? RESTART[code] : ['unknown', null];
  return { word: translate(lang, `restart.${key}`), kind, code };
}

export function agoText(ms, lang = 'en') {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return translate(lang, 'ago.s', { n: s });
  if (s < 3600) return translate(lang, 'ago.min', { n: Math.floor(s / 60) });
  if (s < 86400) return translate(lang, 'ago.h', { n: Math.floor(s / 3600) });
  return translate(lang, 'ago.d', { n: Math.floor(s / 86400) });
}

// Late = older than 120 s, the same rule as the Offline badge on the live page.
export function reportState(reportedAt, nowMs, lang = 'en') {
  const t = Date.parse(reportedAt);
  if (!Number.isFinite(t)) return null;
  const age = nowMs - t;
  return { word: translate(lang, age > 120_000 ? 'report.late' : 'report.just'), kind: age > 120_000 ? 'bad' : 'ok', ago: agoText(age, lang) };
}
