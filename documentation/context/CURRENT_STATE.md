# CURRENT STATE

> Overwritten at every session close. The first file read in every session (CLAUDE.md).

**Current phase:** P00 — Kickoff and decisions.
**Last session:** 2026-10-30 s02 — [close report](../phase-reports/phase-00-kickoff/sessions/2026-10-30_s02_CLOSE.md)
**Branches:** owner = `codenametempest14`. Repo initialised 2026-10-30; remote `origin` = https://github.com/CodenameTempest14/init-heat-monitoring.git. First push goes to `codenametempest14` only (owner approved); `main` stays empty until a reviewed pull request. See `git log -1` for the latest commit.
**Status line:** run `node tools/phase-report.mjs` · progress table: `node tools/phase-report.mjs --md`
**Phase builder:** owner only (answered 2026-10-30). Ask again at the start of every session.

## Recommended model for the next session (MDL-1)
**Sonnet 5.5**, because the work is writing the proposed feature list and phase plan for approval. Switch to **Opus 5.5** when the Supabase schema and device-security design start.

## Next concrete step
1. Owner reviews `hardware/schematic.html` and answers P00-10 (buck module, ESP32 board, BMS, OLED pin order).
2. Propose a feature list in `documentation/specs/FEATURES.md` (proposal only, nothing built) and wait for approval (P00-11).
3. Propose the phase plan (P00-12) and wait for approval.

## Waiting on the owner
- Review of Rev A hardware (P00-10).
- Approval of the feature list and phase plan (P00-11, P00-12). No feature work before that.
- A pre-push hook (as in Ad Astra's `.githooks/`) that blocks pushes to `main`: not set up yet. Ask if you want it.
- Unmarked 18650 cells: capacity and quality are unknown. Plan to measure them (or buy branded cells) before relying on the runtime estimate.

## Decisions so far (all in DECISIONS.md)
D-001 hardware parts · D-002 stack Option A · D-003 scope · D-004 pocket 4G router/hotspot · D-005 unmarked 18650 cells · D-006 MP1584 buck at 5.20 V with D1 · D-007 brand name **Init** (owner may veto).

## Parking lot (out of scope — not being pursued)
- Cellular module on the device (not chosen; revisit only if the hotspot plan fails).
- On-board battery charger (cells are charged outside the device).
