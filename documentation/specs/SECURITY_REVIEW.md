# Backend security review (P02-06), 2026-10-31 s08

Scope: everything in `supabase/migrations/` as applied to `init-test`, the two Supabase projects' settings, the repo history, and the tools that hold secrets. Not in scope: the device firmware (P03) and the web app (P04). Those get their own items below.
The live `init` project has no tables yet. Every migration result here is from `init-test`. The live project's settings were read the same way.

## Summary
| # | Finding | Severity | Status |
|---|---|---|---|
| S-1 | The public can run `ingest_reading` (security definer) | by design | accepted |
| S-2 | Calls with a wrong key are not rate limited | low | accepted |
| S-3 | A stolen device key can write believable fake readings | medium | accepted, mitigations listed |
| S-4 | Anyone can sign up for an account on both projects | medium (from P05) | **owner action** |
| S-5 | SSL is not enforced for direct database connections | low | **owner action** |
| S-6 | Test database password is 11 characters | low | **owner action** |
| S-7 | Supabase gives new tables and functions to the public by default | process | rule added |
| S-8 | One bad hourly row stops the retention job every night | low | accepted, check in P05/P07 |
| S-9 | The free project may pause when idle | operational | check in P07 |
| S-10 | Everything in `readings`, `settings` and `device_status` is public | by design | rule for room names |
| S-11 | The device must check the server's TLS certificate | P03 | carried to P03 |

## Findings

**S-1. The public can run `ingest_reading`.** The Supabase advisor warns about this (`anon_security_definer_function_executable`). It is the device's only way in: the device has only the public key plus its own device key. Mitigations, all tested in `ingest.backend.js`: the key is checked first and a wrong key is refused before anything else happens; `search_path = ''` (no hijacking through other schemas); strict input (exactly three fields, types, ranges, times, batch 1 to 50); a rejected call saves nothing. `authenticated` cannot run it. **Accepted.**

**S-2. Calls with a wrong key are not rate limited.** Only accepted calls count towards the 30 s limit. A wrong-key call costs one SHA-256 and one index lookup. It takes no lock and writes nothing. Guessing a 256-bit key is not possible. The remaining risk is noise and load on a free project. **Accepted.** Revisit if the logs in P07 show abuse.

**S-3. A stolen device key can write believable fake readings.** Whoever holds the key can send values that are in range, up to 50 readings per 30 s, dated up to 7 days back: at most about 144 000 rows a day. That is enough to fill the 500 MB free tier in weeks and to make the history untrustworthy. The key lives only in `.env` and later `secrets.h`. Anyone who holds the device can read it from the ESP32's flash. Mitigations: rotate the key (make a new one, update the hash, re-flash; see SCHEMA.md); watch `last_seen_at` and row counts. Possible later hardening, not a feature yet: ESP32 flash encryption (P07 discussion). **Accepted.**

**S-4. Open sign-ups (both projects).** `disable_signup = false`, email sign-up on, with email confirmation. A stranger can create an account and become the `authenticated` role. Today that role can do no more than the public can (reads only; `ingest_reading` was taken away from it). It becomes dangerous in P05 if an admin rule is written as "any signed-in user may update settings". **Owner action:** in both projects, Dashboard → Authentication → Sign In / Providers → turn off "Allow new users to sign up". The admin account is then created by invite. **P05 rule:** admin policies check a named admin (a user id in an admin list), never just `authenticated`.

**S-5. SSL is not enforced for direct database connections (both projects).** `ssl-enforcement: database false`. The web app and device use HTTPS through the API, so this concerns only the direct Postgres connections our tools make with the DB password. **Owner action:** Dashboard → Database → Settings → "Enforce SSL on incoming connections", on both projects (it may drop open connections once). I could not change it myself: the access token is read-only on purpose.

**S-6. Short test database password.** `init-test`: 11 characters. Live `init`: 16. The test project holds no real data, but its password gives full control of it. **Owner action:** reset both with Supabase's "Generate a password" (Dashboard → Database → Settings), then update `.env` (quote it in single quotes if it has `#`).

**S-7. Default privileges.** Supabase grants every new table and function in `public` to `anon` and `authenticated`. Every migration so far revokes and grants explicitly. **Rule (added to `supabase/migrations/README.md`):** every new table or function revokes from `public, anon, authenticated` and grants back only what is needed, and gets an access test.

**S-8. One bad hourly row stops the retention job.** If `readings_hourly` already has a row for an hour being rolled up, the job fails rather than drop data (tested). That can only happen after a manual insert with the secret key. The job then fails every night until someone fixes it: raw data grows, nothing is lost. **Accepted.** Check the job's result (`cron.job_run_details`) as part of device health (P05) or the field trial (P07).

**S-9. Free-tier pause.** Supabase pauses free projects that are inactive for a while. Not verified whether device traffic every 5 minutes counts as activity. Already a P07 check.

**S-10. Public data.** By design (F-07), anyone with the link can read every reading, the settings (interval, offsets, alert threshold) and the device name and room. None of it is personal. **Rule for P05:** device names and room names must not contain people's names (teachers or students). Say so next to the admin input.

**S-11. Device TLS (for P03).** The device must check Supabase's certificate (root CA in the firmware), not `setInsecure()`. Otherwise someone on the same hotspot can read the device key. Carried into P03 as a check.

## Checked and found as intended
| Check | Result |
|---|---|
| Row-level security on every table | on (`access.backend.js`, 9 tests) |
| Public write to any table | denied, 42501 |
| Public read of `devices.key_hash` | denied, 42501 |
| Public call of `heat_index_c` | denied, 42501 (probed s08) |
| Public call of `rollup_old_readings` | denied, 42501 (`retention.backend.js`) |
| Schemas reachable over the API | only `public`, `graphql_public`; `cron` refused (PGRST106) |
| Rows per request | at most 1000 |
| Functions' `search_path` | `''` on all three |
| Device key | 32 random bytes; only its SHA-256 is stored |
| Secrets in git history | none: 36 commits searched for every `.env` secret value and for key/JWT/password patterns, with a control string that was found |
| Tools printing secrets | `db.mjs` passes only the target project's secrets; `device-key.mjs` masks the password |
| Supabase security advisor | 1 warning, S-1, accepted |

## Not checked
- The live `init` project's tables and rules (none exist yet). After the live migration: the advisor and a public write probe on live.
- Supabase Auth email limits and templates (only relevant once an admin signs in, P05).
- Whether the Supabase CLI uses TLS for `db push` / `db query` (S-5 makes this moot once enforced).
