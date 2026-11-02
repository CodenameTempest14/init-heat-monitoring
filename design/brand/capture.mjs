// Screenshot design/brand/preview.html to preview.png (no network). Run build-logos.mjs first.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(here, 'preview.html')).href, { waitUntil: 'load' });
await page.screenshot({ path: join(here, 'preview.png'), fullPage: true });
await browser.close();
console.log(join(here, 'preview.png'));
