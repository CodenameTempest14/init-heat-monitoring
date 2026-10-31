# Phase 2 — Backend and secure upload

**Objective:** A Supabase backend that stores readings, lets anyone read them, and accepts writes only from the device and the admin, validated on the server.
**Entry criteria:** P01 closed.
**Exit criteria:** A fake device can post readings with a key; bad or unauthenticated posts are rejected; anonymous users can read but not write.
**Features:** F-06, F-07, F-20. Model: Opus 5.5 (security design).

Checklist markers: see phase-01.

- [x] P02-01 Schema (readings, device, settings) designed and approved by the owner — evidence 2026-10-31 s07: `documentation/specs/SCHEMA.md` written, changed at the owner's request (server-side heat index, hourly maxima with time, D-023), owner replied "yes" to the final version. Design only; nothing built on Supabase yet.
- [x] P02-02 Row-level rules: public read-only; an anonymous write attempt is tried and denied — evidence 2026-10-31 s07: `tests/backend/access.backend.js` written first and run against `init-test`: 8/8 failed with PGRST205 (no tables). Migration `20261031120000_core_schema.sql` pushed to `init-test` only, then 9/9 pass (anon read 200; anon insert/update/delete and reading `devices.key_hash` all denied with 42501; a row written with the secret key is visible to anon). Supabase security advisor: 0 findings. NOT yet applied to the live `init` project.
- [ ] P02-03 Device key issued; it is not in the repository
- [ ] P02-04 Ingest checks value ranges, timestamp and rate; tests prove bad payloads are rejected
- [ ] P02-05 Retention: raw readings kept 90 days, then hourly averages (F-20)
- [ ] P02-06 Security review of the backend, findings recorded
