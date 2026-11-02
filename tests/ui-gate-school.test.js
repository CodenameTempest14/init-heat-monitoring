// UI-GATE for the school-day view (P04-07, F-12, D-016): the built page must match the owner-approved screenshots in
// design/school-day/ref/ (a finished day, today so far, a weekend, an empty day; phone light and dark, plus the finished day on desktop).
// The fake Supabase answers use the mock's own made-up numbers (design/school-day/build-mocks.mjs). The clock is fixed and the
// browser runs in a New York time zone: the view must still show Philippine time. Needs `npm install` in web/ and Chromium.
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
const refs = path.join(root, 'design', 'school-day', 'ref');
const headers = JSON.parse(readFileSync(path.join(root, 'web', 'vercel.json'), 'utf8')).headers[0].headers;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

// Clocks (the instant is UTC; Manila is 8 h ahead).
const TUE_MORNING = Date.parse('2026-11-03T02:00:00Z'); // Tue 3 Nov, 10:00 in Manila
const MON_2_42_PM = Date.parse('2026-11-02T06:42:00Z'); // Mon 2 Nov, 2:42 PM in Manila
const SAT_NOON = Date.parse('2026-10-31T04:00:00Z');    // Sat 31 Oct, 12:00 in Manila

const min = (m) => m * 60;
const levels = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, min(v)]));
const finished = {
  day: '2026-10-30', window_start: '2026-10-29T22:00:00+00:00', window_end: '2026-10-30T11:15:00+00:00', window_seconds: 795 * 60, readings: 700,
  highest: { heat_index_c: 43.4, at: '2026-10-30T05:20:00+00:00' },
  lowest: { heat_index_c: 27.2, at: '2026-10-29T22:20:00+00:00' },
  hottest_hour: { starts_at: '2026-10-30T05:00:00+00:00', average: 41.6 },
  average: 36.8,
  levels: levels({ 'extreme-danger': 0, 'danger': 200, 'extreme-caution': 380, 'caution': 150, 'below-range': 20, 'no-reading': 45 }),
};
const today = {
  day: '2026-11-02', window_start: '2026-11-01T22:00:00+00:00', window_end: '2026-11-02T06:42:00+00:00', window_seconds: 522 * 60, readings: 500,
  highest: { heat_index_c: 42.3, at: '2026-11-02T05:15:00+00:00' },
  lowest: { heat_index_c: 27.2, at: '2026-11-01T22:20:00+00:00' },
  hottest_hour: { starts_at: '2026-11-02T05:00:00+00:00', average: 41.1 },
  average: 36.2,
  levels: levels({ 'extreme-danger': 0, 'danger': 80, 'extreme-caution': 260, 'caution': 150, 'below-range': 20, 'no-reading': 12 }),
};
const emptyDay = (day) => ({
  day, window_start: new Date(Date.parse(`${day}T06:00:00+08:00`)).toISOString(), window_end: new Date(Date.parse(`${day}T19:15:00+08:00`)).toISOString(), window_seconds: 795 * 60, readings: 0,
  highest: null, lowest: null, hottest_hour: null, average: null, levels: levels({ 'extreme-danger': 0, 'danger': 0, 'extreme-caution': 0, 'caution': 0, 'below-range': 0, 'no-reading': 795 }),
});
const BY_DAY = { '2026-10-30': finished, '2026-11-02': today };
const newest = (now) => ({ device_id: '11111111-1111-1111-1111-111111111111', recorded_at: new Date(now).toISOString(), received_at: new Date(now).toISOString(), temp_c: 32.2, rh_pct: 68, heat_index_c: 40, room: 'Room 204' });

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

// Open #school at a fixed clock, press ‹ `back` times, wait for the label `label`, and take the screenshot.
async function shootPage({ theme, now, back = 0, label, size = { width: 390, height: 640 }, requests, act }) {
  const ctx = await browser.newContext({ viewport: size, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1, timezoneId: 'America/New_York' });
  try {
    const page = await ctx.newPage();
    const problems = [];
    page.on('console', (m) => problems.push(`${m.type()}: ${m.text()}`));
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    await page.clock.setFixedTime(new Date(now));
    await page.route('**/rest/v1/readings*', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify([newest(now)]) }));
    await page.route('**/rest/v1/rpc/school_day', (route) => {
      const { day } = route.request().postDataJSON();
      requests?.push(day);
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(BY_DAY[day] ?? emptyDay(day)) });
    });
    await page.goto(`${base}#school`, { waitUntil: 'networkidle' });
    // The note shows the window only once this day's numbers are in. (Not waitForFunction: the page's CSP sometimes refuses it.)
    const settle = (text) => page.locator('.viz-note', { hasText: text }).filter({ hasText: '6:00 AM to' }).waitFor();
    for (let i = 0; i < back; i++) {
      await page.waitForSelector('.school-nav button:not([disabled])');
      await page.click('.school-nav button:first-child');
    }
    await settle(label);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement.blur()); // the mock has no focus ring on the button just pressed
    if (act) await act(page);
    await page.evaluate(() => Promise.all(document.getAnimations().map((x) => x.finished))); // a button's colour change after the click
    const shot = loadApproved(await page.screenshot({ fullPage: true }));
    return { shot, problems, text: await page.innerText('.viz-wrap') };
  } finally { await ctx.close(); }
}
// Where the pictures differ, for the failure message: the box around the differing pixels.
function box(a, b) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let i = 0; i < a.w * a.h; i++) {
    for (let c = 0; c < 3; c++) {
      if (Math.abs(a.data[i * a.bpp + c] - b.data[i * b.bpp + c]) > 8) {
        const x = i % a.w, y = Math.floor(i / a.w);
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        break;
      }
    }
  }
  return `x ${x0}-${x1}, y ${y0}-${y1}`;
}
const approved = (state, kind, theme) => loadApproved(readFileSync(path.join(refs, `${state}-${kind}-${theme}.png`)));

const STATES = [
  { state: 'school-day', now: TUE_MORNING, back: 2, label: 'Fri 30 Oct' },        // Tue -> Mon -> Fri
  { state: 'school-today', now: MON_2_42_PM, back: 0, label: 'Today, Mon 2 Nov' },
  { state: 'school-weekend', now: SAT_NOON, back: 0, label: 'Fri 30 Oct' },
  { state: 'school-empty', now: TUE_MORNING, back: 4, label: 'Wed 28 Oct' },       // Tue -> Mon -> Fri -> Thu -> Wed
];

for (const theme of ['light', 'dark']) {
  for (const { state, ...opts } of STATES) {
    test(`school-day view matches the approved image: ${state}, phone, ${theme}`, async () => {
      const { shot, problems } = await shootPage({ theme, ...opts });
      const expected = approved(state, 'phone', theme);
      const r = diffImages(expected, shot);
      assert.equal(r.sameSize, true, 'the page has another size than the approved image');
      assert.equal(r.differing, 0, `${r.differing} pixels differ (${(r.ratio * 100).toFixed(2)} %) at ${box(expected, shot)}`);
      assert.deepEqual(problems, [], 'the browser reported problems (console, CSP)');
    });
  }
  test(`school-day view matches the approved image: school-day, desktop, ${theme}`, async () => {
    const { shot, problems } = await shootPage({ theme, ...STATES[0], size: { width: 1280, height: 720 } });
    const expected = approved('school-day', 'desktop', theme);
    const r = diffImages(expected, shot);
    assert.equal(r.sameSize, true, 'the page has another size than the approved image');
    assert.equal(r.differing, 0, `${r.differing} pixels differ (${(r.ratio * 100).toFixed(2)} %) at ${box(expected, shot)}`);
    assert.deepEqual(problems, []);
  });
}

test('the gate fails when a level has the wrong colour', async () => {
  const { shot } = await shootPage({ theme: 'light', ...STATES[0], act: (p) => p.evaluate(() => { document.querySelector('.school-bar .sb-danger').setAttribute('class', 'sb-caution'); }) });
  assert.ok(diffImages(approved('school-day', 'phone', 'light'), shot).differing > 0);
});

test('the view asks for the right days: the newest school day, then one earlier, weekends skipped', async () => {
  const requests = [];
  await shootPage({ theme: 'light', now: TUE_MORNING, back: 2, label: 'Fri 30 Oct', requests });
  assert.deepEqual([...new Set(requests)], ['2026-11-03', '2026-11-02', '2026-10-30']);
});

test('on a weekend it opens the last school day, with the note; on a school day there is no note', async () => {
  const weekend = await shootPage({ theme: 'light', ...STATES[2] });
  assert.match(weekend.text, /No school on weekends. Showing the last school day./);
  const weekday = await shootPage({ theme: 'light', ...STATES[1] });
  assert.doesNotMatch(weekday.text, /No school on weekends/);
});

test('the day picker stops 90 days back: the oldest school day has no previous day', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 640 }, timezoneId: 'America/New_York' });
  try {
    const page = await ctx.newPage();
    await page.clock.setFixedTime(new Date(MON_2_42_PM));
    await page.route('**/rest/v1/readings*', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify([newest(MON_2_42_PM)]) }));
    await page.route('**/rest/v1/rpc/school_day', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(emptyDay(route.request().postDataJSON().day)) }));
    await page.goto(`${base}#school`, { waitUntil: 'networkidle' });
    for (let i = 0; i < 100; i++) {
      await page.waitForSelector('.school-nav button');
      if (await page.locator('.school-nav button').first().isDisabled()) break;
      await page.click('.school-nav button:first-child');
    }
    assert.equal(await page.textContent('.viz-note strong'), 'Tue 4 Aug'); // 90 days before Mon 2 Nov
    assert.equal(await page.locator('.school-nav button').first().isDisabled(), true);
  } finally { await ctx.close(); }
});
