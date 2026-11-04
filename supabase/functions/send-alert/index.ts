// P05-03 (F-10): delivers one heat alert to every subscribed phone. Design: documentation/specs/P05-03_DESIGN.md.
// Called only by the database trigger `readings_alert` (through pg_net) with { alert_id } and the shared secret.
// It decides nothing: whether to alert was decided in SQL. It only delivers, cleans up gone subscriptions, and writes
// the sent / failed counts into the alert row.
//
// Secrets (set by the owner with `supabase secrets set`, never in the repo):
//   ALERT_SECRET       the same value as Vault's `send_alert_secret`
//   VAPID_PUBLIC_KEY   VAPID_PRIVATE_KEY   from `node tools/vapid-keys.mjs <test|live>`
//   VAPID_SUBJECT      a contact for the push services: the site address
// Given by Supabase to every function: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server only, never sent to a page).
//
// Deployed with JWT checking OFF (config.toml) because the caller is the database, not a signed-in user; the shared
// secret takes its place, and anything without it is refused.

import { sendPush } from '../_shared/webpush.js';
import { alertMessage } from '../_shared/alert-message.js';

const env = (name: string) => {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`missing secret ${name}`);
  return v;
};

/** Compares two strings in constant time, so the secret cannot be guessed from response times. */
function sameSecret(a: string, b: string) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  if (!sameSecret(req.headers.get('x-alert-secret') ?? '', env('ALERT_SECRET'))) return json(401, { error: 'secret' });

  let alertId: number;
  try {
    alertId = (await req.json()).alert_id;
  } catch {
    return json(400, { error: 'body' });
  }
  if (!Number.isInteger(alertId) || alertId < 1) return json(400, { error: 'alert_id' });

  const base = `${env('SUPABASE_URL')}/rest/v1`;
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const db = (path: string, init: RequestInit = {}) =>
    fetch(`${base}/${path}`, {
      ...init,
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });

  const alertRes = await db(`alerts?id=eq.${alertId}&select=id,heat_index_c,room,sent`);
  const [alert] = await alertRes.json();
  if (!alert) return json(404, { error: 'no such alert' });
  if (alert.sent !== null) return json(200, { already: true }); // a repeated call never sends twice

  const subs = await (await db('push_subscriptions?select=endpoint,p256dh,auth')).json();
  const payload = JSON.stringify(alertMessage(alert));
  const vapid = {
    subject: env('VAPID_SUBJECT'),
    publicKey: env('VAPID_PUBLIC_KEY'),
    privateKey: env('VAPID_PRIVATE_KEY'),
  };

  const results = await Promise.allSettled(subs.map((subscription: { endpoint: string; p256dh: string; auth: string }) =>
    sendPush({ subscription, payload, vapid })));

  let sent = 0;
  let failed = 0;
  const statuses: Record<string, number> = {};
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      statuses[r.value.status] = (statuses[r.value.status] ?? 0) + 1;
      if (r.value.ok) sent++;
      else failed++;
      // The phone unsubscribed or the browser data was cleared: remove the address (P5-h: nothing kept without use).
      if (r.value.gone) await db(`push_subscriptions?endpoint=eq.${encodeURIComponent(subs[i].endpoint)}`, { method: 'DELETE' });
    } else {
      failed++;
      statuses.error = (statuses.error ?? 0) + 1;
      console.error('push failed:', String(r.reason));
    }
  }

  await db(`alerts?id=eq.${alertId}`, { method: 'PATCH', body: JSON.stringify({ sent, failed }) });
  console.log(`alert ${alertId}: sent ${sent}, failed ${failed}`, JSON.stringify(statuses));
  return json(200, { sent, failed, statuses });
});
