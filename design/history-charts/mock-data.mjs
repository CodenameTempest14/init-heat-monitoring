// Made-up readings for the history-chart mocks and for the UI gate (tests/ui-gate-history.test.js): same numbers in both.
// Averages per bucket (24 h = 15 min buckets, 7 d = 1 h buckets); "now" is Monday 14:00.
import { heatIndexC } from '../../src/heat-index.js';

// ---- made-up data: averages per bucket (24 h = 15 min buckets, 7 d = 1 h buckets) ----
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const pad = (n) => String(n).padStart(2, '0');
// The heat index is only defined inside its range (D-020): below it the function gives null and the chart draws no line there.
const hiOrNull = (t, rh) => { const v = heatIndexC(t, rh); return v === null ? null : +v.toFixed(1); };
export function series(range) {
  // "now" is Monday 14:00. t is hours since the start of the window.
  const hours = range === '24h' ? 24 : 168;
  const step = range === '24h' ? 0.25 : 1;
  const nowDow = 1;
  const pts = [];
  for (let t = 0; t <= hours + 1e-9; t += step) {
    const hAbs = 14 - hours + t;                       // hours relative to today 00:00 (negative = earlier)
    const hod = ((hAbs % 24) + 24) % 24;               // hour of day
    const dayIdx = Math.floor(hAbs / 24);              // 0 today, -1 yesterday...
    const dow = (((nowDow + dayIdx) % 7) + 7) % 7;
    const w = Math.exp(-(((hAbs / 24 + 1) / 1.2) ** 2)); // smooth "weekend" weight, centred on Sunday: no step at midnight
    const amp = 4.4 - 2.2 * w;
    const cyc = Math.cos(((hod - 14.5) / 24) * 2 * Math.PI);
    const noise = Math.sin(hAbs * 7.3) * 0.25 + Math.sin(hAbs * 2.1) * 0.15;
    const temp = 28.1 + amp * cyc + noise;
    const rh = 76 - 2.2 * amp * cyc + Math.sin(hAbs * 5.1) * 1.2;
    pts.push({ t, hAbs, hod, dow, temp: +temp.toFixed(1), rh: Math.round(rh), hi: hiOrNull(+temp.toFixed(1), Math.round(rh)) });
  }
  // an outage with no readings (the board lost power): the line breaks, nothing is drawn across it
  const gap = range === '24h' ? [-5.0, -3.75] : [-80, -75];
  for (const p of pts) if (p.hAbs >= gap[0] && p.hAbs <= gap[1]) p.temp = p.rh = p.hi = null;
  return pts;
}
