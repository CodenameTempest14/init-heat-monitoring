// P04-04 history charts (F-04): the maths, kept apart from the page so tests can check it (tests/web-history.test.js).
// The server gives one row per bucket (24 h: 15 minutes, 7 d: 1 hour; see supabase/migrations/20261103120000_history.sql).

export const RANGES = {
  '24h': { hours: 24, stepMs: 15 * 60_000, words: 'last 24 hours' },
  '7d': { hours: 168, stepMs: 3_600_000, words: 'last 7 days' },
};
const HOUR_MS = 3_600_000;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');
const num = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

/** Round axis ticks around [min, max], about 4 steps. A flat line is widened by 1 so the scale never collapses. */
export function niceScale(min, max) {
  if (max - min < 1e-9) { min -= 1; max += 1; }
  const raw = (max - min) / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + 1e-9; v += step) ticks.push(+v.toFixed(6));
  return { lo, hi, ticks };
}

/** The server's bucket rows -> points. t = hours since the window start (now minus the range); rows before it are dropped. */
export function buildSeries(rows, range, nowMs) {
  const { hours, stepMs } = RANGES[range];
  const startMs = nowMs - hours * HOUR_MS;
  const pts = [];
  for (const r of rows) {
    const ms = Date.parse(r.bucket);
    if (Number.isNaN(ms) || ms < startMs) continue;
    pts.push({ t: (ms - startMs) / HOUR_MS, ms, temp: num(r.temp_c), rh: num(r.rh_pct), hi: num(r.heat_index_c) });
  }
  pts.sort((a, b) => a.ms - b.ms);
  return { range, hours, startMs, stepMs, pts };
}

const f = (n) => +n.toFixed(1); // one decimal, as in the approved mocks
/** SVG path of one value. The pen lifts where a bucket has no value or a whole bucket is missing: nothing is drawn across a gap. */
export function linePath(pts, key, x, y, stepMs) {
  let d = '';
  let prev = null; // the previous point if the pen is down
  for (const p of pts) {
    if (p[key] === null) { prev = null; continue; }
    const join = prev && p.ms - prev.ms <= stepMs * 1.5;
    d += `${join ? 'L' : 'M'}${f(x(p.t))} ${f(y(p[key]))}`;
    prev = p;
  }
  return d;
}

/** Points of `key` with no joined neighbour. A path of one point draws nothing, so the page draws these as dots. */
export function loneBuckets(pts, key, stepMs) {
  const have = pts.filter((p) => p[key] !== null);
  const near = (a, b) => Boolean(a && b) && b.ms - a.ms <= stepMs * 1.5;
  return have.filter((p, i) => !near(have[i - 1], p) && !near(p, have[i + 1]));
}

/** Time labels along the bottom: every 6 h (24 h chart) or every local midnight (7 d chart), on the viewer's clock. */
export function xTicks(range, nowMs) {
  const { hours } = RANGES[range];
  const startMs = nowMs - hours * HOUR_MS;
  const d = new Date(startMs);
  if (d.getMinutes() || d.getSeconds() || d.getMilliseconds()) d.setHours(d.getHours() + 1, 0, 0, 0);
  const ticks = [];
  for (; d.getTime() <= nowMs; d.setHours(d.getHours() + 1)) {
    const h = d.getHours();
    if (range === '24h' ? h % 6 === 0 : h === 0) {
      ticks.push({ t: (d.getTime() - startMs) / HOUR_MS, label: range === '24h' ? `${pad(h)}:00` : DAYS[d.getDay()] });
    }
  }
  return ticks;
}

/** The time of a bucket as shown in the readout and the table (viewer's local time). */
export function pointLabel(ms, range) {
  const d = new Date(ms);
  const clock = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return range === '24h' ? clock : `${DAYS[d.getDay()]} ${clock}`;
}

/** Index of the point closest in time to t (hours from the window start); -1 when there are no points. */
export function nearestIndex(pts, t) {
  let best = -1;
  for (let i = 0; i < pts.length; i++) if (best < 0 || Math.abs(pts[i].t - t) < Math.abs(pts[best].t - t)) best = i;
  return best;
}

/** The newest point that has a value for `key`, or null. */
export function latestWith(pts, key) {
  for (let i = pts.length - 1; i >= 0; i--) if (pts[i][key] !== null) return pts[i];
  return null;
}
