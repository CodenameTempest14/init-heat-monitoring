# Phase 0 — Kickoff and decisions

**Objective:** Agree what is being built, fix the hardware design and put the working system (rules, reports, state files) in place before any firmware or app code.
**Entry criteria:** Owner starts the project (2026-10-30).
**Exit criteria:** Hardware Rev A confirmed by the owner, feature list approved, later phases planned and approved.

Checklist markers read by `tools/phase-report.mjs`: `- [x]` done · `UNVERIFIED:` ticked but not yet checked on the real thing · `PROG:` partly done · `BLOCKED:` waiting on someone · `RULED:` ruled out.

## Decisions (each recorded in documentation/DECISIONS.md)
- [x] P00-01 Hardware parts chosen: ESP32 38-pin, DHT22, SSD1306 OLED, 2S 18650, 5 V buck — evidence: D-001, owner message 2026-10-30
- [x] P00-02 Tech stack: Option A (Supabase, free static hosting, PWA, Arduino-framework firmware) — evidence: D-002, owner 2026-10-30
- [x] P00-03 Scope: one room, public viewing, free hosting, battery only — evidence: D-003
- [x] P00-04 Internet route: pocket 4G router / hotspot, ESP32 as Wi-Fi client — evidence: D-004, owner answer 2026-10-30
- [x] P00-05 Cells are 18650, unmarked (capacity unknown) — evidence: D-005, owner answer 2026-10-30
- [x] P00-06 Phase builder: owner only — evidence: owner answer 2026-10-30

## Working system
- [x] P00-07 Hard rules carried over from Ad Astra — evidence: CLAUDE.md
- [x] P00-08 Phase tracker, report templates, READMEs set up and run — evidence: `node tools/phase-report.mjs` printed the table; `node tools/check-readmes.mjs` printed "Every folder has a README.md." (2026-10-30)
- [x] P00-08a Brand name chosen: Init — evidence: DECISIONS.md D-007 (agent's pick at owner's request; owner may veto)

## Hardware
- [x] P00-09 Schematic drafted (drafted only; not built, not measured). Rev A 2026-10-30, redrawn as Rev B for the power bank (D-008) — evidence: hardware/schematic.html; Rev B rendered in headless Edge and viewed, two label overlaps fixed and re-rendered clean
- [x] P00-10 Owner confirms power source, ESP32 board variant, BMS and OLED pin order — evidence: D-008, D-009, D-012 (owner messages 2026-10-30 and 2026-10-31: power bank ROMOSS Sense 8P+, ESP32 30-pin Type-C, OLED GND/VCC/SCK/SDA). Rev B not built; the power bank low-load test is still open (bring-up step 1)

## Before Phase 1 can open
- [ ] PROG: P00-11 Feature list proposed in documentation/specs/FEATURES.md and approved by the owner. Owner approved all tiers 2026-10-31 on condition "all open source" (D-010); tick once the condition is confirmed
- [ ] P00-12 Phase plan for the rest of the project proposed and approved by the owner
