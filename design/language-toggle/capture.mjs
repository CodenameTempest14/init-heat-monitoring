// Screenshots of the language-toggle mocks. Usage: node design/language-toggle/capture.mjs (writes ref/*.png)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
const here = dirname(fileURLToPath(import.meta.url)); mkdirSync(join(here, 'ref'), { recursive: true });
const b = await chromium.launch();
for (const [id, w] of [['home-en', 390], ['home-fil', 390], ['home-fil-longest', 360]]) {
  for (const scheme of ['light']) {
    const p = await (await b.newContext({ viewport: { width: w, height: 700 }, colorScheme: scheme })).newPage();
    await p.goto(pathToFileURL(join(here, `${id}.html`)).href, { waitUntil: 'load' });
    await p.screenshot({ path: join(here, 'ref', `${id}-${scheme}.png`), fullPage: true });
  }
}
await b.close();
