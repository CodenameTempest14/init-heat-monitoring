// Screenshots of the device setup page states at phone width, light and dark (D-011, D-016).
// Usage: node design/device-setup/capture.mjs   (writes ref/<state>-<theme>.png next to this file; no network)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const states = ['form', 'form-error', 'saved'];
const themes = ['light', 'dark'];
mkdirSync(join(here, 'ref'), { recursive: true });

const browser = await chromium.launch();
for (const theme of themes) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  for (const s of states) {
    const page = await ctx.newPage();
    await page.goto(pathToFileURL(join(here, `${s}.html`)).href, { waitUntil: 'load' });
    const file = join(here, 'ref', `${s}-${theme}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
