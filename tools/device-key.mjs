// Device key (P02-03, F-06). The key stays in .env (later secrets.h); the database only gets its SHA-256.
// Usage:
//   node --env-file=.env tools/device-key.mjs new [--rotate]           make DEVICE_KEY in .env
//   node --env-file=.env tools/device-key.mjs register <test|live> "Room 1"   store its hash in that project
// The key itself is never printed.
import { randomBytes, createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const [cmd, ...rest] = process.argv.slice(2);
const hashOf = (key) => createHash('sha256').update(key, 'utf8').digest('hex');

if (cmd === 'new') {
  const env = readFileSync('.env', 'utf8');
  const exists = /^DEVICE_KEY=.+$/m.test(env);
  if (exists && !rest.includes('--rotate')) {
    console.error('DEVICE_KEY already in .env. Use --rotate to replace it (then register again and re-flash the device).');
    process.exit(1);
  }
  const key = randomBytes(32).toString('hex');
  const line = `DEVICE_KEY=${key}`;
  const next = exists
    ? env.replace(/^DEVICE_KEY=.*$/m, line)
    : `${env.replace(/\s*$/, '')}\n\n# Device key (tools/device-key.mjs). Secret: copy into secrets.h only.\n${line}\n`;
  writeFileSync('.env', next);
  console.log(`DEVICE_KEY ${exists ? 'rotated' : 'written'} in .env. SHA-256: ${hashOf(key)}`);
} else if (cmd === 'register') {
  const [target, name] = rest;
  const prefix = { test: 'SUPABASE_TEST_', live: 'SUPABASE_' }[target];
  const key = process.env.DEVICE_KEY;
  if (!prefix || !name || !key) {
    console.error('usage: node --env-file=.env tools/device-key.mjs register <test|live> "<name>" (needs DEVICE_KEY in .env)');
    process.exit(2);
  }
  const quote = (s) => `'${s.replaceAll("'", "''")}'`;
  const hash = hashOf(key);
  // One statement (the connection allows no more). One device per name: registering the same
  // name again replaces the hash (key rotation). A settings row with the defaults comes with it.
  const sql = `
    with existing as (
      update public.devices set key_hash = ${quote(hash)} where name = ${quote(name)} returning id
    ), created as (
      insert into public.devices (name, key_hash)
      select ${quote(name)}, ${quote(hash)} where not exists (select 1 from existing) returning id
    ), dev as (select id from existing union all select id from created
    ), s as (insert into public.settings (device_id) select id from dev on conflict do nothing)
    select id, ${quote(name)} as name from dev`;

  // The access token is read-only, so writes go straight to the database with its password.
  const ref = process.env[`${prefix}PROJECT_REF`];
  const password = process.env[`${prefix}DB_PASSWORD`];
  const pooler = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/database/pooler`, {
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}` },
  }).then((r) => r.json());
  const host = new URL([].concat(pooler)[0].connection_string).hostname;
  const dbUrl = `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:5432/postgres`;

  const { PATH, SystemRoot, USERPROFILE, TEMP, APPDATA, LOCALAPPDATA } = process.env;
  const r = spawnSync(process.execPath, ['node_modules/supabase/dist/supabase.js', 'db', 'query', '--db-url', dbUrl, sql], {
    encoding: 'utf8', env: { PATH, SystemRoot, USERPROFILE, TEMP, APPDATA, LOCALAPPDATA },
  });
  const mask = (s) => (s ?? '').split(password).join('<pw>').split(encodeURIComponent(password)).join('<pw>');
  if (r.status !== 0) {
    console.error(`[${target}] failed:\n${mask(r.stderr)}`);
    process.exitCode = 1;
  } else {
    console.log(`[${target}] registered (hash ${hash.slice(0, 12)}…):\n${mask(r.stdout)}`);
  }
} else {
  console.error('usage: tools/device-key.mjs new [--rotate] | register <test|live> "<name>"');
  process.exit(2);
}
