# CURRENT STATE

> Overwritten at every session close. The first file read in every session (CLAUDE.md).

**Current phase:** P03 Device firmware (7/10: P03-D1 to D3 and P03-01 to P03-04 done; P03-05 to P03-07 next). P04 design items can be interleaved. Checklists: [P03](../phases/phase-03-firmware.md), [P04](../phases/phase-04-web-app.md).
**Last session:** 2026-11-02 s13 — [close report](../phase-reports/phase-03-firmware/sessions/2026-11-02_s13_CLOSE.md)
**Branches:** owner = `codenametempest14`. Remote `origin` = https://github.com/CodenameTempest14/init-heat-monitoring.git. s12 was pushed with the owner's approval; s13 is committed locally and not pushed unless the close report says so (check `git status -sb`).
**Status line:** run `node tools/phase-report.mjs` · progress table: `node tools/phase-report.mjs --md`
**Phase builder:** owner only (answered s12). Ask again at the start of every session.
**Board:** COM8 (CP210x). Flash from the terminal in `firmware/init` (`pio run -t upload --upload-port COM8`, hold BOOT on `Connecting....`), not from the VS Code toolbar (see `firmware/README.md`). Running the normal build with P03-04 (OLED screens, 5 s refresh). The `esp32dev_screens` build (OLED-GATE frame-buffer dump) is for checks only: flash the normal build after it. Opening the serial port resets the board, so the first upload after a read can get `429`: expected. The owner may have unplugged it.
**Security settings:** sign-ups off and SSL enforced on both projects (read back 2026-11-01, S-4 and S-5 closed).
**Supabase:** account `CodenameTempest14`. Projects `init-test` (tests, may be wiped) and `init` (live), both Singapore. `init-test` has 6 migrations (the 6th, `20261102120000_ingest_returns_interval.sql`, returns `interval_s`); live `init` has 5 and needs the 6th (owner runs `node --env-file=.env tools/db.mjs live db push`). init-test device "Room 1" has `interval_s` = 60. Live device "Init 1", room "Unassigned", no readings yet. The real board uploads to **init-test** (device "Room 1") until P03 is done (D-026). Keys in `.env` (gitignored, template `.env.example`). The access token is read-only on purpose; writes go through the DB password (`tools/db.mjs`, `tools/device-key.mjs`). Claude Code's auto-mode classifier blocks `tools/db.mjs live ...` writes from the assistant: the owner runs live writes in the terminal.
**Windows note:** commit messages containing `"` must go through `git commit -F <file>` (PowerShell 5.1 mangles them).

## Recommended model for the next session (MDL-1)
**Sonnet 5.5** for P03-06 and P03-07. **Opus 5.5** for P03-05 (setup page: it takes Wi-Fi passwords from a phone).

## Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. **P03-06** offline buffer (F-11): keep readings while the hotspot is down, send them later, show `N to send` on the offline screen (OLED-04; `screens::reading` already takes `queued`). Test-first the buffer logic on the PC. `loop()` still blocks up to 20 s in `joinWifi()`: restructure so the display and sensor keep running while offline.
3. Then **P03-05** (setup page, Opus 5.5), then P03-07 (24 h on the bank).
4. **D-028 (owner said yes, s13):** the upload reply carries the room name for the OLED strip. Write the backend test first (init-test), add a migration, then have the firmware read it (fallback `Room 1`). Not built yet. The sensor-error and offline screens were only checked in the screens build.
5. Open: the Tabler dashboard is about 832 px wide at a 390 px viewport (cause not diagnosed); our home page must not scroll sideways.
6. Before every commit run `node tools/secret-scan.mjs` (exits 1 on a hit). `tools/db.mjs` now quotes arguments, so inline SQL works: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`.

## Waiting on the owner
- ~~D-027 live setup~~ **Done 2026-11-02 (s13):** live `init` has all 6 migrations (read back with `live migration list`), and "Init 1" has `interval_s` 60 (owner ran the update in the dashboard SQL Editor, because the CLI token is read-only; read back by the assistant). Still to decide, later: dummy load or another bank. The board still uploads to init-test until P03 is done (D-026).
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones (the assistant only knows the logins work).
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).

## Decisions so far (all in DECISIONS.md)
D-001 hardware parts · D-002 stack Option A · D-003 scope · D-004 pocket 4G router/hotspot · D-005 unmarked 18650 cells · D-006 MP1584 buck at 5.20 V with D1 · D-007 brand name **Init** (owner may veto) · D-008 USB power bank replaces cells/buck/BMS · D-009 30-pin ESP32, SSD1306 128×64, no BMS · D-010 features approved if open source · D-011 Wi-Fi option 1 · D-012 confirmed hardware and ROMOSS bank · D-013 phase plan · D-014 owner may push main · D-015 heat index option A (JS + shared reference table) · D-016 design canvas option 1 · D-017 38-pin ESP32 with Type-C · D-018 no deep sleep · D-019 PAGASA bands on rounded heat index · D-020 NWS range rule · D-021 P01-07 ruled out · D-022 OLED design canvas at the start of P03 · D-023 server computes and stores the heat index; hourly maxima with time · D-024 F-21 device room assignment (room saved per reading) · D-025 OLED always on, sensor error screen, blue module, Adafruit 5x7 font · D-026 temporary Wi-Fi in secrets.h until P03-05, init-test first, roots GTS R1 + R4 + GlobalSign. D-027 reply carries interval_s; the bank needs an upload at least every 60 s. D-028 reply carries the room name for the OLED. Pre-push hook active via `core.hooksPath .githooks`.

## Built so far
`src/heat-index.js` and tests (14/14: `npm test`); `design/` (pages, tokens, contrast check, registry); `firmware/bench` (Wi-Fi load sketch); `supabase/migrations/` (5 migrations: tables, access rules, device room, `heat_index_c`, `ingest_reading`, retention job `rollup_old_readings` + `pg_cron`) on **init-test and live init**; `tests/backend/` (45/45: `npm run test:backend`, test project only); `documentation/specs/SECURITY_REVIEW.md` (S-1 to S-11); `tools/db.mjs`, `tools/device-key.mjs`; device key in `.env`, its hash registered on init-test ("Room 1") and live ("Init 1"); `THIRD_PARTY_NOTICES.md` (Supabase CLI 2.121.0, MIT); `firmware/init/` (P03-04: `include/heat_index.h` (C++ port, tested on 20 000 points against the JS), `include/screens.h` (the 9 screens), `include/screen_test.h` and env `esp32dev_screens` (frame-buffer dump, `design/oled/check-dump.mjs`: 9/9 equal the approved images), OLED refreshes every 5 s; `tools/secret-scan.mjs`; `npm test` 33/33. P03-03: `include/interval.h` + PC test in `tests/`, the upload reply sets the interval. P03-02: joins the hotspot, NTP time, one HTTPS upload a minute to init-test with the certificate checked against `include/root_ca.h`; proven on the board, including the failing `esp32dev_wrongca` build; `secrets.h` gitignored and filled locally); `design/templates/` (8 Tabler reference screenshots and `capture.mjs`, owner approved 2026-11-02); `design/ui-gate.mjs` and `tests/ui-gate.test.js` (UI-GATE mechanism, Playwright 1.49.1); `design/oled/` (screens as drawing code, 9 approved reference images in `ref/`, `build-refs.mjs`) and `tests/oled.test.js` (OLED-GATE, 4 tests; `npm test` now 23/23 after the UI-GATE; run `npm install` and `npx playwright install chromium` first).

## Parking lot (out of scope — not being pursued)
- Cellular module on the device (not chosen; revisit only if the hotspot plan fails).
- On-board battery charger (cells are charged outside the device).
