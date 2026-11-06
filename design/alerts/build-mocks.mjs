// P05-03 design: mock pages of the #alerts view (F-10, P5-f/g/h; DECIDE 3 = a row under School day summary).
// Made-up room (Room 204) and the default settings (threshold 42 °C, quiet period 60 min). Wording: draft, the teacher
// reviews it before live (D-034).
// Usage: node design/alerts/build-mocks.mjs   (writes <state>.html next to this file)
import { writeFileSync } from 'node:fs';
import { HEADER_TOP } from '../pwa/header.mjs';
import { ROOM_ROW, LANG_CSS_LINK } from '../language-toggle/room-row.mjs';

const ICON = {
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  off: '<path d="M6 8a6 6 0 0 1 9.3-5"/><path d="M18 8c0 7 3 9 3 9H9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="m2 2 20 20"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[name]}</svg>`;

// What every state shows first: what an alert is, from the admin's settings (public values).
const rule = `<p class="alerts-lead">Get a notification on this phone when the classroom gets dangerously hot.</p>
      <ul class="alerts-rule">
        <li><span>When the heat index in <strong>Room 204</strong> reaches <strong>42 °C</strong> (Danger).</span></li>
        <li><span>If it stays that hot, a reminder comes every <strong>60 minutes</strong>.</span></li>
      </ul>`;
const fine = '<p class="alerts-fine">No name or email is asked. Only this phone gets the alerts, and you can stop them at any time.</p>';

const states = {
  // The usual start: alerts off, the browser can receive them. The browser asks permission only after the tap.
  'alerts-off': `${rule}
      <button type="button" class="btn btn-primary alerts-btn">${icon('bell')}<span>Send me heat alerts</span></button>
      ${fine}`,
  // After a successful subscribe.
  'alerts-on': `<p class="alerts-state" role="status">${icon('check')}<span>Heat alerts are on for this phone.</span></p>
      ${rule}
      <button type="button" class="btn alerts-btn">Stop alerts</button>
      ${fine}`,
  // iPhone or iPad in Safari, not opened from the Home Screen: iOS only allows web push for installed apps.
  'alerts-iphone': `${rule}
      <p class="alerts-state">${icon('phone')}<span>On iPhone, add Init to your Home Screen first, then open it from there.</span></p>
      <ol class="alerts-steps"><li>Tap the Share button <span aria-hidden="true">(□↑)</span>.</li><li>Tap <strong>Add to Home Screen</strong>.</li><li>Open <strong>Init</strong> from the Home Screen and come back here.</li></ol>`,
  // The person (or the browser) said no to notifications for this site.
  'alerts-blocked': `<p class="alerts-state" role="status">${icon('off')}<span>Notifications are blocked for Init on this phone.</span></p>
      ${rule}
      <p class="alerts-lead">To get alerts, allow notifications for this site in your browser's settings, then come back here.</p>`,
  // A browser with no web push at all.
  'alerts-unsupported': `<p class="alerts-state" role="status">${icon('off')}<span>This browser cannot receive heat alerts.</span></p>
      ${rule}
      <p class="alerts-lead">Try Chrome on Android, or on iPhone add Init to the Home Screen.</p>`,
};

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
<link rel="stylesheet" href="../../web/src/alerts.css">
${LANG_CSS_LINK}
</head>`;
const top = `<header class="app-head">${HEADER_TOP}${ROOM_ROW(`Room: Room 204`)}
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
const view = (body) => `${back}<section class="viz-wrap" aria-label="Heat alerts"><h2 class="viz-section">Heat alerts</h2>
    <div class="card viz-card"><div class="card-body">
      ${body}
    </div></div></section>`;

for (const [name, body] of Object.entries(states)) {
  writeFileSync(new URL(`./${name}.html`, import.meta.url), page(name, view(body)));
  console.log(`${name}.html`);
}

// The home page gains one row under "School day summary ›": the way into #alerts (DECIDE 3).
const homeTop = `<section class="card heat heat-danger" aria-label="Heat index"><div class="card-body">
    <p class="app-label">Heat index</p><p class="heat-num">43<span class="heat-unit">°C</span></p>
    <p class="heat-cat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 22 12 12 22 2 12z"/></svg>Danger</p><a class="heat-more" href="#heat/danger">What does this mean? ›</a></div></section>
  <div class="app-pair">
    <section class="card" aria-label="Temperature"><div class="card-body"><p class="app-label">Temperature</p><p class="stat">34.1 °C</p></div></section>
    <section class="card" aria-label="Humidity"><div class="card-body"><p class="app-label">Humidity</p><p class="stat">62 %</p></div></section>
  </div>
  <p class="text-secondary app-updated">updated just now</p>
  <a class="school-link" href="#school"><span>School day summary</span><span aria-hidden="true">›</span></a>
  <a class="school-link alerts-link" href="#alerts"><span>Heat alerts</span><span aria-hidden="true">›</span></a>
  <section class="viz-wrap" aria-label="History"><h2 class="viz-section">History</h2><p class="viz-note">(the charts continue here, unchanged)</p></section>`;
writeFileSync(new URL('./home-link.html', import.meta.url), page('home with the heat alerts link', homeTop));
console.log('home-link.html');
