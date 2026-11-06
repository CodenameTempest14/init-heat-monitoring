// P05-03 (F-10): the logic of the #alerts view, kept apart from the page so tests can check it (tests/web-alerts.test.js).
// Mock: design/alerts/ (approved s31). The page itself is Alerts.jsx.
import { categoryOf } from './category.js';
import { translate, categoryLabel } from './i18n.js';

/**
 * Which state the page shows. iPhone or iPad in Safari (not opened from the Home Screen) has no web push at all,
 * so it gets the install steps; everywhere else: no push support, permission denied, subscribed, or not yet.
 */
export function pushState({ hasServiceWorker, hasPushManager, hasNotification, ios, standalone, permission, subscribed }) {
  if (ios && !standalone) return 'iphone';
  if (!hasServiceWorker || !hasPushManager || !hasNotification) return 'unsupported';
  if (permission === 'denied') return 'blocked';
  return subscribed ? 'on' : 'off';
}

/** iPhone, iPod or iPad (an iPad says it is a Mac, but a Mac has no touch screen). */
export function isIOS({ userAgent = '', platform = '', maxTouchPoints = 0 }) {
  return /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

/** The VAPID public key (base64url text) as the bytes `pushManager.subscribe` wants. */
export function keyToBytes(key) {
  if (!key) throw new Error('No VAPID public key in config.js (node tools/vapid-keys.mjs, then npm run config)');
  const b64 = key.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (key.length % 4)) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/** What push_subscribe gets: the push address and the browser's two keys. Nothing about the person (P5-h). */
export function subscribeBody(sub) {
  const { endpoint, keys = {} } = sub;
  if (!endpoint || !keys.p256dh || !keys.auth) throw new Error('subscription without keys');
  return { p_endpoint: endpoint, p_p256dh: keys.p256dh, p_auth: keys.auth };
}

/** What push_unsubscribe gets: the address and the browser's secret, so only this phone can remove itself. */
export const unsubscribeBody = (sub) => ({ p_endpoint: sub.endpoint, p_auth: sub.keys.auth });

const number = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** The rule text from the admin's settings (public values); the defaults of the database when there is no row. */
export function ruleView(settings, room, lang = 'en') {
  const hi = Number(settings?.alert_heat_index_c ?? 42);
  const quiet = Number(settings?.alert_quiet_min ?? 60);
  return {
    room,
    threshold: `${number(hi)} °C`,
    level: categoryLabel(categoryOf(hi), lang),
    quiet: quiet >= 120 && quiet % 60 === 0 ? translate(lang, 'alerts.quietHours', { n: quiet / 60 }) : translate(lang, 'alerts.quietMin', { n: quiet }),
  };
}
