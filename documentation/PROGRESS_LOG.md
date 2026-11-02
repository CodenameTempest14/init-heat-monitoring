# Progress log

Newest first. One entry per session.

## 2026-11-02 · s18
Pushed the s17 close commits (already on both branches). P04-04 follow-ups: the white focus outline after a tap is fixed (test first; a tap counts as keyboard focus in Chromium, so a `data-touched` mark hides it) and the 04:00 temperature drop is real data (a 23.1 °C row at 20:14Z, then a 52 min gap). P04-05 installable PWA designed (header logo, icons, installed look; the owner changed the header twice), built test-first (manifest, icons, a service worker that never keeps readings), UI gates redrawn and 0 px, deployed and seen on the owner's Chrome install, Brave shortcut and iPhone: ticked. P04-06: new `tools/anon-probe.mjs`, 17/17 on init-test and live: ticked. P04-07 school-day view designed and approved (D-033), not built. README check now skips `dist`. One mistake: I ran `npm test` once; the auto-mode classifier blocked it before it wiped init-test (the P03-07 data), so nothing was lost. P03-07 is still running (ends 2026-11-03 18:03 local).

## 2026-11-02 · s17
Owner changed the offline limit to 2 min (test first). History charts (P04-04) designed with the dataviz skill, approved, and built test-first: three charts (heat index, temperature, humidity) for 24 h and 7 d, fed by a new database function `history()` that averages in the database (at most 97 / 169 rows), with a readout, table twin and PAGASA lines; the built page matches the approved images with 0 differing pixels (needed `cssMinify: false`). Verified on the hosted page and the owner's phone; P04-04 ticked. Owner applied the 7th and 8th migrations to live (read back). P03-07 started by the owner at 18:03 local with the bank at 100 %, running. 2 min offline rule still unseen offline. Pushed to `codenametempest14` and `main` up to `3740104`.


## 2026-11-02 · s16
P04-02 verified on the hosted page and the owner's phone (ticked). P04-03 offline badge: design approved by the owner, built test-first (age rule, status colours in tokens, UI gate against the approved images), deployed, and verified with the real board: unplugged 17:06, page showed Offline 3, 4 and 5 min, replugged, Online at 17:13; server gap 435 s. Rule: offline after 180 s by `received_at`. Pushed `29e3f50` to `codenametempest14` and `main`. P03-07 not started (bank not confirmed full). P04 now 8/13.

## 2026-11-02 · s15
Logo on the setup page done (icon above `Init Setup` / `Saved`; owner rejected all capitals), flashed and seen on the phone, rows resumed. P04-01 done: the web app skeleton (Vite + React, D-031) is live on Vercel (D-030, https://init-heat-monitoring.vercel.app), read-only from a logged-out browser, headers from `vercel.json` confirmed, phone view seen. P04-02 live cards: design approved (`design/home-cards/`), page built test-first with the PAGASA bands, UI-GATE matches the approved images pixel for pixel; checked locally with real data but not yet on the hosted page, so not ticked. P03-07 did not start: the power bank was still charging. A search for outdoor weather in Lapu-Lapu City gave no reliable reference for the sensor. Pushed to `codenametempest14` and `main` at the owner's request. Close report: `documentation/phase-reports/phase-03-firmware/sessions/2026-11-02_s15_CLOSE.md`.

## 2026-11-02 · s14
P03-05 done: the device keeps the hotspot in flash and, when none is saved or it cannot join at start-up, opens its own WPA2 network `Init-Setup` with the approved setup page (Android opened it by itself). Tried on the board with the owner's phone: save, power cut, refused short password, setup again with the hotspot off; server rows confirm every step. Validation, escaping and the pages are tested on the PC (the firmware page equals the approved HTML byte for byte). S-12 closed. D-029: Init logo (thermometer-i icon + wordmark) and full name "Init: Indoor Heat Index Tracker, An IoT-Based Classroom Heat Index Monitoring System". Proposal waiting: the icon on the setup page with the title `INIT SETUP`.

## 2026-11-02 · s13
P03-04 done: the OLED shows the live reading and heat index on the real board. Heat index ported to C++ and tested against the JS and the shared reference table on about 20 000 points. All 9 approved screens were drawn on the real OLED and the frame buffer read back over serial equals the approved images pixel for pixel; the owner's photos agree. The owner read the real screen (29.5 °C, 71 %, big 34) and it matches the server row. New `tools/secret-scan.mjs` (exits 1 on a hit). Fixed `tools/db.mjs` splitting quoted SQL. Live setup done by the owner (6 migrations, Init 1 interval 60, read back). D-028: the upload reply carries the room, the OLED shows it (init-test only). P03-06 done: offline buffer of 300 readings, non-blocking Wi-Fi; on the real board 5 readings taken with the hotspot off arrived in one batch with their real times.

## 2026-11-02 · s12
Reflashed the normal build. P03-03 done: the upload reply carries `interval_s`, the board follows it (90 s then 60 s). On the ROMOSS bank 90 s made the bank switch off, 60 s ran 10 minutes without a gap, so the bank limits the interval to the server's 60 s floor (D-027). Untracked PlatformIO files handled.

## 2026-11-02 · s11
P04-D4 done: owner approved the 8 Tabler screenshots; 4 pages Approved in the registry. P03-01 skeleton flashed and run on the board (after one upload of the bench project by mistake, now documented). P03-02 done: the board joins the hotspot, sets the clock and uploads over HTTPS with the certificate checked (GTS R1, R4, GlobalSign; no `setInsecure()`); rows confirmed on init-test, and a wrong-root build is refused with X509 -9984 while the server receives nothing. S-11 closed. D-026. Board left on the wrong-root test build: reflash first next session. Push asked at close.

## 2026-11-02 · s10
P03-01 done: the product firmware project `firmware/init/` builds with PlatformIO (`[SUCCESS]`, platform and 5 libraries pinned, `secrets.h` gitignored); skeleton not flashed. P04-D5 done: UI-GATE mechanism (Playwright screenshot vs approved image) built test-first, fails on a changed number, colour or width; 23/23 tests. P04-D4: 8 Tabler template screenshots taken, awaiting owner approval. s08 cron check passed (`rollup-old-readings` ran `succeeded` 2026-10-31 18:30 UTC). Push asked at close.

## 2026-11-01 · s09
Owner closed sign-ups and enforced SSL on both Supabase projects (S-4, S-5; read back with the read-only token) and reset the DB passwords (S-6; logins work). OLED design canvas done (P03-D1 to D3): 9 screens as Adafruit-GFX-style drawing code with the 5x7 font scaled 1 to 4, reference images approved by the owner, and an OLED-GATE test that compares the drawing with the images (red first, mutation-checked). D-025: screen always on (no button yet), sensor error screen approved, blue-only module. 18/18 tests. Nothing on the real OLED yet.

## 2026-10-31 · s08
P02 complete. 90-day retention job (`rollup_old_readings`, daily `pg_cron` at 18:30 UTC) built test-first and mutation-checked; hourly rows keep the room (P02-05, P02-07): 45/45 backend tests. Security review written (P02-06, `SECURITY_REVIEW.md`, S-1 to S-11); owner actions open: turn off sign-ups, enforce SSL, longer DB passwords. Owner ran the live migration and registered "Init 1" (the assistant's live push was blocked by the auto-mode classifier); checked from outside on live. Push asked at close.

## 2026-10-31 · s07
P02 started. Schema approved (P02-01) with the owner's additions: server-computed heat index and hourly maxima with time (D-023). Two Supabase projects set up (`init-test`, `init`). Tables and access rules (P02-02), device key with only its hash in the database (P02-03), and `ingest_reading` with a SQL heat index matching the JS (P02-04) built test-first on `init-test`: 41/41 backend tests. New feature F-21 device room (D-024, P02-07 partly). OLED design canvas placed at the start of P03 (D-022). Live project still empty. Pushed to `codenametempest14` and `main`.

## 2026-10-31 · s06
Bench bring-up done on the real board: 38-pin ESP32 (D-017), 3V3 = 3.273 V, OLED and DHT22 live (P01-05, P01-06). The ROMOSS bank switched off at deep-sleep current and also after about 1 min without Wi-Fi load; the always-awake design (D-018) with a Wi-Fi scan load ran 61 min (P01-04). PAGASA rounding and the NWS range rule confirmed (D-019, D-020); P01-07 ruled out (D-021). New DHT22 breadboard diagram in the schematic; VS Code upload task added. P01 complete. Pushed to `codenametempest14` and `main`.

## 2026-10-31 · s05
Start report, phase-builder answer (owner only), breadboard walkthrough for P01-05 given. Owner paused before building; bench work continues the next day. Owner has a multimeter only, so P01-07 needs a plan for measuring current. No code changes; nothing pushed.

## 2026-10-31 · s04
P01 software side: heat index and PAGASA categories written test-first and checked against the NWS chart and PAGASA's own infographic (P01-01 to 03); library licences recorded (P01-08). Design canvas started (D-016): pages, tokens, contrast check, template choices (P04-D1 to D3). Bench sketch written and compiled, not run. D-015 and D-016 recorded. Bench work moved to the next day by the owner. Nothing pushed.

## 2026-10-31 · s03
Owner changed the power to a USB power bank (ROMOSS Sense 8P+ 30 000 mAh): schematic redrawn as Rev B (D-008, D-009, D-012). Feature list F-01…F-20 written and approved on the open-source condition (D-010); Wi-Fi setup option 1 (D-011). Pre-push hook added and tested. Phase plan P01–P08 approved (D-013) and checklists created. P00 closed. Nothing built or measured on hardware; nothing pushed.

## 2026-10-30 · s02
Owner answered the open questions (hotspot, 18650 unmarked, owner-only, set up tracker). Added the phase tracker (`tools/`), Phase 0 checklist, report templates, DECISIONS, CURRENT_STATE. No feature work.

## 2026-10-30 · s01
Project started. Carried the Ad Astra hard rules into CLAUDE.md. Chose stack Option A. Drafted the Rev A hardware schematic (`hardware/schematic.html`), not built.
