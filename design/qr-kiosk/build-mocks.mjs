// P06-01 / P06-02 design: mock pages of the QR poster (F-14) and the kiosk display (F-13). Made-up readings, made-up room.
// The QR code is real (qrcode-generator, MIT) and points at the hosted app. Usage: node design/qr-kiosk/build-mocks.mjs
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { HEADER_TOP } from '../pwa/header.mjs';
const require = createRequire(import.meta.url);
const qrcode = require('../../web/node_modules/qrcode-generator');

const URL_APP = 'https://init-heat-monitoring.vercel.app';
const qr = qrcode(0, 'M'); qr.addData(URL_APP); qr.make();
const n = qr.getModuleCount(), q = 4;
let cells = '';
for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) cells += `M${c + q} ${r + q}h1v1h-1z`;
const QR = `<svg class="qr-code" viewBox="0 0 ${n + 2 * q} ${n + 2 * q}" role="img" aria-label="QR code for ${URL_APP}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${cells}" fill="#000"/></svg>`;

const SHAPE = '<path d="M12 2 22 12 12 22 2 12z"/>';
const css = `
<link rel="stylesheet" href="../../web/node_modules/@tabler/core/dist/css/tabler.min.css">
<link rel="stylesheet" href="../../web/src/tokens.css"><link rel="stylesheet" href="../../web/src/app.css">
<style>
body{margin:0}
.poster{max-width:640px;margin:0 auto;padding:32px 24px;text-align:center;background:#fff;color:#000;font-family:Arial,sans-serif}
.poster img{display:block;margin:0 auto 8px}.poster h1{font-size:30px;margin:8px 0}.poster .lead{font-size:20px;margin:0 0 16px}
.qr-code{width:300px;height:300px;display:block;margin:0 auto 16px}
.poster .url{font-size:18px;font-weight:700;word-break:break-all}.poster .note{font-size:14px;margin-top:16px}
.poster ul{display:flex;gap:6px;justify-content:center;list-style:none;padding:0;margin:16px 0;flex-wrap:wrap}
.poster li{border:2px solid #000;padding:4px 8px;font-size:13px;font-weight:700}
.poster-tools{padding:16px;text-align:center}@media print{.poster-tools{display:none}}
.kiosk{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:var(--heat-danger-fill);color:var(--heat-danger-text);padding:24px;box-sizing:border-box}
.kiosk .room{font-size:5vmin;margin:0}.kiosk .num{font-size:30vmin;font-weight:700;line-height:1;margin:0}.kiosk .num small{font-size:10vmin}
.kiosk .cat{display:flex;align-items:center;gap:2vmin;font-size:9vmin;font-weight:700;margin:0}.kiosk .cat svg{width:9vmin;height:9vmin;fill:none;stroke:currentColor;stroke-width:2}
.kiosk .pair{display:flex;gap:6vmin;font-size:6vmin;margin:3vmin 0 0}.kiosk .upd{font-size:3.5vmin;margin:2vmin 0 0}
.kiosk .st{position:absolute;top:2vmin;right:3vmin;font-size:3vmin;font-weight:700}
</style>`;
const head = (t) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Init: mock ${t}</title>${css}</head>`;

writeFileSync(new URL('./poster.html', import.meta.url), `${head('QR poster')}<body>
<div class="poster-tools"><button class="btn" type="button">Print this page</button> <span class="text-secondary">(hidden when printed)</span></div>
<main class="poster"><img src="../../web/public/logo-light.svg" width="140" height="51" alt="">
<h1>How hot is our classroom?</h1><p class="lead">Scan to see the live heat index.</p>${QR}
<p class="url">${URL_APP.replace('https://', '')}</p>
<ul><li>Caution 27–32 °C</li><li>Extreme caution 33–41 °C</li><li>Danger 42–51 °C</li><li>Extreme danger 52 °C +</li></ul>
<p class="note">Heat index levels are PAGASA's. Init is a school project, not an official service.</p></main></body></html>`);

writeFileSync(new URL('./kiosk.html', import.meta.url), `${head('kiosk')}<body>
<main class="kiosk"><p class="st">● Online</p><p class="room">Room 204</p><p class="num">43<small>°C</small></p>
<p class="cat"><svg viewBox="0 0 24 24" aria-hidden="true">${SHAPE}</svg>Danger</p>
<p class="pair"><span>Temperature 34.1 °C</span><span>Humidity 62 %</span></p><p class="upd">updated just now · init-heat-monitoring.vercel.app</p></main></body></html>`);
console.log('poster.html kiosk.html');
