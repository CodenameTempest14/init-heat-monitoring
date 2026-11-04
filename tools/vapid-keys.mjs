// P05-03 (NEW PIECE, approved s31): makes the keys for heat alerts, for ONE project.
// Usage: node tools/vapid-keys.mjs <test|live>
//
// - VAPID key pair (P-256): proves to the push services (Google, Apple, Mozilla) that a push comes from our server.
//   The PUBLIC key is public by design (the web app gives it to the browser when subscribing).
//   The PRIVATE key never leaves .env and the Edge Function's secrets.
// - The alert secret: shared by the database (Vault) and the Edge Function, so only our database can start a send.
//
// Writes the three values to .env (gitignored) and NEVER overwrites one that is already there (a new pair would
// silently cut off every phone that subscribed with the old public key). Prints only the public key.
import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** A fresh VAPID pair (base64url, as the Web Push standard writes them) and a 32-byte alert secret. */
export function makeKeys() {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jwk = privateKey.export({ format: 'jwk' });
  const pubJwk = publicKey.export({ format: 'jwk' });
  // Uncompressed point: 0x04, then x and y (32 bytes each).
  const point = Buffer.concat([Buffer.from([4]), Buffer.from(pubJwk.x, 'base64url'), Buffer.from(pubJwk.y, 'base64url')]);
  return {
    publicKey: point.toString('base64url'),
    privateKey: jwk.d, // already base64url, 32 bytes
    alertSecret: randomBytes(32).toString('base64url'),
  };
}

/** The .env names for a target: test = *_TEST_*, live = no infix (same pattern as SUPABASE_TEST_* / SUPABASE_*). */
export const envNames = (target) => {
  const t = target === 'test' ? 'TEST_' : '';
  return { publicKey: `VAPID_${t}PUBLIC_KEY`, privateKey: `VAPID_${t}PRIVATE_KEY`, alertSecret: `ALERT_${t}SECRET` };
};

/** Adds the missing names to the .env text. Returns the new text and the names added. */
export function mergeEnv(envText, target, keys) {
  const names = envNames(target);
  const has = (name) => new RegExp(`^\\s*${name}\\s*=\\s*\\S`, 'm').test(envText);
  const added = [];
  let text = envText;
  for (const field of ['publicKey', 'privateKey', 'alertSecret']) {
    if (has(names[field])) continue;
    if (text && !text.endsWith('\n')) text += '\n';
    text += `${names[field]}=${keys[field]}\n`;
    added.push(names[field]);
  }
  return { text, added };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = process.argv[2];
  if (target !== 'test' && target !== 'live') {
    console.error('usage: node tools/vapid-keys.mjs <test|live>');
    process.exit(2);
  }
  const envFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
  let envText = '';
  try { envText = readFileSync(envFile, 'utf8'); } catch { /* no .env yet */ }
  const { text, added } = mergeEnv(envText, target, makeKeys());
  if (added.length) writeFileSync(envFile, text);
  const names = envNames(target);
  const pub = text.match(new RegExp(`^\\s*${names.publicKey}\\s*=\\s*(\\S+)`, 'm'))[1];
  console.log(added.length ? `added to .env: ${added.join(', ')}` : `.env already has the ${target} keys: nothing changed`);
  console.log(`${names.publicKey} (public, goes in web/src/config.js): ${pub}`);
}
