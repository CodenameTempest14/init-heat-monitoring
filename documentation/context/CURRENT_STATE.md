# CURRENT STATE

> Overwritten at every session close. The first file read in every session (CLAUDE.md).

**Current phase:** P02 complete (7/7, on `init-test` and live `init`). Next: P03 (starts with the OLED design canvas P03-D1 to D3) and/or P04 design items. Checklists: [P03](../phases/phase-03-firmware.md), [P04](../phases/phase-04-web-app.md).
**Last session:** 2026-10-31 s08 — [close report](../phase-reports/phase-02-backend/sessions/2026-10-31_s08_CLOSE.md)
**Branches:** owner = `codenametempest14`. Remote `origin` = https://github.com/CodenameTempest14/init-heat-monitoring.git. See `git log -1` and `git status -sb` for whether s08 was pushed (asked at close).
**Status line:** run `node tools/phase-report.mjs` · progress table: `node tools/phase-report.mjs --md`
**Phase builder:** owner only (answered s08). Ask again at the start of every session.
**Supabase:** account `CodenameTempest14`. Projects `init-test` (tests, may be wiped) and `init` (live), both Singapore. Both now have the 5 migrations. Live device "Init 1", room "Unassigned", no readings yet. Keys in `.env` (gitignored, template `.env.example`). The access token is read-only on purpose; writes go through the DB password (`tools/db.mjs`, `tools/device-key.mjs`). Claude Code's auto-mode classifier blocks `tools/db.mjs live ...` writes from the assistant: the owner runs live writes in the terminal.
**Windows note:** commit messages containing `"` must go through `git commit -F <file>` (PowerShell 5.1 mangles them).

## Recommended model for the next session (MDL-1)
**Sonnet 5.5**, because the next items (OLED design canvas P03-D1 to D3, web template screenshots P04-D4) are design work with no security-sensitive changes. Switch to Opus 5.5 for P03-02 (device key in firmware, TLS certificate check) and P03-05 (setup page).

## Next concrete step
1. Ask the phase-builder question (last answer: owner only). Ask whether the owner did the dashboard actions S-4, S-5, S-6 from `documentation/specs/SECURITY_REVIEW.md` on both projects; if yes, read the settings back with the read-only token (auth `disable_signup`, `ssl-enforcement`) and note it in SECURITY_REVIEW.md.
2. P03-D1: `design/oled/` with README: screen list from the approved features (F-08, offline and setup states of F-03 and D-011), the 128×64 grid spec, open-source pixel fonts (D-010). Then P03-D2 reference images for the owner to approve.
3. Interleavable: P04-D4 (template screenshots; install Playwright first) and P04-D5 (UI-GATE).
4. Optional check: after 18:30 UTC, read `cron.job_run_details` on `init-test` to see the first scheduled run succeeded (nothing to roll up yet, so `{hours:0, deleted:0}`).

## Waiting on the owner
- SECURITY_REVIEW S-4 (turn off sign-ups), S-5 (enforce SSL), S-6 (new generated DB passwords, update `.env`), on both projects.
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.

## Decisions so far (all in DECISIONS.md)
D-001 hardware parts · D-002 stack Option A · D-003 scope · D-004 pocket 4G router/hotspot · D-005 unmarked 18650 cells · D-006 MP1584 buck at 5.20 V with D1 · D-007 brand name **Init** (owner may veto) · D-008 USB power bank replaces cells/buck/BMS · D-009 30-pin ESP32, SSD1306 128×64, no BMS · D-010 features approved if open source · D-011 Wi-Fi option 1 · D-012 confirmed hardware and ROMOSS bank · D-013 phase plan · D-014 owner may push main · D-015 heat index option A (JS + shared reference table) · D-016 design canvas option 1 · D-017 38-pin ESP32 with Type-C · D-018 no deep sleep · D-019 PAGASA bands on rounded heat index · D-020 NWS range rule · D-021 P01-07 ruled out · D-022 OLED design canvas at the start of P03 · D-023 server computes and stores the heat index; hourly maxima with time · D-024 F-21 device room assignment (room saved per reading). Pre-push hook active via `core.hooksPath .githooks`.

## Built so far
`src/heat-index.js` and tests (14/14: `npm test`); `design/` (pages, tokens, contrast check, registry); `firmware/bench` (Wi-Fi load sketch); `supabase/migrations/` (5 migrations: tables, access rules, device room, `heat_index_c`, `ingest_reading`, retention job `rollup_old_readings` + `pg_cron`) on **init-test and live init**; `tests/backend/` (45/45: `npm run test:backend`, test project only); `documentation/specs/SECURITY_REVIEW.md` (S-1 to S-11); `tools/db.mjs`, `tools/device-key.mjs`; device key in `.env`, its hash registered on init-test ("Room 1") and live ("Init 1"); `THIRD_PARTY_NOTICES.md` (Supabase CLI 2.121.0, MIT).

## Parking lot (out of scope — not being pursued)
- Cellular module on the device (not chosen; revisit only if the hotspot plan fails).
- On-board battery charger (cells are charged outside the device).
