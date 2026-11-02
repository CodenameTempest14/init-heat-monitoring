// UI-GATE for the online/offline badge (P04-03, D-016): the built page must match the owner-approved screenshots in
// design/offline-badge/ref/ for online, offline (12 min, 3 h) and no readings, phone width, light and dark.
// The fake Supabase answer carries received_at set to the age drawn in each mock. Needs `npm install` in web/ and Chromium.
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
const refs = path.join(root, 'design', 'offline-badge', 'ref');
const headers = JSON.parse(readFileSync(path.join(root, 'web', 'vercel.json'), 'utf8')).headers[0].headers;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

// What each approved mock shows (design/offline-badge/build-mocks.mjs). ageS = age of the newest reading; null = no row at all.
const STATES = {
  'online': { ageS: 0, hi: '40.2', temp: '32.5', rh: '66.0' },
  'offline-12min': { ageS: 12 * 60, hi: '40.2', temp: '32.5', rh: '66.0' },
  'offline-3h': { ageS: 3 * 3600, hi: '29.1', temp: '28.1', rh: '62.0' },
  'no-readings': { ageS: null },
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
    await page.route('**/rest/v1/readings*', (route) => {
      const s = STATES[state];
      const at = s.ageS === null ? null : new Date(Date.now() - s.ageS * 1000).toISOString();
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(at === null ? [] : [{ recorded_at: at, received_at: at, temp_c: s.temp, rh_pct: s.rh, heat_index_c: s.hi, room: 'Room 204' }]) });
    });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForSelector('.status');
    if (mutate) await mutate(page);
    const shot = decodeShot(await page.screenshot({ fullPage: true }));
    return { shot, problems };
  } finally { await ctx.close(); }
}
const decodeShot = (buf) => loadApproved(buf);
const approved = (state, theme) => loadApproved(readFileSync(path.join(refs, `${state}-phone-${theme}.png`)));

for (const theme of ['light', 'dark']) {
  for (const state of Object.keys(STATES)) {
    test(`badge states match the approved image: ${state}, ${theme}`, async () => {
      const { shot, problems } = await shootPage(state, theme);
      const r = diffImages(approved(state, theme), shot);
      assert.equal(r.sameSize, true, 'the page has another size than the approved image');
      assert.equal(r.differing, 0, `${r.differing} pixels differ (${(r.ratio * 100).toFixed(2)} %)`);
      assert.deepEqual(problems, [], 'the browser reported problems (console, CSP)');
    });
  }
}

test('the gate fails when the badge shows the wrong state (offline drawn as online)', async () => {
  const { shot } = await shootPage('offline-12min', 'light', (p) => p.evaluate(() => { const e = document.querySelector('.status'); e.className = 'status status-online'; e.lastChild.textContent = 'Online'; }));
  assert.ok(diffImages(approved('offline-12min', 'light'), shot).differing > 0);
});
