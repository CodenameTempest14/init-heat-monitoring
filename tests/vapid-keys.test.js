// tools/vapid-keys.mjs (P05-03 NEW PIECE, approved s31): the VAPID key pair and the database-to-function secret.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createECDH } from 'node:crypto';
import { makeKeys, mergeEnv } from '../tools/vapid-keys.mjs';

const b64 = (s) => Buffer.from(s, 'base64url');

test('the public key is an uncompressed P-256 point (65 bytes, 0x04) and belongs to the private key', () => {
  const k = makeKeys();
  const pub = b64(k.publicKey);
  const priv = b64(k.privateKey);
  assert.equal(pub.length, 65);
  assert.equal(pub[0], 0x04);
  assert.equal(priv.length, 32);
  const ecdh = createECDH('prime256v1');
  ecdh.setPrivateKey(priv);
  assert.deepEqual(ecdh.getPublicKey(), pub, 'public key does not match the private key');
  assert.match(k.publicKey, /^[A-Za-z0-9_-]+$/, 'not base64url');
  assert.ok(b64(k.alertSecret).length >= 32, 'alert secret shorter than 32 bytes');
});

test('two runs give different keys', () => {
  const a = makeKeys();
  const b = makeKeys();
  assert.notEqual(a.privateKey, b.privateKey);
  assert.notEqual(a.alertSecret, b.alertSecret);
});

test('mergeEnv adds the three names for test, keeps other lines, and never overwrites an existing value', () => {
  const k = { publicKey: 'PUB', privateKey: 'PRIV', alertSecret: 'SEC' };
  const before = 'SUPABASE_URL=x\n# comment\n';
  const { text, added } = mergeEnv(before, 'test', k);
  assert.ok(text.startsWith(before));
  assert.match(text, /^VAPID_TEST_PUBLIC_KEY=PUB$/m);
  assert.match(text, /^VAPID_TEST_PRIVATE_KEY=PRIV$/m);
  assert.match(text, /^ALERT_TEST_SECRET=SEC$/m);
  assert.deepEqual(added, ['VAPID_TEST_PUBLIC_KEY', 'VAPID_TEST_PRIVATE_KEY', 'ALERT_TEST_SECRET']);

  const again = mergeEnv(text, 'test', { publicKey: 'NEW', privateKey: 'NEW', alertSecret: 'NEW' });
  assert.equal(again.text, text, 'an existing key was overwritten');
  assert.deepEqual(again.added, []);

  const live = mergeEnv('', 'live', k);
  assert.match(live.text, /^VAPID_PUBLIC_KEY=PUB$/m);
  assert.match(live.text, /^ALERT_SECRET=SEC$/m);
});
