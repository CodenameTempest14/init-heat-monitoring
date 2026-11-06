// UI-GATE for the English / Filipino switch (P06-05, F-18; D-016): the built home page must match the owner-approved images in
// design/language-toggle/ref/ (English, Filipino, and the longest Filipino texts at 360 px; light and dark). Also: the choice is kept
// after a reload and sets the page's lang, the school-day and alerts pages follow it, the kiosk stays English, only the one
// language key is written to the browser, and a blocked browser store means English with no error.
// The Filipino is a DRAFT until a teacher reviews it (D-034); this gate checks layout and behaviour, not the quality of the words.
// Supabase is faked. Needs `npm install` in web/ and Chromium. Run it alone (it builds web/dist).
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { diffImages, loadApproved } from '../design/ui-gate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'web', 'dist');
const refs = path.join(root, 'design', 'language-toggle', 'ref');
const headers = JSON.parse(readFileSync(path.join(root, 'web', 'vercel.json'), 'utf8')).headers[0].headers;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

let browser, server, base;
test.before(async () => {
  const b = spawnSync('npm run build', { cwd: path.join(root, 'web'), shell: true, encoding: 'utf8' });
  assert.equal(b.status, 0, `web build failed:\n${b.stdout}\n${b.stderr}`);
  server = http.createServer((q, r) => {
    const f = path.join(dist, q.url === '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0]));
    if (!f.startsWith(dist) || !existsSync(f)) { r.writeHead(404); return r.end(); }
    const h = { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' };
    for (const x of headers) h[x.key] = x.value;
    r.writeHead(200, h); r.end(readFileSync(f));
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  base = `http://127.0.0.1:${server.address().port}/`;
  browser = await chromium.launch();
});
test.after(async () => { await browser?.close(); server?.close(); });

// The two made-up readings drawn in the mocks. No device_id, so the page has no history or readings table (like the home gate).
const READINGS = {
  normal: (now) => [{ recorded_at: new Date(now).toISOString(), received_at: new Date(now).toISOString(), temp_c: '32.5', rh_pct: '66.0', heat_index_c: '40.2', room: 'Room 204' }],
  longest: (now) => [{ recorded_at: new Date(now - 12 * 60_000).toISOString(), received_at: new Date(now - 12 * 60_000).toISOString(), temp_c: '38.0', rh_pct: '60.0', heat_index_c: '54.0', room: 'Room 204' }],
};

async function open({ reading = 'normal', theme = 'light', width = 390, hash = '', init, storageBlocked = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 700 }, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => problems.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  if (storageBlocked) await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  const now = Date.now();
  await page.route('**/rest/v1/readings*', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(READINGS[reading](now)) }));
  await page.route('**/rest/v1/rpc/**', (route) => route.fulfill({ contentType: 'application/json', body: '{}' }));
  await page.route('**/rest/v1/settings*', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  if (init) await init(page);
  await page.goto(`${base}${hash}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.heat-cat, .heat-num, .viz-section');
  return { ctx, page, problems };
}
const shot = async (page) => { await page.mouse.move(0, 0); await page.evaluate(() => document.activeElement.blur()); return loadApproved(await page.screenshot({ fullPage: true })); };
const approved = (name, theme) => loadApproved(readFileSync(path.join(refs, `${name}-${theme}.png`)));
const clickFilipino = (page) => page.click('.lang-btn[lang="fil"]');
const chooseFilipino = (p) => p.addInitScript(() => window.localStorage.setItem('init-lang', 'fil'));

for (const theme of ['light', 'dark']) {
  test(`English home page matches the approved image, ${theme}`, async () => {
    const { ctx, page, problems } = await open({ theme });
    try {
      const r = diffImages(approved('home-en', theme), await shot(page));
      assert.equal(r.sameSize, true);
      assert.equal(r.differing, 0, `${r.differing} pixels differ`);
      assert.deepEqual(problems, []);
    } finally { await ctx.close(); }
  });
  test(`Filipino home page matches the approved image, ${theme}`, async () => {
    const { ctx, page, problems } = await open({ theme });
    try {
      await clickFilipino(page);
      const r = diffImages(approved('home-fil', theme), await shot(page));
      assert.equal(r.sameSize, true);
      assert.equal(r.differing, 0, `${r.differing} pixels differ`);
      assert.deepEqual(problems, []);
    } finally { await ctx.close(); }
  });
  test(`the longest Filipino texts fit at 360 px and match the approved image, ${theme}`, async () => {
    const { ctx, page } = await open({ theme, reading: 'longest', width: 360 });
    try {
      await clickFilipino(page);
      const r = diffImages(approved('home-fil-longest', theme), await shot(page));
      assert.equal(r.sameSize, true);
      assert.equal(r.differing, 0, `${r.differing} pixels differ`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'the page scrolls sideways');
    } finally { await ctx.close(); }
  });
}

test('the choice is kept after a reload, sets the page language, and only the language key is stored', async () => {
  const { ctx, page } = await open();
  try {
    assert.equal(await page.getAttribute('html', 'lang'), 'en');
    assert.equal(await page.getAttribute('.lang-btn[lang="en"]', 'aria-pressed'), 'true');
    await clickFilipino(page);
    assert.equal(await page.getAttribute('html', 'lang'), 'fil');
    assert.equal(await page.getAttribute('.lang-btn[lang="fil"]', 'aria-pressed'), 'true');
    assert.equal(await page.getAttribute('.lang-btn[lang="en"]', 'aria-pressed'), 'false');
    assert.deepEqual(await page.evaluate(() => Object.keys(window.localStorage)), ['init-lang']);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.heat-cat');
    assert.equal(await page.getAttribute('html', 'lang'), 'fil');
    assert.match(await page.textContent('.app-room'), /^Silid: /);
    await page.click('.lang-btn[lang="en"]');
    assert.equal(await page.getAttribute('html', 'lang'), 'en');
    assert.match(await page.textContent('.app-room'), /^Room: /);
  } finally { await ctx.close(); }
});

test('the switch buttons are at least 30 px and show the chosen one with a check mark, not only with colour', async () => {
  const { ctx, page } = await open();
  try {
    for (const b of await page.locator('.lang-btn').all()) {
      const box = await b.boundingBox();
      assert.ok(box.height >= 30 && box.width >= 30, `button is ${box.width} x ${box.height}`);
    }
    assert.match(await page.textContent('.lang-btn[lang="en"]'), /^✓ English$/);
    assert.equal(await page.textContent('.lang-btn[lang="fil"]'), 'Filipino');
  } finally { await ctx.close(); }
});

test('the school-day and alerts pages follow the choice and keep the switch', async () => {
  const { ctx, page, problems } = await open({ init: chooseFilipino });
  try {
    assert.equal(await page.getAttribute('html', 'lang'), 'fil');
    await page.goto(`${base}#school`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.viz-section');
    assert.equal(await page.textContent('.viz-section'), 'Araw sa paaralan');
    assert.equal(await page.textContent('.school-back'), '‹ Mga live na reading');
    assert.equal(await page.locator('.lang-switch').count(), 1);
    await page.goto(`${base}#alerts`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.viz-section');
    assert.equal(await page.textContent('.viz-section'), 'Mga babala sa init');
    await page.waitForSelector('[data-alerts-ready]');
    assert.match(await page.textContent('.alerts-rule'), /Kapag umabot ang heat index sa Room 204/);
    assert.ok(await page.locator('.alerts-rule strong').count() >= 2, 'the room and the level are bold');
    assert.deepEqual(problems, []);
  } finally { await ctx.close(); }
});

test('the kiosk stays English whatever was chosen', async () => {
  const { ctx, page } = await open({ init: chooseFilipino });
  try {
    await page.goto(`${base}#kiosk`, { waitUntil: 'networkidle' });
    const text = await page.textContent('body');
    assert.match(text, /Extreme caution/);
    assert.doesNotMatch(text, /Matinding/);
    assert.equal(await page.locator('.lang-switch').count(), 0);
  } finally { await ctx.close(); }
});

test('a blocked browser store means English and no error', async () => {
  const { ctx, page, problems } = await open({ storageBlocked: true });
  try {
    assert.equal(await page.getAttribute('html', 'lang'), 'en');
    await clickFilipino(page); // works for this visit even though it cannot be kept
    assert.match(await page.textContent('.app-room'), /^Silid: /);
    assert.deepEqual(problems, []);
  } finally { await ctx.close(); }
});
