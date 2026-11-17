// How to put the five lidfit pieces and the real bank and cable together for the four checks (PRINT_GUIDE.md section 12 and its amendment).
// Schematic: positions are close to the case coordinates (init_case.scad) but B is shifted 5 mm so it can touch C. Run: node enclosure/draw-lidfit-assembly.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const R = (x, y, w, h, c = 'part', rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${c}"/>`;
const T = (x, y, t, c = 'lbl', a = 'start') => `<text x="${x}" y="${y}" class="${c}" text-anchor="${a}">${t}</text>`;
const tag = (x, y, id) => `<g><circle cx="${x}" cy="${y}" r="11" class="tag"/><text x="${x}" y="${y + 4}" text-anchor="middle" class="tagt">${id}</text></g>`;
const letter = (x, y, id) => `<g><circle cx="${x}" cy="${y}" r="11" class="let"/><text x="${x}" y="${y + 4}" text-anchor="middle" class="lett">${id}</text></g>`;
let s = '';
const panel = (x, y, w, h, title) => { s += R(x, y, w, h, 'frame', 8) + T(x + 14, y + 26, title, 'h'); };

// ---------- P1: parts and things to bring ----------
panel(20, 20, 1360, 150, 'What you lay out: the five printed pieces (letters) and what you bring');
const parts = [
  ['A', 'base corner', 'full-height post'],
  ['B', 'port stop', 'with the 4 x 5 mm cable tunnel'],
  ['C', 'base slice 70 mm', 'back wall, window, logo, strip'],
  ['D', 'lid corner', 'countersunk screw hole'],
  ['E', 'lid piece', '12.5 x 7.5 mm cable hole, post'],
];
parts.forEach(([l, a, b], i) => { const x = 50 + i * 215; s += R(x, 60, 190, 90, 'part2', 6) + letter(x + 22, 82, l) + T(x + 42, 87, a, 'b') + T(x + 14, 112, b, 'sm') ; });
s += T(1150, 70, 'Bring:', 'b');
['the real power bank', 'your 30 cm USB-C cable', '1 x M2.5 x 8 screw + screwdriver', 'caliper, phone for photos'].forEach((t, i) => { s += T(1150, 92 + i * 20, '- ' + t, 'sm'); });

// ---------- P2: top view ----------
panel(20, 190, 700, 500, 'Layout on the table, seen from above (front wall at the top)');
const X = (x) => 60 + 3.2 * (x - 6), Y = (y) => 255 + 3.2 * y, W = (w) => 3.2 * w;
// C: base slice
s += R(X(40), Y(0), W(70), W(92.4), 'floor') ;
s += R(X(40), Y(0), W(70), W(3.2), 'wall') + R(X(40), Y(89.2), W(70), W(3.2), 'wall');
s += T(X(75), Y(0) + 11, 'front wall (logo)', 'smw', 'middle');
s += R(X(47.8), Y(89.2) - 1, W(11), W(3.2) + 2, 'win');
s += T(X(53), Y(92.4) + 14, 'button window', 'sm', 'middle');
s += R(X(40), Y(3.2) + 1, W(70), W(5.4) - 2, 'strip');
s += T(X(70), Y(13.5), 'strip 5.4 mm wide (cable only)', 'sm', 'middle');
s += letter(X(75), Y(46), 'C');
// bank
s += `<polygon points="${[[33.8,8.6],[140,8.6],[134,26.6],[140,44.6],[134,62.6],[140,80.6],[137,88.6],[33.8,88.6]].map(([a,b])=>X(a).toFixed(1)+','+Y(b).toFixed(1)).join(' ')}" class="bank"/>`;
s += T(X(50), Y(70), 'power bank (167 mm long, drawn cut)', 'smb');
s += T(X(35), Y(84), 'port end', 'smb');
// B
s += R(X(13), Y(0), W(27), W(20), 'part2');
s += R(X(20.8), Y(3.2), W(7.7), W(10.4), 'stop');
s += `<line x1="${X(20.8)}" y1="${Y(6.4)}" x2="${X(28.5)}" y2="${Y(6.4)}" class="tun"/>`;
s += letter(X(16), Y(14), 'B');
// E on top of the bank
s += R(X(98), Y(0), W(37), W(26), 'lidE');
s += R(X(106.2), Y(3.4), W(12.5), W(7.5), 'hole');
s += `<circle cx="${X(123.35)}" cy="${Y(9.2)}" r="${W(3.5)}" class="post"/>`;
s += letter(X(129), Y(20), 'E');
s += T(X(118), Y(30) + 4, 'E rests on the bank top', 'sm', 'middle');
// cable path
const px = (x, y) => `${X(x).toFixed(1)} ${Y(y).toFixed(1)}`;
s += R(X(22), Y(36), W(11.8), W(11.3), 'plug', 2);
s += `<path d="M ${px(22, 41.6)} L ${px(12, 41.6)} Q ${px(6, 41.6)} ${px(6, 34)} L ${px(6, 14)} Q ${px(6, 6.4)} ${px(14, 6.4)} L ${px(112, 6.4)}" class="cable"/>`;
s += `<path d="M ${X(112) - 2} ${Y(6.4) - 6} L ${X(112) + 8} ${Y(6.4)} L ${X(112) - 2} ${Y(6.4) + 6} Z" class="arrow"/>`;
s += T(X(14), Y(36) - 6, 'plug into the bank', 'sm');
s += T(X(8.5), Y(27), 'U-turn', 'b');
// check tags
s += tag(X(2), Y(24), 2) + tag(X(112.5), Y(15), 2) + tag(X(53), Y(80), 3) + tag(X(24.6), Y(17), 4);
// legend under the drawing
[
  'Orange line = the USB-C cable. It leaves the plug going away from the bank, turns back (the U-turn),',
  'runs through the tunnel in B, lies in the strip in C, and rises through the hole in E.',
  'Pull the plug head through the hole first. Hold E down by hand or let it rest on the bank.',
  "B touches the left end of C. B's stop is then about 5 mm from the bank end: that is expected.",
  'Bank position follows the button window in C (check 3), not B.',
].forEach((l, i) => { s += T(40, 598 + i * 15, l, 'sm'); });

// ---------- P3: cross-section through the lid hole ----------
panel(740, 190, 640, 270, 'Section at the cable hole (looking along the bank, front wall on the left)');
const sc = 3.6, ox = 800, oy = 440;   // y mm -> right, z mm -> up
const sy = (y) => ox + sc * y, sz = (z) => oy - sc * z;
s += R(sy(0), sz(26), sc * 3.2, sc * 26, 'wall');                       // front wall (C walls 26 mm)
s += R(sy(0), sz(3.2), sc * 40, sc * 3.2, 'floor2');                    // floor
s += R(sy(8.6), sz(37.1), sc * 30, sc * (37.1 - 3.8), 'bank');          // bank
s += T(sy(24), sz(20), 'power bank', 'smb', 'middle');
s += R(sy(0), sz(39.5), sc * 38, sc * 2.4, 'lidE');                      // lid plate resting on the bank (underside 37.1)
s += R(sy(3.4), sz(39.5) - 1, sc * 7.5, sc * 2.4 + 2, 'holecut');        // hole
s += `<line x1="${sy(3.4)}" y1="${sz(39.5) - 8}" x2="${sy(3.4)}" y2="${sz(39.5) + 18}" class="d"/><line x1="${sy(10.9)}" y1="${sz(39.5) - 8}" x2="${sy(10.9)}" y2="${sz(39.5) + 18}" class="d"/>`;
s += T(sy(12), sz(42.8), 'hole 7.5', 'dl');
// cable rod + plug head
s += R(sy(4.4), sz(41), sc * 3.4, sc * (41 - 3.2), 'cable', 3);
s += R(sy(3.4 + 0.5), sz(53), sc * 6.5, sc * 12, 'plug', 3);
s += T(sy(12), sz(56), 'plug head 6.5 (11.3 deep)', 'dl');
s += T(sy(12), sz(51.5), 'passes up through the hole,', 'sm');
s += T(sy(12), sz(47), 'then only the cable stays in it', 'sm');
// strip dimension
s += `<g class="d"><line x1="${sy(3.2)}" y1="${sz(0.8)}" x2="${sy(8.6)}" y2="${sz(0.8)}"/><line x1="${sy(3.2)}" y1="${sz(0.8) - 5}" x2="${sy(3.2)}" y2="${sz(0.8) + 5}"/><line x1="${sy(8.6)}" y1="${sz(0.8) - 5}" x2="${sy(8.6)}" y2="${sz(0.8) + 5}"/></g>`;
s += T(sy(5.9), sz(0.8) + 17, 'strip 5.4', 'dl', 'middle');
s += T(sy(40), sz(14), 'cable 3.4 mm lies in the strip;', 'sm');
s += T(sy(40), sz(14) + 13, 'the plug (6.5) would NOT fit it', 'dl');
s += tag(sy(41), sz(22), 2);

// ---------- P4: D on A ----------
panel(740, 470, 640, 220, 'Lid corner on base corner, side view');
const s3 = 3.0, bx = 800, by = 670;
s += R(bx, by - s3 * 37.7, s3 * 30, s3 * 37.7, 'part2');                   // A
s += R(bx + s3 * 5, by - s3 * 37.7, s3 * 7, s3 * 37.7, 'post');            // post
s += R(bx, by - s3 * 37.7 - s3 * 2.4 - 28, s3 * 30, s3 * 2.4, 'lidE');    // D lifted
s += `<path d="M ${bx + s3 * 17} ${by - s3 * 37.7 - 34} v 24" class="cable" style="stroke-width:2" /><path d="M ${bx + s3 * 17 - 5} ${by - s3 * 37.7 - 14} l 5 8 l 5 -8 Z" class="arrow"/>`;
s += letter(bx + s3 * 15, by - s3 * 37.7 - 40, 'D') + letter(bx + s3 * 15, by - s3 * 20, 'A');
s += T(bx + s3 * 33, by - s3 * 33, 'lower D flat onto A', 'sm');
// screw drawn at the post (right of the drawing)
const gx = 1130;
s += R(gx - 40, by - s3 * 37.7, 80, s3 * 37.7, 'part2');
s += R(gx - s3 * 3.5, by - s3 * 37.7, s3 * 7, s3 * 37.7, 'post');
s += R(gx - 45, by - s3 * 37.7 - s3 * 2.4, 90, s3 * 2.4, 'lidE');
s += R(gx - s3 * 2.6, by - s3 * 37.7 - s3 * 2.4 - 1, s3 * 5.2, s3 * 1.5, 'screw');          // head
s += R(gx - s3 * 1.25, by - s3 * 37.7 - s3 * 2.4 + s3 * 1.5 - 1, s3 * 2.5, s3 * 8 - s3 * 1.5, 'screw');  // shank
s += T(gx + 52, by - s3 * 37.7 - 12, 'M2.5 x 8: head flush,', 'sm');
s += T(gx + 52, by - s3 * 37.7 + 2, 'about 5.6 mm bites the post', 'sm');
s += tag(gx - 56, by - s3 * 37.7 - 24, 1);

// ---------- P5: the four checks ----------
panel(20, 710, 1360, 200, 'The four checks (say PASS or FAIL and send a photo of each)');
const ck = [
  [1, 'Lid corner', 'Put D flat on A. Drive 1 x M2.5 x 8 through the countersink into the post. Head flush? Firm bite, no split plastic?'],
  [2, 'Cable', 'Plug into the bank. Make the U-turn without a kink. Cable through the tunnel in B, along the strip in C. Plug head through the hole in E?'],
  [3, 'Bank in C', 'Bank against the back wall of C, about 0.6 mm of play. Can a finger reach the power button through the window?'],
  [4, 'Stop and lift', 'Bank cannot slide into the strip (front side). Bank lifts out of C without force.'],
];
ck.forEach(([n, a, b], i) => { const y = 756 + i * 38; s += tag(44, y - 4, n) + T(66, y, a, 'b') + T(190, y, b, 'sm'); });
s += T(44, 900, 'Also write down: plug length and the width of the bank pocket in your first test plate (inside, between the long walls; model 86 mm).', 'sm');

const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#fff;font-family:Arial,sans-serif}.frame{fill:#fafafa;stroke:#999}.h{font-size:15px;font-weight:bold;fill:#222}
.part2{fill:#e2e2e2;stroke:#444;stroke-width:1.5}.floor{fill:#f1f1f1;stroke:#888}.floor2{fill:#cfcfcf;stroke:#444}.wall{fill:#bdbdbd;stroke:#444;stroke-width:1.2}.win{fill:#fff;stroke:#444}
.strip{fill:#fff3cf;stroke:none}.bank{fill:#cfe0ff;fill-opacity:.65;stroke:#35c;stroke-width:1.5}.stop{fill:#a9a9a9;stroke:#333}.tun{stroke:#fff;stroke-width:4}
.lidE{fill:#e6d7ff;fill-opacity:.9;stroke:#63a;stroke-width:1.5}.hole{fill:#fff;stroke:#63a;stroke-width:1.5}.holecut{fill:#fff;stroke:none}.post{fill:#d8c5f5;stroke:#63a}
.cable{fill:#f08a00;stroke:#f08a00;stroke-width:3.4;fill-opacity:1;stroke-linejoin:round}path.cable{fill:none}.arrow{fill:#f08a00}.plug{fill:#333;stroke:#111}
.d line{stroke:#c33;stroke-width:1.4}.dl{font-size:12px;fill:#c33}.lbl{font-size:13px}.sm{font-size:12px;fill:#333}.smw{font-size:11px;fill:#333}.smb{font-size:12px;fill:#24a;font-weight:bold}.b{font-size:13px;font-weight:bold;fill:#222}
.tag{fill:#c33}.tagt{font-size:12px;fill:#fff;font-weight:bold}.let{fill:#222}.lett{font-size:12px;fill:#fff;font-weight:bold}.screw{fill:#666;stroke:#222}</style>
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="930">${s}${T(20, 924, 'Schematic for the lidfit test (D-050, D-051). Red numbers = checks, letters = printed pieces. Not to scale in detail.', 'sm')}</svg>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 940 } });
await p.setContent(html);
await p.screenshot({ path: join(here, 'preview', 'lidfit_assembly.png'), fullPage: true });
await b.close();
console.log('saved preview/lidfit_assembly.png');
