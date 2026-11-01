# CURRENT STATE

> Overwritten at every session close. The first file read in every session (CLAUDE.md).

**Current phase:** P03 Device firmware (4/10: OLED canvas P03-D1 to D3 and P03-01 done; P03-02 to P03-07 next). P04 design items can be interleaved. Checklists: [P03](../phases/phase-03-firmware.md), [P04](../phases/phase-04-web-app.md).
**Last session:** 2026-11-02 s10 — [close report](../phase-reports/phase-03-firmware/sessions/2026-11-02_s10_CLOSE.md)
**Branches:** owner = `codenametempest14`. Remote `origin` = https://github.com/CodenameTempest14/init-heat-monitoring.git. See `git status -sb` for whether s10 was pushed (asked at close).
**Status line:** run `node tools/phase-report.mjs` · progress table: `node tools/phase-report.mjs --md`
**Phase builder:** owner only (answered s10). Ask again at the start of every session.
**Security settings:** sign-ups off and SSL enforced on both projects (read back 2026-11-01, S-4 and S-5 closed).
**Supabase:** account `CodenameTempest14`. Projects `init-test` (tests, may be wiped) and `init` (live), both Singapore. Both now have the 5 migrations. Live device "Init 1", room "Unassigned", no readings yet. Keys in `.env` (gitignored, template `.env.example`). The access token is read-only on purpose; writes go through the DB password (`tools/db.mjs`, `tools/device-key.mjs`). Claude Code's auto-mode classifier blocks `tools/db.mjs live ...` writes from the assistant: the owner runs live writes in the terminal.
**Windows note:** commit messages containing `"` must go through `git commit -F <file>` (PowerShell 5.1 mangles them).

## Recommended model for the next session (MDL-1)
**Opus 5.5** for P03-02 (device key in firmware, TLS certificate check) and P03-05 (setup page). Sonnet 5.5 is fine for the P04-D4 approval follow-up and for P03-03, P03-04 and P03-06.

## Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. **Owner reviews the 8 template screenshots in `design/templates/`** (P04-D4): approve or change. Then set the `pages.json` statuses Proposed to Approved, run `node design/build-registry.mjs`, tick P04-D4.
3. **P03-02**: HTTPS upload through the hotspot with the server certificate checked (root CA in firmware, no `setInsecure()`, S-11), shown to fail against a wrong certificate. Needs the real device key and ingest URL in `firmware/init/include/secrets.h` (the local file holds placeholders). First flash the P03-01 skeleton (`pio run -t upload` in `firmware/init`): it has only been built, not run on the board.
4. In P03-04 check: `display.cp437(true)` gives the degree sign; the size-4 digits look clean on the real OLED.
5. Open: the Tabler dashboard is about 832 px wide at a 390 px viewport (cause not diagnosed); our home page must not scroll sideways.

## Waiting on the owner
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones (the assistant only knows the logins work).
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.

## Decisions so far (all in DECISIONS.md)
D-001 hardware parts · D-002 stack Option A · D-003 scope · D-004 pocket 4G router/hotspot · D-005 unmarked 18650 cells · D-006 MP1584 buck at 5.20 V with D1 · D-007 brand name **Init** (owner may veto) · D-008 USB power bank replaces cells/buck/BMS · D-009 30-pin ESP32, SSD1306 128×64, no BMS · D-010 features approved if open source · D-011 Wi-Fi option 1 · D-012 confirmed hardware and ROMOSS bank · D-013 phase plan · D-014 owner may push main · D-015 heat index option A (JS + shared reference table) · D-016 design canvas option 1 · D-017 38-pin ESP32 with Type-C · D-018 no deep sleep · D-019 PAGASA bands on rounded heat index · D-020 NWS range rule · D-021 P01-07 ruled out · D-022 OLED design canvas at the start of P03 · D-023 server computes and stores the heat index; hourly maxima with time · D-024 F-21 device room assignment (room saved per reading) · D-025 OLED always on, sensor error screen, blue module, Adafruit 5x7 font. Pre-push hook active via `core.hooksPath .githooks`.

## Built so far
`src/heat-index.js` and tests (14/14: `npm test`); `design/` (pages, tokens, contrast check, registry); `firmware/bench` (Wi-Fi load sketch); `supabase/migrations/` (5 migrations: tables, access rules, device room, `heat_index_c`, `ingest_reading`, retention job `rollup_old_readings` + `pg_cron`) on **init-test and live init**; `tests/backend/` (45/45: `npm run test:backend`, test project only); `documentation/specs/SECURITY_REVIEW.md` (S-1 to S-11); `tools/db.mjs`, `tools/device-key.mjs`; device key in `.env`, its hash registered on init-test ("Room 1") and live ("Init 1"); `THIRD_PARTY_NOTICES.md` (Supabase CLI 2.121.0, MIT); `firmware/init/` (P03-01 skeleton: builds with `pio run`, versions pinned, `secrets.h` gitignored, not flashed); `design/templates/` (8 Tabler reference screenshots and `capture.mjs`, awaiting owner approval); `design/ui-gate.mjs` and `tests/ui-gate.test.js` (UI-GATE mechanism, Playwright 1.49.1); `design/oled/` (screens as drawing code, 9 approved reference images in `ref/`, `build-refs.mjs`) and `tests/oled.test.js` (OLED-GATE, 4 tests; `npm test` now 23/23 after the UI-GATE; run `npm install` and `npx playwright install chromium` first).

## Parking lot (out of scope — not being pursued)
- Cellular module on the device (not chosen; revisit only if the hotspot plan fails).
- On-board battery charger (cells are charged outside the device).
