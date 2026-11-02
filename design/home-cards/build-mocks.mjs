// P04-02 design: mock pages of the live cards (F-01, F-02, F-21), one per heat category, made-up readings.
// They use the real stylesheet (web/src/app.css + tokens.css + Tabler), so an approved image can be matched by the built page.
// Usage: node design/home-cards/build-mocks.mjs   (writes <state>.html next to this file)
import { HEADER_TOP } from '../pwa/header.mjs';
import { writeFileSync } from 'node:fs';

const SHAPES = {
  'caution': '<circle cx="12" cy="12" r="9"/>',
  'extreme-caution': '<path d="M12 3 22 21H2z"/>',
  'danger': '<path d="M12 2 22 12 12 22 2 12z"/>',
  'extreme-danger': '<path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z"/>',
  'below-range': '<path d="M4 12h16"/>',
};
const STATES = [
  { id: 'caution', label: 'Caution', hi: '29', temp: '28.1', rh: '62' },
  { id: 'extreme-caution', label: 'Extreme caution', hi: '40', temp: '32.5', rh: '66' },
  { id: 'danger', label: 'Danger', hi: '44', temp: '34.0', rh: '68' },
  { id: 'extreme-danger', label: 'Extreme danger', hi: '53', temp: '38.2', rh: '70' },
  { id: 'below-range', label: 'Below heat-index range', hi: '24', temp: '23.6', rh: '55' },
];

for (const s of STATES) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Init: mock ${s.id}</title>
<link rel="stylesheet" href="../../web/node_modules/@tabler/core/dist/css/tabler.min.css">
<link rel="stylesheet" href="../../web/src/tokens.css">
<link rel="stylesheet" href="../../web/src/app.css">
</head>
<body>
<main class="app-wrap">
  <header class="app-head">${HEADER_TOP}<p class="text-secondary app-room">Room: Room 204</p>
    <p class="status status-online" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dot" cx="12" cy="12" r="6"/></svg>Online</p></header>
  <section class="card heat heat-${s.id}" aria-label="Heat index"><div class="card-body">
    <p class="app-label">Heat index</p>
    <p class="heat-num">${s.hi}<span class="heat-unit">°C</span></p>
    <p class="heat-cat"><svg viewBox="0 0 24 24" aria-hidden="true">${SHAPES[s.id]}</svg>${s.label}</p>
  </div></section>
  <div class="app-pair">
    <section class="card" aria-label="Temperature"><div class="card-body"><p class="app-label">Temperature</p><p class="stat">${s.temp} °C</p></div></section>
    <section class="card" aria-label="Humidity"><div class="card-body"><p class="app-label">Humidity</p><p class="stat">${s.rh} %</p></div></section>
  </div>
  <p class="text-secondary app-updated">updated 1 min ago</p>
</main>
</body>
</html>
`;
  writeFileSync(new URL(`./${s.id}.html`, import.meta.url), html);
  console.log(`${s.id}.html`);
}
