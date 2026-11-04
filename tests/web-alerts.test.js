// P05-03 (F-10): the logic of the #alerts view (web/src/alerts.js), apart from the page so it is tested without a browser.
// Mock: design/alerts/ (approved by the owner, s31).
import test from 'node:test';
import assert from 'node:assert/strict';
import { pushState, isIOS, keyToBytes, subscribeBody, unsubscribeBody, ruleView } from '../web/src/alerts.js';

const full = { hasServiceWorker: true, hasPushManager: true, hasNotification: true, ios: false, standalone: false, permission: 'default', subscribed: false };

test('which state the page shows', () => {
  assert.equal(pushState(full), 'off');
  assert.equal(pushState({ ...full, subscribed: true, permission: 'granted' }), 'on');
  assert.equal(pushState({ ...full, permission: 'denied' }), 'blocked');
  assert.equal(pushState({ ...full, hasPushManager: false }), 'unsupported');
  assert.equal(pushState({ ...full, hasServiceWorker: false }), 'unsupported');
  assert.equal(pushState({ ...full, hasNotification: false }), 'unsupported');
  // iPhone in Safari (not installed): iOS has no web push there, so the page explains how to install first.
  assert.equal(pushState({ ...full, ios: true, standalone: false, hasPushManager: false, hasNotification: false }), 'iphone');
  // iPhone opened from the Home Screen: the normal states.
  assert.equal(pushState({ ...full, ios: true, standalone: true }), 'off');
  assert.equal(pushState({ ...full, ios: true, standalone: true, permission: 'denied' }), 'blocked');
  // Subscribed but the permission was taken away later: blocked wins (no alert can show).
  assert.equal(pushState({ ...full, subscribed: true, permission: 'denied' }), 'blocked');
});

test('iPhone and iPad are recognised, including an iPad that says it is a Mac', () => {
  assert.equal(isIOS({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', platform: 'iPhone', maxTouchPoints: 5 }), true);
  assert.equal(isIOS({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', platform: 'MacIntel', maxTouchPoints: 5 }), true);
  assert.equal(isIOS({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', platform: 'MacIntel', maxTouchPoints: 0 }), false);
  assert.equal(isIOS({ userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 8)', platform: 'Linux armv8l', maxTouchPoints: 5 }), false);
});

test('the VAPID public key (base64url) becomes the 65 bytes the browser needs', () => {
  const b = keyToBytes('BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8');
  assert.ok(b instanceof Uint8Array);
  assert.equal(b.length, 65);
  assert.equal(b[0], 4);
  assert.deepEqual([...b], [...Buffer.from('BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8', 'base64url')]); // same bytes as Node's own decoder
  assert.equal(b[64], 0x0f);
  assert.throws(() => keyToBytes(''), /VAPID/);
});

test('what is sent to push_subscribe and push_unsubscribe: only the address and the browser keys', () => {
  const sub = { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', expirationTime: null, keys: { p256dh: 'P'.repeat(87), auth: 'A'.repeat(22) } };
  assert.deepEqual(subscribeBody(sub), { p_endpoint: sub.endpoint, p_p256dh: sub.keys.p256dh, p_auth: sub.keys.auth });
  assert.deepEqual(unsubscribeBody(sub), { p_endpoint: sub.endpoint, p_auth: sub.keys.auth });
  assert.throws(() => subscribeBody({ endpoint: 'https://x/', keys: {} }), /keys/);
});

test('the rule text comes from the admin settings; defaults when the device has no settings row', () => {
  assert.deepEqual(ruleView({ alert_heat_index_c: '42.0', alert_quiet_min: 60 }, 'Room 204'),
    { room: 'Room 204', threshold: '42 °C', level: 'Danger', quiet: '60 minutes' });
  assert.deepEqual(ruleView(null, 'Room 204'), { room: 'Room 204', threshold: '42 °C', level: 'Danger', quiet: '60 minutes' });
  assert.deepEqual(ruleView({ alert_heat_index_c: 35.5, alert_quiet_min: 120 }, 'Unassigned'),
    { room: 'Unassigned', threshold: '35.5 °C', level: 'Extreme caution', quiet: '2 hours' });
  assert.equal(ruleView({ alert_heat_index_c: 52, alert_quiet_min: 1440 }, 'R').quiet, '24 hours');
  assert.equal(ruleView({ alert_heat_index_c: 52, alert_quiet_min: 90 }, 'R').quiet, '90 minutes');
  assert.equal(ruleView({ alert_heat_index_c: 52, alert_quiet_min: 60 }, 'R').level, 'Extreme danger');
});
