// UI-GATE for the #alerts view (P05-03, F-10, DECIDE 3): the built page must match the owner-approved screenshots in
// design/alerts/ref/ (off, on, iPhone not installed, blocked, unsupported; phone light and dark, plus off on desktop),
// and behave as designed: no permission prompt on load, Send asks and subscribes, Stop unsubscribes, a "no" sends nothing.
// The browser's push parts are replaced by stand-ins (no real push service in a test). Needs `npm install` in web/ and Chromium.
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
const refs = path.join(root, 'design', 'alerts', 'ref');
const headers = JSON.parse(readFileSync(path.join(root, 'web', 'vercel.json'), 'utf8')).headers[0].headers;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const NOW = Date.parse('2026-11-04T05:00:00Z');
const DEVICE = '11111111-1111-1111-1111-111111111111';
const newest = { device_id: DEVICE, recorded_at: new Date(NOW).toISOString(), received_at: new Date(NOW).toISOString(), temp_c: 34.1, rh_pct: 62, heat_index_c: 43, room: 'Room 204' };
const FAKE_SUB = { endpoint: 'https://fcm.googleapis.com/fcm/send/gate-test', expirationTime: null, keys: { p256dh: 'P'.repeat(87), auth: 'A'.repeat(22) } };

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

// Stand-ins for the browser's push parts, set before the page's own code runs. `mode` picks the situation.
function stubs({ mode, sub, answer }) {
  window.__push = { asked: 0, subscribed: null, unsubscribed: 0 };
  const fakeSub = sub && { ...sub, toJSON: () => sub, unsubscribe: async () => { window.__push.unsubscribed++; return true; } };
  let current = mode === 'on' ? fakeSub : null;
  if (mode === 'unsupported') { delete window.PushManager; return; }
  if (window.PushManager) {
    window.PushManager.prototype.getSubscription = async () => current;
    window.PushManager.prototype.subscribe = async (opts) => {
      window.__push.subscribed = { userVisibleOnly: opts.userVisibleOnly, keyLength: new Uint8Array(opts.applicationServerKey).length, firstByte: new Uint8Array(opts.applicationServerKey)[0] };
      current = fakeSub; return fakeSub;
    };
  }
  let permission = mode === 'blocked' ? 'denied' : mode === 'on' ? 'granted' : 'default';
  Object.defineProperty(Notification, 'permission', { get: () => permission, configurable: true });
  Notification.requestPermission = async () => { window.__push.asked++; permission = answer || 'granted'; return permission; };
}

async function open({ theme = 'light', mode = 'off', size = { width: 390, height: 640 }, ios = false, answer, rpc = [] }) {
  const ctx = await browser.newContext({ viewport: size, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1, ...(ios && { userAgent: IPHONE_UA }) });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => problems.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  await page.clock.setFixedTime(new Date(NOW));
  await page.addInitScript(stubs, { mode, sub: FAKE_SUB, answer });
  await page.route('**/rest/v1/readings*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify([newest]) }));
  await page.route('**/rest/v1/settings*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify([{ alert_heat_index_c: 42, alert_quiet_min: 60 }]) }));
  await page.route('**/rest/v1/rpc/push_*', (r) => { rpc.push({ fn: r.request().url().split('/').pop(), body: r.request().postDataJSON() }); r.fulfill({ status: 204 }); });
  await page.goto(`${base}#alerts`, { waitUntil: 'networkidle' });
  await page.locator('.alerts-lead').first().waitFor();
  await page.locator('[data-alerts-ready]').waitFor({ state: 'attached' });
  return { ctx, page, problems };
}
async function shot(page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement.blur());
  await page.evaluate(() => Promise.all(document.getAnimations().map((x) => x.finished)));
  return loadApproved(await page.screenshot({ fullPage: true }));
}
const approved = (state, kind, theme) => loadApproved(readFileSync(path.join(refs, `${state}-${kind}-${theme}.png`)));
function same(expected, actual) {
  const r = diffImages(expected, actual);
  assert.equal(r.sameSize, true, 'the page has another size than the approved image');
  assert.equal(r.differing, 0, `${r.differing} pixels differ (${(r.ratio * 100).toFixed(2)} %)`);
}

const STATES = [
  ['alerts-off', { mode: 'off' }],
  ['alerts-on', { mode: 'on' }],
  ['alerts-iphone', { mode: 'off', ios: true }],
  ['alerts-blocked', { mode: 'blocked' }],
  ['alerts-unsupported', { mode: 'unsupported' }],
];
for (const theme of ['light', 'dark']) {
  for (const [state, opts] of STATES) {
    test(`#alerts matches the approved image: ${state}, phone, ${theme}`, async () => {
      const { ctx, page, problems } = await open({ theme, ...opts });
      try {
        same(approved(state, 'phone', theme), await shot(page));
        assert.deepEqual(problems, [], 'the browser reported problems (console, CSP)');
      } finally { await ctx.close(); }
    });
  }
  test(`#alerts matches the approved image: alerts-off, desktop, ${theme}`, async () => {
    const { ctx, page, problems } = await open({ theme, size: { width: 1280, height: 720 } });
    try { same(approved('alerts-off', 'desktop', theme), await shot(page)); assert.deepEqual(problems, []); } finally { await ctx.close(); }
  });
}

test('opening the page never asks for permission; Send asks, subscribes with our key and stores only address and keys', async () => {
  const rpc = [];
  const { ctx, page } = await open({ rpc });
  try {
    assert.equal(await page.evaluate(() => window.__push.asked), 0, 'asked for permission on load');
    await page.click('.alerts-btn');
    await page.locator('.alerts-state', { hasText: 'Heat alerts are on for this phone.' }).waitFor();
    const p = await page.evaluate(() => window.__push);
    assert.equal(p.asked, 1);
    assert.deepEqual(p.subscribed, { userVisibleOnly: true, keyLength: 65, firstByte: 4 });
    assert.deepEqual(rpc, [{ fn: 'push_subscribe', body: { p_endpoint: FAKE_SUB.endpoint, p_p256dh: FAKE_SUB.keys.p256dh, p_auth: FAKE_SUB.keys.auth } }]);
    same(approved('alerts-on', 'phone', 'light'), await shot(page));
  } finally { await ctx.close(); }
});

test('Stop alerts removes the address on the server and in the browser, and shows the off state', async () => {
  const rpc = [];
  const { ctx, page } = await open({ mode: 'on', rpc });
  try {
    await page.click('.alerts-btn');
    await page.locator('.alerts-btn', { hasText: 'Send me heat alerts' }).waitFor();
    assert.deepEqual(rpc, [{ fn: 'push_unsubscribe', body: { p_endpoint: FAKE_SUB.endpoint, p_auth: FAKE_SUB.keys.auth } }]);
    assert.equal(await page.evaluate(() => window.__push.unsubscribed), 1);
    same(approved('alerts-off', 'phone', 'light'), await shot(page));
  } finally { await ctx.close(); }
});

test('saying no to the prompt shows the blocked state and sends nothing', async () => {
  const rpc = [];
  const { ctx, page } = await open({ answer: 'denied', rpc });
  try {
    await page.click('.alerts-btn');
    await page.locator('.alerts-state', { hasText: 'Notifications are blocked' }).waitFor();
    assert.deepEqual(rpc, []);
    assert.equal(await page.evaluate(() => window.__push.subscribed), null);
  } finally { await ctx.close(); }
});

test('the home page has the Heat alerts row, and it opens #alerts', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 640 } });
  try {
    const page = await ctx.newPage();
    await page.clock.setFixedTime(new Date(NOW));
    await page.route('**/rest/v1/**', (r) => r.fulfill({ contentType: 'application/json', body: r.request().url().includes('/readings') ? JSON.stringify([newest]) : '[]' }));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.click('a.alerts-link');
    await page.locator('h2', { hasText: 'Heat alerts' }).waitFor();
    assert.equal(new URL(page.url()).hash, '#alerts');
  } finally { await ctx.close(); }
});
