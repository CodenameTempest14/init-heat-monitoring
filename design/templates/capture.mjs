// P04-D4: take reference screenshots of the chosen Tabler demo pages at phone and desktop widths.
// Usage: node design/templates/capture.mjs   (needs network; writes PNGs next to this file)
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pages = [
  { id: 'home', url: 'https://preview.tabler.io/' },
  { id: 'cards', url: 'https://preview.tabler.io/cards.html' },
  { id: 'sign-in', url: 'https://preview.tabler.io/sign-in.html' },
  { id: 'settings', url: 'https://preview.tabler.io/settings.html' },
];
const sizes = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
];

const browser = await chromium.launch();
for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, reducedMotion: 'reduce' });
  for (const p of pages) {
    const page = await ctx.newPage();
    const res = await page.goto(p.url, { waitUntil: 'load' });
    await page.addStyleTag({ content: '*{animation:none!important;transition:none!important} .tblr-banner,.btn-floating{display:none!important}' });
    await page.waitForTimeout(3000);
    const file = join(here, `${p.id}-${s.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(res.status(), p.url, s.name, file);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
