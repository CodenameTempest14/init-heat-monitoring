// P04-07 design: mock pages of the school-day view (F-12): highest, hottest hour, lowest, average, and the time spent in each
// PAGASA level, for one school day (Mon to Fri, 6:00 AM to 7:15 PM, owner s18). Made-up readings for a made-up room.
// Usage: node design/school-day/build-mocks.mjs   (writes <state>.html next to this file)
import { writeFileSync } from 'node:fs';
import { HEADER_TOP } from '../pwa/header.mjs';

const SHAPES = {
  'below-range': '<path d="M4 12h16"/>',
  'caution': '<circle cx="12" cy="12" r="9"/>',
  'extreme-caution': '<path d="M12 3 22 21H2z"/>',
  'danger': '<path d="M12 2 22 12 12 22 2 12z"/>',
  'extreme-danger': '<path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z"/>',
  'none': '<path d="M8 12h8" stroke-dasharray="2 3"/>',
};
const NAMES = { 'extreme-danger': 'Extreme danger', 'danger': 'Danger', 'extreme-caution': 'Extreme caution', 'caution': 'Caution', 'below-range': 'Below heat-index range', 'none': 'No reading' };
const ORDER = ['extreme-danger', 'danger', 'extreme-caution', 'caution', 'below-range', 'none']; // hottest first in the list
const BAR_ORDER = ['below-range', 'caution', 'extreme-caution', 'danger', 'extreme-danger', 'none']; // coolest to hottest in the bar

const dur = (min) => (min === 0 ? '0 min' : `${min >= 60 ? `${Math.floor(min / 60)} h ` : ''}${min % 60 ? `${min % 60} min` : ''}`.trim());

// Made-up days. Minutes add up to the length of the window (6:00 AM to 7:15 PM = 795 min; "so far" = to 2:42 PM = 522 min).
const FULL = { label: 'Fri 30 Oct', window: '6:00 AM to 7:15 PM', mins: { 'none': 45, 'below-range': 20, 'caution': 150, 'extreme-caution': 380, 'danger': 200, 'extreme-danger': 0 },
  high: ['43 °C', 'at 1:20 PM'], hour: ['42 °C average', '1:00 to 2:00 PM'], low: ['27 °C', 'at 6:20 AM'], avg: ['37 °C', ''] };
const TODAY = { label: 'Today, Mon 2 Nov', window: '6:00 AM to now (2:42 PM)', mins: { 'none': 12, 'below-range': 20, 'caution': 150, 'extreme-caution': 260, 'danger': 80, 'extreme-danger': 0 },
  high: ['42 °C', 'at 1:15 PM'], hour: ['41 °C average', '1:00 to 2:00 PM'], low: ['27 °C', 'at 6:20 AM'], avg: ['36 °C', ''] };

function bar(mins) {
  const total = Object.values(mins).reduce((a, b) => a + b, 0);
  let x = 0, out = '';
  for (const k of BAR_ORDER) {
    if (!mins[k]) continue;
    const w = (mins[k] / total) * 326;
    out += `<rect class="sb-${k}" x="${x.toFixed(1)}" y="1" width="${w.toFixed(1)}" height="22" rx="3"/>`;
    x += w;
  }
  return `<svg class="school-bar" viewBox="0 0 326 24" role="img" aria-label="Time in each level, as a bar: ${ORDER.filter((k) => mins[k]).map((k) => `${NAMES[k]} ${dur(mins[k])}`).join(', ')}">${out}</svg>`;
}
const stat = (name, [value, note]) => `<div class="school-stat"><dt>${name}</dt><dd>${value}${note ? `<small>${note}</small>` : ''}</dd></div>`;

function view({ day, weekendNote, empty, prev, next }) {
  const nav = `<div class="school-nav" role="group" aria-label="Choose a school day">
      <button type="button" class="btn viz-range">‹ ${prev}</button>
      <button type="button" class="btn viz-range"${next ? '' : ' disabled'}>${next || 'Next'} ›</button></div>`;
  const note = `<p class="viz-note">${weekendNote ? `${weekendNote}<br>` : ''}<strong>${day.label}</strong> · ${day.window}</p>`;
  if (empty) return `<section class="viz-wrap" aria-label="School day"><h2 class="viz-section">School day</h2>${note}${nav}
    <div class="card viz-card"><div class="card-body"><p class="viz-empty">No readings during school hours on this day.</p></div></div></section>`;
  return `<section class="viz-wrap" aria-label="School day"><h2 class="viz-section">School day</h2>${note}${nav}
    <div class="card viz-card"><div class="card-body">
      <dl class="school-stats">${stat('Highest', day.high)}${stat('Hottest hour', day.hour)}${stat('Lowest', day.low)}${stat('Average', day.avg)}</dl>
      <p class="viz-caption">Heat index. Moments below its calculation range (about 27 °C) are left out of these four.</p>
    </div></div>
    <div class="card viz-card"><div class="card-body">
      <h3 class="viz-title">Time in each level</h3>
      ${bar(day.mins)}
      <ul class="school-bands">${ORDER.map((k) => `<li><span class="school-chip sc-${k}"><svg viewBox="0 0 24 24" aria-hidden="true">${SHAPES[k]}</svg></span><span>${NAMES[k]}</span><strong>${dur(day.mins[k])}</strong></li>`).join('')}</ul>
    </div></div></section>`;
}

const head = (title) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Init: mock ${title}</title>
<link rel="stylesheet" href="../../web/node_modules/@tabler/core/dist/css/tabler.min.css">
<link rel="stylesheet" href="../../web/src/tokens.css">
<link rel="stylesheet" href="../../web/src/app.css">
<link rel="stylesheet" href="../../web/src/charts.css">
<link rel="stylesheet" href="../../web/src/school.css">
</head>`;
const top = `<header class="app-head">${HEADER_TOP}<p class="text-secondary app-room">Room: Room 204</p>
    <p class="status status-online" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dot" cx="12" cy="12" r="6"/></svg>Online</p></header>`;
const page = (title, body) => `${head(title)}
<body>
<main class="app-wrap">
  ${top}
  ${body}
</main>
</body>
</html>
`;
const back = '<a class="school-back" href="#">‹ Live readings</a>';

const states = {
  'school-day': view({ day: FULL, prev: 'Thu 29 Oct', next: 'Mon 2 Nov' }),
  'school-today': view({ day: TODAY, prev: 'Fri 30 Oct', next: '' }),
  'school-weekend': view({ day: FULL, weekendNote: 'No school on weekends. Showing the last school day.', prev: 'Thu 29 Oct', next: '' }),
  'school-empty': view({ day: { label: 'Wed 28 Oct', window: '6:00 AM to 7:15 PM' }, empty: true, prev: 'Tue 27 Oct', next: 'Thu 29 Oct' }),
};
for (const [name, body] of Object.entries(states)) { writeFileSync(new URL(`./${name}.html`, import.meta.url), page(name, `${back}${body}`)); console.log(`${name}.html`); }

// The home page gains one row under "updated ...": a link to this view.
const homeTop = `<section class="card heat heat-danger" aria-label="Heat index"><div class="card-body">
    <p class="app-label">Heat index</p><p class="heat-num">43<span class="heat-unit">°C</span></p>
    <p class="heat-cat"><svg viewBox="0 0 24 24" aria-hidden="true">${SHAPES.danger}</svg>Danger</p><a class="heat-more" href="#heat/danger">What does this mean? ›</a></div></section>
  <div class="app-pair">
    <section class="card" aria-label="Temperature"><div class="card-body"><p class="app-label">Temperature</p><p class="stat">34.1 °C</p></div></section>
    <section class="card" aria-label="Humidity"><div class="card-body"><p class="app-label">Humidity</p><p class="stat">62 %</p></div></section>
  </div>
  <p class="text-secondary app-updated">updated just now</p>
  <a class="school-link" href="#school"><span>School day summary</span><span aria-hidden="true">›</span></a>
  <section class="viz-wrap" aria-label="History"><h2 class="viz-section">History</h2><p class="viz-note">(the charts continue here, unchanged)</p></section>`;
writeFileSync(new URL('./home-link.html', import.meta.url), page('home with the school day link', homeTop));
console.log('home-link.html');
