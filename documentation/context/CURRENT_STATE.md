# CURRENT STATE

> Overwritten at every session close. The first file read in every session (CLAUDE.md).

**Current phase:** P01 complete (7/7, P01-07 ruled out, D-021). Next: P02 backend. Design canvas (D-016) started inside P04 (P04-D1 to D3 done; D4, D5 open). Checklist: [P02](../phases/phase-02-backend.md).
**Last session:** 2026-10-31 s06 — [close report](../phase-reports/phase-01-core-and-bench/sessions/2026-10-31_s06_CLOSE.md)
**Branches:** owner = `codenametempest14`. Remote `origin` = https://github.com/CodenameTempest14/init-heat-monitoring.git. Pushed 2026-10-31 to `codenametempest14` and to `main` (D-014, owner approved each). See `git log -1` for the latest commit.
**Status line:** run `node tools/phase-report.mjs` · progress table: `node tools/phase-report.mjs --md`
**Phase builder:** owner only (answered 2026-10-30). Ask again at the start of every session.

## Recommended model for the next session (MDL-1)
**Opus 5.5**, because P02 is the Supabase schema, row-level rules and device-key security, which needs deeper reasoning. Return to Sonnet 5.5 for P03 firmware and P04 UI work.

## Next concrete step
1. Ask the phase-builder question (last answer: owner only). Start P02: read `documentation/phases/phase-02-backend.md`. P02-01 first: propose the schema (readings, device, settings) and wait for the owner's approval before building. Remember D-018: the device stays awake and the bank needs about Wi-Fi-level load, so the ingest rate should assume a reading every few minutes from an always-on device.
2. Software-only work that can interleave: P04-D4 (screenshots of the chosen templates; install Playwright first, it is not in the repo) and P04-D5 (UI-GATE).
3. Owner request (s06): design the OLED screens (128x64) with the same canvas method as D-016 and Ad Astra (design/ entry, tokens or a small pixel-font spec, reference mock-ups the owner approves, check against the approved image). Not started. Propose where it sits (suggest a short step at the start of P03) and get it approved in documentation/specs/FEATURES.md before building. Read the Ad Astra method at D:/System Documents/Documents/Codes/projects/ad-astra first.

## Waiting on the owner
- Nothing blocking. Bench work is finished and the board can stay unplugged.
- Approval of where the OLED screen design (owner's request) sits in the phase plan (see next step 3).
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.
- Work up to commit `0c4a1ca` is pushed to `codenametempest14` and `main`. The s06 close commit is not. Ask before the next push, naming the target.

## Decisions so far (all in DECISIONS.md)
D-001 hardware parts · D-002 stack Option A · D-003 scope · D-004 pocket 4G router/hotspot · D-005 unmarked 18650 cells · D-006 MP1584 buck at 5.20 V with D1 · D-007 brand name **Init** (owner may veto) · D-008 USB power bank replaces cells/buck/BMS (supersedes D-001 power, D-005, D-006) · D-009 30-pin ESP32, SSD1306 128×64, no BMS · D-010 features approved if open source · D-011 Wi-Fi option 1 · D-012 confirmed hardware and ROMOSS bank · D-013 phase plan · D-014 owner may push main · D-015 heat index option A (JS + shared reference table) · D-016 design canvas option 1 · D-017 38-pin ESP32 with Type-C · D-018 no deep sleep (bank needs Wi-Fi-level load) · D-019 PAGASA bands on rounded heat index · D-020 NWS range rule wins over the 40 % RH wording · D-021 P01-07 ruled out, awake current in P07. Pre-push hook active via `core.hooksPath .githooks` (tested).

## Built so far
`src/heat-index.js` (heatIndexC, heatCategory) and tests (14/14 pass: `node --test`); `design/` (pages, tokens, contrast check, registry); `firmware/bench` (Wi-Fi scan load sketch, ran 61 min on the ROMOSS bank; deep sleep removed); `THIRD_PARTY_NOTICES.md`.

## Parking lot (out of scope — not being pursued)
- Cellular module on the device (not chosen; revisit only if the hotspot plan fails).
- On-board battery charger (cells are charged outside the device).
