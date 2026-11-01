# CURRENT STATE

> Overwritten at every session close. The first file read in every session (CLAUDE.md).

**Current phase:** P03 Device firmware (5/10: P03-D1 to D3, P03-01 and P03-02 done; P03-03 to P03-07 next). P04 design items can be interleaved. Checklists: [P03](../phases/phase-03-firmware.md), [P04](../phases/phase-04-web-app.md).
**Last session:** 2026-11-02 s11 — [close report](../phase-reports/phase-03-firmware/sessions/2026-11-02_s11_CLOSE.md)
**Branches:** owner = `codenametempest14`. Remote `origin` = https://github.com/CodenameTempest14/init-heat-monitoring.git. See `git status -sb` for whether s11 was pushed (asked at close).
**Status line:** run `node tools/phase-report.mjs` · progress table: `node tools/phase-report.mjs --md`
**Phase builder:** owner only (answered s10; not re-confirmed in s11). Ask again at the start of every session.
**Board:** COM8 (CP210x). Flash from the terminal in `firmware/init` (`pio run -t upload --upload-port COM8`, hold BOOT on `Connecting....`), not from the VS Code toolbar (see `firmware/README.md`). **Currently running the WRONG-CA test build: reflash the normal build first.**
**Security settings:** sign-ups off and SSL enforced on both projects (read back 2026-11-01, S-4 and S-5 closed).
**Supabase:** account `CodenameTempest14`. Projects `init-test` (tests, may be wiped) and `init` (live), both Singapore. Both now have the 5 migrations. Live device "Init 1", room "Unassigned", no readings yet. The real board uploads to **init-test** (device "Room 1") until P03 is done (D-026). Keys in `.env` (gitignored, template `.env.example`). The access token is read-only on purpose; writes go through the DB password (`tools/db.mjs`, `tools/device-key.mjs`). Claude Code's auto-mode classifier blocks `tools/db.mjs live ...` writes from the assistant: the owner runs live writes in the terminal.
**Windows note:** commit messages containing `"` must go through `git commit -F <file>` (PowerShell 5.1 mangles them).

## Recommended model for the next session (MDL-1)
**Sonnet 5.5** for P03-03, P03-04 and P03-06. **Opus 5.5** for P03-05 (setup page: it takes Wi-Fi passwords from a phone).

## Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. **Reflash the normal build**: the board still runs the `esp32dev_wrongca` test build from the P03-02 proof (every upload fails by design). In `firmware/init`: `pio run -t upload --upload-port COM8`, then read COM8 and check `-> 200`.
3. **P03-03**: upload interval read from the server settings instead of the fixed 60 s in `main.cpp`; the loop stays awake (D-018) and the bank stays on between sends.
4. In P03-04 check: `display.cp437(true)` gives the degree sign; the size-4 digits look clean on the real OLED.
5. Open: the Tabler dashboard is about 832 px wide at a 390 px viewport (cause not diagnosed); our home page must not scroll sideways.
6. Owner to decide: `firmware/init/.gitignore` and `firmware/init/.vscode/` (made by the PlatformIO extension) are untracked; commit, ignore or delete.

## Waiting on the owner
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones (the assistant only knows the logins work).
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).

## Decisions so far (all in DECISIONS.md)
D-001 hardware parts · D-002 stack Option A · D-003 scope · D-004 pocket 4G router/hotspot · D-005 unmarked 18650 cells · D-006 MP1584 buck at 5.20 V with D1 · D-007 brand name **Init** (owner may veto) · D-008 USB power bank replaces cells/buck/BMS · D-009 30-pin ESP32, SSD1306 128×64, no BMS · D-010 features approved if open source · D-011 Wi-Fi option 1 · D-012 confirmed hardware and ROMOSS bank · D-013 phase plan · D-014 owner may push main · D-015 heat index option A (JS + shared reference table) · D-016 design canvas option 1 · D-017 38-pin ESP32 with Type-C · D-018 no deep sleep · D-019 PAGASA bands on rounded heat index · D-020 NWS range rule · D-021 P01-07 ruled out · D-022 OLED design canvas at the start of P03 · D-023 server computes and stores the heat index; hourly maxima with time · D-024 F-21 device room assignment (room saved per reading) · D-025 OLED always on, sensor error screen, blue module, Adafruit 5x7 font · D-026 temporary Wi-Fi in secrets.h until P03-05, init-test first, roots GTS R1 + R4 + GlobalSign. Pre-push hook active via `core.hooksPath .githooks`.

## Built so far
`src/heat-index.js` and tests (14/14: `npm test`); `design/` (pages, tokens, contrast check, registry); `firmware/bench` (Wi-Fi load sketch); `supabase/migrations/` (5 migrations: tables, access rules, device room, `heat_index_c`, `ingest_reading`, retention job `rollup_old_readings` + `pg_cron`) on **init-test and live init**; `tests/backend/` (45/45: `npm run test:backend`, test project only); `documentation/specs/SECURITY_REVIEW.md` (S-1 to S-11); `tools/db.mjs`, `tools/device-key.mjs`; device key in `.env`, its hash registered on init-test ("Room 1") and live ("Init 1"); `THIRD_PARTY_NOTICES.md` (Supabase CLI 2.121.0, MIT); `firmware/init/` (P03-02: joins the hotspot, NTP time, one HTTPS upload a minute to init-test with the certificate checked against `include/root_ca.h`; proven on the board, including the failing `esp32dev_wrongca` build; `secrets.h` gitignored and filled locally); `design/templates/` (8 Tabler reference screenshots and `capture.mjs`, owner approved 2026-11-02); `design/ui-gate.mjs` and `tests/ui-gate.test.js` (UI-GATE mechanism, Playwright 1.49.1); `design/oled/` (screens as drawing code, 9 approved reference images in `ref/`, `build-refs.mjs`) and `tests/oled.test.js` (OLED-GATE, 4 tests; `npm test` now 23/23 after the UI-GATE; run `npm install` and `npx playwright install chromium` first).

## Parking lot (out of scope — not being pursued)
- Cellular module on the device (not chosen; revisit only if the hotspot plan fails).
- On-board battery charger (cells are charged outside the device).
