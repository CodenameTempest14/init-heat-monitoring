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
import { SPAN, ROWS } from '../design/room-reset-readings/section.mjs';
import { series } from '../design/history-charts/mock-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'web', 'dist');
const refs = path.join(root, 'design', 'history-charts', 'ref');
const headers = JSON.parse(readFileSync(path.join(root, 'web', 'vercel.json'), 'utf8')).headers[0].headers;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
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
async function shootPage({ theme, size = { width: 390, height: 640 }, empty = false, act, hourly }) {
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
    const readingCalls = [];
    await page.route('**/rest/v1/rpc/readings_span', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(empty ? { first_at: null, last_at: null } : SPAN) }));
    await page.route('**/rest/v1/rpc/readings_hourly', (route) => {
      const body = route.request().postDataJSON();
      readingCalls.push(body);
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(hourly ? hourly(body) : ROWS) });
    });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForSelector(empty ? '.viz-empty' : '.viz-charts');
    if (act) await act(page);
    const shot = loadApproved(await page.screenshot({ fullPage: true }));
    return { shot, problems, page, readingCalls };
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
    rows = await page.$$eval('.viz-tablebox .viz-table tbody tr', (trs) => trs.map((tr) => [...tr.children].map((td) => td.textContent)));
  } });
  const expected = bucketRows(24).length;
  assert.equal(rows.length, expected);
  assert.deepEqual(rows[0], ['14:00', '40', '32.2', '68']);
  assert.ok(rows.some((r) => r[1] === '—' && r[2] !== '—'), 'a bucket below the heat index range shows a dash only for the heat index');
});

// Follow-up from the phone (s17): a tap left a white focus outline on the chart. Only keyboard users should see one.
test('a tap on a chart shows no focus outline, keyboard focus does', async () => {
  let tapped, keyboard;
  await shootPage({ theme: 'dark', act: async (page) => {
    const outline = () => page.evaluate(() => { const s = getComputedStyle(document.activeElement); return { cls: document.activeElement.getAttribute('class'), style: s.outlineStyle, width: s.outlineWidth }; });
    const svg = page.locator('.viz-svg').first();
    await svg.scrollIntoViewIfNeeded();
    const box = await svg.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    tapped = await outline();
    await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('Tab');
    while (!(await page.evaluate(() => document.activeElement.classList.contains('viz-svg')))) await page.keyboard.press('Tab');
    keyboard = await outline();
  } });
  assert.equal(tapped.cls, 'viz-svg', 'the tap should have focused the chart');
  assert.ok(tapped.style === 'none' || tapped.width === '0px', `outline after a tap: ${JSON.stringify(tapped)}`);
  assert.ok(keyboard.style !== 'none' && keyboard.width !== '0px', `outline from the keyboard: ${JSON.stringify(keyboard)}`);
});

// ---- F-24: the readings table (behaviour; the picture is part of the history states above) ----
const fullPage = (n, startMs = Date.parse('2026-11-03T08:00:00Z')) => Array.from({ length: n }, (_, i) => ({ hour: new Date(startMs - i * 3_600_000).toISOString(), room: 'Room 204', temp_c: 30, rh_pct: 60, heat_index_c: 34, n: 60 }));

test('F-24: the first load asks for the newest day, both ends, 500 rows', async () => {
  const { readingCalls } = await shootPage({ theme: 'light' });
  assert.deepEqual(readingCalls[0], { from_day: '2026-11-03', to_day: '2026-11-03', for_device: readingCalls[0].for_device, before_hour: null, page_size: 500 });
});

test('F-24: a short page has no Show more; a full page has it, and it adds the next rows from where the last ended', async () => {
  await shootPage({ theme: 'light', act: async (p) => { assert.equal(await p.getByRole('button', { name: 'Show more' }).count(), 0); } });

  const all = fullPage(503);
  const r = await shootPage({
    theme: 'light',
    hourly: (b) => (b.before_hour ? all.slice(500) : all.slice(0, 500)),
    act: async (p) => {
      assert.equal(await p.locator('.rr-table tbody tr').count(), 500);
      await p.getByRole('button', { name: 'Show more' }).click();
      await p.waitForFunction(() => document.querySelectorAll('.rr-table tbody tr').length === 503);
      assert.equal(await p.getByRole('button', { name: 'Show more' }).count(), 0, 'the end: no more button');
    },
  });
  assert.equal(r.readingCalls.at(-1).before_hour, all[499].hour);
});

test('F-24: changing the days loads again; a To day before From is refused and nothing is asked', async () => {
  const r = await shootPage({
    theme: 'light',
    act: async (p) => {
      await p.fill('#rd-from', '2026-11-02');
      await p.waitForFunction(() => document.querySelectorAll('.rr-table tbody tr').length > 0);
    },
  });
  assert.equal(r.readingCalls.at(-1).from_day, '2026-11-02');
  const n = r.readingCalls.length;
  const bad = await shootPage({
    theme: 'light',
    act: async (p) => { await p.fill('#rd-to', '2026-11-02'); await p.getByRole('alert').waitFor(); },
  });
  assert.equal(bad.readingCalls.length, 1, 'only the first load; the bad range asked nothing');
  assert.ok(n >= 2);
});

test('F-24: Download CSV gets every page of the range and saves one file named by the days', async () => {
  const all = fullPage(503);
  let name; let text;
  await shootPage({
    theme: 'light',
    hourly: (b) => (b.before_hour ? all.slice(500) : all.slice(0, 500)),
    act: async (p) => {
      const [download] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'Download CSV' }).click()]);
      name = download.suggestedFilename();
      text = readFileSync(await download.path(), 'utf8');
    },
  });
  assert.equal(name, 'init-readings_2026-11-03_to_2026-11-03.csv');
  assert.equal(text.split('\r\n').length, 1 + 503 + 1, 'header, 503 rows, trailing newline');
});
