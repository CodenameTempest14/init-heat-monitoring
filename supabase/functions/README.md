# supabase/functions/

Edge Functions (Deno, run by Supabase). Only one so far.

- `send-alert/` — P05-03 heat alerts: delivers one alert (decided in SQL by the trigger `readings_alert`) to every
  subscribed phone by Web Push. Called only by the database through `pg_net`, with a shared secret.
- `_shared/` — plain JavaScript used by the function **and** by the Node tests, so it is tested without deploying:
  `webpush.js` (Web Push encryption and VAPID with Web Crypto only, checked against the RFC 8291 example) and
  `alert-message.js` (the alert's title and body, same PAGASA levels as the page).

Tests: `tests/webpush.test.js`, `tests/alert-message.test.js` (Node), `tests/backend/push.backend.js` (the SQL rule).

## Set-up for one project (the owner runs the steps that write to Supabase)

The access token in `.env` is read-only on purpose, so deploying and setting secrets need the owner's own CLI login
(`npx supabase login`) or the dashboard.

1. Migration `20261108120000_push_alerts.sql`: `node --env-file=.env tools/db.mjs test db push`.
2. Keys: `node tools/vapid-keys.mjs test` (adds `VAPID_TEST_PUBLIC_KEY`, `VAPID_TEST_PRIVATE_KEY`, `ALERT_TEST_SECRET`
   to `.env`; prints only the public key, which goes in `web/src/config.js`).
3. Function secrets: `ALERT_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (the site address) with
   `npx supabase secrets set --project-ref <ref> --env-file <file>` (a file outside the repo, deleted afterwards).
4. Deploy: `npx supabase functions deploy send-alert --project-ref <ref> --no-verify-jwt --use-api` (no Docker needed).
5. Vault (dashboard SQL Editor of that project):
   `select vault.create_secret('https://<ref>.supabase.co/functions/v1/send-alert', 'send_alert_url');`
   `select vault.create_secret('<the ALERT secret>', 'send_alert_secret');`
   Until both exist the trigger still logs alerts but sends nothing.
