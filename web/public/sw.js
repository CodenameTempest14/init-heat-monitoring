// Service worker (P04-05, F-05). Keeps the page's own files so the app opens with no signal.
// It never touches anything from another origin: the readings come from Supabase, and an old temperature must not
// look current (owner-approved, s18). With no signal the page says "Could not load the readings".
// Tested in tests/web-pwa.test.js.
const CACHE = 'init-pages-v1';

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)))).then(() => self.clients.claim()));
});

async function keep(request, response) {
  if (response && response.ok) { const cache = await caches.open(CACHE); await cache.put(request, response.clone()); }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return; // readings: network only
  if (request.mode === 'navigate') {
    // The page itself: network first, so a new deploy shows at once; the kept copy only when offline.
    event.respondWith(fetch(request).then((res) => keep('/', res)).catch(() => caches.match('/')));
    return;
  }
  // Hashed script, style and icon files never change under the same name: kept copy first.
  event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((res) => keep(request, res))));
});

// ---- P05-03 heat alerts (F-10) ----
// The Edge Function sends { title, body, url }, encrypted for this phone only. Every push must show a notification
// (browsers require it), so a push without readable data still shows one. A tap opens only a page of this site.
const ALERT_TITLE = 'Init heat alert';
const safePath = (url) => (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') ? url : '/');

self.addEventListener('push', (event) => {
  let msg = {};
  try { msg = (event.data && event.data.json()) || {}; } catch { msg = {}; }
  event.waitUntil(self.registration.showNotification(msg.title || ALERT_TITLE, {
    body: msg.body || 'Open Init to see the heat index.',
    icon: '/icon-192.png',
    tag: 'init-heat-alert', // a newer alert replaces an older one on the phone
    renotify: true,         // ...and still makes a sound
    data: { url: safePath(msg.url) },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = safePath(event.notification.data && event.notification.data.url);
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
    const win = wins.find((w) => new URL(w.url).origin === self.location.origin);
    if (win) return win.navigate(url).then(() => win.focus());
    return self.clients.openWindow(url);
  }));
});
