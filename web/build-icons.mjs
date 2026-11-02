// Makes the icon and logo files in public/ from the approved brand drawings (design/pwa/icons.mjs).
// Usage (in web/): npm run icons   (needs Chromium from the root's Playwright; the PNGs are committed, so this is only for changes)
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICONS, LOGOS } from '../design/pwa/icons.mjs';

const pub = join(dirname(fileURLToPath(import.meta.url)), 'public');
writeFileSync(join(pub, 'favicon.svg'), ICONS.any + '\n');
writeFileSync(join(pub, 'logo-light.svg'), LOGOS.light + '\n');
writeFileSync(join(pub, 'logo-dark.svg'), LOGOS.dark + '\n');

const PNGS = [
  ['icon-192.png', 'any', 192], ['icon-512.png', 'any', 512], ['icon-maskable-512.png', 'maskable', 512],
  ['apple-touch-icon.png', 'apple', 180], ['favicon-32.png', 'any', 32],
];
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const [file, kind, size] of PNGS) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px">${ICONS[kind].replace('<svg ', `<svg width="${size}" height="${size}" `)}</div></body>`);
  await page.screenshot({ path: join(pub, file), omitBackground: true });
  console.log(file);
}
await browser.close();
