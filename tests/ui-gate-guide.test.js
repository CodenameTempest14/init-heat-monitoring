// UI-GATE for the admin guide #guide (F-22, D-034, D-016): the built page must match the owner-approved screenshots in
// design/admin-guide/ref/ (phone, light and dark). Also checks that the guide needs no sign-in and sends nothing but the
// header's readings request, and that the How? links on the admin page open the guide at the right part.
// Supabase is faked; nothing reaches a real project. Needs `npm install` in web/ and Chromium.
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
const refs = path.join(root, 'design', 'admin-guide', 'ref');
const headers = JSON.parse(readFileSync(path.join(root, 'web', 'vercel.json'), 'utf8')).headers[0].headers;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

const NOW = Date.parse('2026-11-02T13:00:00Z');
const DEVICE = '11111111-1111-1111-1111-111111111111';
const EMAIL = 'admin@example.com';
const SETTINGS = { device_id: DEVICE, interval_s: 60, temp_offset_c: 0, rh_offset_pct: 0, alert_heat_index_c: 42, alert_quiet_min: 60 };
const newest = { device_id: DEVICE, recorded_at: new Date(NOW).toISOString(), received_at: new Date(NOW).toISOString(), temp_c: 32.2, rh_pct: 68, heat_index_c: 40, room: 'Room 204' };

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

/** Open `hash` with a fake Supabase. `steps(page)` drives the page; every request except static files is recorded in `calls`. */
async function shootPage({ theme, hash = '#guide', size = { width: 390, height: 640 }, steps }) {
  const ctx = await browser.newContext({ viewport: size, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  try {
    const page = await ctx.newPage();
    const problems = [];
    const calls = [];
    page.on('console', (m) => problems.push(`${m.type()}: ${m.text()}`));
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('request', (r) => { if (r.url().includes('/rest/') || r.url().includes('/auth/')) calls.push(`${r.method()} ${new URL(r.url()).pathname}`); });
    await page.clock.setFixedTime(new Date(NOW));
    const json = (body, status = 200) => (route) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    await page.route('**/rest/v1/readings*', json([newest]));
    await page.route('**/auth/v1/token*', json({ access_token: 'fake-token', refresh_token: 'fake-refresh', expires_in: 3600, user: { email: EMAIL, id: 'u1' } }));
    await page.route('**/rest/v1/rpc/is_admin', json(true));
    await page.route('**/rest/v1/device_status*', json([{ room: 'Room 204' }]));
    await page.route('**/rest/v1/settings*', json([SETTINGS]));
    await page.route('**/rest/v1/device_health*', json([]));
    await page.goto(`${base}${hash}`, { waitUntil: 'networkidle' });
    if (steps) await steps(page);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement.blur());
    await page.evaluate(() => Promise.all(document.getAnimations().map((x) => x.finished)));
    const shot = loadApproved(await page.screenshot({ fullPage: true }));
    return { shot, problems, calls, page };
  } finally { await ctx.close(); }
}

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
const approved = (theme) => loadApproved(readFileSync(path.join(refs, `guide-phone-${theme}.png`)));
const same = (expected, shot) => {
  const r = diffImages(expected, shot);
  assert.equal(r.sameSize, true, `the page has another size than the approved image (${shot.w}x${shot.h} vs ${expected.w}x${expected.h})`);
  assert.equal(r.differing, 0, `${r.differing} pixels differ (${(r.ratio * 100).toFixed(2)} %) at ${box(expected, shot)}`);
};

for (const theme of ['light', 'dark']) {
  test(`guide matches the approved image: phone, ${theme}`, async () => {
    const { shot, problems } = await shootPage({ theme });
    same(approved(theme), shot);
    assert.deepEqual(problems, [], 'the browser reported problems (console, CSP)');
  });
}

test('the gate fails when a section number badge has another colour', async () => {
  const { shot } = await shootPage({ theme: 'light', steps: (p) => p.evaluate(() => { document.querySelector('.gd-num').style.background = 'red'; }) });
  assert.ok(diffImages(approved('light'), shot).differing > 0);
});

test('the guide needs no sign-in: it only reads the newest reading for the page header and sends nothing else', async () => {
  const { calls } = await shootPage({ theme: 'light' });
  assert.deepEqual(calls.filter((c) => !c.startsWith('GET /rest/v1/readings')), []);
});

test('the guide hides the room and status lines of the live page, and its back link goes to #admin', async () => {
  const { page } = await shootPage({ theme: 'light', steps: async (p) => {
    assert.equal(await p.locator('.app-room').count(), 0);
    assert.equal(await p.locator('.status').count(), 0);
    assert.equal(await p.locator('a.school-back').getAttribute('href'), '#admin');
  } });
  assert.ok(page);
});

test('the How? links on the admin page open the guide at Room, Device health, Reporting interval and Heat alerts', async () => {
  const wanted = { room: 'Room', health: 'Device health', interval: 'Reporting interval', alerts: 'Heat alerts' };
  for (const [id, title] of Object.entries(wanted)) {
    const { page } = await shootPage({
      theme: 'light',
      hash: '#admin',
      steps: async (p) => {
        await p.fill('#email', EMAIL);
        await p.fill('#pw', 'xxxxxxxxxxxx');
        await p.click('button[type=submit]');
        await p.getByRole('button', { name: 'Save changes' }).waitFor();
        assert.equal(await p.locator('a.ab-how').count(), 4);
        await p.locator(`a.ab-how[href="#guide/${id}"]`).click();
        await p.locator(`#${id}`).waitFor();
        await p.waitForFunction((sid) => { const r = document.getElementById(sid).getBoundingClientRect(); return r.top >= 0 && r.top < 200; }, id);
        assert.ok((await p.locator(`#${id} h2`).innerText()).endsWith(title), `section ${id} should be titled "${title}"`);
      },
    });
    assert.ok(page);
  }
});
