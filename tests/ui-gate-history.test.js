// UI-GATE for the history charts (P04-04, D-016): the built page must match the owner-approved screenshots in
// design/history-charts/ref/ (24 h, 7 d, a time picked, no readings; phone light and dark, plus the 24 h desktop page).
// The fake Supabase answers use the mock's own made-up data (design/history-charts/mock-data.mjs); the clock is fixed to
// Monday 14:00 in UTC, the "now" of the mocks. Needs `npm install` in web/ and Chromium.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { diffImages, loadApproved } from '../design/ui-gate.mjs';
import { series } from '../design/history-charts/mock-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'web', 'dist');
const refs = path.join(root, 'design', 'history-charts', 'ref');
const headers = JSON.parse(readFileSync(path.join(root, 'web', 'vercel.json'), 'utf8')).headers[0].headers;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const NOW = Date.parse('2026-11-02T14:00:00Z');
const HOUR = 3_600_000;

// The mock's buckets as the server's history() would answer them. A bucket with no readings (the outage) is simply absent.
const bucketRows = (hours) => series(hours === 24 ? '24h' : '7d').filter((p) => p.temp !== null)
  .map((p) => ({ bucket: new Date(NOW - hours * HOUR + p.t * HOUR).toISOString(), temp_c: p.temp, rh_pct: p.rh, heat_index_c: p.hi }));
const top = series('24h').at(-1);
const newest = { device_id: '11111111-1111-1111-1111-111111111111', recorded_at: new Date(NOW).toISOString(), received_at: new Date(NOW).toISOString(), temp_c: top.temp, rh_pct: top.rh, heat_index_c: top.hi, room: 'Room 204' };

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

// Open the page with fake Supabase answers; `act(page)` does what the state needs (click a range, point at a time).
async function shootPage({ theme, size = { width: 390, height: 640 }, empty = false, act }) {
  const ctx = await browser.newContext({ viewport: size, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1, timezoneId: 'UTC' });
  try {
    const page = await ctx.newPage();
    const problems = [];
    page.on('console', (m) => problems.push(`${m.type()}: ${m.text()}`));
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    await page.clock.setFixedTime(new Date(NOW));
    await page.route('**/rest/v1/readings*', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify([newest]) }));
    await page.route('**/rest/v1/rpc/history', (route) => {
      const { range_hours } = route.request().postDataJSON();
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(empty ? [] : bucketRows(range_hours)) });
    });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForSelector(empty ? '.viz-empty' : '.viz-charts');
    if (act) await act(page);
    const shot = loadApproved(await page.screenshot({ fullPage: true }));
    return { shot, problems, page };
  } finally { await ctx.close(); }
}
const approved = (state, kind, theme) => loadApproved(readFileSync(path.join(refs, `${state}-${kind}-${theme}.png`)));

const show7d = async (page) => {
  await page.click('text=Last 7 days');
  await page.waitForFunction(() => document.querySelector('.viz-svg')?.getAttribute('aria-label').includes('7 days') && !document.querySelector('.viz-loading'));
  await page.mouse.move(0, 0); // the mock has no hover or focus on the clicked button
  await page.evaluate(() => document.activeElement.blur());
};
// Point at yesterday 16:00 (2 h into the 24 h window) on the first chart, like the hover mock.
const pointAt16 = async (page) => {
  // A pointer event sent straight to the chart, so the page does not scroll (the mock was shot unscrolled).
  const svg = page.locator('.viz-svg').first();
  const box = await svg.boundingBox();
  await svg.dispatchEvent('pointermove', { pointerType: 'mouse', clientX: box.x + ((34 + (2 / 24) * (326 - 44)) / 326) * box.width, clientY: box.y + box.height / 2 });
  await page.waitForSelector('.viz-tip-time');
};
const STATES = [
  { state: '24h' },
  { state: '7d', act: show7d },
  { state: '24h-hover', act: pointAt16 },
  { state: 'empty', empty: true },
];

for (const theme of ['light', 'dark']) {
  for (const { state, act, empty } of STATES) {
    test(`history charts match the approved image: ${state}, phone, ${theme}`, async () => {
      const { shot, problems } = await shootPage({ theme, act, empty });
      const r = diffImages(approved(state, 'phone', theme), shot);
      assert.equal(r.sameSize, true, 'the page has another size than the approved image');
      assert.equal(r.differing, 0, `${r.differing} pixels differ (${(r.ratio * 100).toFixed(2)} %)`);
      assert.deepEqual(problems, [], 'the browser reported problems (console, CSP)');
    });
  }
  test(`history charts match the approved image: 24h, desktop, ${theme}`, async () => {
    const { shot, problems } = await shootPage({ theme, size: { width: 1280, height: 720 } });
    const r = diffImages(approved('24h', 'desktop', theme), shot);
    assert.equal(r.sameSize, true, 'the page has another size than the approved image');
    assert.equal(r.differing, 0, `${r.differing} pixels differ (${(r.ratio * 100).toFixed(2)} %)`);
    assert.deepEqual(problems, []);
  });
}

test('the gate fails when a series has the wrong colour', async () => {
  const { shot } = await shootPage({ theme: 'light', act: (p) => p.evaluate(() => { document.querySelector('.viz-line.s-temp').setAttribute('class', 'viz-line s-hi'); }) });
  assert.ok(diffImages(approved('24h', 'phone', 'light'), shot).differing > 0);
});

test('table twin: one row per bucket, newest first, a dash only for a missing heat index', async () => {
  let rows;
  await shootPage({ theme: 'light', act: async (page) => {
    await page.click('summary');
    rows = await page.$$eval('.viz-table tbody tr', (trs) => trs.map((tr) => [...tr.children].map((td) => td.textContent)));
  } });
  const expected = bucketRows(24).length;
  assert.equal(rows.length, expected);
  assert.deepEqual(rows[0], ['14:00', '40', '32.2', '68']);
  assert.ok(rows.some((r) => r[1] === '—' && r[2] !== '—'), 'a bucket below the heat index range shows a dash only for the heat index');
});
