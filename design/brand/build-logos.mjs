// Logo proposals for the Init brand (D-007). Letters are drawn as plain strokes, so no font file or font licence is
// involved (D-010). Colours come from design/tokens.json. Writes the SVGs and preview.html next to this file.
// Usage: node design/brand/build-logos.mjs, then node design/brand/capture.mjs for preview.png
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, '..', 'tokens.json'), 'utf8'));
const heat = tokens.heat;
const ink = { light: tokens.themes.light.text, dark: tokens.themes.dark.text };
const accent = { light: heat.danger.fill, dark: heat.danger.border.dark };
const r1 = (n) => Math.round(n * 100) / 100;

// Lowercase "init", baseline y=100, x-height 48, stroke 16, about 192 wide. `dots` colours the two i-dots.
function wordmark(color, dots, dx = 0, dy = 0) {
  const s = `stroke="${color}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  return `<g transform="translate(${dx} ${dy})">
  <path ${s} d="M20 52V100M52 52V100M52 76A24 24 0 0 1 100 76V100M132 52V100M164 30V84A16 16 0 0 0 180 100H188M150 52H188"/>
  <circle cx="20" cy="24" r="10" fill="${dots[0]}"/><circle cx="132" cy="24" r="10" fill="${dots[1]}"/>
</g>`;
}

// A: wordmark, the two i-dots are the heat accent.
const logoA = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 208 120" role="img" aria-label="Init">
${wordmark(ink[t], [accent[t], accent[t]])}
</svg>`;

// B: app icon, a lowercase i drawn as a thermometer (tube, level, bulb) on an ink square. Also the PWA icon / favicon.
const iconB = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="Init">
  <rect width="96" height="96" rx="22" fill="${ink.light}"/>
  <circle cx="48" cy="20" r="8" fill="${heat['extreme-caution'].fill}"/>
  <rect x="39" y="34" width="18" height="40" rx="9" fill="none" stroke="#ffffff" stroke-width="5"/>
  <rect x="45" y="48" width="6" height="22" rx="3" fill="${heat.danger.fill}"/>
  <circle cx="48" cy="72" r="12" fill="${heat.danger.fill}" stroke="#ffffff" stroke-width="5"/>
</svg>`;
const lockupB = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" role="img" aria-label="Init">
  <g transform="translate(4 12)">${iconB().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
  ${wordmark(ink[t], [ink[t], ink[t]], 122, 0)}
</svg>`;

// C: a heat index gauge in the four PAGASA band colours (D-019), needle in "danger", above the wordmark.
function arc(cx, cy, r, a0, a1) {
  const p = (a) => [r1(cx + r * Math.cos((a * Math.PI) / 180)), r1(cy - r * Math.sin((a * Math.PI) / 180))];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`;
}
function logoC(t) {
  const bands = ['caution', 'extreme-caution', 'danger', 'extreme-danger'];
  const segs = bands.map((b, i) => {
    const a0 = 180 - i * 45 - 3, a1 = 180 - (i + 1) * 45 + 3;
    return `<path d="${arc(104, 82, 56, a0, a1)}" stroke="${heat[b].fill}" stroke-width="18" fill="none"/>`;
  }).join('\n  ');
  const na = 65, nx = r1(104 + 46 * Math.cos((na * Math.PI) / 180)), ny = r1(82 - 46 * Math.sin((na * Math.PI) / 180));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 208 220" role="img" aria-label="Init">
  ${segs}
  <path d="M104 82L${nx} ${ny}" stroke="${ink[t]}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="104" cy="82" r="10" fill="${ink[t]}"/>
  ${wordmark(ink[t], [ink[t], ink[t]], 0, 100)}
</svg>`;
}

const files = {
  'logo-a-light.svg': logoA('light'), 'logo-a-dark.svg': logoA('dark'),
  'icon-b.svg': iconB(), 'logo-b-light.svg': lockupB('light'), 'logo-b-dark.svg': lockupB('dark'),
  'logo-c-light.svg': logoC('light'), 'logo-c-dark.svg': logoC('dark'),
};
for (const [name, svg] of Object.entries(files)) writeFileSync(join(here, name), svg + '\n');

// Preview: each concept on light and dark, plus the small sizes it must survive (favicon 32 px, 16 px).
const img = (f, h) => `<img src="${f}" style="height:${h}px">`;
const row = (title, light, dark, small) => `<section><h2>${title}</h2><div class="pair">
<div class="l">${img(light, 96)}</div><div class="d">${img(dark, 96)}</div>
<div class="l small">${img(small, 32)} ${img(small, 16)}</div></div></section>`;
writeFileSync(join(here, 'preview.html'), `<!doctype html><meta charset="utf-8"><title>Init logo proposals</title>
<style>body{margin:0;padding:24px;font:16px system-ui,sans-serif;background:#fff;color:${ink.light}}h1{margin:0 0 16px;font-size:24px}
h2{font-size:18px;margin:24px 0 8px}.pair{display:flex;gap:12px;align-items:stretch}.pair>div{padding:16px 20px;border-radius:12px;display:flex;align-items:center;gap:12px}
.l{background:${tokens.themes.light.bg};border:1px solid #dde1e6}.d{background:${tokens.themes.dark.bg}}</style>
<h1>Init logo proposals</h1>
${row('A: Heat dots wordmark', 'logo-a-light.svg', 'logo-a-dark.svg', 'logo-a-light.svg')}
${row('B: Thermometer-i icon + wordmark', 'logo-b-light.svg', 'logo-b-dark.svg', 'icon-b.svg')}
${row('C: Heat index gauge + wordmark', 'logo-c-light.svg', 'logo-c-dark.svg', 'logo-c-light.svg')}
`);
console.log(Object.keys(files).concat('preview.html').join('\n'));
