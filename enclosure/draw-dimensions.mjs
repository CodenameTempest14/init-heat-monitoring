// Draws the dimensioned draft (top and side view) from the same numbers as init_case.scad, then saves a PNG.
// Run: node enclosure/draw-dimensions.mjs   (needs Playwright's Chromium, already used by the UI gates)
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const wall = 2.4, floor = 2.4, lid = 2.4, gap = 0.6, rear = 12, bayH = 30;
const bank = [167, 80, 33.3], screen = [22, 67.2], scrFrom = 9.8, bayX = 48.05 + 60, innerY = 86, step = 6;
const innerX = bank[0] + 2 * gap + rear, outX = innerX + 2 * wall, outY = innerY + 2 * wall;
const baseH = floor + bank[2] + 2 * gap, bay0 = wall + gap + scrFrom + screen[0] + step, bayOut = bayX + 2 * wall;
const totalH = baseH + lid + bayH + lid;
const S = 4.6, M = 120;                         // px per mm, margin
const f = (n) => (Math.round(n * 10) / 10).toString();
let svg = '';
const rect = (x, y, w, h, st) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${st}/>`;
const dimH = (x1, x2, y, label, off = 0) => `<g class="d"><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><line x1="${x1}" y1="${y - 6}" x2="${x1}" y2="${y + 6}"/><line x1="${x2}" y1="${y - 6}" x2="${x2}" y2="${y + 6}"/><text x="${(x1 + x2) / 2}" y="${y - 8 + off}" text-anchor="middle">${label}</text></g>`;
const dimV = (y1, y2, x, label) => `<g class="d"><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/><line x1="${x - 6}" y1="${y1}" x2="${x + 6}" y2="${y1}"/><line x1="${x - 6}" y1="${y2}" x2="${x + 6}" y2="${y2}"/><text x="${x - 8}" y="${(y1 + y2) / 2}" text-anchor="end" dominant-baseline="middle">${label}</text></g>`;
// ---- TOP VIEW (port end on the left) ----
const T = { x: M, y: 150 };
svg += `<text x="${M}" y="36" class="h">TOP VIEW (lid on). Port end on the left. mm</text>`;
svg += rect(T.x, T.y, outX * S, outY * S, 'class="body"');
svg += rect(T.x + (wall + gap) * S, T.y + (outY - bank[1]) / 2 * S, bank[0] * S, bank[1] * S, 'class="bank"');
svg += rect(T.x + (wall + gap + scrFrom - 0.5) * S, T.y + (outY - screen[1] - 1) / 2 * S, (screen[0] + 1) * S, (screen[1] + 1) * S, 'class="win"');
svg += rect(T.x + bay0 * S, T.y, bayOut * S, outY * S, 'class="bay"');
svg += `<text x="${T.x + (bay0 + bayOut / 2) * S}" y="${T.y + outY / 2 * S}" text-anchor="middle" class="lbl">Electronics bay: ${f(bayX)} x ${f(48.05 > 0 ? 25.3 + 60 : 0)} inner (ESP32 PCB + 30 mm each side)</text>`;
svg += `<text x="${T.x + (wall + gap + scrFrom + screen[0] / 2) * S}" y="${T.y + outY / 2 * S}" text-anchor="middle" class="lbl" transform="rotate(-90 ${T.x + (wall + gap + scrFrom + screen[0] / 2) * S} ${T.y + outY / 2 * S})">bank screen window ${f(screen[0] + 1)} x ${f(screen[1] + 1)}</text>`;
svg += `<text x="${T.x + (bay0 + bayOut + 8) * S}" y="${T.y + (outY / 2) * S}" class="lbl">rear space ${rear}</text>`;
svg += dimH(T.x, T.x + outX * S, T.y - 14, `outer length ${f(outX)}`);
svg += dimH(T.x + bay0 * S, T.x + (bay0 + bayOut) * S, T.y - 44, `bay outer ${f(bayOut)}`);
svg += dimH(T.x + (wall + gap + scrFrom - 0.5) * S, T.x + (wall + gap + scrFrom + screen[0] + 0.5) * S, T.y + outY * S + 24, `window ${f(screen[0] + 1)}`);
svg += dimH(T.x + (wall + gap) * S, T.x + (wall + gap + scrFrom) * S, T.y + outY * S + 54, `${f(scrFrom)} (bank end to screen)`);
svg += dimV(T.y, T.y + outY * S, T.x - 14, `width ${f(outY)}`);
svg += `<text x="${T.x - 6}" y="${T.y - 85}" class="note">grey = bank (167 x 80), blue = electronics bay walls, white = bank screen window</text>`;
// ---- SIDE VIEW ----
const Y0 = T.y + outY * S + 150, D = { x: M, y: Y0 };
const zy = (z) => D.y + (totalH - z) * S;
svg += `<text x="${M}" y="${Y0 - 20}" class="h">SIDE VIEW. Port end on the left. mm</text>`;
svg += rect(D.x, zy(baseH), outX * S, baseH * S, 'class="body"');
svg += rect(D.x, zy(baseH + lid), outX * S, lid * S, 'class="lidc"');
svg += rect(D.x + bay0 * S, zy(baseH + lid + bayH), bayOut * S, bayH * S, 'class="bay"');
svg += rect(D.x + bay0 * S, zy(totalH), bayOut * S, lid * S, 'class="cover"');
svg += rect(D.x + (wall + gap) * S, zy(floor + gap + bank[2]), bank[0] * S, bank[2] * S, 'class="bank"');
svg += `<text x="${D.x + (wall + gap + 83) * S}" y="${zy(floor + gap + bank[2] / 2)}" text-anchor="middle" class="lbl">ROMOSS bank 167 x 80 x 33.3</text>`;
svg += `<text x="${D.x + (bay0 + bayOut / 2) * S}" y="${zy(baseH + lid + bayH / 2)}" text-anchor="middle" class="lbl">electronics bay, ${f(bayH)} high inside</text>`;
svg += dimV(zy(totalH), zy(0), D.x - 14, `total ${f(totalH)}`);
svg += dimV(zy(baseH), zy(0), D.x + outX * S + 60, `base ${f(baseH)}`);
svg += dimH(D.x, D.x + outX * S, zy(0) + 30, `outer length ${f(outX)}`);
svg += `<text x="${M}" y="${zy(0) + 70}" class="note">Walls ${wall}, floor ${floor}, lid ${lid}, clearance around the bank ${gap} each side. Pod (DHT22): 38 x 26 x 16. Overall: ${f(outX)} x ${f(outY)} x ${f(totalH)}.</text>`;
svg += `<text x="${M}" y="${zy(0) + 92}" class="note">PLACEHOLDERS (not measured): bank port opening 66 x 14, USB-C slot 14 x 8, BOOT/EN holes 4 dia, OLED window 22 x 11, insert hole sizes.</text>`;
const W = Math.round(M * 2 + (outX + 24) * S), H = Math.round(zy(0) + 120);
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#fff;font-family:Arial,sans-serif}
.body{fill:#e6e6e6;stroke:#333;stroke-width:1.5}.bank{fill:#bdbdbd;stroke:#555;stroke-width:1;opacity:.9}.win{fill:#fff;stroke:#c33;stroke-width:1.5}
.bay{fill:#cde8ff;stroke:#246;stroke-width:1.5;opacity:.85}.lidc{fill:#f4f4f4;stroke:#333}.cover{fill:#9cc8ee;stroke:#246}
.d line{stroke:#c33;stroke-width:1.2}.d text{fill:#c33;font-size:15px}.h{font-size:20px;font-weight:bold}.lbl{font-size:14px;fill:#123}.note{font-size:14px;fill:#333}</style>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
await p.setContent(html); await p.screenshot({ path: join(here, 'preview', 'draft1_dimensions.png'), fullPage: true }); await b.close();
console.log('saved preview/draft1_dimensions.png', W, H, 'overall', f(outX), f(outY), f(totalH));
