# _shared/

Plain JavaScript shared by the Edge Functions (Deno) and the Node tests. No imports from outside this folder, so
Supabase bundles it with the function.

- `webpush.js` — Web Push: RFC 8291 encryption and RFC 8292 VAPID, Web Crypto only (`tests/webpush.test.js`).
- `alert-message.js` — the alert's words and PAGASA level (`tests/alert-message.test.js`).
