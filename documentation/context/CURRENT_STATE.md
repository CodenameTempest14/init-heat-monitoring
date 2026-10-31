# CURRENT STATE

> Overwritten at every session close. The first file read in every session (CLAUDE.md).

**Current phase:** P02 backend, in progress (P02-01 to P02-04 done, P02-07 partly). Checklist: [P02](../phases/phase-02-backend.md). P01 complete.
**Last session:** 2026-10-31 s07 — [close report](../phase-reports/phase-02-backend/sessions/2026-10-31_s07_CLOSE.md)
**Branches:** owner = `codenametempest14`. Remote `origin` = https://github.com/CodenameTempest14/init-heat-monitoring.git. s07 pushed to `codenametempest14` and `main` (D-014, owner approved both by name). See `git log -1` for the latest commit.
**Status line:** run `node tools/phase-report.mjs` · progress table: `node tools/phase-report.mjs --md`
**Phase builder:** owner only (answered s07). Ask again at the start of every session.
**Supabase:** account `CodenameTempest14`. Projects `init-test` (tests, may be wiped) and `init` (live), both Singapore. Keys in `.env` (gitignored, template `.env.example`). The access token is read-only on purpose; writes go through the DB password (`tools/db.mjs`, `tools/device-key.mjs`).

## Recommended model for the next session (MDL-1)
**Opus 5.5**, because P02-05 (retention job), P02-06 (security review) and the first push to the live database are security and data-loss sensitive. Return to Sonnet 5.5 for P03 firmware and P04 UI work.

## Next concrete step
1. Ask the phase-builder question (last answer: owner only). Then P02-05: test-first retention job (`pg_cron`, daily): readings older than 90 days → `readings_hourly` (avg/min/max, max with its exact time, grouped by room), then deleted, in one transaction. The test inserts old readings with the secret key and runs the job function directly. This also finishes P02-07 (hourly rows keep the room).
2. P02-06: security review of the backend; record findings. Known items to include: the accepted advisor warning (anon may run `ingest_reading`, intended); wrong-key calls are not rate limited (only accepted calls are); the free-tier project pause risk.
3. Then ask the owner before applying the migrations to the live `init` project (`node --env-file=.env tools/db.mjs live db push`) and registering the device there (`node --env-file=.env tools/device-key.mjs register live "<name>"`; room stays "Unassigned", owner s07).
4. Interleavable software work: P04-D4 (template screenshots; install Playwright first) and P04-D5 (UI-GATE). P03 starts with the OLED design canvas P03-D1 to D3 (D-022).

## Waiting on the owner
- Nothing blocking.
- Approval before the first push of migrations to the live `init` project.
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.

## Decisions so far (all in DECISIONS.md)
D-001 hardware parts · D-002 stack Option A · D-003 scope · D-004 pocket 4G router/hotspot · D-005 unmarked 18650 cells · D-006 MP1584 buck at 5.20 V with D1 · D-007 brand name **Init** (owner may veto) · D-008 USB power bank replaces cells/buck/BMS · D-009 30-pin ESP32, SSD1306 128×64, no BMS · D-010 features approved if open source · D-011 Wi-Fi option 1 · D-012 confirmed hardware and ROMOSS bank · D-013 phase plan · D-014 owner may push main · D-015 heat index option A (JS + shared reference table) · D-016 design canvas option 1 · D-017 38-pin ESP32 with Type-C · D-018 no deep sleep · D-019 PAGASA bands on rounded heat index · D-020 NWS range rule · D-021 P01-07 ruled out · D-022 OLED design canvas at the start of P03 · D-023 server computes and stores the heat index; hourly maxima with time · D-024 F-21 device room assignment (room saved per reading). Pre-push hook active via `core.hooksPath .githooks`.

## Built so far
`src/heat-index.js` and tests (14/14: `npm test`); `design/` (pages, tokens, contrast check, registry); `firmware/bench` (Wi-Fi load sketch); `supabase/migrations/` (4 migrations: tables, access rules, device room, `heat_index_c`, `ingest_reading`) applied to **init-test only**; `tests/backend/` (41/41: `npm run test:backend`); `tools/db.mjs`, `tools/device-key.mjs`; device key in `.env`, its hash registered on init-test as "Room 1"; `THIRD_PARTY_NOTICES.md` (Supabase CLI 2.121.0, MIT).

## Parking lot (out of scope — not being pursued)
- Cellular module on the device (not chosen; revisit only if the hotspot plan fails).
- On-board battery charger (cells are charged outside the device).
