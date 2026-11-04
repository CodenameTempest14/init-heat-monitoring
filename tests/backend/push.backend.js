// P05-03 (F-10, P5-f/g/h): heat alerts. Design: documentation/specs/P05-03_DESIGN.md (approved s31).
// The decision "send or not" is made in SQL by a trigger on new readings; these tests check that decision through the
// `alerts` log, without a phone. Throwaway devices (names start with "test ") and throwaway subscriptions only, so this
// file can run alone at any time; the trigger does not call the Edge Function for test devices, so no phone is woken.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { heatIndexC } from '../../src/heat-index.js';
import { anon, service, makeDevice, makeUser, asUser, ingest, minutesFromNow } from './_helpers.js';

const refused = (res) => res.status >= 400 || (Array.isArray(res.body) && res.body.length === 0);
const b64url = (n) => randomBytes(n).toString('base64url');

/** A subscription like a browser gives: endpoint plus p256dh (65 bytes) and auth (16 bytes), base64url. */
const fakeSub = (host = 'fcm.googleapis.com', path = '/fcm/send/') => ({
  p_endpoint: `https://${host}${path}test-${b64url(24)}`,
  p_p256dh: b64url(65),
  p_auth: b64url(16),
});
const subscribe = (sub, who = anon) => who('rpc/push_subscribe', { method: 'POST', body: sub });
const unsubscribe = (endpoint, auth) =>
  anon('rpc/push_unsubscribe', { method: 'POST', body: { p_endpoint: endpoint, p_auth: auth } });
const subRows = async (endpoint) =>
  (await service(`push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`)).body;
const dropSub = (endpoint) => service(`push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, { method: 'DELETE' });

const alertsOf = async (deviceId) => (await service(`alerts?device_id=eq.${deviceId}&order=created_at`)).body;
/** Clear the 30 s rate check so the same device can upload again at once. */
const clearRate = (id) => service(`devices?id=eq.${id}`, { method: 'PATCH', body: { last_seen_at: minutesFromNow(-5) } });

/** The heat index the server stores for a reading: the JS formula (equal to the SQL one, D-023) to 1 decimal. */
const storedHI = (t, rh) => {
  const hi = heatIndexC(t, rh);
  return hi === null ? null : Math.round(hi * 10) / 10;
};
/** Find a classroom reading whose stored heat index satisfies `ok` (search a fine grid). */
function findReading(ok) {
  for (let t = 30; t <= 45; t = Math.round((t + 0.1) * 10) / 10) {
    for (let rh = 40; rh <= 90; rh += 1) {
      const hi = storedHI(t, rh);
      if (hi !== null && ok(hi)) return { temp_c: t, rh_pct: rh, hi };
    }
  }
  throw new Error('no reading found for the condition');
}
const frac = (x) => Math.round((x - Math.floor(x)) * 10) / 10;
const DANGER = findReading((hi) => hi >= 43 && hi < 44 && frac(hi) <= 0.3); // rounds to 43, Danger at the default 42
const COOL = findReading((hi) => hi >= 30 && hi < 32); // well under any threshold used here

const reading = (r, minutesAgo = 0.5) => ({ recorded_at: minutesFromNow(-minutesAgo), temp_c: r.temp_c, rh_pct: r.rh_pct });

async function withDevice(settings, fn) {
  const device = await makeDevice({ room: 'Room 204', settings: { interval_s: 60, ...settings } });
  try { await fn(device); } finally { await device.cleanup(); }
}

// ── The alert rule (section 3) ──────────────────────────────────────────────────────────────────────────────────

test('a fresh reading at or over the threshold writes one alert with the heat index and room', async () => {
  await withDevice({}, async (device) => {
    const res = await ingest(device.key, [reading(DANGER)]);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const alerts = await alertsOf(device.id);
    assert.equal(alerts.length, 1, JSON.stringify(alerts));
    assert.equal(Number(alerts[0].heat_index_c), DANGER.hi);
    assert.equal(alerts[0].room, 'Room 204');
  });
});

test('a reading under the threshold writes no alert; a device with no settings row uses the default 42', async () => {
  await withDevice({}, async (device) => {
    await ingest(device.key, [reading(COOL)]);
    assert.equal((await alertsOf(device.id)).length, 0);
  });
  const bare = await makeDevice({ room: 'Room 9' }); // no settings row
  try {
    await ingest(bare.key, [reading(DANGER)]);
    assert.equal((await alertsOf(bare.id)).length, 1, 'default threshold 42 not applied');
  } finally { await bare.cleanup(); }
});

test('inside the quiet period a second Danger reading writes no new alert', async () => {
  await withDevice({}, async (device) => {
    await ingest(device.key, [reading(DANGER, 2)]);
    await clearRate(device.id);
    const res = await ingest(device.key, [reading(DANGER, 0.5)]);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal((await alertsOf(device.id)).length, 1);
  });
});

test('after the quiet period, still hot: a reminder alert (DECIDE 1 = a)', async () => {
  await withDevice({ alert_quiet_min: 60 }, async (device) => {
    await ingest(device.key, [reading(DANGER, 2)]);
    assert.equal((await alertsOf(device.id)).length, 1);
    const back = await service(`alert_state?device_id=eq.${device.id}`, {
      method: 'PATCH', body: { last_alert_at: minutesFromNow(-61) },
    });
    assert.equal(back.status, 200, JSON.stringify(back.body));
    await clearRate(device.id);
    await ingest(device.key, [reading(DANGER, 0.5)]);
    assert.equal((await alertsOf(device.id)).length, 2, 'no reminder after the quiet period');
  });
});

test('a Danger reading recorded 10 minutes ago (a queued batch after a Wi-Fi gap) writes no alert', async () => {
  await withDevice({}, async (device) => {
    await ingest(device.key, [reading(DANGER, 10)]);
    assert.equal((await alertsOf(device.id)).length, 0);
  });
});

test('two Danger readings in one upload write one alert', async () => {
  await withDevice({}, async (device) => {
    await ingest(device.key, [reading(DANGER, 1.5), reading(DANGER, 0.5)]);
    assert.equal((await alertsOf(device.id)).length, 1);
  });
});

test('the threshold is compared on the ROUNDED heat index (DECIDE 4)', async () => {
  const up = findReading((hi) => hi >= 33 && hi < 50 && frac(hi) >= 0.6); // e.g. 41.6: rounds up
  const down = findReading((hi) => hi >= 33 && hi < 50 && frac(hi) > 0 && frac(hi) <= 0.4); // e.g. 41.4: rounds down
  await withDevice({ alert_heat_index_c: Math.ceil(up.hi) }, async (device) => {
    await ingest(device.key, [reading(up)]);
    assert.equal((await alertsOf(device.id)).length, 1, `${up.hi} should round up to ${Math.ceil(up.hi)}`);
  });
  await withDevice({ alert_heat_index_c: Math.ceil(down.hi) }, async (device) => {
    await ingest(device.key, [reading(down)]);
    assert.equal((await alertsOf(device.id)).length, 0, `${down.hi} should round down under ${Math.ceil(down.hi)}`);
  });
});

test('the admin raising the threshold to 45 stops an alert for a reading at 43', async () => {
  await withDevice({ alert_heat_index_c: 45 }, async (device) => {
    await ingest(device.key, [reading(DANGER)]);
    assert.equal((await alertsOf(device.id)).length, 0);
  });
});

test('a reading below the NWS range (no heat index) writes no alert, even with the lowest threshold', async () => {
  await withDevice({ alert_heat_index_c: 27 }, async (device) => {
    const res = await ingest(device.key, [{ recorded_at: minutesFromNow(-0.5), temp_c: 24, rh_pct: 40 }]);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal((await alertsOf(device.id)).length, 0);
  });
});

// ── Who may touch the new tables (P5-h, S-4) ────────────────────────────────────────────────────────────────────

test('anon and a signed-in user cannot read or write push_subscriptions, alerts or alert_state', async () => {
  const user = await makeUser();
  const sub = fakeSub();
  try {
    assert.equal((await subscribe(sub)).status < 300, true, 'setup subscribe failed');
    const asUserFn = (path, opts) => asUser(user.token, path, opts);
    for (const [name, who] of [['anon', anon], ['signed-in', asUserFn]]) {
      for (const [table, key] of [['push_subscriptions', 'id'], ['alerts', 'id'], ['alert_state', 'device_id']]) {
        assert.ok(refused(await who(table)), `${name} read ${table}`);
        assert.ok(refused(await who(table, { method: 'POST', body: {} })), `${name} inserted into ${table}`);
        assert.ok(refused(await who(`${table}?${key}=not.is.null`, { method: 'DELETE' })), `${name} deleted from ${table}`);
      }
      assert.ok(refused(await who(`push_subscriptions?endpoint=eq.${encodeURIComponent(sub.p_endpoint)}`,
        { method: 'PATCH', body: { auth: 'x' } })), `${name} edited a subscription`);
    }
    assert.equal((await subRows(sub.p_endpoint)).length, 1, 'the subscription was removed by a stranger');
  } finally {
    await dropSub(sub.p_endpoint);
    await user.cleanup();
  }
});

// ── push_subscribe / push_unsubscribe ───────────────────────────────────────────────────────────────────────────

test('push_subscribe stores a real push service address; the same address twice is one row with the new keys', async () => {
  const subs = [
    fakeSub('fcm.googleapis.com', '/fcm/send/'),
    fakeSub('updates.push.services.mozilla.com', '/wpush/v2/'),
    fakeSub('web.push.apple.com', '/'),
    fakeSub('wns2-sg2p.notify.windows.com', '/w/?token='),
  ];
  try {
    for (const sub of subs) {
      const res = await subscribe(sub);
      assert.ok(res.status < 300, `${sub.p_endpoint}: ${res.status} ${JSON.stringify(res.body)}`);
      assert.equal((await subRows(sub.p_endpoint)).length, 1);
    }
    const again = { ...subs[0], p_p256dh: b64url(65), p_auth: b64url(16) };
    assert.ok((await subscribe(again)).status < 300);
    const rows = await subRows(again.p_endpoint);
    assert.equal(rows.length, 1, 'same endpoint made a second row');
    assert.equal(rows[0].auth, again.p_auth, 'keys not updated');
  } finally {
    for (const sub of subs) await dropSub(sub.p_endpoint);
  }
});

test('push_subscribe refuses http, unknown hosts, tricks in the host, over-long values and bad keys', async () => {
  const good = fakeSub();
  const bad = [
    { ...good, p_endpoint: good.p_endpoint.replace('https://', 'http://') },
    { ...good, p_endpoint: `https://example.com/push/${b64url(10)}` },
    { ...good, p_endpoint: `https://fcm.googleapis.com.evil.com/x/${b64url(10)}` },
    { ...good, p_endpoint: `https://evil.com@fcm.googleapis.com/x/${b64url(10)}` },
    { ...good, p_endpoint: `https://fcm.googleapis.com:8443/x/${b64url(10)}` },
    { ...good, p_endpoint: `https://notpush.apple.com/x/${b64url(10)}` },
    { ...good, p_endpoint: `https://fcm.googleapis.com/fcm/send/${'a'.repeat(1001)}` },
    { ...good, p_p256dh: 'not base64!' },
    { ...good, p_p256dh: b64url(200) },
    { ...good, p_auth: '' },
    { ...good, p_auth: b64url(100) },
    { ...good, p_endpoint: null },
  ];
  for (const sub of bad) {
    const res = await subscribe(sub);
    assert.ok(res.status >= 400, `accepted ${JSON.stringify(sub).slice(0, 120)}: ${res.status}`);
    if (sub.p_endpoint) assert.equal((await subRows(sub.p_endpoint)).length, 0);
  }
});

test('push_unsubscribe removes a row only when endpoint AND auth match', async () => {
  const sub = fakeSub();
  try {
    assert.ok((await subscribe(sub)).status < 300);
    await unsubscribe(sub.p_endpoint, b64url(16));
    assert.equal((await subRows(sub.p_endpoint)).length, 1, 'removed with the wrong auth');
    const ok = await unsubscribe(sub.p_endpoint, sub.p_auth);
    assert.ok(ok.status < 300, JSON.stringify(ok.body));
    assert.equal((await subRows(sub.p_endpoint)).length, 0, 'not removed with the right auth');
  } finally {
    await dropSub(sub.p_endpoint);
  }
});

test('push_subscribe refuses a new address when the table holds 300 (DECIDE 5); an update still works', async () => {
  const count = (await service('push_subscriptions?select=id')).body.length;
  const filler = Array.from({ length: Math.max(0, 300 - count) }, () => {
    const s = fakeSub();
    return { endpoint: s.p_endpoint, p256dh: s.p_p256dh, auth: s.p_auth };
  });
  const existing = fakeSub();
  try {
    // One real-looking row first (through the function), then fill the rest with the secret key.
    if (filler.length > 0) filler.pop();
    assert.ok((await subscribe(existing)).status < 300);
    if (filler.length) assert.equal((await service('push_subscriptions', { method: 'POST', body: filler })).status, 201);
    assert.equal((await service('push_subscriptions?select=id')).body.length, 300);
    const extra = fakeSub();
    const res = await subscribe(extra);
    assert.ok(res.status >= 400, `301st accepted: ${res.status}`);
    assert.equal((await subRows(extra.p_endpoint)).length, 0);
    assert.ok((await subscribe({ ...existing, p_auth: b64url(16) })).status < 300, 'update refused at the cap');
  } finally {
    await dropSub(existing.p_endpoint);
    for (let i = 0; i < filler.length; i += 50) {
      const list = filler.slice(i, i + 50).map((f) => `"${f.endpoint}"`).join(',');
      await service(`push_subscriptions?endpoint=in.(${encodeURIComponent(list)})`, { method: 'DELETE' });
    }
  }
});
