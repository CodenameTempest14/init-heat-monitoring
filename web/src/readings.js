// F-24 readings table under the history charts: the pure parts (Manila days, the from-to check, one row, the CSV).
// No browser or network code, so tests/web-readings.test.js can run them. The data comes from the database function
// readings_hourly (hourly averages, newest first, 500 rows per call) and readings_span (first and last reading).
import { categoryOf, CATEGORY_LABEL } from './category.js';

export const PAGE_SIZE = 500; // the database caps a call at 500 rows too
const MANILA_MS = 8 * 3_600_000; // UTC+8, no daylight saving
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' of a moment in Philippine time. */
export const manilaDay = (ms) => new Date(ms + MANILA_MS).toISOString().slice(0, 10);

/** The first and last day that have readings, from readings_span; null when there is none. */
export function spanDays(span) {
  if (!span?.first_at || !span?.last_at) return null;
  return { min: manilaDay(Date.parse(span.first_at)), max: manilaDay(Date.parse(span.last_at)) };
}

export const defaultRange = (days) => ({ from: days.max, to: days.max });

export function checkRange(from, to, days) {
  if (!days) return { ok: false, error: 'There are no readings yet.' };
  if (!from || !to) return { ok: false, error: 'Pick both days.' };
  if (to < from) return { ok: false, error: 'The To day must not be before the From day.' };
  if (from < days.min || to > days.max) return { ok: false, error: `Readings exist from ${days.min} to ${days.max}.` };
  return { ok: true };
}

/** '3 Nov, 16:00' in Philippine time. */
export function timeLabel(iso) {
  const d = new Date(Date.parse(iso) + MANILA_MS);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function rowView(r) {
  const levelKey = categoryOf(r.heat_index_c);
  return {
    key: `${r.hour}|${r.room}`,
    time: timeLabel(r.hour),
    room: r.room,
    temp: `${Number(r.temp_c).toFixed(1)} °C`,
    rh: `${Number(r.rh_pct).toFixed(1)} %`,
    hi: r.heat_index_c === null ? '—' : `${Math.round(r.heat_index_c)} °C`,
    level: levelKey === 'below-range' ? 'Below range' : CATEGORY_LABEL[levelKey],
    levelKey,
  };
}

/** A full page means there may be more rows; a short page is the end. */
export const hasMore = (pageLength) => pageLength === PAGE_SIZE;

// A cell that starts with = + - or @ can be run as a formula by a spreadsheet; a room name is typed by an admin, so guard it.
const cell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

export function csvOf(rows) {
  const head = 'hour_manila,room,temp_c,rh_pct,heat_index_c,level,readings_in_hour';
  const lines = rows.map((r) => {
    const d = new Date(Date.parse(r.hour) + MANILA_MS).toISOString();
    return [`${d.slice(0, 10)} ${d.slice(11, 16)}`, r.room, Number(r.temp_c).toFixed(1), Number(r.rh_pct).toFixed(1), r.heat_index_c ?? '', CATEGORY_LABEL[categoryOf(r.heat_index_c)], r.n].map(cell).join(',');
  });
  return [head, ...lines, ''].join('\r\n');
}

export const csvName = (from, to) => `init-readings_${from}_to_${to}.csv`;
