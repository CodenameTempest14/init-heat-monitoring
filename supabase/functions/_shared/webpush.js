// P05-03: Web Push with Web Crypto only, so the same file runs in Supabase's Edge runtime (Deno) and in the Node
// tests. Chosen in s31 over `npm:web-push` (needs Node's crypto module; not confirmed on Supabase's runtime).
// Checked against the RFC 8291 example byte for byte (tests/webpush.test.js).
//
// How a push works, in short:
//  1. Encryption (RFC 8291): the browser gave us its public key (p256dh) and a secret (auth). We make a one-time key
//     pair, agree a shared secret with the browser's key (ECDH), mix it with `auth` and a random salt (HKDF), and
//     encrypt the message with AES-128-GCM. Only that browser can read it; the push service (Google, Apple, Mozilla)
//     only carries it.
//  2. VAPID (RFC 8292): a short token signed with our private key. The push service checks it against the public key
//     the browser subscribed with, so nobody else can push to our subscribers.

const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();

/** base64url without padding. */
export function b64u(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function unb64u(text) {
  const s = atob(text.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '') + '='.repeat((4 - (text.replace(/=+$/, '').length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}
const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parts) { out.set(p, i); i += p.length; }
  return out;
};
async function hmac(key, data) {
  const k = await subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await subtle.sign('HMAC', k, data));
}

const RECORD_SIZE = 4096;

/**
 * RFC 8291 "aes128gcm" body: header (salt, record size, our one-time public key) + ciphertext.
 * `fixed` is only for the RFC test (a known salt and key pair); normally both are random.
 */
export async function encryptPayload({ plaintext, uaPublic, authSecret, fixed }) {
  const ua = typeof uaPublic === 'string' ? unb64u(uaPublic) : uaPublic;
  const auth = typeof authSecret === 'string' ? unb64u(authSecret) : authSecret;
  let salt, asPrivateKey, asPublic;
  if (fixed) {
    ({ salt, asPrivateKey, asPublic } = fixed);
  } else {
    salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const pair = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    asPrivateKey = pair.privateKey;
    asPublic = new Uint8Array(await subtle.exportKey('raw', pair.publicKey));
  }

  // ECDH with the browser's key, then HKDF (each HKDF step with one block is a single HMAC).
  const uaKey = await subtle.importKey('raw', ua, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await subtle.deriveBits({ name: 'ECDH', public: uaKey }, asPrivateKey, 256));
  const prkKey = await hmac(auth, ecdh);
  const keyInfo = concat(enc.encode('WebPush: info\0'), ua, asPublic);
  const ikm = await hmac(prkKey, concat(keyInfo, new Uint8Array([1])));
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, concat(enc.encode('Content-Encoding: aes128gcm\0'), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, concat(enc.encode('Content-Encoding: nonce\0'), new Uint8Array([1])))).slice(0, 12);

  // One record: the message, then the delimiter 0x02 (last record), no extra padding.
  const key = await subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ciphertext = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, concat(plaintext, new Uint8Array([2]))));

  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, RECORD_SIZE);
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, ciphertext);
}

/** RFC 8292 header value: `vapid t=<signed token>, k=<our public key>`. Token valid 12 h (the limit is 24 h). */
export async function vapidAuthorization({ endpoint, subject, publicKey, privateKey, nowSeconds }) {
  const pub = unb64u(publicKey);
  const jwk = { kty: 'EC', crv: 'P-256', x: b64u(pub.slice(1, 33)), y: b64u(pub.slice(33, 65)), d: privateKey };
  const key = await subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  const part = (obj) => b64u(enc.encode(JSON.stringify(obj)));
  const unsigned = `${part({ typ: 'JWT', alg: 'ES256' })}.${part({ aud: new URL(endpoint).origin, exp: now + 12 * 3600, sub: subject })}`;
  // Web Crypto gives the raw 64-byte r||s signature, which is exactly what ES256 tokens use.
  const sig = new Uint8Array(await subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(unsigned)));
  return `vapid t=${unsigned}.${b64u(sig)}, k=${publicKey}`;
}

/**
 * Sends one push. subscription = { endpoint, p256dh, auth } (a row of push_subscriptions).
 * Returns { status, ok, gone }: gone = the push service says the subscription no longer exists (404 / 410).
 * TTL 1 h: an alert older than that is not worth showing. Urgency high: deliver now, even on a sleeping phone.
 */
export async function sendPush({ subscription, payload, vapid, fetchFn = fetch }) {
  const body = await encryptPayload({ plaintext: enc.encode(payload), uaPublic: subscription.p256dh, authSecret: subscription.auth });
  const res = await fetchFn(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: '3600',
      Urgency: 'high',
      Authorization: await vapidAuthorization({ endpoint: subscription.endpoint, ...vapid }),
    },
    body,
  });
  try { await res.body?.cancel(); } catch { /* nothing to read */ }
  return { status: res.status, ok: res.status >= 200 && res.status < 300, gone: res.status === 404 || res.status === 410 };
}
