// Builds paper/Init_Research_Paper.docx and .pdf from content.mjs (CLAUDE.md rule 5).
// Short bond paper (Letter, 8.5 x 11 in), Times New Roman 12, 1.5 line spacing, 1 in margins.
// Run: node paper/build.mjs   (needs `npm install` at the repo root and Playwright's Chromium)
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, PageBreak,
  Footer, PageNumber, BorderStyle,
} from 'docx';
import { blocks, figures, meta } from './content.mjs';

const OUT = fileURLToPath(new URL('./', import.meta.url));
mkdirSync(OUT + 'build', { recursive: true });

// 1. diagrams -> PNG (docx needs bitmaps)
const browser = await chromium.launch();
const pngs = {};
{
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  for (const [k, f] of Object.entries(figures)) {
    await page.setViewportSize({ width: f.w, height: f.h });
    await page.setContent(`<body style="margin:0">${f.svg}</body>`);
    pngs[k] = await page.screenshot({ clip: { x: 0, y: 0, width: f.w, height: f.h } });
    writeFileSync(`${OUT}build/fig-${k}.png`, pngs[k]);
  }
}

const FONT = 'Times New Roman';
const SZ = 24; // half-points: 12 pt
const LINE = 360; // 1.5 spacing
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 2. DOCX
const run = (text, o = {}) => new TextRun({ text: String(text), font: FONT, size: o.size ?? SZ, bold: o.bold, italics: o.italics });
const para = (text, o = {}) => new Paragraph({
  alignment: o.align ?? AlignmentType.JUSTIFIED,
  spacing: { line: LINE, before: o.before ?? 0, after: o.after ?? 120 },
  indent: o.indent, keepNext: o.keepNext, pageBreakBefore: o.pb,
  children: Array.isArray(text) ? text : [run(text, o)],
});
const center = (t, o = {}) => para(t, { ...o, align: AlignmentType.CENTER });
const cell = (t, o = {}) => new TableCell({
  width: { size: o.w, type: WidthType.DXA },
  margins: { top: 40, bottom: 40, left: 80, right: 80 },
  shading: o.head ? { fill: 'E7E7E7' } : undefined,
  children: [new Paragraph({ alignment: AlignmentType.LEFT, spacing: { line: 276 }, children: [run(t, { bold: o.head, size: 21 })] })],
});
const TOTAL = 9360; // 6.5 in of text width in DXA

const kids = [];
let figNo = 0;
for (const b of blocks) {
  switch (b.t) {
    case 'title':
      kids.push(center(b.title, { bold: true, size: 32, before: 1400 }), center(b.sub, { bold: true, size: 28, after: 600 }),
        center(b.field, { bold: true, after: 900 }), center('Researchers:'), ...b.researchers.map((r) => center(r, { bold: true })),
        center('Coach:', { before: 360 }), center(b.coach, { bold: true }), center(b.school, { before: 360 }), center(b.date, { before: 120 }));
      break;
    case 'pb': kids.push(new Paragraph({ children: [new PageBreak()] })); break;
    case 'h1': kids.push(center(b.x, { bold: true, after: 0 }), center(b.y, { bold: true, after: 240 })); break;
    case 'h2': kids.push(para(b.x, { bold: true, align: AlignmentType.LEFT, keepNext: true, before: 120 })); break;
    case 'p': kids.push(para(b.x, { indent: { firstLine: 720 } })); break;
    case 'ol': b.items.forEach((x, i) => kids.push(para(`${i + 1}. ${x}`, { indent: { left: 720, hanging: 360 } }))); break;
    case 'ul': b.items.forEach((x) => kids.push(para(`•  ${x}`, { indent: { left: 720, hanging: 360 } }))); break;
    case 'table': {
      kids.push(para(b.cap, { bold: true, align: AlignmentType.LEFT, keepNext: true, before: 120, after: 60 }));
      const n = b.head.length; const w0 = Math.floor(TOTAL / n);
      kids.push(new Table({
        width: { size: TOTAL, type: WidthType.DXA }, columnWidths: Array(n).fill(w0),
        rows: [new TableRow({ tableHeader: true, children: b.head.map((h) => cell(h, { w: w0, head: true })) }),
          ...b.rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c) => cell(c, { w: w0 })) }))],
      }), para('', { after: 120 }));
      break;
    }
    case 'fig': {
      const f = figures[b.k]; figNo += 1;
      const wpx = 600; const hpx = Math.round((wpx * f.h) / f.w);
      kids.push(new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120 }, children: [new ImageRun({ type: 'png', data: pngs[b.k], transformation: { width: wpx, height: hpx }, altText: { title: f.title, description: f.title, name: b.k } })] }),
        center(`Figure ${figNo}. ${f.title}`, { bold: true, size: 22 }));
      break;
    }
    case 'refs':
      kids.push(center('References', { bold: true, after: 240 }));
      b.items.forEach((x) => kids.push(para(x, { align: AlignmentType.LEFT, indent: { left: 720, hanging: 720 } })));
      break;
  }
}
const doc = new Document({
  creator: 'Init project', title: 'Init: Indoor Heat Index Tracker',
  styles: { default: { document: { run: { font: FONT, size: SZ } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 })] })] }) },
    children: kids,
  }],
});
writeFileSync(OUT + 'Init_Research_Paper.docx', await Packer.toBuffer(doc));

// 3. PDF from the same blocks (HTML rendered by Chromium)
let html = '', fn = 0;
for (const b of blocks) {
  if (b.t === 'title') html += `<div class="c title"><p class="big">${esc(b.title)}</p><p class="mid">${esc(b.sub)}</p><p class="b sp">${esc(b.field)}</p><p>Researchers:</p>${b.researchers.map((r) => `<p class="b">${esc(r)}</p>`).join('')}<p class="sp2">Coach:</p><p class="b">${esc(b.coach)}</p><p class="sp2">${esc(b.school)}</p><p>${esc(b.date)}</p></div>`;
  else if (b.t === 'pb') html += '<div class="pb"></div>';
  else if (b.t === 'h1') html += `<h1>${esc(b.x)}${b.y ? '<br>' + esc(b.y) : ''}</h1>`;
  else if (b.t === 'h2') html += `<h2>${esc(b.x)}</h2>`;
  else if (b.t === 'p') html += `<p class="ind">${esc(b.x)}</p>`;
  else if (b.t === 'ol') html += '<div>' + b.items.map((x, i) => `<p class="li">${i + 1}. ${esc(x)}</p>`).join('') + '</div>';
  else if (b.t === 'ul') html += '<div>' + b.items.map((x) => `<p class="li">•&nbsp; ${esc(x)}</p>`).join('') + '</div>';
  else if (b.t === 'table') html += `<p class="cap">${esc(b.cap)}</p><table><thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  else if (b.t === 'fig') { fn += 1; html += `<figure><img src="data:image/png;base64,${pngs[b.k].toString('base64')}"><figcaption>Figure ${fn}. ${esc(figures[b.k].title)}</figcaption></figure>`; }
  else if (b.t === 'refs') html += `<h1>References</h1>` + b.items.map((x) => `<p class="ref">${esc(x)}</p>`).join('');
}
const css = `@page{size:8.5in 11in;margin:1in}
body{font:12pt/1.5 "Times New Roman",Times,serif;margin:0}
p{margin:0 0 6pt;text-align:justify}.ind{text-indent:.5in}.c{text-align:center}.c p{text-align:center}
.title .big{font-size:16pt;font-weight:700;margin-top:1.2in}.title .mid{font-size:14pt;font-weight:700}.b{font-weight:700}.sp{margin-top:.6in;margin-bottom:.5in}.sp2{margin-top:.25in}
h1{font-size:12pt;text-align:center;margin:0 0 12pt}h2{font-size:12pt;margin:6pt 0 3pt;break-after:avoid}
.li{margin-left:.5in;text-indent:-.25in}.ref{margin-left:.5in;text-indent:-.5in;text-align:left}
.pb{break-after:page}
table{border-collapse:collapse;width:100%;font-size:10.5pt;line-height:1.15;margin-bottom:10pt}th,td{border:1px solid #000;padding:2pt 4pt;text-align:left;vertical-align:top}th{background:#e7e7e7}tr{break-inside:avoid}thead{display:table-header-group}
.cap{font-weight:700;text-align:left;break-after:avoid;margin-bottom:3pt}
figure{margin:6pt 0;text-align:center;break-inside:avoid}figure img{width:6.5in}figcaption{font-size:11pt;font-weight:700}`;
const page = await browser.newPage();
await page.setContent(`<html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`);
await page.pdf({ path: OUT + 'Init_Research_Paper.pdf', format: 'Letter', margin: { top: '1in', bottom: '1in', left: '1in', right: '1in' }, printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="font:10pt Times New Roman;width:100%;text-align:center"><span class="pageNumber"></span></div>' });
await browser.close();
console.log('built', meta.version, 'figures', fn);
