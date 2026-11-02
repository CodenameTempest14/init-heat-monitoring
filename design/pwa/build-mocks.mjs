// P04-05 design: mock pages for the header logo, the icons (favicon, home screen) and the installed look (F-05).
// Made-up room name; the logo and icon are the owner-approved ones in design/brand/ (D-029).
// Usage: node design/pwa/build-mocks.mjs   (writes header.html, icons.html, installed.html next to this file)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const brand = join(here, '..', 'brand');
const svg = (f) => readFileSync(join(brand, f), 'utf8').trim();
const logoLight = svg('init-logo-light.svg'), logoDark = svg('init-logo-dark.svg'), iconSvg = svg('init-icon-light.svg');

// The three icon files the app will ship, all drawn from the approved icon (96 x 96 units):
// "any": the rounded icon as it is (transparent corners); "maskable": full-bleed square, glyph scaled to 85 % so the
// phone's mask (circle, squircle) never cuts it (safe zone = circle of 40 % of the width); "apple": full-bleed square, iOS rounds it.
const glyph = iconSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/<rect width="96"[^>]*\/>/, '');
export const ICONS = {
  any: iconSvg,
  maskable: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#1b2430"/><g transform="translate(48 48) scale(0.85) translate(-48 -48)">${glyph}</g></svg>`,
  apple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#1b2430"/>${glyph}</svg>`,
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
<link rel="stylesheet" href="pwa.css">
</head>`;

const logo = `<span class="app-logo" role="img" aria-label="Init"><span class="logo-for-light">${logoLight}</span><span class="logo-for-dark">${logoDark}</span></span>`;
const header = `<header class="app-head">${logo}<h1 class="app-fullname">Init: Indoor Heat Index Tracker</h1><p class="text-secondary app-room">Room: Room 204</p>
    <p class="status status-online" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dot" cx="12" cy="12" r="6"/></svg>Online</p></header>`;
const cards = `<section class="card heat heat-extreme-caution" aria-label="Heat index"><div class="card-body">
    <p class="app-label">Heat index</p>
    <p class="heat-num">40<span class="heat-unit">°C</span></p>
    <p class="heat-cat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2z"/></svg>Extreme caution</p>
  </div></section>
  <div class="app-pair">
    <section class="card" aria-label="Temperature"><div class="card-body"><p class="app-label">Temperature</p><p class="stat">32.2 °C</p></div></section>
    <section class="card" aria-label="Humidity"><div class="card-body"><p class="app-label">Humidity</p><p class="stat">68 %</p></div></section>
  </div>
  <p class="text-secondary app-updated">updated just now</p>`;

// 1. The page with the logo in the header (replaces the plain "Init" title).
writeFileSync(join(here, 'header.html'), `${head('header logo')}
<body>
<main class="app-wrap">
  ${header}
  ${cards}
</main>
</body></html>
`);

// 2. Icons: the browser tab, and the home screen under each mask a phone may apply.
const img = (k, cls = '') => `<span class="ic ${cls}">${ICONS[k]}</span>`;
const tile = (inner, name, note) => `<figure class="tile">${inner}<figcaption><strong>${name}</strong><br>${note}</figcaption></figure>`;
writeFileSync(join(here, 'icons.html'), `${head('icons')}
<body>
<main class="sheet">
  <h1 class="sheet-title">Icons</h1>
  <h2 class="sheet-h">Browser tab (favicon, 16 px and 32 px)</h2>
  <div class="tabstrip"><span class="tab">${img('any', 'ic-16')}<span>Init: classroom heat index</span></span>
    <span class="tab-big">${img('any', 'ic-32')}<span class="muted">32 px, bookmarks</span></span></div>
  <h2 class="sheet-h">Home screen</h2>
  <div class="wall">
    ${tile(img('maskable', 'ic-64 m-circle'), 'Android, circle', 'maskable icon')}
    ${tile(img('maskable', 'ic-64 m-squircle'), 'Android, squircle', 'maskable icon')}
    ${tile(img('apple', 'ic-64 m-ios'), 'iPhone', 'apple-touch-icon')}
    ${tile(img('any', 'ic-64'), 'No mask (desktop)', 'any icon')}
  </div>
  <h2 class="sheet-h">Safe zone of the maskable icon</h2>
  <div class="safe"><span class="ic ic-128">${ICONS.maskable}</span><span class="ring"></span></div>
  <p class="muted">Dashed circle: the part every phone keeps. The thermometer stays inside it.</p>
  <h2 class="sheet-h">Files (all drawn from the approved icon)</h2>
  <table class="table table-sm"><tbody>
    <tr><td>favicon.svg, favicon-32.png</td><td>the rounded icon</td></tr>
    <tr><td>icon-192.png, icon-512.png</td><td>"any": the rounded icon</td></tr>
    <tr><td>icon-maskable-512.png</td><td>full square, glyph at 85 %</td></tr>
    <tr><td>apple-touch-icon.png (180)</td><td>full square, glyph at 100 %</td></tr>
  </tbody></table>
</main>
</body></html>
`);

// 3. The installed app: no browser bar, the phone's status bar takes the theme colour.
writeFileSync(join(here, 'installed.html'), `${head('installed app')}
<body class="installed">
<div class="statusbar" aria-hidden="true"><span>18:42</span><span>▲ ▮▮▮ 76%</span></div>
<main class="app-wrap">
  ${header}
  ${cards}
</main>
</body></html>
`);
console.log('wrote header.html, icons.html, installed.html');
