import { categoryOf } from './category.js';

// Text helpers for the page. Plain functions with no browser or network code, so tests/web-lib.test.js can run them.

// "updated" age in words. `nowMs` is passed in so a test can fix the time.
export function ageText(recordedAt, nowMs) {
  const t = Date.parse(recordedAt);
  if (!recordedAt || Number.isNaN(t)) return 'unknown';
  const s = Math.max(0, Math.floor((nowMs - t) / 1000)); // a time in the future (clock skew) counts as 0
  if (s < 60) return 'just now';
  const min = Math.floor(s / 60);
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? '1 day ago' : `${d} days ago`;
}

// Same age, without "ago" ("12 min"), for the offline badge.
export function durationText(recordedAt, nowMs) {
  return ageText(recordedAt, nowMs).replace(/ ago$/, '');
}

// F-03: the device counts as offline when its newest reading is more than 3 min old (3 missed 60 s uploads, owner approved
// the badge s16). Age comes from received_at (the server's clock, so a wrong device clock cannot fake "online").
export const OFFLINE_AFTER_S = 180;
export function deviceStatus(row, nowMs) {
  if (!row) return { kind: 'wait', text: 'Waiting for the first reading' };
  const at = row.received_at || row.recorded_at;
  const t = Date.parse(at);
  if (Number.isNaN(t) || (nowMs - t) / 1000 > OFFLINE_AFTER_S) {
    return { kind: 'offline', text: `Offline: no reading for ${durationText(at, nowMs)}` };
  }
  return { kind: 'online', text: 'Online' };
}

// One row of the readings table (as the REST API returns it) turned into the words shown on the page.
// Numbers may arrive as strings (Postgres numeric). The heat index is shown in whole degrees (D-019); `heatIndex` is the
// bare number because the card draws the unit next to it. `category` is null when there is no row or no usable number.
export function readingView(row, nowMs) {
  if (!row) return { room: '—', temp: '—', rh: '—', heatIndex: '—', category: null, label: 'Heat index', updated: 'no readings yet' };
  const offline = deviceStatus(row, nowMs).kind === 'offline';
  const at = row.received_at || row.recorded_at;
  return {
    room: row.room || '—',
    temp: `${Number(row.temp_c).toFixed(1)} °C`,
    rh: `${Math.round(Number(row.rh_pct))} %`,
    heatIndex: row.heat_index_c === null ? '—' : String(Math.round(Number(row.heat_index_c))),
    category: categoryOf(row.heat_index_c),
    label: offline ? 'Last heat index' : 'Heat index',
    updated: offline ? `last reading ${ageText(at, nowMs)}` : `updated ${ageText(row.recorded_at, nowMs)}`,
  };
}
