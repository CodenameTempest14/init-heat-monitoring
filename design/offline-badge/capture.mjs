// Screenshots of the badge mocks: phone 390 px light and dark for every state, plus desktop 1280 px for two states.
// Usage: node design/offline-badge/capture.mjs   (writes ref/<state>-<phone|desktop>-<light|dark>.png; no network)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const states = ['online', 'offline-12min', 'offline-3h', 'no-readings'];
const desktopStates = ['offline-12min'];
mkdirSync(join(here, 'ref'), { recursive: true });

const browser = await chromium.launch();
for (const theme of ['light', 'dark']) {
  for (const [kind, size] of [['phone', { width: 390, height: 640 }], ['desktop', { width: 1280, height: 720 }]]) {
    const ctx = await browser.newContext({ viewport: size, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    for (const s of kind === 'phone' ? states : desktopStates) {
      const page = await ctx.newPage();
      await page.goto(pathToFileURL(join(here, `${s}.html`)).href, { waitUntil: 'load' });
      await page.evaluate((t) => document.documentElement.setAttribute('data-bs-theme', t), theme);
      const file = join(here, 'ref', `${s}-${kind}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(file);
      await page.close();
    }
    await ctx.close();
  }
}
await browser.close();
