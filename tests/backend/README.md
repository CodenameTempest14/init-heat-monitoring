# tests/backend/

Tests that call the real `init-test` Supabase project over the internet. Run with `npm run test:backend` (needs `.env`).
Named `*.backend.js` so the offline `npm test` does not pick them up.

- `access.backend.js` — row-level rules (P02-02): the public key can read, every write is denied with `42501`.
- `ingest.backend.js` — `ingest_reading` (P02-04): what is saved, and every rejection rule (each also checks nothing was saved).
- `heat-index-sql.backend.js` — the SQL heat index equals `src/heat-index.js` (D-023): shared reference table plus a grid.
- `retention.backend.js` — the 90-day rollup (P02-05): hourly values, max times, room kept, whole hours only, stops rather than drop data.
- `admin.backend.js` — who may change settings and the room (P05-05): anon, a signed-in non-admin, the admin. Throwaway devices and users only, so it can run alone during the 24 h run. Seen failing before the migration (s22: no `admins` table).
- `_helpers.js` — shared calls (public key, secret key, throwaway devices). Not a test file.
