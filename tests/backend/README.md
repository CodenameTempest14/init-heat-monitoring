# tests/backend/

Tests that call the real `init-test` Supabase project over the internet. Run with `npm run test:backend` (needs `.env`).
Named `*.backend.js` so the offline `npm test` does not pick them up.

- `access.backend.js` — row-level rules (P02-02): the public key can read, every write is denied with `42501`.
