# CURRENT STATE

> Overwritten at every session close. The first file read in every session (CLAUDE.md).

**Project:** Init: Indoor Heat Index Tracker, An IoT-Based Classroom Heat Index Monitoring System (D-029).
**Current phase:** P03 Device firmware (9/10: only P03-07 left). P04 design items can be interleaved. Checklists: [P03](../phases/phase-03-firmware.md), [P04](../phases/phase-04-web-app.md).
**Last session:** 2026-11-02 s14 — [close report](../phase-reports/phase-03-firmware/sessions/2026-11-02_s14_CLOSE.md)
**Branches:** owner = `codenametempest14`. Remote `origin` = https://github.com/CodenameTempest14/init-heat-monitoring.git. s13 is pushed. s14 commits are local unless the owner approved the push at close (check `git status -sb`).
**Status line:** run `node tools/phase-report.mjs` · progress table: `node tools/phase-report.mjs --md`
**Phase builder:** owner only (answered s14). Ask again at the start of every session.
**Board:** COM8 (CP210x). Flash from the terminal in `firmware/init` (`pio run -t upload --upload-port COM8`, hold BOOT on `Connecting....`), not from the VS Code toolbar (see `firmware/README.md`). Running the normal build with P03-05: the hotspot is saved in the board's flash (owner's hotspot), not in `secrets.h`. With no saved network, or when it cannot be joined for 20 s at start-up, the board opens `Init-Setup` (WPA2, password = `SECRET_SETUP_PASS`, last line of the local `secrets.h`) with the page at 192.168.4.1. Opening the serial port may or may not reset the board; my PowerShell background serial recording repeated text in s14, so prefer the server as evidence.
**Security settings:** sign-ups off and SSL enforced on both projects (read back 2026-11-01, S-4 and S-5 closed). S-12 (setup page) closed s14.
**Supabase:** account `CodenameTempest14`. Projects `init-test` (tests, may be wiped) and `init` (live), both Singapore. `init-test` has 7 migrations; live `init` has 6 and needs the 7th (`20261102140000_ingest_returns_room.sql`, D-028; owner runs `node --env-file=.env tools/db.mjs live db push`). init-test device "Room 1" has `interval_s` = 60. Live device "Init 1", room "Unassigned", `interval_s` 60, no readings yet. The real board uploads to **init-test** (device "Room 1") until P03 is done (D-026). Keys in `.env` (gitignored, template `.env.example`). The access token is read-only on purpose; writes go through the DB password (`tools/db.mjs`, `tools/device-key.mjs`). Claude Code's auto-mode classifier blocks `tools/db.mjs live ...` writes from the assistant: the owner runs live writes in the terminal. Readings columns: `temp_c`, `rh_pct`, `heat_index_c`, `recorded_at`, `received_at`, `room`.
**Windows note:** commit messages containing `"` must go through `git commit -F <file>` (PowerShell 5.1 mangles them).

## Recommended model for the next session (MDL-1)
**Sonnet 5.5** for P03-07 (24 h on the power bank: mostly waiting and reading the server). **Opus 5.5** only if the logo-on-the-setup-page proposal is approved and built in the same session (it changes the page code that handles the Wi-Fi password).

## Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. **P03-07** 24-hour run on the ROMOSS bank: owner charges it fully, notes the bank's charge level and the start time, unplugs USB from the PC, runs the board on the bank. Evidence from the server: one row a minute for 24 h (init-test, "Room 1"), gaps listed with their cause; bank level at the end = the measured drop. Keep the interval at 60 s (D-027).
3. **Owner decides** on `design/device-setup/proposal-logo/` (Init icon above the title, title `INIT SETUP`; open question: should the "Saved" title be `SAVED` too?). If approved: steps in that folder's README (copy over the approved pages, re-capture `ref/`, change `wifi_setup.h` until `tests/firmware-setup-page.test.js` passes, flash, check on the phone).
4. Not tried for P03-05: the 10-minute setup timeout, an iPhone, light mode on the phone. Not tried for P03-06: queue over 50, a full queue, the 400 drop. Flash is 76.9 % full (matters for P08 OTA).
5. Before the board moves to live: apply the 7th migration to live `init` (owner).
6. Open: the Tabler dashboard is about 832 px wide at a 390 px viewport (cause not diagnosed); our home page must not scroll sideways.
7. Before every commit run `node tools/secret-scan.mjs` (exits 1 on a hit; it also guards the hotspot name through the old `SECRET_WIFI_*` lines kept in the local `secrets.h`). Inline SQL works: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`.

## Waiting on the owner
- Push of the s14 commits to `codenametempest14` and `main` (asked at close).
- Logo-on-the-setup-page proposal: approve or change (`design/device-setup/proposal-logo/ref/`).
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Apply the 7th migration to live `init` before the board moves to live (D-028). Later: dummy load or another bank (D-027).
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones.
- Later (P07): a USB inline meter to measure the awake current.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).

## Decisions so far (all in DECISIONS.md)
D-001 hardware parts · D-002 stack Option A · D-003 scope · D-004 pocket 4G router/hotspot · D-005 unmarked 18650 cells · D-006 MP1584 buck at 5.20 V with D1 · D-007 brand name **Init** · D-008 USB power bank replaces cells/buck/BMS · D-009 30-pin ESP32, SSD1306 128×64, no BMS · D-010 features approved if open source · D-011 Wi-Fi option 1 · D-012 confirmed hardware and ROMOSS bank · D-013 phase plan · D-014 owner may push main · D-015 heat index option A · D-016 design canvas option 1 · D-017 38-pin ESP32 with Type-C · D-018 no deep sleep · D-019 PAGASA bands on rounded heat index · D-020 NWS range rule · D-021 P01-07 ruled out · D-022 OLED design canvas at the start of P03 · D-023 server computes and stores the heat index · D-024 F-21 device room assignment · D-025 OLED always on, sensor error screen, blue module, 5x7 font · D-026 temporary Wi-Fi in secrets.h until P03-05 (ended s14), init-test first, roots GTS R1 + R4 + GlobalSign · D-027 reply carries interval_s; the bank needs an upload at least every 60 s · D-028 reply carries the room name · D-029 logo (B icon + A wordmark) and full name; setup page approved, title centred. Pre-push hook active via `core.hooksPath .githooks`.

## Built so far
`src/heat-index.js` and tests; `design/` (pages, tokens, contrast check, registry, `brand/` logo and icon, `device-setup/` approved setup page + `proposal-logo/`, `oled/` canvas, `templates/` Tabler shots, `ui-gate.mjs`); `firmware/bench`; `supabase/migrations/` (7 on init-test, 6 on live); `tests/backend/` (48, test project only); `documentation/specs/SECURITY_REVIEW.md` (S-1 to S-12); `tools/` (`db.mjs`, `device-key.mjs`, `secret-scan.mjs`, `phase-report.mjs`, `continuation-prompt.mjs`, `check-readmes.mjs`); `firmware/init/` (P03-01 to P03-06: HTTPS upload with certificate check, interval from the reply, OLED screens, offline queue, room from the reply, setup page with Wi-Fi in flash; PC tests for each pure header). `npm test` 38/38 (run `npm install` and `npx playwright install chromium` first; needs g++).

## Parking lot (out of scope — not being pursued)
- Cellular module on the device (not chosen; revisit only if the hotspot plan fails).
- On-board battery charger (cells are charged outside the device).
