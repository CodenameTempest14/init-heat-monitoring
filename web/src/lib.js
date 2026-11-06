import { categoryOf } from './category.js';
import { translate } from './i18n.js';

// Text helpers for the page. Plain functions with no browser or network code, so tests/web-lib.test.js can run them.

// The age as a length of time without "ago": "12 min", "5 h", "3 days" (null when it is under a minute).
function lengthOf(seconds, lang) {
  if (seconds < 60) return null;
  const min = Math.floor(seconds / 60);
  if (min < 60) return translate(lang, 'dur.min', { n: min });
  const h = Math.floor(min / 60);
  if (h < 24) return translate(lang, 'dur.h', { n: h });
  const d = Math.floor(h / 24);
  return d === 1 ? translate(lang, 'dur.day1') : translate(lang, 'dur.days', { n: d });
}
const secondsSince = (recordedAt, nowMs) => {
  const t = Date.parse(recordedAt);
  if (!recordedAt || Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((nowMs - t) / 1000)); // a time in the future (clock skew) counts as 0
};

// "updated" age in words. `nowMs` is passed in so a test can fix the time. `lang` is 'en' (default) or 'fil'.
export function ageText(recordedAt, nowMs, lang = 'en') {
  const s = secondsSince(recordedAt, nowMs);
  if (s === null) return translate(lang, 'age.unknown');
  const len = lengthOf(s, lang);
  return len === null ? translate(lang, 'age.now') : translate(lang, 'age.ago', { d: len });
}

// Same age, without "ago" ("12 min"), for the offline badge.
export function durationText(recordedAt, nowMs, lang = 'en') {
  const s = secondsSince(recordedAt, nowMs);
  if (s === null) return translate(lang, 'age.unknown');
  return lengthOf(s, lang) ?? translate(lang, 'age.now');
}

// F-03: the device counts as offline when its newest reading is more than 2 min old (2 missed 60 s uploads; owner chose
// 2 min in s17, was 3 min). Age comes from received_at (the server's clock, so a wrong device clock cannot fake "online").
export const OFFLINE_AFTER_S = 120;
export function deviceStatus(row, nowMs, lang = 'en') {
  if (!row) return { kind: 'wait', text: translate(lang, 'status.wait') };
  const at = row.received_at || row.recorded_at;
  const t = Date.parse(at);
  if (Number.isNaN(t) || (nowMs - t) / 1000 > OFFLINE_AFTER_S) {
    return { kind: 'offline', text: translate(lang, 'status.offline', { d: durationText(at, nowMs, lang) }) };
  }
  return { kind: 'online', text: translate(lang, 'status.online') };
}

// One row of the readings table (as the REST API returns it) turned into the words shown on the page.
// Numbers may arrive as strings (Postgres numeric). The heat index is shown in whole degrees (D-019); `heatIndex` is the
// bare number because the card draws the unit next to it. `category` is null when there is no row or no usable number.
export function readingView(row, nowMs, lang = 'en') {
  if (!row) return { room: '—', temp: '—', rh: '—', heatIndex: '—', category: null, label: translate(lang, 'home.heatIndex'), updated: translate(lang, 'home.noReadings') };
  const offline = deviceStatus(row, nowMs, lang).kind === 'offline';
  const at = row.received_at || row.recorded_at;
  return {
    room: row.room || '—',
    temp: `${Number(row.temp_c).toFixed(1)} °C`,
    rh: `${Math.round(Number(row.rh_pct))} %`,
    heatIndex: row.heat_index_c === null ? '—' : String(Math.round(Number(row.heat_index_c))),
    category: categoryOf(row.heat_index_c),
    label: translate(lang, offline ? 'home.lastHeatIndex' : 'home.heatIndex'),
    updated: offline ? translate(lang, 'home.lastReading', { age: ageText(at, nowMs, lang) }) : translate(lang, 'home.updated', { age: ageText(row.recorded_at, nowMs, lang) }),
  };
}
