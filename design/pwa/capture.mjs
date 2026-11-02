// Screenshots of the PWA mocks: phone 390 px, light and dark. Usage: node design/pwa/capture.mjs (writes ref/<page>-phone-<light|dark>.png)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, 'ref'), { recursive: true });
const browser = await chromium.launch();
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 640 }, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  for (const s of ['header', 'icons', 'installed']) {
    const page = await ctx.newPage();
    await page.goto(pathToFileURL(join(here, `${s}.html`)).href, { waitUntil: 'load' });
    await page.evaluate((t) => document.documentElement.setAttribute('data-bs-theme', t), theme);
    const file = join(here, 'ref', `${s}-phone-${theme}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
