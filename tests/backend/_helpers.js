// Shared by the *.backend.js tests. Talks to the TEST project only.
import { randomBytes, createHash } from 'node:crypto';

const url = process.env.SUPABASE_TEST_URL;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_KEY;
if (!url || !anonKey || !serviceKey) throw new Error('SUPABASE_TEST_* missing: fill .env (see .env.example)');

async function call(key, path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key, 'Content-Type': 'application/json', Prefer: 'return=representation',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

/** The public, like a stranger or the device (the device only adds its own key). */
export const anon = (path, opts) => call(anonKey, path, opts);
/** The secret key: bypasses row-level rules. Only for setting up and checking tests. */
export const service = (path, opts) => call(serviceKey, path, opts);

/** A signed-in user: the public key plus that user's token (what the web app sends after sign-in). */
export const asUser = (token, path, opts) => call(anonKey, path, { ...opts, token });

/**
 * A throwaway signed-in user (P05). Sign-ups are off, so the secret key creates it; the password is random and
 * never leaves the test. Call cleanup() in finally (it also removes any `admins` row, which cascades).
 */
export async function makeUser() {
  const email = `test-${randomBytes(6).toString('hex')}@example.com`;
  const password = randomBytes(18).toString('base64url');
  const made = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const user = await made.json();
  if (made.status !== 200) throw new Error(`makeUser: ${made.status} ${JSON.stringify(user)}`);
  const signIn = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const session = await signIn.json();
  if (signIn.status !== 200) throw new Error(`makeUser sign-in: ${signIn.status} ${JSON.stringify(session)}`);
  return {
    id: user.id,
    token: session.access_token,
    makeAdmin: () => service('admins', { method: 'POST', body: { user_id: user.id } }),
    removeAdmin: () => service(`admins?user_id=eq.${user.id}`, { method: 'DELETE' }),
    cleanup: () => fetch(`${url}/auth/v1/admin/users/${user.id}`, {
      method: 'DELETE', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    }),
  };
}

/** A throwaway device with its own key. Call cleanup() in finally. */
export async function makeDevice({ room, settings } = {}) {
  const key = randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(key, 'utf8').digest('hex');
  const res = await service('devices', {
    method: 'POST',
    body: { name: `test ${hash.slice(0, 8)}`, key_hash: hash, ...(room && { room }) },
  });
  if (res.status !== 201) throw new Error(`makeDevice: ${res.status} ${JSON.stringify(res.body)}`);
  const id = res.body[0].id;
  if (settings) await service('settings', { method: 'POST', body: { device_id: id, ...settings } });
  return {
    id,
    key,
    readings: () => service(`readings?device_id=eq.${id}&order=recorded_at`).then((r) => r.body),
    cleanup: () => service(`devices?id=eq.${id}`, { method: 'DELETE' }), // cascades
  };
}

/** What the device sends: POST /rest/v1/rpc/ingest_reading with the public key. */
export const ingest = (deviceKey, readings) =>
  anon('rpc/ingest_reading', { method: 'POST', body: { device_key: deviceKey, readings } });

/** ISO time `minutes` from now (negative = past), whole seconds. */
export const minutesFromNow = (minutes) =>
  new Date(Math.floor((Date.now() + minutes * 60_000) / 1000) * 1000).toISOString();
