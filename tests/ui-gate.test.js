// UI-GATE (P04-D5): a Playwright screenshot of a page is compared with an approved image, and the comparison
// is shown to fail on a deliberate mismatch. Uses a fixture page, not an app page (none exists yet).
import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { shoot, diffImages } from '../design/ui-gate.mjs';

const fixture = pathToFileURL(fileURLToPath(new URL('./fixtures/ui-gate/page.html', import.meta.url))).href;
const size = { width: 390, height: 300 };

let browser;
test.before(async () => { browser = await chromium.launch(); });
test.after(async () => { await browser.close(); });

test('the same page twice is identical', async () => {
  const approved = await shoot(browser, fixture, size);
  const again = await shoot(browser, fixture, size);
  const r = diffImages(approved, again);
  assert.equal(r.sameSize, true);
  assert.equal(r.differing, 0);
});

test('the gate fails when one number changes', async () => {
  const approved = await shoot(browser, fixture, size);
  const changed = await shoot(browser, fixture, size, (page) => page.evaluate(() => { document.getElementById('num').textContent = '41'; }));
  assert.ok(diffImages(approved, changed).differing > 0);
});

test('the gate fails when a colour changes', async () => {
  const approved = await shoot(browser, fixture, size);
  const changed = await shoot(browser, fixture, size, (page) => page.addStyleTag({ content: '.card{border-color:#15803d}' }));
  assert.ok(diffImages(approved, changed).differing > 0);
});

test('the gate fails when the page has another size', async () => {
  const approved = await shoot(browser, fixture, size);
  const wider = await shoot(browser, fixture, { width: 500, height: 300 });
  assert.equal(diffImages(approved, wider).sameSize, false);
});

test('colour differences below the tolerance are ignored (anti-aliasing noise)', () => {
  const a = { w: 1, h: 1, bpp: 4, data: Buffer.from([100, 100, 100, 255]) };
  const b = { w: 1, h: 1, bpp: 4, data: Buffer.from([103, 100, 98, 255]) };
  assert.equal(diffImages(a, b).differing, 0);
  assert.equal(diffImages(a, { ...b, data: Buffer.from([140, 100, 100, 255]) }).differing, 1);
});
