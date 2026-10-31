# tools

Project scripts (Node). `phase-report.mjs` prints the status line and Phase Progress table, `continuation-prompt.mjs` writes the next-session prompt, `check-readmes.mjs` checks every folder has a README, `db.mjs` runs the Supabase CLI against the test or live project (see `supabase/README.md`), `device-key.mjs` makes the device key in `.env` and stores only its SHA-256 in a project (the access token is read-only, so it writes through the database password).
