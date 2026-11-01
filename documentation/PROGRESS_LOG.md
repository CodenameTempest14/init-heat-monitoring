# Progress log

Newest first. One entry per session.

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
