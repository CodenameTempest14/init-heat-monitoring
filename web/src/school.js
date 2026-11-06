// P04-07 school-day view (F-12): the maths and words, kept apart from the page so tests can check them (tests/web-school.test.js).
// The numbers come from the database function school_day() (supabase/migrations/20261104120000_school_day.sql).
// Everything here is in Philippine time (Asia/Manila, UTC+8, no daylight saving), whatever the visitor's phone says:
// a school day belongs to a place.

import { translate, listOf } from './i18n.js';

export const MAX_DAYS_BACK = 90; // raw readings are kept 90 days
const MANILA_MS = 8 * 3_600_000;
const DAY_MS = 86_400_000;

const utc = (iso) => new Date(`${iso}T00:00:00Z`);
const shift = (iso, days) => new Date(utc(iso).getTime() + days * DAY_MS).toISOString().slice(0, 10);
const manila = (ms) => new Date(ms + MANILA_MS); // read its UTC fields to get the Philippine clock

/** The Philippine date (YYYY-MM-DD) of a moment. */
export const manilaDay = (ms) => manila(ms).toISOString().slice(0, 10);
export const isSchoolDay = (iso) => { const d = utc(iso).getUTCDay(); return d >= 1 && d <= 5; };

/** The school day before `iso`, or null when it is more than 90 days before today. */
export function prevSchoolDay(iso, today) {
  let d = shift(iso, -1);
  while (!isSchoolDay(d)) d = shift(d, -1);
  return d < shift(today, -MAX_DAYS_BACK) ? null : d;
}

/** The school day after `iso`, or null when it would be after today. */
export function nextSchoolDay(iso, today) {
  let d = shift(iso, 1);
  while (!isSchoolDay(d)) d = shift(d, 1);
  return d > today ? null : d;
}

/** The day to open: today on a school day from 6:00 AM, else the last school day. `weekend` adds the note. */
export function startDay(nowMs) {
  const today = manilaDay(nowMs);
  const started = manila(nowMs).getUTCHours() >= 6;
  if (isSchoolDay(today) && started) return { day: today, weekend: false };
  let d = shift(today, -1);
  while (!isSchoolDay(d)) d = shift(d, -1);
  return { day: d, weekend: !isSchoolDay(today) };
}

export function dayLabel(iso, today, lang = 'en') {
  const d = utc(iso);
  const text = `${listOf(lang, 'weekdays')[d.getUTCDay()]} ${d.getUTCDate()} ${listOf(lang, 'months')[d.getUTCMonth()]}`;
  return iso === today ? translate(lang, 'school.today', { day: text }) : text;
}

/** Seconds as words: "3 h 20 min", "2 h", "20 min", "0 min". Under half a minute (but not zero) is "under 1 min". */
export function durationText(seconds, lang = 'en') {
  if (seconds > 0 && seconds < 30) return translate(lang, 'school.under1');
  const min = Math.round(seconds / 60);
  if (min === 0) return '0 min';
  const h = Math.floor(min / 60), m = min % 60;
  return [h ? `${h} h` : '', m ? `${m} min` : ''].filter(Boolean).join(' ');
}

const hour12 = (h) => h % 12 || 12;
const ampm = (h) => (h < 12 ? 'AM' : 'PM');
const pad = (n) => String(n).padStart(2, '0');

/** A moment as a Philippine clock time: "1:20 PM". */
export function clockText(iso) {
  const d = manila(Date.parse(iso));
  return `${hour12(d.getUTCHours())}:${pad(d.getUTCMinutes())} ${ampm(d.getUTCHours())}`;
}

/** The clock hour that starts at `iso`: "1:00 to 2:00 PM", or "11:00 AM to 12:00 PM" across noon. */
export function hourText(iso, lang = 'en') {
  const h = manila(Date.parse(iso)).getUTCHours();
  const to = `${hour12(h + 1)}:00 ${ampm(h + 1)}`;
  return translate(lang, 'range', { a: ampm(h) === ampm(h + 1) ? `${hour12(h)}:00` : `${hour12(h)}:00 ${ampm(h)}`, b: to });
}

/** "6:00 AM to 7:15 PM", or "6:00 AM to now (2:42 PM)" while the day is still going. */
export function windowText(body, lang = 'en') {
  const end = clockText(body.window_end);
  return end === '7:15 PM' ? translate(lang, 'school.window.full') : translate(lang, 'school.window.now', { time: end });
}

const deg = (v) => `${Math.round(Number(v))} °C`;
/** The four numbers as [value, note] pairs. No heat index (everything below its range) shows a dash, never a made-up number. */
export function statsView(body, lang = 'en') {
  const none = ['—', ''];
  const at = (iso) => translate(lang, 'school.at', { time: clockText(iso) });
  return {
    highest: body.highest ? [deg(body.highest.heat_index_c), at(body.highest.at)] : none,
    hour: body.hottest_hour ? [translate(lang, 'school.avg', { value: deg(body.hottest_hour.average) }), hourText(body.hottest_hour.starts_at, lang)] : none,
    lowest: body.lowest ? [deg(body.lowest.heat_index_c), at(body.lowest.at)] : none,
    average: body.average === null ? none : [deg(body.average), ''],
  };
}

export const LEVEL_NAME = Object.fromEntries(
  ['extreme-danger', 'danger', 'extreme-caution', 'caution', 'below-range', 'no-reading'].map((k) => [k, translate('en', `level.${k}`)]),
);
const LIST_ORDER = ['extreme-danger', 'danger', 'extreme-caution', 'caution', 'below-range', 'no-reading']; // hottest first
const BAR_ORDER = ['below-range', 'caution', 'extreme-caution', 'danger', 'extreme-danger', 'no-reading']; // coolest to hottest

/** The list under the bar: every level, hottest first, with its time. */
export const bandsView = (levels, lang = 'en') => LIST_ORDER.map((key) => ({ key, name: translate(lang, `level.${key}`), seconds: levels[key], text: durationText(levels[key], lang) }));

/** Pieces of the bar, left to right, `width` units wide in all. Levels with no time are left out. */
export function barSegments(levels, width) {
  const total = BAR_ORDER.reduce((a, k) => a + levels[k], 0);
  if (!total) return [];
  let x = 0;
  const segs = [];
  for (const key of BAR_ORDER) {
    if (!levels[key]) continue;
    const w = (levels[key] / total) * width;
    segs.push({ key, x, w });
    x += w;
  }
  return segs;
}
