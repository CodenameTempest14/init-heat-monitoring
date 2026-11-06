// UI-GATE for the kiosk page #kiosk (F-13, P06-01) and the QR poster #poster (F-14, P06-02) (D-016): the built pages must match
// the owner-approved screenshots in design/qr-kiosk/ref/ (poster A4 width, kiosk TV, kiosk phone). Also checks that neither page
// needs a sign-in or sends anything but the readings request, that the kiosk shows Offline and keeps the level colour when the
// newest reading is old, that the kiosk shows a neutral screen with no reading, and that the poster stays black on white in dark mode.
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
const refs = path.join(root, 'design', 'qr-kiosk', 'ref');
const headers = JSON.parse(readFileSync(path.join(root, 'web', 'vercel.json'), 'utf8')).headers[0].headers;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

const NOW = Date.parse('2026-11-02T13:00:00Z');
const DEVICE = '11111111-1111-1111-1111-111111111111';
// The mock's made-up reading: Room 204, 34.1 C, 62 %, heat index 43 (Danger).
const newest = { device_id: DEVICE, recorded_at: new Date(NOW).toISOString(), received_at: new Date(NOW).toISOString(), temp_c: 34.1, rh_pct: 62, heat_index_c: 43, room: 'Room 204' };

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

/** Open `hash` with a fake Supabase (`rows` = what the readings request returns; `at` = the page's clock). */
async function shootPage({ hash, size, theme = 'light', rows = [newest], at = NOW, steps, full = false }) {
  const ctx = await browser.newContext({ viewport: size, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  try {
    const page = await ctx.newPage();
    const problems = [];
    const calls = [];
    page.on('console', (m) => problems.push(`${m.type()}: ${m.text()}`));
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('request', (r) => { if (r.url().includes('/rest/') || r.url().includes('/auth/')) calls.push(`${r.method()} ${new URL(r.url()).pathname}`); });
    await page.clock.setFixedTime(new Date(at));
    await page.route('**/rest/v1/readings*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rows) }));
    await page.goto(`${base}${hash}`, { waitUntil: 'networkidle' });
    if (steps) await steps(page);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement.blur());
    const shot = loadApproved(await page.screenshot({ fullPage: full }));
    return { shot, problems, calls };
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
const approved = (name) => loadApproved(readFileSync(path.join(refs, `${name}.png`)));
const same = (expected, shot) => {
  const r = diffImages(expected, shot);
  assert.equal(r.sameSize, true, `the page has another size than the approved image (${shot.w}x${shot.h} vs ${expected.w}x${expected.h})`);
  assert.equal(r.differing, 0, `${r.differing} pixels differ (${(r.ratio * 100).toFixed(2)} %) at ${box(expected, shot)}`);
};
const TV = { width: 1920, height: 1080 }, PHONE = { width: 390, height: 640 }, A4 = { width: 794, height: 1000 };

test('kiosk matches the approved image: TV', async () => {
  const { shot, problems } = await shootPage({ hash: '#kiosk', size: TV });
  same(approved('kiosk-tv'), shot);
  assert.deepEqual(problems, [], 'the browser reported problems (console, CSP)');
});
test('kiosk matches the approved image: phone', async () => {
  const { shot, problems } = await shootPage({ hash: '#kiosk', size: PHONE });
  same(approved('kiosk-phone'), shot);
  assert.deepEqual(problems, []);
});
test('kiosk looks the same in dark mode (the level colours do not change)', async () => {
  const { shot } = await shootPage({ hash: '#kiosk', size: TV, theme: 'dark' });
  same(approved('kiosk-tv'), shot);
});
test('poster matches the approved image', async () => {
  const { shot, problems } = await shootPage({ hash: '#poster', size: A4, full: true });
  same(approved('poster-a4'), shot);
  assert.deepEqual(problems, []);
});

test('the gate fails when the kiosk colour changes', async () => {
  const { shot } = await shootPage({ hash: '#kiosk', size: TV, steps: (p) => p.evaluate(() => { document.querySelector('.kiosk').style.background = 'red'; }) });
  assert.ok(diffImages(approved('kiosk-tv'), shot).differing > 0);
});

test('neither page needs a sign-in: they send only the readings request', async () => {
  for (const hash of ['#kiosk', '#poster']) {
    const { calls } = await shootPage({ hash, size: PHONE });
    assert.deepEqual(calls.filter((c) => !c.startsWith('GET /rest/v1/readings')), [], hash);
  }
});

test('neither page has the app header, room line or links', async () => {
  for (const hash of ['#kiosk', '#poster']) {
    await shootPage({ hash, size: PHONE, steps: async (p) => {
      assert.equal(await p.locator('.app-head').count(), 0, hash);
      assert.equal(await p.locator('a').count(), 0, hash);
    } });
  }
});

test('kiosk offline: keeps the level colour, says Offline and "Last heat index" after 5 minutes without a reading', async () => {
  await shootPage({ hash: '#kiosk', size: PHONE, at: NOW + 5 * 60 * 1000, steps: async (p) => {
    assert.equal(await p.locator('.kiosk-danger').count(), 1);
    assert.equal(await p.locator('.st').innerText(), '● Offline: no reading for 5 min');
    assert.match(await p.locator('.upd').innerText(), /^last reading 5 min ago/);
  } });
});

test('kiosk with no reading: neutral screen, dashes, no level and no made-up colour', async () => {
  await shootPage({ hash: '#kiosk', size: PHONE, rows: [], steps: async (p) => {
    assert.equal(await p.locator('.kiosk-none').count(), 1);
    assert.equal(await p.locator('.num').innerText(), '—');
    assert.equal(await p.locator('.cat').count(), 0);
    assert.match(await p.locator('.upd').innerText(), /^no readings yet/);
  } });
});

test('kiosk level colours: every level has a colour of its own', async () => {
  const cases = [[28, 'kiosk-caution'], [35, 'kiosk-extreme-caution'], [43, 'kiosk-danger'], [53, 'kiosk-extreme-danger']];
  const seen = new Set();
  for (const [hi, cls] of cases) {
    await shootPage({ hash: '#kiosk', size: PHONE, rows: [{ ...newest, heat_index_c: hi }], steps: async (p) => {
      assert.equal(await p.locator(`.${cls}`).count(), 1, cls);
      seen.add(await p.locator('.kiosk').evaluate((e) => getComputedStyle(e).backgroundColor));
    } });
  }
  assert.equal(seen.size, 4);
});

test('poster: the QR is a real image with a name for screen readers, and the sheet stays black on white in dark mode', async () => {
  await shootPage({ hash: '#poster', size: A4, theme: 'dark', steps: async (p) => {
    assert.equal(await p.locator('svg.qr-code').getAttribute('aria-label'), 'QR code for https://init-heat-monitoring.vercel.app');
    const s = await p.locator('main.poster').evaluate((e) => { const c = getComputedStyle(e); return [c.backgroundColor, c.color]; });
    assert.deepEqual(s, ['rgb(255, 255, 255)', 'rgb(0, 0, 0)']);
  } });
});

test('poster: the Print button is hidden when the page is printed', async () => {
  await shootPage({ hash: '#poster', size: A4, steps: async (p) => {
    await p.emulateMedia({ media: 'print' });
    assert.equal(await p.locator('.poster-tools').evaluate((e) => getComputedStyle(e).display), 'none');
  } });
});
