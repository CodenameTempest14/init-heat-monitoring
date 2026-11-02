// Makes the dummy admin account on init-test (P05): a confirmed user plus its row in `admins`.
// The password is random and goes into .env (gitignored) as ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD; it is never printed.
// Running it again keeps the same account and sets a new password.
// Usage: node --env-file=.env tools/make-test-admin.mjs
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const url = process.env.SUPABASE_TEST_URL;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_KEY;
if (!url || !serviceKey) throw new Error('SUPABASE_TEST_URL / SUPABASE_TEST_SERVICE_KEY missing in .env');
const email = 'init-admin@example.com'; // dummy address, test project only
const password = randomBytes(18).toString('base64url');
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };

const list = await (await fetch(`${url}/auth/v1/admin/users?per_page=1000`, { headers })).json();
let user = list.users.find((u) => u.email === email);
const res = user
  ? await fetch(`${url}/auth/v1/admin/users/${user.id}`, { method: 'PUT', headers, body: JSON.stringify({ password }) })
  : await fetch(`${url}/auth/v1/admin/users`, { method: 'POST', headers, body: JSON.stringify({ email, password, email_confirm: true }) });
user = await res.json();
if (!res.ok) throw new Error(`user: ${res.status} ${JSON.stringify(user)}`);

const row = await fetch(`${url}/rest/v1/admins`, {
  method: 'POST', headers: { ...headers, Prefer: 'resolution=ignore-duplicates' }, body: JSON.stringify({ user_id: user.id }),
});
if (!row.ok) throw new Error(`admins: ${row.status} ${await row.text()}`);

let env = readFileSync('.env', 'utf8').replace(/^ADMIN_TEST_(EMAIL|PASSWORD)=.*\r?\n?/gm, '');
if (!env.endsWith('\n')) env += '\n';
writeFileSync('.env', `${env}ADMIN_TEST_EMAIL=${email}\nADMIN_TEST_PASSWORD=${password}\n`);
console.log(`admin on init-test: ${email} (id ${user.id}); password written to .env as ADMIN_TEST_PASSWORD`);
