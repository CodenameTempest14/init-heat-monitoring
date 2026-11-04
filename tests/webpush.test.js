// P05-03: supabase/functions/_shared/webpush.js — Web Push with Web Crypto only (runs in Deno and Node).
// Encryption is checked byte for byte against the example of RFC 8291 (Appendix A and Section 5,
// https://www.rfc-editor.org/rfc/rfc8291.txt, read s31). VAPID (RFC 8292) is checked by verifying the signature.
import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptPayload, vapidAuthorization, sendPush, b64u, unb64u } from '../supabase/functions/_shared/webpush.js';

const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();

// RFC 8291 Appendix A (whitespace removed).
const RFC = {
  plaintext: 'V2hlbiBJIGdyb3cgdXAsIEkgd2FudCB0byBiZSBhIHdhdGVybWVsb24',
  asPublic: 'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8',
  asPrivate: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw',
  uaPublic: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
  uaPrivate: 'q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94',
  salt: 'DGv6ra1nlYgDCS1FRnbzlw',
  auth: 'BTBZMqHH6r4Tts7J_aSIgg',
  body: 'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN',
};

const jwkFor = (pub, d) => {
  const p = unb64u(pub);
  return { kty: 'EC', crv: 'P-256', x: b64u(p.slice(1, 33)), y: b64u(p.slice(33, 65)), ...(d && { d }) };
};

test('encryption matches the RFC 8291 example byte for byte', async () => {
  const asPrivateKey = await subtle.importKey('jwk', jwkFor(RFC.asPublic, RFC.asPrivate), { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
  const body = await encryptPayload({
    plaintext: unb64u(RFC.plaintext),
    uaPublic: RFC.uaPublic,
    authSecret: RFC.auth,
    fixed: { salt: unb64u(RFC.salt), asPrivateKey, asPublic: unb64u(RFC.asPublic) },
  });
  assert.equal(b64u(body), RFC.body);
});

// The browser's side of RFC 8291, written here only to check a message made with random keys and salt.
async function decryptAsBrowser(body, uaPrivateB64, uaPublicB64, authB64) {
  const hmac = async (key, data) => new Uint8Array(await subtle.sign('HMAC', await subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), data));
  const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };
  const salt = body.slice(0, 16);
  const idlen = body[20];
  const asPublic = body.slice(21, 21 + idlen);
  const ct = body.slice(21 + idlen);
  const uaPriv = await subtle.importKey('jwk', jwkFor(uaPublicB64, uaPrivateB64), { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
  const asKey = await subtle.importKey('raw', asPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await subtle.deriveBits({ name: 'ECDH', public: asKey }, uaPriv, 256));
  const prkKey = await hmac(unb64u(authB64), ecdh);
  const ikm = await hmac(prkKey, cat(enc.encode('WebPush: info\0'), unb64u(uaPublicB64), asPublic, new Uint8Array([1])));
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, cat(enc.encode('Content-Encoding: aes128gcm\0'), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, cat(enc.encode('Content-Encoding: nonce\0'), new Uint8Array([1])))).slice(0, 12);
  const key = await subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']);
  const padded = new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv: nonce }, key, ct));
  assert.equal(padded[padded.length - 1], 2, 'missing the 0x02 padding delimiter');
  return new TextDecoder().decode(padded.slice(0, -1));
}

test('a message with fresh random server keys and salt decrypts on the browser side', async () => {
  const text = JSON.stringify({ title: 'Init heat alert', body: 'Heat index 43 °C (Danger) in Room 204.', url: '/' });
  const body = await encryptPayload({ plaintext: enc.encode(text), uaPublic: RFC.uaPublic, authSecret: RFC.auth });
  assert.notEqual(b64u(body.slice(0, 16)), RFC.salt, 'salt was not random');
  assert.equal(await decryptAsBrowser(body, RFC.uaPrivate, RFC.uaPublic, RFC.auth), text);
});

test('VAPID: a signed ES256 token for the push service origin, 12 h, with our subject and public key', async () => {
  const pair = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const jwk = await subtle.exportKey('jwk', pair.privateKey);
  const publicKey = b64u(new Uint8Array(await subtle.exportKey('raw', pair.publicKey)));
  const now = 1_800_000_000;
  const header = await vapidAuthorization({
    endpoint: 'https://fcm.googleapis.com/fcm/send/abc', subject: 'https://init-heat-monitoring.vercel.app',
    publicKey, privateKey: jwk.d, nowSeconds: now,
  });
  const m = header.match(/^vapid t=([^,]+), k=(.+)$/);
  assert.ok(m, header);
  assert.equal(m[2], publicKey);
  const [h, c, s] = m[1].split('.');
  assert.deepEqual(JSON.parse(new TextDecoder().decode(unb64u(h))), { typ: 'JWT', alg: 'ES256' });
  assert.deepEqual(JSON.parse(new TextDecoder().decode(unb64u(c))),
    { aud: 'https://fcm.googleapis.com', exp: now + 12 * 3600, sub: 'https://init-heat-monitoring.vercel.app' });
  const ok = await subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pair.publicKey, unb64u(s), enc.encode(`${h}.${c}`));
  assert.ok(ok, 'signature does not verify');
});

test('sendPush posts the encrypted body with the right headers and reports gone (404/410) subscriptions', async () => {
  const pair = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const vapid = {
    subject: 'https://init-heat-monitoring.vercel.app',
    publicKey: b64u(new Uint8Array(await subtle.exportKey('raw', pair.publicKey))),
    privateKey: (await subtle.exportKey('jwk', pair.privateKey)).d,
  };
  const sub = { endpoint: 'https://fcm.googleapis.com/fcm/send/xyz', p256dh: RFC.uaPublic, auth: RFC.auth };
  for (const [status, gone, ok] of [[201, false, true], [404, true, false], [410, true, false], [500, false, false]]) {
    let seen;
    const fakeFetch = async (url, init) => { seen = { url, init }; return new Response(null, { status }); };
    const r = await sendPush({ subscription: sub, payload: '{"title":"t"}', vapid, fetchFn: fakeFetch });
    assert.deepEqual({ status: r.status, gone: r.gone, ok: r.ok }, { status, gone, ok });
    assert.equal(seen.url, sub.endpoint);
    assert.equal(seen.init.method, 'POST');
    assert.equal(seen.init.headers['Content-Encoding'], 'aes128gcm');
    assert.equal(seen.init.headers.TTL, '3600');
    assert.equal(seen.init.headers.Urgency, 'high');
    assert.match(seen.init.headers.Authorization, /^vapid t=.+, k=/);
    assert.equal(await decryptAsBrowser(new Uint8Array(seen.init.body), RFC.uaPrivate, RFC.uaPublic, RFC.auth), '{"title":"t"}');
  }
});
