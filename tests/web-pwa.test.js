// P04-05 installable PWA (F-05): manifest, icons, the tags in index.html and the service worker's rules.
// The service worker runs here in a vm with a fake cache and fetch. Rule (owner-approved s18): the page files are kept so the
// app opens with no signal; readings (the Supabase answers) are never kept, because an old temperature must not look current.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (f) => path.join(root, 'web', 'public', f);
const manifest = () => JSON.parse(readFileSync(pub('manifest.webmanifest'), 'utf8'));
const html = () => readFileSync(path.join(root, 'web', 'index.html'), 'utf8');

function pngSize(file) {
  const b = readFileSync(file);
  assert.equal(b.subarray(1, 4).toString(), 'PNG', `${file} is not a PNG`);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

test('manifest names the app and makes it open full screen', () => {
  const m = manifest();
  assert.equal(m.name, 'Init: Indoor Heat Index Tracker');
  assert.equal(m.short_name, 'Init');
  assert.equal(m.display, 'standalone');
  assert.equal(m.start_url, '/');
  assert.equal(m.scope, '/');
  assert.equal(m.theme_color, '#f6f7f9');
  assert.equal(m.background_color, '#10161d');
});

test('manifest icons exist at the size they claim, with a maskable one', () => {
  const m = manifest();
  const sizes = m.icons.map((i) => i.sizes);
  assert.ok(sizes.includes('192x192') && sizes.includes('512x512'), 'needs 192 and 512');
  assert.ok(m.icons.some((i) => i.purpose === 'maskable'), 'needs a maskable icon');
  for (const i of m.icons) {
    const file = pub(i.src.replace(/^\//, ''));
    assert.ok(existsSync(file), `${i.src} is missing`);
    assert.deepEqual(pngSize(file), i.sizes.split('x').map(Number), `${i.src} has another size than the manifest says`);
  }
});

test('favicon and iPhone icon exist at the right size', () => {
  assert.ok(existsSync(pub('favicon.svg')));
  assert.deepEqual(pngSize(pub('favicon-32.png')), [32, 32]);
  assert.deepEqual(pngSize(pub('apple-touch-icon.png')), [180, 180]);
});

test('index.html links the manifest, icons and the two theme colours', () => {
  const h = html();
  assert.match(h, /<link rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(h, /<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml"/);
  assert.match(h, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png"/);
  assert.match(h, /<meta name="theme-color" content="#f6f7f9" media="\(prefers-color-scheme: light\)"/);
  assert.match(h, /<meta name="theme-color" content="#10161d" media="\(prefers-color-scheme: dark\)"/);
});

test('both logos used in the header exist', () => {
  for (const f of ['logo-light.svg', 'logo-dark.svg']) assert.ok(existsSync(pub(f)), `${f} is missing`);
});

// ---- service worker, run against fakes ----
function loadWorker() {
  const store = new Map(); // url -> Response-like
  const handlers = {};
  const caches = {
    open: async () => ({
      addAll: async () => {},
      put: async (req, res) => { store.set(typeof req === 'string' ? req : req.url, res); },
    }),
    match: async (req) => store.get(typeof req === 'string' ? req : req.url),
    keys: async () => [], delete: async () => true,
  };
  const net = { online: true, calls: [] };
  const fetchFake = async (req) => {
    net.calls.push(req.url);
    if (!net.online) throw new TypeError('network down');
    return { ok: true, url: req.url, clone() { return this; } };
  };
  const self = { location: { origin: 'https://app.example' }, addEventListener: (t, f) => { handlers[t] = f; }, skipWaiting: () => {}, clients: { claim: async () => {} } };
  vm.runInNewContext(readFileSync(pub('sw.js'), 'utf8'), { self, caches, fetch: fetchFake, URL, Promise });
  // Fire a fetch event; resolves to the response the worker gave, or 'ignored' when it left the request alone.
  const request = (url, { method = 'GET', mode = 'cors' } = {}) => new Promise((resolve) => {
    let given = 'ignored';
    handlers.fetch({ request: { url, method, mode }, respondWith: (p) => { given = p; } });
    resolve(Promise.resolve(given));
  });
  return { request, net, store };
}

test('worker never touches readings: another origin and non-GET are left to the network', async () => {
  const w = loadWorker();
  assert.equal(await w.request('https://bqovmxatnqzhnncpudmn.supabase.co/rest/v1/readings?limit=1'), 'ignored');
  assert.equal(await w.request('https://app.example/api', { method: 'POST' }), 'ignored');
  assert.equal(w.store.size, 0);
});

test('worker keeps page files so the page opens with no signal', async () => {
  const w = loadWorker();
  await w.request('https://app.example/', { mode: 'navigate' });
  await w.request('https://app.example/assets/index-abc.js');
  w.net.online = false;
  const page = await w.request('https://app.example/', { mode: 'navigate' });
  assert.equal(page.url, 'https://app.example/', 'the page should come from the cache');
  const js = await w.request('https://app.example/assets/index-abc.js');
  assert.equal(js.url, 'https://app.example/assets/index-abc.js');
});

test('worker prefers the network for the page, so a new deploy shows at once', async () => {
  const w = loadWorker();
  await w.request('https://app.example/', { mode: 'navigate' });
  w.net.calls.length = 0;
  await w.request('https://app.example/', { mode: 'navigate' });
  assert.deepEqual(w.net.calls, ['https://app.example/']);
});
