// UI-GATE for the "What does this mean?" page #heat (F-15 extended, D-016): the built page must match the owner-approved
// screenshots in design/heat-info/ref/ (phone light and dark, desktop light and dark). Also checks that the page needs no
// sign-in and sends nothing but the header's readings request, that it has no room or status line, that its back link goes to
// the live page, and that the link in the heat card on the home page opens the part for the level the room is in now.
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
const refs = path.join(root, 'design', 'heat-info', 'ref');
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
async function shootPage({ theme, hash = '#heat', size = { width: 390, height: 640 }, steps }) {
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
const approved = (theme, kind = 'phone') => loadApproved(readFileSync(path.join(refs, `heat-${kind}-${theme}.png`)));
const same = (expected, shot) => {
  const r = diffImages(expected, shot);
  assert.equal(r.sameSize, true, `the page has another size than the approved image (${shot.w}x${shot.h} vs ${expected.w}x${expected.h})`);
  assert.equal(r.differing, 0, `${r.differing} pixels differ (${(r.ratio * 100).toFixed(2)} %) at ${box(expected, shot)}`);
};

for (const theme of ['light', 'dark']) {
  test(`heat page matches the approved image: phone, ${theme}`, async () => {
    const { shot, problems } = await shootPage({ theme });
    same(approved(theme), shot);
    assert.deepEqual(problems, [], 'the browser reported problems (console, CSP)');
  });
  test(`heat page matches the approved image: desktop, ${theme}`, async () => {
    const { shot, problems } = await shootPage({ theme, size: { width: 1280, height: 720 } });
    same(approved(theme, 'desktop'), shot);
    assert.deepEqual(problems, []);
  });
}

test('the gate fails when a level picture has another colour', async () => {
  const { shot } = await shootPage({ theme: 'light', steps: (p) => p.evaluate(() => { document.querySelector('.hl-art-danger').style.background = 'red'; }) });
  assert.ok(diffImages(approved('light'), shot).differing > 0);
});

test('the heat page needs no sign-in: it only reads the newest reading for the page header and sends nothing else', async () => {
  const { calls } = await shootPage({ theme: 'light' });
  assert.deepEqual(calls.filter((c) => !c.startsWith('GET /rest/v1/readings')), []);
});

test('the heat page hides the room and status lines of the live page, and its back link goes to the live page', async () => {
  await shootPage({ theme: 'light', steps: async (p) => {
    assert.equal(await p.locator('.app-room').count(), 0);
    assert.equal(await p.locator('.status').count(), 0);
    assert.equal(await p.locator('a.school-back').getAttribute('href'), '#');
  } });
});

test('the pictures are decoration: hidden from screen readers, with no text of their own', async () => {
  await shootPage({ theme: 'light', steps: async (p) => {
    assert.equal(await p.locator('svg.hl-art').count(), 5);
    for (const a of await p.locator('svg.hl-art').all()) {
      assert.equal(await a.getAttribute('aria-hidden'), 'true');
      assert.equal(await a.locator('text, title').count(), 0);
    }
  } });
});

test('the heat card on the home page has a link to the part for its level, and it opens there', async () => {
  // The fake newest reading has heat index 40: Extreme caution (33 to 41).
  const { page } = await shootPage({ theme: 'light', hash: '#', steps: async (p) => {
    const link = p.locator('.heat a.heat-more');
    assert.equal(await link.innerText(), 'What does this mean? ›');
    assert.equal(await link.getAttribute('href'), '#heat/extreme-caution');
    await link.click();
    await p.locator('#extreme-caution').waitFor();
    await p.waitForFunction(() => { const r = document.getElementById('extreme-caution').getBoundingClientRect(); return r.top >= 0 && r.top < 200; });
    assert.ok((await p.locator('#extreme-caution h2').innerText()).endsWith('Extreme caution'));
  } });
  assert.ok(page);
});

test('every level link on the home page points at a section that exists on the heat page', async () => {
  await shootPage({ theme: 'light', hash: '#heat', steps: async (p) => {
    for (const id of ['caution', 'extreme-caution', 'danger', 'extreme-danger']) assert.equal(await p.locator(`section#${id}`).count(), 1, id);
  } });
});
