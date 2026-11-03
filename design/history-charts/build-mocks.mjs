// P04-04 design: mock pages of the 24 h / 7 d history charts (F-04), made-up readings for a made-up room.
// Three charts, one series each (heat index, temperature, humidity): never two scales on one plot.
// Usage: node design/history-charts/build-mocks.mjs   (writes <state>.html next to this file)
import { HEADER_TOP } from '../pwa/header.mjs';
import { writeFileSync } from 'node:fs';
import { heatCategory } from '../../src/heat-index.js';

import { series, DAYS, pad } from './mock-data.mjs';
import { readingsSection } from '../room-reset-readings/section.mjs';

const label = (p, range) => (range === '24h' ? `${pad(Math.floor(p.hod))}:${pad(Math.round((p.hod % 1) * 60))}` : `${DAYS[p.dow]} ${pad(Math.floor(p.hod))}:00`);

// ---- chart geometry ----
const H = 156, M = { l: 34, r: 10, t: 10, b: 28 };
function nice(min, max) {
  const raw = (max - min) / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const ticks = []; for (let v = lo; v <= hi + 1e-9; v += step) ticks.push(+v.toFixed(6));
  return { lo, hi, ticks };
}
// PAGASA lines (D-019); drawn only when inside the chart's range.
const LINES = [{ v: 33, cat: 'extreme-caution', name: 'Extreme caution' }, { v: 42, cat: 'danger', name: 'Danger' }];

function chart({ pts, key, W, range, cls, title, unit, fmt, hover, lines }) {
  const vals = pts.map((p) => p[key]).filter((v) => v !== null);
  const { lo, hi, ticks } = nice(Math.min(...vals), Math.max(...vals));
  const x = (t) => M.l + (t / (range === '24h' ? 24 : 168)) * (W - M.l - M.r);
  const y = (v) => M.t + (1 - (v - lo) / (hi - lo)) * (H - M.t - M.b);
  let out = `<svg class="viz-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title}, ${range === '24h' ? 'last 24 hours' : 'last 7 days'}; the table below has every value">`;
  for (const v of ticks) out += `<line class="viz-grid" x1="${M.l}" x2="${W - M.r}" y1="${y(v)}" y2="${y(v)}"/><text class="viz-tick" x="${M.l - 6}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`;
  // x ticks: every 6 h for 24 h; every midnight for 7 d
  const xt = pts.filter((p) => (range === '24h' ? p.hod % 6 === 0 : p.hod === 0));
  for (const p of xt) out += `<text class="viz-tick" x="${x(p.t)}" y="${H - 10}" text-anchor="middle">${range === '24h' ? `${pad(p.hod)}:00` : DAYS[p.dow]}</text>`;
  if (lines) for (const L of LINES) if (L.v > lo && L.v < hi) out += `<line class="viz-ref viz-ref-${L.cat}" x1="${M.l}" x2="${W - M.r}" y1="${y(L.v)}" y2="${y(L.v)}"/><text class="viz-reflabel" x="${M.l + 4}" y="${y(L.v) - 4}">${L.name} ${L.v}</text>`;
  // the line, broken wherever a bucket has no reading
  let d = '', pen = false;
  for (const p of pts) { if (p[key] === null) { pen = false; continue; } d += `${pen ? 'L' : 'M'}${x(p.t).toFixed(1)} ${y(p[key]).toFixed(1)}`; pen = true; }
  out += `<path class="viz-line ${cls}" d="${d}"/>`;
  // a bucket with no neighbour is a one-point path and draws nothing, so it gets a small dot (found on the real page, s20)
  pts.forEach((p, i) => { if (p[key] !== null && !(pts[i - 1] && pts[i - 1][key] !== null) && !(pts[i + 1] && pts[i + 1][key] !== null)) out += `<circle class="viz-dot ${cls}" cx="${x(p.t)}" cy="${y(p[key])}" r="3"/>`; });
  // end label: the latest value, dot on the last point (selective direct label)
  const last = pts[pts.length - 1];
  out += `<circle class="viz-dot ${cls}" cx="${x(last.t)}" cy="${y(last[key])}" r="4"/>`;
  if (hover) { const hp = pts.find((p) => p.hAbs === hover); out += `<line class="viz-cross" x1="${x(hp.t)}" x2="${x(hp.t)}" y1="${M.t}" y2="${H - M.b}"/><circle class="viz-dot ${cls}" cx="${x(hp.t)}" cy="${y(hp[key])}" r="4"/>`; }
  out += '</svg>';
  return `<section class="card viz-card" aria-label="${title}"><div class="card-body">
    <div class="viz-head"><h2 class="viz-title">${title} <span class="viz-unit">${unit}</span></h2><p class="viz-now"><span class="viz-key ${cls}"></span>${fmt(last[key])}${unit === '%' ? ' %' : ' °C'} now</p></div>
    ${out}${lines ? '<p class="viz-caption">No line where the heat index is below its calculation range (about 27 °C).</p>' : ''}</div></section>`;
}

function table(pts, range, rows) {
  const body = pts.slice().reverse().filter((_, i) => i < rows).map((p) => `<tr><td>${label(p, range)}</td><td>${p.hi === null ? '—' : Math.round(p.hi)}</td><td>${p.temp ?? '—'}</td><td>${p.rh ?? '—'}</td></tr>`).join('');
  return `<details class="viz-tablebox"${rows > 0 ? ' open' : ''}><summary>Show as table</summary>
    <div class="viz-tablescroll"><table class="table table-sm viz-table"><thead><tr><th>${range === '24h' ? 'Time' : 'Day and hour'}</th><th>Heat index °C</th><th>Temp °C</th><th>Humidity %</th></tr></thead><tbody>${body}</tbody></table></div></details>`;
}

function history({ range, W, hover, tableRows = 0, empty }) {
  const filter = `<div class="viz-filter" role="group" aria-label="Time range">
      <button type="button" class="btn viz-range" aria-pressed="${range === '24h'}">Last 24 hours</button>
      <button type="button" class="btn viz-range" aria-pressed="${range === '7d'}">Last 7 days</button></div>`;
  if (empty) return `<section class="viz-wrap" aria-label="History"><h2 class="viz-section">History</h2>${filter}
    <div class="card viz-card"><div class="card-body"><p class="viz-empty">No readings in the last 24 hours yet.</p></div></div></section>`;
  const pts = series(range);
  const common = { pts, W, range, hover };
  // One readout for all three charts, in the page flow above them (a finger or the pointer never hides the data)
  let tip = '<div class="viz-tip" role="status"><p class="viz-hint">Touch or hover a chart to read the values at that time.</p></div>';
  if (hover) {
    const hp = pts.find((p) => p.hAbs === hover);
    tip = `<div class="viz-tip" role="status"><p class="viz-tip-time">${label(hp, range)}</p>
      <p><span class="viz-key s-hi"></span><strong>${hp.hi === null ? '—' : Math.round(hp.hi)} °C</strong> <span>Heat index</span></p>
      <p><span class="viz-key s-temp"></span><strong>${hp.temp} °C</strong> <span>Temperature</span></p>
      <p><span class="viz-key s-rh"></span><strong>${hp.rh} %</strong> <span>Humidity</span></p></div>`;
  }
  return `<section class="viz-wrap" aria-label="History"><h2 class="viz-section">History</h2>${filter}${tip}
    <div class="viz-charts">
    ${chart({ ...common, key: 'hi', cls: 's-hi', title: 'Heat index', unit: '°C', fmt: (v) => String(Math.round(v)), lines: true })}
    ${chart({ ...common, key: 'temp', cls: 's-temp', title: 'Temperature', unit: '°C', fmt: (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1)) })}
    ${chart({ ...common, key: 'rh', cls: 's-rh', title: 'Humidity', unit: '%', fmt: (v) => String(Math.round(v)) })}
    </div>${table(pts, range, tableRows)}</section>`;
}

// ---- the page: same top as the approved home page (online state), history below ----
// The cards at the top show the newest chart point, so the page agrees with itself.
const topPt = series('24h').at(-1);
const top = { ...topPt, cat: heatCategory(Math.round(topPt.hi)) };
const SHAPES = { 'caution': '<circle cx="12" cy="12" r="9"/>', 'extreme-caution': '<path d="M12 3 22 21H2z"/>', 'danger': '<path d="M12 2 22 12 12 22 2 12z"/>' };
const CAT_LABEL = { 'caution': 'Caution', 'extreme-caution': 'Extreme caution', 'danger': 'Danger' };
const STATES = [
  { id: '24h', range: '24h' },
  { id: '7d', range: '7d' },
  { id: '24h-hover', range: '24h', hover: -8 }, // yesterday 16:00, the afternoon peak: a high heat index in the readout
  { id: '24h-table', range: '24h', tableRows: 8 },
  { id: 'empty', range: '24h', empty: true },
];

for (const s of STATES) {
  for (const wide of s.id === '24h' ? [false, true] : [false]) {
    const W = wide ? 456 : 326; // inner width of a chart card: 520 px column (or 390 px phone) minus page and card padding
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Init: mock history ${s.id}${wide ? ' wide' : ''}</title>
<link rel="stylesheet" href="../../web/node_modules/@tabler/core/dist/css/tabler.min.css">
<link rel="stylesheet" href="../../web/src/tokens.css">
<link rel="stylesheet" href="../../web/src/app.css">
<link rel="stylesheet" href="../../web/src/charts.css">
<link rel="stylesheet" href="../../web/src/school.css">
<link rel="stylesheet" href="../../web/src/readings.css">
</head>
<body>
<main class="app-wrap">
  <header class="app-head">${HEADER_TOP}<p class="text-secondary app-room">Room: Room 204</p>
    <p class="status status-online" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dot" cx="12" cy="12" r="6"/></svg>Online</p></header>
  <section class="card heat heat-${top.cat}" aria-label="Heat index"><div class="card-body">
    <p class="app-label">Heat index</p>
    <p class="heat-num">${Math.round(top.hi)}<span class="heat-unit">°C</span></p>
    <p class="heat-cat"><svg viewBox="0 0 24 24" aria-hidden="true">${SHAPES[top.cat]}</svg>${CAT_LABEL[top.cat]}</p>${top.cat === 'below-range' ? '' : `
    <a class="heat-more" href="#heat/${top.cat}">What does this mean? ›</a>`}
  </div></section>
  <div class="app-pair">
    <section class="card" aria-label="Temperature"><div class="card-body"><p class="app-label">Temperature</p><p class="stat">${top.temp.toFixed(1)} °C</p></div></section>
    <section class="card" aria-label="Humidity"><div class="card-body"><p class="app-label">Humidity</p><p class="stat">${top.rh} %</p></div></section>
  </div>
  <p class="text-secondary app-updated">updated just now</p>
  <a class="school-link" href="#school"><span>School day summary</span><span aria-hidden="true">›</span></a>
  ${history({ ...s, W })}
  ${readingsSection(s.empty ? 'none' : 'rows')}
</main>
</body>
</html>
`;
    const name = `${s.id}${wide ? '-wide' : ''}`;
    writeFileSync(new URL(`./${name}.html`, import.meta.url), html);
    console.log(`${name}.html`);
  }
}
