# CURRENT STATE

> Overwritten at every session close. The first file read in every session (CLAUDE.md).

**Current phase:** P01 in progress (4/8): heat index logic done (P01-01 to 03, 08); bench items P01-04 to 07 wait for the owner. Design canvas (D-016) started inside P04 (P04-D1 to D3 done; D4, D5 open). Checklist: [P01](../phases/phase-01-core-and-bench.md).
**Last session:** 2026-10-31 s04 — [close report](../phase-reports/phase-01-core-and-bench/sessions/2026-10-31_s04_CLOSE.md)
**Branches:** owner = `codenametempest14`. Repo initialised 2026-10-30; remote `origin` = https://github.com/CodenameTempest14/init-heat-monitoring.git. First push goes to `codenametempest14` only (owner approved); `main` stays empty until a reviewed pull request. See `git log -1` for the latest commit.
**Status line:** run `node tools/phase-report.mjs` · progress table: `node tools/phase-report.mjs --md`
**Phase builder:** owner only (answered 2026-10-30). Ask again at the start of every session.

## Recommended model for the next session (MDL-1)
**Sonnet 5.5**, because P01 is the heat index function written test-first plus bench bring-up, which needs care but not deep architecture. Switch to **Opus 5.5** when P02 starts (Supabase schema, row-level rules, device-key security).

## Next concrete step
1. Ask the phase-builder question. Then the owner does the bench with the agent guiding: P01-04 power bank low-load test, P01-05 breadboard and 3V3 measurement, P01-06 upload `firmware/bench` (`pio run -t upload`) and watch the OLED, P01-07 awake and sleep current with a USB meter. Record results in the phase file with evidence; correct the runtime estimate in the schematic.
2. Software-only work that can follow: P04-D4 (Playwright screenshots of the chosen templates) and P04-D5 (UI-GATE).

## Waiting on the owner
- The bench work above (owner, next day). All parts are in hand (owner, 2026-10-31).
- Two small calls to confirm: PAGASA bands are applied to the heat index rounded to whole °C (agent's choice); F-01's "40 % RH" wording vs the NWS range rule used in the code.
- Nothing pushed. Ask before any push, naming the target (`codenametempest14` or `main`, D-014).

## Decisions so far (all in DECISIONS.md)
D-001 hardware parts · D-002 stack Option A · D-003 scope · D-004 pocket 4G router/hotspot · D-005 unmarked 18650 cells · D-006 MP1584 buck at 5.20 V with D1 · D-007 brand name **Init** (owner may veto) · D-008 USB power bank replaces cells/buck/BMS (supersedes D-001 power, D-005, D-006) · D-009 30-pin ESP32, SSD1306 128×64, no BMS · D-010 features approved if open source · D-011 Wi-Fi option 1 · D-012 confirmed hardware and ROMOSS bank · D-013 phase plan · D-014 owner may push main · D-015 heat index option A (JS + shared reference table) · D-016 design canvas option 1. Pre-push hook active via `core.hooksPath .githooks` (tested).

## Built so far
`src/heat-index.js` (heatIndexC, heatCategory) and tests (14/14 pass: `node --test`); `design/` (pages, tokens, contrast check, registry); `firmware/bench` (compiles, not run on the board); `THIRD_PARTY_NOTICES.md`.

## Parking lot (out of scope — not being pursued)
- Cellular module on the device (not chosen; revisit only if the hotspot plan fails).
- On-board battery charger (cells are charged outside the device).
