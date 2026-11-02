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

// One row of the readings table (as the REST API returns it) turned into the words shown on the page.
// Numbers may arrive as strings (Postgres numeric). The heat index is shown in whole degrees (D-019).
export function readingView(row, nowMs) {
  if (!row) return { room: '—', temp: '—', rh: '—', heatIndex: '—', updated: 'no readings yet' };
  return {
    room: row.room || '—',
    temp: `${Number(row.temp_c).toFixed(1)} °C`,
    rh: `${Math.round(Number(row.rh_pct))} %`,
    heatIndex: `${Math.round(Number(row.heat_index_c))} °C`,
    updated: `updated ${ageText(row.recorded_at, nowMs)}`,
  };
}
