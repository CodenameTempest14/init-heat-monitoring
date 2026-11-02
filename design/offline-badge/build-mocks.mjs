// P04-03 design: mock pages of the online/offline badge (F-03), made-up readings. Same markup as the live page plus the badge.
// Usage: node design/offline-badge/build-mocks.mjs   (writes <state>.html next to this file)
import { HEADER_TOP } from '../pwa/header.mjs';
import { writeFileSync } from 'node:fs';

const ICON = {
  online: '<circle class="dot" cx="12" cy="12" r="6"/>',                       // filled dot
  offline: '<circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8"/>',     // ring with a cross
  wait: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',               // clock
};
const STATES = [
  { id: 'online', kind: 'online', text: 'Online', hiLabel: 'Heat index', upd: 'updated just now', hi: '40', cat: 'extreme-caution', catLabel: 'Extreme caution', temp: '32.5 °C', rh: '66 %' },
  { id: 'offline-12min', kind: 'offline', text: 'Offline: no reading for 12 min', hiLabel: 'Last heat index', upd: 'last reading 12 min ago', hi: '40', cat: 'extreme-caution', catLabel: 'Extreme caution', temp: '32.5 °C', rh: '66 %' },
  { id: 'offline-3h', kind: 'offline', text: 'Offline: no reading for 3 h', hiLabel: 'Last heat index', upd: 'last reading 3 h ago', hi: '29', cat: 'caution', catLabel: 'Caution', temp: '28.1 °C', rh: '62 %' },
  { id: 'no-readings', room: '—', kind: 'wait', text: 'Waiting for the first reading', hiLabel: 'Heat index', upd: 'no readings yet', hi: '—', cat: null, temp: '—', rh: '—' },
];
const SHAPES = { 'caution': '<circle cx="12" cy="12" r="9"/>', 'extreme-caution': '<path d="M12 3 22 21H2z"/>' };

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
<link rel="stylesheet" href="../../web/src/charts.css">
<link rel="stylesheet" href="../../web/src/school.css">
</head>
<body>
<main class="app-wrap">
  <header class="app-head">${HEADER_TOP}<p class="text-secondary app-room">Room: ${s.room ?? 'Room 204'}</p>
    <p class="status status-${s.kind}" role="status"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[s.kind]}</svg>${s.text}</p></header>
  <section class="card heat${s.cat ? ` heat-${s.cat}` : ''}" aria-label="Heat index"><div class="card-body">
    <p class="app-label">${s.hiLabel}</p>
    <p class="heat-num">${s.hi}${s.cat ? '<span class="heat-unit">°C</span>' : ''}</p>
    ${s.cat ? `<p class="heat-cat"><svg viewBox="0 0 24 24" aria-hidden="true">${SHAPES[s.cat]}</svg>${s.catLabel}</p>` : ''}
  </div></section>
  <div class="app-pair">
    <section class="card" aria-label="Temperature"><div class="card-body"><p class="app-label">Temperature</p><p class="stat">${s.temp}</p></div></section>
    <section class="card" aria-label="Humidity"><div class="card-body"><p class="app-label">Humidity</p><p class="stat">${s.rh}</p></div></section>
  </div>
  <p class="text-secondary app-updated">${s.upd}</p>
<a class="school-link" href="#school"><span>School day summary</span><span aria-hidden="true">›</span></a>
</main>
</body>
</html>
`;
  writeFileSync(new URL(`./${s.id}.html`, import.meta.url), html);
  console.log(`${s.id}.html`);
}
