// Draft sketches of WHERE to measure what is still missing (numbers match enclosure/MEASURE_NEXT.md). Not to scale.
// Run: node enclosure/draw-measure-guide.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const R = (x, y, w, h, c = 'part', rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${c}"/>`;
const T = (x, y, t, c = 'lbl', a = 'start') => `<text x="${x}" y="${y}" class="${c}" text-anchor="${a}">${t}</text>`;
const tag = (x, y, id) => `<g><circle cx="${x}" cy="${y}" r="11" class="tag"/><text x="${x}" y="${y + 4}" text-anchor="middle" class="tagt">${id}</text></g>`;
const H = (x1, x2, y, id, label = '') => `<g class="d"><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><line x1="${x1}" y1="${y - 5}" x2="${x1}" y2="${y + 5}"/><line x1="${x2}" y1="${y - 5}" x2="${x2}" y2="${y + 5}"/></g>${tag((x1 + x2) / 2, y - 14, id)}${label ? T((x1 + x2) / 2, y + 16, label, 'dl', 'middle') : ''}`;
const V = (y1, y2, x, id, label = '') => `<g class="d"><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/><line x1="${x - 5}" y1="${y1}" x2="${x + 5}" y2="${y1}"/><line x1="${x - 5}" y1="${y2}" x2="${x + 5}" y2="${y2}"/></g>${tag(x - 16, (y1 + y2) / 2, id)}${label ? T(x + 8, (y1 + y2) / 2 + 4, label, 'dl') : ''}`;
let s = '';
const panel = (x, y, w, h, title) => { s += R(x, y, w, h, 'frame', 8) + T(x + 14, y + 26, title, 'h'); };

// ---- A1. bank end face ----
panel(20, 20, 640, 300, 'A1. ROMOSS port end face (port end toward you). Left edge = start of every number');
s += R(60, 80, 540, 170, 'part', 26);
s += R(90, 150, 480, 60, 'part2', 8);
[[110, 80], [210, 60], [290, 110], [420, 110]].forEach(([x, w], i) => { s += R(x, 170, w, 24, 'port', 4) + T(x + w / 2, 186, ['USB-C in', 'USB-C fit', 'USB-A fit', 'USB-A fast'][i], 'sm', 'middle'); });
s += H(60, 110, 232, 2, 'left edge to port 1');
s += H(90, 570, 124, 1, 'panel width');
s += V(150, 210, 612, 1, 'panel height');
s += V(170, 194, 584, 3, 'opening height');
s += V(194, 250, 40, 3, 'bottom face to ports');
s += T(60, 290, 'also: which port feeds the ESP32 (4), thickness at 3 points (9)', 'sm');

// ---- A2. bank top face ----
panel(680, 20, 700, 300, 'A2. Bank top face (port end on the left)');
s += R(710, 90, 620, 190, 'part', 20);
s += R(740, 120, 70, 130, 'screen') + T(775, 190, 'screen', 'sm', 'middle');
s += R(1300, 100, 10, 24, 'port', 3) + tag(1305, 86, 7) + T(1180, 82, 'power button (long side)', 'sm');
s += H(710, 740, 296, 6, 'port end to screen');
s += V(90, 120, 722, 5, 'left edge to screen end');
s += V(250, 280, 722, 5, 'right edge to screen end');
s += T(850, 196, '67.2 across, 22 along; flush / raised / recessed? (6)', 'sm');
s += tag(715, 100, 8) + T(870, 112, 'corner radius (8): compare with a coin', 'sm');

// ---- B. ESP32 ----
panel(20, 340, 640, 330, 'B. ESP32 38-pin (top view, USB end on the right)');
s += R(70, 420, 480, 130, 'pcb', 4) + R(70, 430, 130, 110, 'ant') + T(135, 490, 'antenna strip', 'smw', 'middle');
s += R(550, 460, 26, 50, 'port', 3) + R(520, 430, 22, 22, 'btn', 3) + R(520, 520, 22, 22, 'btn', 3);
s += T(512, 424, 'BOOT', 'sm', 'end') + T(512, 558, 'EN', 'sm', 'end');
s += H(520, 550, 408, 13, 'BTN to USB end');
s += V(420, 430, 596, 13, 'BTN to long edge');
s += H(70, 200, 590, 14, 'antenna end');
s += V(420, 550, 40, 11, 'row spacing');
s += T(40, 640, 'side view: header body under PCB (10), pin tip length (10), USB shell height (12), BTN height (13)', 'sm');

// ---- C. OLED ----
panel(680, 340, 340, 330, 'C. OLED (pins at the top)');
s += R(730, 410, 200, 200, 'pcb', 4) + R(750, 450, 160, 100, 'lit') + T(830, 505, 'lit area', 'smw', 'middle');
[[744, 424], [916, 424], [744, 596], [916, 596]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="5" class="hole"/>`; });
s += H(744, 916, 636, 17, 'hole spacing, other way');
s += V(424, 596, 960, 17, 'holes (14 mm?)');
s += V(410, 450, 716, 16, 'top edge to lit');
s += H(750, 910, 396, 15, 'lit length');
s += V(450, 550, 990, 15, 'lit width');
s += T(700, 660, '18 header height, 19 glass + flex thickness', 'sm');

// ---- D. DHT22 + jumper ----
panel(1040, 340, 340, 330, 'D. DHT22 and jumper plug');
s += R(1070, 400, 130, 80, 'part', 4) + R(1110, 410, 80, 50, 'grille') + `<circle cx="1085" cy="428" r="6" class="hole"/>`;
s += tag(1085, 392, 20) + T(1100, 388, 'mount hole: diameter + centre', 'sm');
s += H(1110, 1190, 502, 21, 'grille area');
s += R(1230, 410, 40, 28, 'plug', 3) + T(1250, 428, 'plug', 'smw', 'middle');
s += H(1230, 1270, 472, 22, 'plug width');
s += V(410, 438, 1296, 22, 'thickness');
s += T(1060, 560, 'plus plug length and wire length (22)', 'sm');
s += T(1060, 600, '25 x 15 x 6.1 body (given)', 'sm');

// ---- E. screws ----
panel(20, 690, 1360, 120, 'E. Screws and inserts: head diameter and height of one DIN965 M3 and one M2.5 (24); insert outer diameter and length (25); have M3 x 10 and M3 x 6 or 8? (26)');
s += R(60, 730, 36, 12, 'part', 2) + R(70, 742, 16, 40, 'part2') + T(110, 752, 'head diameter x height; shank length', 'sm');
s += R(500, 730, 14, 36, 'port', 2) + T(525, 752, 'brass heat-set insert: outer diameter + length', 'sm');

const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#fff;font-family:Arial,sans-serif}.frame{fill:#fafafa;stroke:#999}.h{font-size:15px;font-weight:bold;fill:#222}
.part{fill:#e8e8e8;stroke:#444;stroke-width:1.5}.part2{fill:#d4d4d4;stroke:#666}.port{fill:#9aa;stroke:#333}.screen{fill:#222;stroke:#000}.pcb{fill:#2d6a4f;stroke:#123}.ant{fill:#111}.btn{fill:#ddd;stroke:#333}
.lit{fill:#2a7fff;stroke:#036}.hole{fill:#fff;stroke:#333}.grille{fill:#cfe;stroke:#264}.plug{fill:#222}.d line{stroke:#c33;stroke-width:1.4}.dl{font-size:12px;fill:#c33}
.lbl{font-size:13px}.sm{font-size:12px;fill:#333}.smw{font-size:12px;fill:#fff}.tag{fill:#c33}.tagt{font-size:12px;fill:#fff;font-weight:bold}</style>
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="830">${s}${T(20, 826, 'DRAFT sketch, not to scale. Red numbers match the checklist in enclosure/MEASURE_NEXT.md.', 'sm')}</svg>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 840 } });
await p.setContent(html);
await p.screenshot({ path: join(here, 'preview', 'measure_guide.png'), fullPage: true });
await b.close();
console.log('saved preview/measure_guide.png');
