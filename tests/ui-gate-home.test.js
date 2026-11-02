// UI-GATE for the home page (P04-02, D-016): the built page (web/dist, served with the headers from web/vercel.json)
// must match the owner-approved screenshots in design/home-cards/ref/, for every heat category, phone width,
// light and dark. The readings come from a fixed fake answer (no network). Needs `npm install` in web/ and Chromium.
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
const refs = path.join(root, 'design', 'home-cards', 'ref');
const headers = JSON.parse(readFileSync(path.join(root, 'web', 'vercel.json'), 'utf8')).headers[0].headers;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

// The numbers drawn in the approved mocks (design/home-cards/build-mocks.mjs).
const STATES = {
  'caution': { hi: '29.1', temp: '28.1', rh: '62.0' },
  'extreme-caution': { hi: '40.2', temp: '32.5', rh: '66.0' },
  'danger': { hi: '44.3', temp: '34.0', rh: '68.0' },
  'extreme-danger': { hi: '53.0', temp: '38.2', rh: '70.0' },
  'below-range': { hi: '24.4', temp: '23.6', rh: '55.0' },
};

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

// Open the page with a fake Supabase answer; returns the decoded full-page screenshot and what the browser complained about.
async function shootPage(state, theme, mutate) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 640 }, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  try {
    const page = await ctx.newPage();
    const problems = [];
    page.on('console', (m) => problems.push(`${m.type()}: ${m.text()}`));
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    await page.route('**/rest/v1/readings*', (route) => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([{ recorded_at: new Date(Date.now() - 60_000).toISOString(), temp_c: STATES[state].temp, rh_pct: STATES[state].rh, heat_index_c: STATES[state].hi, room: 'Room 204' }]),
    }));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForSelector('.heat-cat, .heat-num');
    if (mutate) await mutate(page);
    const shot = decodeShot(await page.screenshot({ fullPage: true }));
    return { shot, problems };
  } finally { await ctx.close(); }
}
const decodeShot = (buf) => loadApproved(buf);
const approved = (state, theme) => loadApproved(readFileSync(path.join(refs, `${state}-phone-${theme}.png`)));

for (const theme of ['light', 'dark']) {
  for (const state of Object.keys(STATES)) {
    test(`home page matches the approved image: ${state}, ${theme}`, async () => {
      const { shot, problems } = await shootPage(state, theme);
      const r = diffImages(approved(state, theme), shot);
      assert.equal(r.sameSize, true, 'the page has another size than the approved image');
      assert.equal(r.differing, 0, `${r.differing} pixels differ (${(r.ratio * 100).toFixed(2)} %)`);
      assert.deepEqual(problems, [], 'the browser reported problems (console, CSP)');
    });
  }
}

test('the gate fails on a deliberate mismatch (a changed heat index number)', async () => {
  const { shot } = await shootPage('extreme-caution', 'light', (p) => p.evaluate(() => { document.querySelector('.heat-num').firstChild.textContent = '41'; }));
  assert.ok(diffImages(approved('extreme-caution', 'light'), shot).differing > 0);
});

test('the gate fails when the category colour is wrong (danger drawn with the extreme-caution fill)', async () => {
  const { shot } = await shootPage('danger', 'dark', (p) => p.evaluate(() => { document.querySelector('.heat').className = 'card heat heat-extreme-caution'; }));
  assert.ok(diffImages(approved('danger', 'dark'), shot).differing > 0);
});
