# P05-01 / P05-05 design: admin login and the refusal rules (DRAFT, s22, 2026-11-02)

**Status:** on paper only. Nothing is applied to any database, nothing is built. Written while the 24 h run (P03-07) is going, because the backend tests cannot run until it ends. Features are already approved (FEATURES.md, P5-a to P5-j). This file is the plan for the build session (Opus 5.5), not a new feature. The two items marked **DECIDE** need the owner first.

## 1. The idea in one picture

```
Owner (once, by hand) ── creates the admin user in the Supabase dashboard (sign-ups stay off)
                      ── adds that user's id to `admins` with tools/db.mjs
Admin in the browser ── POST /auth/v1/token (email + password) ── gets a short-lived token
                      ── calls the same REST address as everyone, but the token says "authenticated"
Database ── every admin action asks one question: is_admin()  → is auth.uid() in `admins`?
Anyone else (anon, or a signed-in stranger) ── is_admin() = false → refused by the database
```

Signed in is not the same as admin (S-4). The page can hide the admin view from strangers, but only the database decides.

## 2. Database (one new migration, `..._admin.sql`)

| Piece | What | Notes |
|---|---|---|
| `admins` | `user_id uuid primary key references auth.users(id) on delete cascade` | RLS on, **no policies**, so nobody (not even a signed-in user) can read or change it through the REST address. Only the owner, with the DB password. Deleting the user deletes the row. |
| `is_admin()` | `security definer`, `stable`, `set search_path = ''`, returns `exists(select 1 from public.admins where user_id = auth.uid())` | `execute` revoked from public; granted to `authenticated` only. Used inside policies as `(select public.is_admin())`. |
| `settings` update | policy `for update to authenticated using ((select is_admin())) with check ((select is_admin()))`; column grant `update (interval_s, temp_offset_c, rh_offset_pct, alert_heat_index_c, alert_quiet_min)` | `device_id` and any other column cannot change. The CHECK ranges in SCHEMA.md still apply to the admin. No insert or delete policy. |
| `admin_set_room(p_device uuid, p_room text)` | `security definer`; refuses unless `is_admin()`; trims the text; 1 to 60 characters; updates `devices.room` | An RPC and not a direct update, because `devices` holds `key_hash` and is not readable by users, which makes row-level update rules awkward. Old readings keep their room (the ingest function already copies it). |
| Not changed | `readings`, `readings_hourly`, `devices`: still no insert, update or delete for anon or authenticated | The admin cannot edit readings either; that is deliberate. |

## 3. Web app (plain `fetch`, no `supabase-js`, D-031)

- A `#admin` view (no link on public pages). Sign-in form: email + password → `POST {url}/auth/v1/token?grant_type=password`.
- The token stays in `sessionStorage` (cleared when the tab closes; wrapped in try/catch like the other storage). Refresh with the refresh token before expiry; **Sign out** clears both. The service worker already never keeps readings; it must also never keep anything from `/auth/`.
- Wrong password: one plain message, no hint whether the email exists. Supabase's own rate limits cover guessing.
- A signed-in non-admin sees "This account is not an admin" (the answer to an `is_admin()` call), and every call they try is refused by the database anyway.
- `web/vercel.json` CSP already names the Supabase host; sign-in uses the same host, so it likely needs no change (check).
- Room box text: "Use a room name such as Room 204. Do not use people's names." (S-10).

## 4. Tests first (they must be seen failing before the migration exists)

Three callers, created by the test with the secret key (`/auth/v1/admin/users`): **anon**, **a signed-in user who is not an admin**, **the admin** (its id inserted into `admins`).

| Action | anon | non-admin | admin |
|---|---|---|---|
| update any `settings` column | refused | refused | allowed in range, **refused out of range** (CHECK) |
| update `settings.device_id` | refused | refused | refused |
| insert or delete a `settings` row | refused | refused | refused |
| `admin_set_room` | refused | refused | allowed; 0 and 61 characters refused; new readings get the new room, old keep theirs |
| read, insert, update, delete `admins` | refused | refused | refused |
| call `is_admin()` | refused | `false` | `true` |
| insert, update, delete `readings` | refused | refused | refused |
| read `devices.key_hash` | refused | refused | refused |

Also: remove the admin row → the same admin token is refused on the very next call. Delete the user → refused. A forged or expired token → refused. `tools/anon-probe.mjs` gets the new function names so the stranger probe covers them (17 checks today).

## 5. Order of work for the build session

1. Create the two test users and write the tests above; run them against the current schema and **watch them fail** (they cannot, until the run ends, because the backend tests wipe init-test).
2. Write the migration; the owner applies it to init-test; run the tests until green.
3. Build the sign-in view; look at it in a real browser and on the phone (not only the build).
4. Owner creates the live admin user and adds the id (live writes are done by the owner in the terminal); apply the migration to live; run the probe against live.
5. Tick P05-01 and P05-05, then P05-06 (the room box) on the same base.

## 6. Questions for the owner

**Owner, s22 (2026-11-02): DECIDE 1 = (a) and DECIDE 2 = OK, both approved.** The range stays 60 to 3600 with a warning on the admin page about the power bank, and no raw column is added.

- **DECIDE 1, interval limit (this changes P5-d).** SCHEMA.md allows `interval_s` 60 to 3600, and the firmware accepts only 60 to 3600. The bank needs an upload at least every 60 s (D-027). So a cap of 60 s on the bank leaves a range of exactly one value. Options: (a) keep 60 to 3600 and show a warning on the admin page, "on the power bank, anything above 60 s may switch it off"; (b) lower the database maximum to 60 and raise it again with a different power source. I suggest (a), because the warning is visible and nothing needs a firmware change.
- **DECIDE 2, raw values.** P5-e said the raw value is kept. SCHEMA.md stores the corrected value and the offset that was applied, so raw = corrected − offset. Nothing is lost, so no new column. OK?
- Which email should the admin account use? The password is made by you in the dashboard (long and generated), never typed to me or committed.
- Second factor for the admin: suggested for P07, not now.
