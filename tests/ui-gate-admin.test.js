// UI-GATE for the admin view #admin (P05-01, P05-02, P05-06, D-016): the built page must match the owner-approved
// screenshots of proposal B in design/admin/proposal-b/ref/ (sign-in, wrong password, not an admin, settings, saved; phone
// light and dark, plus settings on desktop). Supabase is faked with the mocks' made-up account and room
// (design/admin/proposal-b/build-mocks.mjs); nothing reaches a real project. Needs `npm install` in web/ and Chromium.
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
const refs = path.join(root, 'design', 'admin', 'proposal-b', 'ref');
const headers = JSON.parse(readFileSync(path.join(root, 'web', 'vercel.json'), 'utf8')).headers[0].headers;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

const NOW = Date.parse('2026-11-02T13:00:00Z');
const DEVICE = '11111111-1111-1111-1111-111111111111';
const EMAIL = 'admin@example.com'; // the mocks' made-up account
const PASSWORD = 'xxxxxxxxxxxx';   // 12 characters, like the mock's dots
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

/**
 * Open #admin with a fake Supabase. `admin`: what is_admin() answers. `goodPassword`: whether sign-in succeeds.
 * `steps(page)` drives the page to the state; every non-GET call is recorded in `calls`.
 */
async function shootPage({ theme, size = { width: 390, height: 640 }, admin = true, goodPassword = true, steps, act }) {
  const ctx = await browser.newContext({ viewport: size, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  try {
    const page = await ctx.newPage();
    const problems = [];
    const calls = [];
    page.on('console', (m) => { if (!(m.type() === 'error' && /status of 400/.test(m.text()))) problems.push(`${m.type()}: ${m.text()}`); }); // the 400 is the wrong password
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('request', (r) => { if (r.method() !== 'GET') calls.push(`${r.method()} ${new URL(r.url()).pathname}`); });
    await page.clock.setFixedTime(new Date(NOW));
    const json = (body, status = 200) => (route) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    await page.route('**/rest/v1/readings*', json([newest]));
    await page.route('**/auth/v1/token*', (route) => (goodPassword
      ? json({ access_token: 'fake-token', refresh_token: 'fake-refresh', expires_in: 3600, user: { email: EMAIL, id: 'u1' } })(route)
      : json({ error: 'invalid_grant', error_description: 'Invalid login credentials' }, 400)(route)));
    await page.route('**/auth/v1/logout*', (route) => route.fulfill({ status: 204 }));
    await page.route('**/rest/v1/rpc/is_admin', json(admin));
    await page.route('**/rest/v1/device_status*', json([{ room: 'Room 204' }]));
    await page.route('**/rest/v1/settings*', (route) => (route.request().method() === 'PATCH'
      ? json([{ ...SETTINGS, ...route.request().postDataJSON() }])(route) : json([SETTINGS])(route)));
    await page.route('**/rest/v1/rpc/admin_set_room', (route) => route.fulfill({ status: 204 }));
    await page.goto(`${base}#admin`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Sign in' }).waitFor();
    if (steps) await steps(page);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement.blur()); // the mocks have no focus ring or caret
    if (act) await act(page);
    await page.evaluate(() => Promise.all(document.getAnimations().map((x) => x.finished)));
    const shot = loadApproved(await page.screenshot({ fullPage: true }));
    return { shot, problems, calls, page };
  } finally { await ctx.close(); }
}

const signIn = async (page) => {
  await page.fill('#email', EMAIL);
  await page.fill('#pw', PASSWORD);
  await page.click('button[type=submit]');
};
const STATES = {
  'b-sign-in': {},
  'b-sign-in-error': { goodPassword: false, steps: async (p) => { await signIn(p); await p.getByRole('alert').waitFor(); } },
  'b-not-admin': { admin: false, steps: async (p) => { await signIn(p); await p.getByText('Not an admin').waitFor(); } },
  'b-settings': { steps: async (p) => { await signIn(p); await p.getByRole('button', { name: 'Save changes' }).waitFor(); } },
  'b-saved': {
    steps: async (p) => {
      await signIn(p);
      await p.getByRole('button', { name: 'Save changes' }).waitFor();
      await p.fill('#room', 'Room 305');
      await p.click('button[type=submit]');
      await p.getByRole('status').filter({ hasText: 'Saved' }).waitFor();
    },
  },
};

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
const same = (expected, shot) => {
  const r = diffImages(expected, shot);
  assert.equal(r.sameSize, true, `the page has another size than the approved image (${shot.w}x${shot.h} vs ${expected.w}x${expected.h})`);
  assert.equal(r.differing, 0, `${r.differing} pixels differ (${(r.ratio * 100).toFixed(2)} %) at ${box(expected, shot)}`);
};

for (const theme of ['light', 'dark']) {
  for (const [state, opts] of Object.entries(STATES)) {
    test(`admin view matches the approved image: ${state}, phone, ${theme}`, async () => {
      const { shot, problems } = await shootPage({ theme, ...opts });
      same(approved(state, 'phone', theme), shot);
      assert.deepEqual(problems, [], 'the browser reported problems (console, CSP)');
    });
  }
  test(`admin view matches the approved image: b-settings, desktop, ${theme}`, async () => {
    const { shot, problems } = await shootPage({ theme, ...STATES['b-settings'], size: { width: 1280, height: 720 } });
    same(approved('b-settings', 'desktop', theme), shot);
    assert.deepEqual(problems, []);
  });
}

test('the gate fails when the Save button has another colour', async () => {
  const { shot } = await shootPage({ theme: 'light', ...STATES['b-settings'], act: (p) => p.evaluate(() => { document.querySelector('.ab-save .btn').classList.replace('btn-primary', 'btn-danger'); }) });
  assert.ok(diffImages(approved('b-settings', 'phone', 'light'), shot).differing > 0);
});

test('saving: only what changed is sent; an out-of-range value is stopped by the page and nothing is sent', async () => {
  const room = await shootPage({ theme: 'light', ...STATES['b-saved'] });
  assert.deepEqual(room.calls.filter((c) => c.includes('/rest/')), ['POST /rest/v1/rpc/is_admin', 'POST /rest/v1/rpc/admin_set_room']);

  const bad = await shootPage({
    theme: 'light',
    steps: async (p) => {
      await STATES['b-settings'].steps(p);
      await p.fill('#interval_s', '59');
      await p.click('button[type=submit]');
      await p.locator('.ab-err').first().waitFor();
      assert.equal(await p.locator('.ab-err').first().innerText(), 'Use 60 to 3600, whole numbers.');
    },
  });
  assert.deepEqual(bad.calls.filter((c) => c.includes('/rest/')), ['POST /rest/v1/rpc/is_admin']);

  const setting = await shootPage({
    theme: 'light',
    steps: async (p) => {
      await STATES['b-settings'].steps(p);
      await p.fill('#interval_s', '90');
      await p.click('button[type=submit]');
      await p.getByRole('status').filter({ hasText: 'Saved' }).waitFor();
    },
  });
  assert.deepEqual(setting.calls.filter((c) => c.includes('/rest/')), ['POST /rest/v1/rpc/is_admin', 'PATCH /rest/v1/settings']);
});
