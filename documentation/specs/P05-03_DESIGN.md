# P05-03 design: heat alerts by web push (DRAFT, s30, 2026-11-04)

**Status:** on paper only. Nothing is applied to any database, nothing is built, no keys exist yet. The feature is
already approved: F-10 (Tier 2, 2026-10-31) and its details P5-f, P5-g, P5-h (FEATURES.md, owner, s22). This file is
the plan for the build session (Opus 5.5). The items marked **DECIDE** need the owner's answer before building; the
parts marked **NEW PIECE** are design details that the approved text does not name, so they need the owner's OK too.

## 1. The idea in one picture

```
Phone (installed app) ── taps "Send me heat alerts" ── browser asks permission ── gets a push address
                      ── push_subscribe(address, keys) ──▶ database stores it (nobody can read it back)

Device ── ingest_reading (as today) ──▶ readings row
Database trigger on the new row:
   is it fresh (recorded in the last 5 min)?  is the heat index at or over the admin's threshold?
   has the quiet period passed since the last alert for this device?
   ── all yes ──▶ write one row in `alerts`, start the quiet period (one atomic update)
              ──▶ pg_net calls the Edge Function `send-alert` with the alert id and a shared secret
Edge Function ── reads the alert and all subscriptions (service key, server only)
              ── sends "Heat index 43 °C (Danger) in Room 204." to each phone (Web Push, VAPID private key)
              ── deletes addresses the push service says are gone (404 / 410); writes sent / failed counts
Phone ── service worker `push` event ── shows the notification; a tap opens the app
```

The decision "send or not" lives in SQL, where the backend tests can check it without a phone. The Edge Function only
delivers. Nothing in the browser decides who gets an alert.

## 2. Database (one new migration, `..._push_alerts.sql`)

| Piece | What | Notes |
|---|---|---|
| `push_subscriptions` | `id uuid pk`, `endpoint text unique`, `p256dh text`, `auth text`, `created_at timestamptz` | RLS on, **no policies, no grants** to anon or authenticated: nobody reads it through the REST address. Only the Edge Function (service key). No name, no email, no device of the person (P5-h). |
| `push_subscribe(endpoint, p256dh, auth)` | `security definer`; checks: `https://` only; host in a short list of real push services (Google `fcm.googleapis.com`, Mozilla `updates.push.services.mozilla.com`, Apple `*.push.apple.com`, Microsoft `*.notify.windows.com`); lengths capped (endpoint 1000, keys 200); refuses when the table is full (cap, **DECIDE 5**). Same endpoint again = keys updated, no second row. | Granted to anon. The host list stops our server from being used to send requests to any address a stranger types (it would otherwise post to that address). |
| `push_unsubscribe(endpoint, auth)` | Deletes the row only when **both** match | Only the phone knows its `auth` secret, so a stranger can remove only their own (P5-h). |
| `alerts` **NEW PIECE** | `id`, `device_id`, `heat_index_c`, `room`, `created_at`, `sent int`, `failed int` | A log: one row per alert. Lets the tests check the rule, lets the admin see that alerts went out, and gives the paper real data. Not readable by anon. Old rows removed by the existing retention job (same age as readings). |
| `alert_state` | `device_id pk`, `last_alert_at` | The quiet period. Updated with one `update ... where last_alert_at is null or last_alert_at < now() - quiet returning`, so two readings arriving together cannot both send. |
| Trigger `after insert on readings` | Runs the rule in section 3; on "yes" inserts into `alerts` and calls `net.http_post` | Needs the `pg_net` extension (free on Supabase). The function address and the shared secret are kept in **Supabase Vault**, not in the migration. |

## 3. The alert rule

Send an alert for a device when **all** are true:

1. The reading is **fresh**: `recorded_at` is within 5 minutes of now. After a Wi-Fi gap the device sends its queued
   readings in one batch (P03-04); an hour-old Danger reading must not wake phones now.
2. The heat index is at or over `settings.alert_heat_index_c` (default 42 = Danger). Compared on the **rounded** heat
   index, the same value that picks the PAGASA level on screen (D-019), so the phone never says Danger while the page
   says Extreme caution (**DECIDE 4**).
3. No alert for this device in the last `settings.alert_quiet_min` minutes (default 60).
4. What happens after the quiet period while it is still hot: **DECIDE 1**.

The admin already can change the threshold (27 to 60) and the quiet period (10 to 1440) in `#admin` (P05-02 fields
exist), so no new admin control is needed.

## 4. The message (P5-g)

- Title: `Init heat alert`. Body: `Heat index 43 °C (Danger) in Room 204.` Level name from the same PAGASA bands as the
  page. A room left `Unassigned` reads `in Unassigned`, as on the OLED.
- No advice text until a teacher reviews it (F-15, D-034). The teacher also reviews the two lines above before live.
- A tap on the notification opens the app's home page.

## 5. Keys (VAPID)

- One key pair per project (test and live). A small tool `tools/vapid-keys.mjs` (**NEW PIECE**) makes a pair with
  Node's own crypto (P-256), prints the **public** key and writes the private one only to `.env` (gitignored).
- The public key goes in `web/src/config.js` (public by design, like the anon key).
- The private key goes to the Edge Function secrets with `supabase secrets set` (**the owner runs this**: Claude Code's
  classifier blocks live writes, and the private key should not pass through chat). `secret-scan.mjs` gets the new
  name so a leak is caught before a commit.
- The shared secret between the database and the Edge Function: a long random value in Vault and in the function's
  secrets. The function refuses any call without it (the function address is public).

## 6. Web app

- **Where the button lives (DECIDE 3).** P5-h lets anyone subscribe, so it is on the public side. Suggestion: a row
  `Heat alerts ›` under `School day summary ›` that opens a small `#alerts` view: one sentence on what it does, the
  **Send me heat alerts** button (then **Stop alerts**), and the current threshold ("when the heat index reaches 42 °C").
  Mock first (design canvas, approved before building, like every page).
- The button asks for notification permission **only when tapped**, never on page load.
- What each phone sees:
  - Android Chrome or Brave, desktop: button works.
  - **iPhone not installed:** "On iPhone, add Init to your Home Screen first, then open it from there." (iOS 16.4 and
    later only allow web push for installed apps.) Not seen on a real iPhone yet: risk.
  - Permission denied, or no push support: a plain line saying alerts are off on this phone and why.
- `web/public/sw.js` gets a `push` handler (show the notification with the app icon) and a `notificationclick`
  handler (open or focus the app). It still never stores readings. `tests/web-pwa.test.js` is extended.
- CSP: subscribing is done by the browser itself, not by `fetch`, so `connect-src` likely needs no change. Check on the
  hosted page.

## 7. Edge Function `send-alert` (first Edge Function of the project; `supabase/functions/`, with a README)

- Deno (Supabase's runtime). Gets `{ alert_id }` and the secret header; anything else is refused.
- Reads the alert and the subscriptions with the service key that Supabase gives the function (never sent to the page).
- Sends with a Web Push library (to confirm in the build session which one runs on Deno: `npm:web-push` or a Deno-native
  one; checked before writing code, not assumed).
- 404 / 410 from a push service: delete that subscription. Writes `sent` and `failed` into the alert row.
- Message building is a small pure file shared with a Node test, so the wording and levels are tested without Deno.
- Free tier: one call per alert (at most one per quiet period per device), far below the free monthly limit.

## 8. Tests first (seen failing before the migration exists)

Backend (`tests/backend/push.backend.js`, throwaway devices, safe to run alone):

| Check | Expected |
|---|---|
| anon reads, inserts, updates, deletes `push_subscriptions`, `alerts`, `alert_state` directly | refused |
| `push_subscribe` with `http://`, an unknown host, an over-long endpoint | refused |
| `push_subscribe` with a valid Google / Mozilla / Apple address | stored; the same endpoint twice = one row |
| `push_subscribe` when the table is at the cap | refused |
| `push_unsubscribe` with the right endpoint but wrong `auth` | nothing removed |
| fresh reading, rounded heat index at threshold | one `alerts` row |
| a second fresh Danger reading inside the quiet period | no new row |
| after the quiet period (rule from DECIDE 1) | new row, or not |
| a Danger reading recorded 10 minutes ago (queued batch) | no row |
| 41.6 °C with threshold 42 (rounds to 42) / 41.4 °C | row / no row (DECIDE 4) |
| two Danger readings in one batch call | one row |
| admin raises the threshold to 45, reading at 43 | no row |

Also: `tools/anon-probe.mjs` gets the new tables and functions (21 checks today); Node test for the message file; the
web gate for the `#alerts` mock; `tests/web-pwa.test.js` for the push handlers.

**End-to-end on a real phone (the checklist evidence for P05-03):** on init-test, the owner subscribes on the Android
phone, sets the threshold low in `#admin` (for example 30, a real save, which also helps P05-02), and waits for the next
upload: the notification arrives on the phone; a second one does not come inside the quiet period. Screenshot of the
notification. Then the threshold goes back to 42.

## 9. Order of work for the build session

1. Owner answers the DECIDEs and approves the NEW PIECEs here.
2. Write the backend tests, run them against the current schema, **watch them fail**.
3. Write the migration; the owner applies it to init-test; tests green; the probe updated.
4. Make the test VAPID pair and secrets (owner sets the function secrets); write and deploy `send-alert` to init-test.
5. Mock the `#alerts` view, owner approves, build it and the service worker handlers test-first; look at it in a
   browser and on the phone.
6. End-to-end test on the phone (section 8). Tick P05-03 with the screenshot.
7. Live: the same migration, a live key pair and secrets, the function deployed to live. Only useful once the device
   uploads to live (D-026), so it may wait for that step.
8. Paper (rule 5): the alert flow in Chapter 2 (a diagram) and the result in Chapter 3.

## 10. Questions for the owner

- **DECIDE 1, still hot after the quiet period.** (a) Send again every quiet period while the heat index stays at or
  over the threshold (a reminder; with the default, at most one alert an hour). (b) Send again only after it drops
  below the threshold and then reaches it again. **I suggest (a):** it matches the approved P5-f text ("then stays
  quiet for the quiet period"), and the admin can lengthen the quiet period up to 24 h if it is too often.
- **DECIDE 2, how the database starts the send.** (a) A trigger on each new reading calls the Edge Function only when
  an alert is due (one call per alert, seconds after the upload). (b) A job every minute calls the function, which
  checks the newest reading (simpler wiring, up to a minute late, about 43,000 calls a month). **I suggest (a).**
- **DECIDE 3, where the button lives.** A `Heat alerts ›` row under `School day summary ›` that opens `#alerts`
  (suggested), or the button directly on the home page under the cards. Either way a mock comes first.
- **DECIDE 4, rounded or exact heat index for the threshold.** Rounded (suggested, matches the level on the page) or
  the exact stored value.
- **DECIDE 5, cap on subscriptions.** Suggested 300 (a school with several classes and teachers); a stranger cannot
  fill the free database with fake rows. The cap can be raised later.
- **NEW PIECES to approve:** the `alerts` log table, `tools/vapid-keys.mjs`, and the `#alerts` view (if DECIDE 3 = row).
- **Teacher review:** the notification title and body (section 4) before alerts go live (D-034).
