// P06-05 design (F-18): mocks of the English / Filipino toggle, made-up readings, made-up room. PROPOSED, not built.
// The Filipino words are a DRAFT written by the assistant: a teacher or fluent speaker must review every one before it goes live (D-034).
// Usage: node design/language-toggle/build-mocks.mjs   (writes <state>.html next to this file); node design/language-toggle/capture.mjs for ref/*.png
import { HEADER_TOP } from '../pwa/header.mjs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));

const ICON = { online: '<circle class="dot" cx="12" cy="12" r="6"/>', offline: '<circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8"/>' };
const SHAPES = { 'extreme-caution': '<path d="M12 3 22 21H2z"/>', 'extreme-danger': '<path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z"/>' };
const EN = { lang: 'en', room: 'Room: Room 204', hiLabel: 'Heat index', temp: 'Temperature', rh: 'Humidity', more: 'What does this mean? ›', school: 'School day summary', alerts: 'Heat alerts' };
const FIL = { lang: 'fil', room: 'Silid: Room 204', hiLabel: 'Heat index', temp: 'Temperatura', rh: 'Halumigmig', more: 'Ano ang ibig sabihin nito? ›', school: 'Buod ng araw sa paaralan', alerts: 'Mga babala sa init' };
const STATES = [
  { id: 'home-en', t: EN, kind: 'online', status: 'Online', cat: 'extreme-caution', catLabel: 'Extreme caution', hi: '40', temp: '32.5 °C', rh: '66 %', upd: 'updated just now' },
  { id: 'home-fil', t: FIL, kind: 'online', status: 'Online', cat: 'extreme-caution', catLabel: 'Matinding pag-iingat', hi: '40', temp: '32.5 °C', rh: '66 %', upd: 'na-update ngayon lang' },
  // The longest strings: the widest Filipino level name and the offline line, at 360 px.
  { id: 'home-fil-longest', t: FIL, kind: 'offline', status: 'Offline: walang reading sa loob ng 12 min', cat: 'extreme-danger', catLabel: 'Matinding panganib', hi: '54', temp: '38.0 °C', rh: '60 %', hiLabel: 'Huling heat index', upd: 'huling reading 12 min na ang nakalipas' },
];
// The switch: two 44 px buttons in one outlined pill, top right of the header. The chosen language has a filled background AND a check mark
// (colour is never the only signal). It is a <fieldset>-free pair of buttons with aria-pressed; the choice is kept on the phone (localStorage).
const toggle = (lang) => `<div class="lang-switch" role="group" aria-label="Language / Wika">
    <button type="button" class="lang-btn" lang="en" aria-pressed="${lang === 'en'}">${lang === 'en' ? '<span aria-hidden="true">✓ </span>' : ''}English</button>
    <button type="button" class="lang-btn" lang="fil" aria-pressed="${lang === 'fil'}">${lang === 'fil' ? '<span aria-hidden="true">✓ </span>' : ''}Filipino</button></div>`;
const css = `<style>
.lang-switch{display:flex;justify-content:flex-end;margin:0 0 8px}
.lang-btn{min-height:44px;min-width:44px;padding:0 14px;font:600 14px/1 inherit;font-family:inherit;border:2px solid var(--tblr-body-color,#182433);background:transparent;color:inherit;cursor:pointer}
.lang-btn:first-child{border-radius:999px 0 0 999px;border-right-width:1px}.lang-btn:last-child{border-radius:0 999px 999px 0;border-left-width:1px}
.lang-btn[aria-pressed="true"]{background:var(--tblr-body-color,#182433);color:var(--tblr-body-bg,#fff)}
</style>`;

for (const s of STATES) {
  const t = s.t;
  writeFileSync(join(here, `${s.id}.html`), `<!doctype html>
<html lang="${t.lang === 'fil' ? 'fil' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Init: mock ${s.id}</title>
<link rel="stylesheet" href="../../web/node_modules/@tabler/core/dist/css/tabler.min.css">
<link rel="stylesheet" href="../../web/src/tokens.css"><link rel="stylesheet" href="../../web/src/app.css"><link rel="stylesheet" href="../../web/src/school.css"><link rel="stylesheet" href="../../web/src/alerts.css">
${css}</head><body>
<main class="app-wrap">
  <header class="app-head">${toggle(t.lang)}${HEADER_TOP}<p class="text-secondary app-room">${t.room}</p>
    <p class="status status-${s.kind}" role="status"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[s.kind]}</svg>${s.status}</p></header>
  <section class="card heat heat-${s.cat}" aria-label="Heat index"><div class="card-body">
    <p class="app-label">${s.hiLabel ?? t.hiLabel}</p>
    <p class="heat-num">${s.hi}<span class="heat-unit">°C</span></p>
    <p class="heat-cat"><svg viewBox="0 0 24 24" aria-hidden="true">${SHAPES[s.cat]}</svg>${s.catLabel}</p>
    <a class="heat-more" href="#heat/${s.cat}">${t.more}</a>
  </div></section>
  <div class="app-pair">
    <section class="card" aria-label="${t.temp}"><div class="card-body"><p class="app-label">${t.temp}</p><p class="stat">${s.temp}</p></div></section>
    <section class="card" aria-label="${t.rh}"><div class="card-body"><p class="app-label">${t.rh}</p><p class="stat">${s.rh}</p></div></section>
  </div>
  <p class="text-secondary app-updated">${s.upd}</p>
  <a class="school-link" href="#school"><span>${t.school}</span><span aria-hidden="true">›</span></a>
  <a class="school-link alerts-link" href="#alerts"><span>${t.alerts}</span><span aria-hidden="true">›</span></a>
</main></body></html>`);
}
