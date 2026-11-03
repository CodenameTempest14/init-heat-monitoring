// F-15 extended (proposal s25, owner approved the proposal): mocks of the "What does this mean?" link on the home page and of the
// public #heat page. The wording is a DRAFT: advisory only, not official DepEd or PAGASA guidance, and a teacher reviews every
// sentence before it goes live (D-034). Level ranges are D-019 (27/33/42/52). Made-up room only.
// Usage: node design/heat-info/build-mocks.mjs   (writes home-danger.html, home-caution.html, heat.html next to this file)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const cards = join(here, '..', 'home-cards');

const SHAPES = {
  'caution': '<circle cx="12" cy="12" r="9"/>',
  'extreme-caution': '<path d="M12 3 22 21H2z"/>',
  'danger': '<path d="M12 2 22 12 12 22 2 12z"/>',
  'extreme-danger': '<path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z"/>',
};
const WARN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2z"/><path d="M12 10v4M12 17.5v.01"/></svg>';

// 1) The home page with one new link inside the heat card, under the level name (the rest is the approved home mock).
for (const cat of ['danger', 'caution']) {
  const src = readFileSync(join(cards, `${cat}.html`), 'utf8').replace(/\r\n/g, '\n');
  const out = src
    .replace(/<title>[^<]*<\/title>/, `<title>Init: mock F-15 home-${cat}</title>`)
    .replace('<link rel="stylesheet" href="../../web/src/school.css">', '<link rel="stylesheet" href="../../web/src/school.css">\n<link rel="stylesheet" href="heat-info.css">')
    .replace('</p>\n  </div></section>', `</p>\n    <a class="heat-more" href="#heat/${cat}">What does this mean? ›</a>\n  </div></section>`);
  if (!out.includes('heat-more')) throw new Error(`insert point not found in ${cat}.html`);
  writeFileSync(join(here, `home-${cat}.html`), out);
  console.log(`home-${cat}.html`);
}

// 2) The #heat page.
// Flat pictures, drawn here as inline SVG (no files, no copyright, they work offline and follow light and dark through the tokens).
// They are decoration: the text says everything, so they are hidden from screen readers.
const rays = (cx, cy, r) => [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
  const t = (a * Math.PI) / 180;
  const p = (k) => `${(cx + Math.cos(t) * k).toFixed(1)} ${(cy + Math.sin(t) * k).toFixed(1)}`;
  return `<path d="M${p(r + 6)} L${p(r + 14)}"/>`;
}).join('');
const sun = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" stroke="none"/><g stroke="${c}">${rays(cx, cy, r)}</g>`;
const thermo = (x, c, level) => `<rect x="${x}" y="8" width="16" height="60" rx="8"/><circle cx="${x + 8}" cy="76" r="13" fill="${c}"/><rect x="${x + 5}" y="${level}" width="6" height="${72 - level}" rx="3" fill="${c}" stroke="none"/>`;
const ART = {
  what: (c) => `${thermo(70, c, 30)}<path d="M128 48h20M138 38v20"/><path d="M240 16C240 16 218 44 218 60a22 22 0 0 0 44 0C262 44 240 16 240 16z" fill="${c}" fill-opacity=".35"/>`,
  caution: (c) => `${sun(80, 48, 16, c)}<rect x="212" y="14" width="18" height="9" rx="2"/><path d="M208 28q0-5 5-5h12q5 0 5 5v44q0 8-8 8h-6q-8 0-8-8z"/><path d="M210 50h28v22q0 6-6 6h-16q-6 0-6-6z" fill="${c}" fill-opacity=".35" stroke="none"/>`,
  'extreme-caution': (c) => `<rect x="86" y="12" width="70" height="72" rx="4"/><path d="M121 12v72M86 48h70"/><path d="M172 34q10-8 20 0t20 0t20 0M172 52q10-8 20 0t20 0t20 0" stroke="${c}"/><path d="M258 28h34l-5 52h-24z" fill="${c}" fill-opacity=".1"/><path d="M262 52h26l-3 28h-20z" fill="${c}" fill-opacity=".4" stroke="none"/>`,
  danger: (c) => `<circle cx="80" cy="48" r="30"/><path d="M80 48V24M80 48l17 10"/><path d="M80 12A36 36 0 0 1 111 66" stroke="${c}" stroke-width="5"/><path d="M196 56a52 42 0 0 1 104 0z" fill="${c}" fill-opacity=".35"/><path d="M248 56v26q0 6 6 6"/>`,
  'extreme-danger': (c) => `${thermo(66, c, 14)}<circle cx="240" cy="48" r="34" stroke="${c}" stroke-width="4"/><path d="M240 30v36M222 48h36" stroke="${c}" stroke-width="9"/>`,
};
const art = (id) => `<svg class="hl-art hl-art-${id}" viewBox="0 0 326 96" aria-hidden="true" fill="none" stroke="var(--viz-ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ART[id](id === 'what' ? 'var(--series-hi)' : `var(--heat-${id}-border)`)}</svg>`;

const LEVELS = [
  { id: 'caution', name: 'Caution', range: 'Heat index 27 to 32 °C',
    body: 'You can get tired if you stay active in the heat for a long time.',
    todo: ['Keep a water bottle with you.', 'If you feel tired, rest in a shady or cooler place.'] },
  { id: 'extreme-caution', name: 'Extreme caution', range: 'Heat index 33 to 41 °C',
    body: 'Heat cramps (painful tight muscles) and heat exhaustion (very tired, dizzy, sweating a lot) can happen. If you keep going without a rest, it can get worse.',
    todo: ['Drink water often, even if you are not thirsty.', 'Wear light-coloured, loose clothes.', 'Open the windows and use a fan if you have one.', 'Take rest breaks in the shade.', 'Do hard activities, like sports, in a cooler place or at a cooler time.'] },
  { id: 'danger', name: 'Danger', range: 'Heat index 42 to 51 °C',
    body: 'Heat cramps and heat exhaustion are likely. Heat stroke can happen if you stay active in this heat.',
    todo: ['Cut down or stop hard activity, most of all between 12:00 and 4:00 in the afternoon.', 'Move class activities to the coolest, shadiest place you have.', 'Drink water often and rest often.', 'Tell a teacher right away if someone feels unwell.', 'Learn the warning signs below.'] },
  { id: 'extreme-danger', name: 'Extreme danger', range: 'Heat index 52 °C and up',
    body: 'Heat stroke is very likely. Heat stroke is an emergency.',
    todo: ['Stay out of the heat. No hard activity.', 'Move everyone to the coolest place.', 'Drink water.', 'If someone shows a warning sign, tell a teacher and get medical help straight away.'] },
];
const sec = (l) => `<section class="gd-sec hl-sec hl-${l.id}" id="${l.id}"><h2><span class="school-chip sc-${l.id}"><svg viewBox="0 0 24 24" aria-hidden="true">${SHAPES[l.id]}</svg></span>${l.name}</h2>
    ${art(l.id)}
    <p class="hl-range">${l.range}</p>
    <h3>What it can do to the body</h3>
    <p>${l.body}</p>
    <h3>What to prepare and do</h3>
    <ul>${l.todo.map((t) => `<li>${t}</li>`).join('')}</ul></section>`;

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Init: mock F-15 heat</title>
<link rel="stylesheet" href="../../web/node_modules/@tabler/core/dist/css/tabler.min.css">
<link rel="stylesheet" href="../../web/src/tokens.css">
<link rel="stylesheet" href="../../web/src/app.css">
<link rel="stylesheet" href="../../web/src/charts.css">
<link rel="stylesheet" href="../../web/src/school.css">
<link rel="stylesheet" href="../../web/src/admin.css">
<link rel="stylesheet" href="../admin-guide/guide.css">
<link rel="stylesheet" href="heat-info.css">
</head>
<body>
<main class="app-wrap">
  <header class="app-head"><picture class="app-logo"><source media="(prefers-color-scheme: dark)" srcset="../../web/public/logo-dark.svg"><img src="../../web/public/logo-light.svg" width="110" height="40" alt=""></picture><h1 class="app-fullname">Init: Indoor Heat Index Tracker</h1></header>
  <a class="school-back" href="#">‹ Live readings</a>
  <h2 class="visually-hidden">What the heat index means</h2>
  <p class="gd-intro">What the number means, what the heat can do to your body, and what to do about it.</p>
  <div class="gd-note" style="margin:0 0 16px">${WARN}<span>This is general advice, not official DepEd or PAGASA guidance. If someone is very unwell, tell a teacher and get medical help.</span></div>
  <nav class="gd-toc" aria-label="Sections"><p>On this page</p><ol>
    <li><a href="#what">What is the heat index?</a></li>
    ${LEVELS.map((l) => `<li><a href="#${l.id}">${l.name}</a></li>`).join('\n    ')}
    <li><a href="#signs">Warning signs</a></li>
  </ol></nav>

  <section class="gd-sec" id="what"><h2>What is the heat index?</h2>
    ${art('what')}
    <p>It is how hot it feels to your body. It uses the air temperature and the humidity together.</p>
    <p>When the air is humid, sweat dries slowly, so your body cannot cool down well. That is why 33 °C with high humidity feels much hotter than 33 °C in dry air.</p>
    <p>The levels and numbers below are from PAGASA. This device measures inside the classroom.</p></section>

  ${LEVELS.map(sec).join('\n\n  ')}

  <section class="gd-sec" id="signs"><h2>Warning signs</h2>
    <h3>Heat exhaustion</h3>
    <ul class="hl-signs"><li>Heavy sweating, cool and damp skin</li><li>Feeling dizzy, weak or very tired</li><li>Headache or feeling sick</li></ul>
    <p><strong>What to do:</strong> tell a teacher. Move to a cooler, shady place. Loosen tight clothes. Sip water.</p>
    <h3>Heat stroke</h3>
    <ul class="hl-signs"><li>Confusion, or not making sense</li><li>Fainting</li><li>Very hot skin, with or without sweat</li></ul>
    <p><strong>What to do:</strong> this is an emergency. Get an adult and medical help straight away. Move the person to a cooler place while you wait.</p>
    <div class="gd-note">${WARN}<span>When you are not sure, treat it as serious and ask for help.</span></div></section>
</main>
</body>
</html>
`;
writeFileSync(join(here, 'heat.html'), page);
console.log('heat.html');
