// Screenshots of the QR poster and kiosk mocks. Usage: node design/qr-kiosk/capture.mjs (writes ref/*.png)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
const here = dirname(fileURLToPath(import.meta.url)); mkdirSync(join(here, 'ref'), { recursive: true });
const b = await chromium.launch();
for (const [s, kind, size] of [['poster', 'a4', { width: 794, height: 1000 }], ['kiosk', 'tv', { width: 1920, height: 1080 }], ['kiosk', 'phone', { width: 390, height: 640 }]]) {
  const p = await (await b.newContext({ viewport: size })).newPage();
  await p.goto(pathToFileURL(join(here, `${s}.html`)).href, { waitUntil: 'load' });
  await p.screenshot({ path: join(here, 'ref', `${s}-${kind}.png`), fullPage: s === 'poster' });
}
await b.close();
