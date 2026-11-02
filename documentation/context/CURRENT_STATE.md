# CURRENT STATE

> Overwritten at every session close. The first file read in every session (CLAUDE.md).

**Project:** Init: Indoor Heat Index Tracker, An IoT-Based Classroom Heat Index Monitoring System (D-029).
**Current phase:** P03 Device firmware (9/10: only P03-07 left, waiting for the owner to start the 24 h run). P04 web app is built in parallel (P04-01 to P04-03 done). Checklists: [P03](../phases/phase-03-firmware.md), [P04](../phases/phase-04-web-app.md).
**Last session:** 2026-11-02 s16 — [close report](../phase-reports/phase-03-firmware/sessions/2026-11-02_s16_CLOSE.md)
**Branches:** owner = `codenametempest14`. Remote `origin` = https://github.com/CodenameTempest14/init-heat-monitoring.git. `29e3f50` is pushed to `codenametempest14` and `main` (owner approved, s16). The P04-03 tick and the s16 close commit are local until the owner approves a push (check `git status -sb`).
**Status line:** run `node tools/phase-report.mjs` · progress table: `node tools/phase-report.mjs --md`
**Phase builder:** owner only (answered s16). Ask again at the start of every session.
**Board:** COM8 (CP210x). Flash from the terminal in `firmware/init` (`pio run -t upload --upload-port COM8`, hold BOOT on `Connecting....`), not from the VS Code toolbar (see `firmware/README.md`). The board has the s15 firmware (logo on the setup page, titles `Init Setup` / `Saved`) and joined the owner's hotspot at 07:02Z. Running the normal build with P03-05: the hotspot is saved in the board's flash (owner's hotspot), not in `secrets.h`. With no saved network, or when it cannot be joined for 20 s at start-up, the board opens `Init-Setup` (WPA2, password = `SECRET_SETUP_PASS`, last line of the local `secrets.h`) with the page at 192.168.4.1. Opening the serial port may or may not reset the board; my PowerShell background serial recording repeated text in s14, so prefer the server as evidence.
**Security settings:** sign-ups off and SSL enforced on both projects (read back 2026-11-01, S-4 and S-5 closed). S-12 (setup page) closed s14.
**Supabase:** account `CodenameTempest14`. Projects `init-test` (tests, may be wiped) and `init` (live), both Singapore. `init-test` has 7 migrations; live `init` has 6 and needs the 7th (`20261102140000_ingest_returns_room.sql`, D-028; owner runs `node --env-file=.env tools/db.mjs live db push`). init-test device "Room 1" has `interval_s` = 60. Live device "Init 1", room "Unassigned", `interval_s` 60, no readings yet. The real board uploads to **init-test** (device "Room 1") until P03 is done (D-026). Keys in `.env` (gitignored, template `.env.example`). The access token is read-only on purpose; writes go through the DB password (`tools/db.mjs`, `tools/device-key.mjs`). Claude Code's auto-mode classifier blocks `tools/db.mjs live ...` writes from the assistant: the owner runs live writes in the terminal. Readings columns: `temp_c`, `rh_pct`, `heat_index_c`, `recorded_at`, `received_at`, `room`.
**Web app (P04, s16):** P04-02 cards and the P04-03 online/offline badge are live and verified (offline = newest reading more than 180 s old by `received_at`; status colours in `design/tokens.json`; UI gates `tests/ui-gate-home.test.js` and `tests/ui-gate-badge.test.js`). Set up in s15: `web/` = Vite 8.3.5 + React 19.3.1 + `@tabler/core` 1.7.3, plain `fetch` to the Supabase REST address (no `supabase-js`). Live at https://init-heat-monitoring.vercel.app (Vercel Hobby, non-commercial, D-030; imported from the GitHub repo, Root Directory `web`; every push deploys). Reads **init-test** with the public key (`npm run config` in `web/`; `npm run config -- live` switches, then also change the Supabase host in `web/vercel.json`, whose CSP names it). Needs `npm install` in `web/` before `npm test` (the UI gate builds `web/` and uses Chromium). Room shows `Unassigned` on purpose (owner).
**Windows note:** commit messages containing `"` must go through `git commit -F <file>` (PowerShell 5.1 mangles them).

## Recommended model for the next session (MDL-1)
**Sonnet 5.5**: 24 h run evidence, the P04-04 chart design and build. Opus 5.5 only for the admin sign-in in P05.

## Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. Ask the owner to approve a push of the s16 close commits to `codenametempest14` and `main`, naming both targets.
3. **P03-07** 24-hour run on the ROMOSS bank, **when the owner says it is full** (not confirmed full at s16 close). Owner notes the bank level and start time, unplugs USB, runs the board on the bank. Evidence from the server: one row a minute for 24 h (init-test, device "Room 1"; the room shows `Unassigned`, which is fine), gaps listed with their cause; bank level at the end = the measured drop. Interval stays 60 s (D-027). Old init-test rows stay (owner told to leave them; count with a time window; the s16 unplug test left one 435 s gap, 09:05:45Z to 09:13:00Z, before the run). Do not run the backend tests during the run (they wipe init-test).
4. Next P04 items, each needs a **design mock approved first** (D-016): P04-04 24 h and 7 d charts (F-04; read the `dataviz` skill first), then P04-05 PWA (manifest, service worker, **favicon, home-screen icons and the header logo: the owner chose to add them here**), P04-06 to P04-08. Also confirm with the owner that 3 min is the wanted offline limit (a short Wi-Fi drop can show Offline for a few minutes).
5. Not done: sensor accuracy check against a reference thermometer next to the board; the anonymous-write recheck; desktop layout is in the mocks only; iPhone; light mode of the setup page and of the badge on the phone. Open: page loads took 2.7 to 4.2 s (Supabase cold start?); the stylesheet is 692 kB (all of Tabler, trim later).
6. Not tried for P03-05: the 10-minute setup timeout, an iPhone. Not tried for P03-06: queue over 50, a full queue, the 400 drop. Flash is 77.0 % full (matters for P08 OTA).
7. Before the board moves to live: apply the 7th migration to live `init` (owner).
8. Before every commit run `node tools/secret-scan.mjs` (exits 1 on a hit; it also guards the hotspot name). Inline SQL works: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`.

## Waiting on the owner
- Say when the power bank is full, the start time and the bank's level (P03-07).
- Approve a push of the s16 close commits to `codenametempest14` and `main`.
- Say if 3 min is the wanted offline limit.
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Apply the 7th migration to live `init` before the board moves to live (D-028). Later: dummy load or another bank (D-027).
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones.
- Optional: a reference thermometer and hygrometer for the sensor check. Later (P07): a USB inline meter for the awake current.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).

## Decisions so far (all in DECISIONS.md)
D-001 hardware parts · D-002 stack Option A · D-003 scope · D-004 pocket 4G router/hotspot · D-005 unmarked 18650 cells · D-006 MP1584 buck at 5.20 V with D1 · D-007 brand name **Init** · D-008 USB power bank replaces cells/buck/BMS · D-009 30-pin ESP32, SSD1306 128×64, no BMS · D-010 features approved if open source · D-011 Wi-Fi option 1 · D-012 confirmed hardware and ROMOSS bank · D-013 phase plan · D-014 owner may push main · D-015 heat index option A · D-016 design canvas option 1 · D-017 38-pin ESP32 with Type-C · D-018 no deep sleep · D-019 PAGASA bands on rounded heat index · D-020 NWS range rule · D-021 P01-07 ruled out · D-022 OLED design canvas at the start of P03 · D-023 server computes and stores the heat index · D-024 F-21 device room assignment · D-025 OLED always on, sensor error screen, blue module, 5x7 font · D-026 temporary Wi-Fi in secrets.h until P03-05 (ended s14), init-test first, roots GTS R1 + R4 + GlobalSign · D-027 reply carries interval_s; the bank needs an upload at least every 60 s · D-028 reply carries the room name · D-029 logo (B icon + A wordmark) and full name; setup page approved, title centred · D-030 hosting on Vercel · D-031 web app on Vite + React, init-test first, public key in the repo. Pre-push hook active via `core.hooksPath .githooks`.

## Built so far
`src/heat-index.js` and tests; `design/` (pages, tokens, contrast check, registry, `brand/` logo and icon, `device-setup/` approved setup page + `proposal-logo/`, `oled/` canvas, `templates/` Tabler shots, `ui-gate.mjs`); `firmware/bench`; `supabase/migrations/` (7 on init-test, 6 on live); `tests/backend/` (48, test project only); `documentation/specs/SECURITY_REVIEW.md` (S-1 to S-12); `tools/` (`db.mjs`, `device-key.mjs`, `secret-scan.mjs`, `phase-report.mjs`, `continuation-prompt.mjs`, `check-readmes.mjs`); `firmware/init/` (P03-01 to P03-06: HTTPS upload with certificate check, interval from the reply, OLED screens, offline queue, room from the reply, setup page with Wi-Fi in flash; PC tests for each pure header). `web/` (P04-01 to P04-03 live on Vercel) with `design/home-cards/` and `design/offline-badge/` (approved mocks) and the UI gates `tests/ui-gate-home.test.js`, `tests/ui-gate-badge.test.js`. `npm test` 76/76 (run `npm install` at the root, `npm install` in `web/` and `npx playwright install chromium` first; needs g++).

## Parking lot (out of scope — not being pursued)
- Cellular module on the device (not chosen; revisit only if the hotspot plan fails).
- On-board battery charger (cells are charged outside the device).
