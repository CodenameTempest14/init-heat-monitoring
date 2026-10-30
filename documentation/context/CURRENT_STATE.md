# CURRENT STATE

> Overwritten at every session close. The first file read in every session (CLAUDE.md).

**Current phase:** P00 closed (13/13). Next to open: P01 — Heat index core and bench bring-up ([checklist](../phases/phase-01-core-and-bench.md)). Phases P01–P08 approved (D-013).
**Last session:** 2026-10-31 s03 — [close report](../phase-reports/phase-00-kickoff/sessions/2026-10-31_s03_CLOSE.md)
**Branches:** owner = `codenametempest14`. Repo initialised 2026-10-30; remote `origin` = https://github.com/CodenameTempest14/init-heat-monitoring.git. First push goes to `codenametempest14` only (owner approved); `main` stays empty until a reviewed pull request. See `git log -1` for the latest commit.
**Status line:** run `node tools/phase-report.mjs` · progress table: `node tools/phase-report.mjs --md`
**Phase builder:** owner only (answered 2026-10-30). Ask again at the start of every session.

## Recommended model for the next session (MDL-1)
**Sonnet 5.5**, because P01 is the heat index function written test-first plus bench bring-up, which needs care but not deep architecture. Switch to **Opus 5.5** when P02 starts (Supabase schema, row-level rules, device-key security).

## Next concrete step
1. Ask the phase-builder question, then start P01: write the heat index tests first (P01-01) and watch them fail. Explain the formula to the owner before coding.
2. In parallel, when the owner has the parts: run the power bank low-load test (P01-04).

## Waiting on the owner
- Nothing blocks the start of P01. Ask which parts the owner already has (ESP32, DHT22, OLED, resistors, breadboard) and have them check the ROMOSS manual for a low-current mode.
- Power bank auto-off test at low load: needs the real ROMOSS bank and the board (bring-up step 1). Check its manual for a low-current mode.
- Nothing pushed. Ask before any push, naming the target.

## Decisions so far (all in DECISIONS.md)
D-001 hardware parts · D-002 stack Option A · D-003 scope · D-004 pocket 4G router/hotspot · D-005 unmarked 18650 cells · D-006 MP1584 buck at 5.20 V with D1 · D-007 brand name **Init** (owner may veto) · D-008 USB power bank replaces cells/buck/BMS (supersedes D-001 power, D-005, D-006) · D-009 30-pin ESP32, SSD1306 128×64, no BMS · D-010 features approved if open source · D-011 Wi-Fi option 1 · D-012 confirmed hardware and ROMOSS bank. Pre-push hook active via `core.hooksPath .githooks` (tested).

## Parking lot (out of scope — not being pursued)
- Cellular module on the device (not chosen; revisit only if the hotspot plan fails).
- On-board battery charger (cells are charged outside the device).
