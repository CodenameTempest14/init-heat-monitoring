# Phase 4 — Web app core

**Objective:** The public app: live readings, heat category, history and an installable phone app.
**Entry criteria:** P03 closed (real data is flowing).
**Exit criteria:** A logged-out visitor on a phone sees correct, current data; the app is checked in a real browser and on a real phone.
**Features:** F-01 to F-05, F-07 (checked from the front end), F-12. Model: Sonnet 5.5.

Checklist markers: see phase-01.

## Design canvas (D-016, owner chose option 1; agent placed it here)
Software only. Needs no data or hardware, so it may be done before P04 opens; it must be finished and approved before any page is built (UI-GATE).
- [x] P04-D1 `design/` folder with README, a small template manifest and registry, and one token file (colours, type, spacing) — evidence 2026-10-31: design/README.md, pages.json (5 pages), tokens.json (provisional), build-registry.mjs run -> REGISTRY.md. No "small template manifest" beyond pages.json; templates themselves come in D2.
- [x] P04-D2 Page list for the app taken from the approved features, one open-source template chosen per page, licence recorded — evidence 2026-10-31: pages.json updated, REGISTRY.md regenerated. Tabler MIT licence read on GitHub; demo page URLs return HTTP 200. Templates NOT yet looked at (D4). Device setup page is hand-written (ESP32 flash size). Statuses stay Proposed until D4.
- [x] P04-D3 Tokens for light and dark, including the four heat category colours, with contrast checked by a script (text 4.5:1, non-text 3:1) and an icon or text label so colour is never the only signal — evidence 2026-10-31: tests/contrast.test.js written first (red: module missing), then 4/4 pass; `node design/contrast.mjs` found white-on-orange danger at 3.58:1, fixed fill to #c2410c (5.18:1), now all pass. Each category has a text label token; rendering of the labels is checked in the UI later.
- [ ] P04-D4 Reference screenshots of each chosen template at phone and desktop widths, owner approves them
- [ ] P04-D5 UI-GATE comparison (Playwright screenshot of our page vs the approved image) set up and shown to fail on a deliberate mismatch

## Build
- [ ] P04-01 App skeleton built and deployed on free hosting
- [ ] P04-02 Live cards for temperature, humidity, heat index and PAGASA category (F-01, F-02)
- [ ] P04-03 Online/offline badge (F-03)
- [ ] P04-04 24-hour and 7-day charts (F-04)
- [ ] P04-05 Installable PWA, phone-first layout, light and dark (F-05)
- [ ] P04-06 Public read-only confirmed from a logged-out browser (F-07)
- [ ] P04-07 Daily summary and school-hours view (F-12)
- [ ] P04-08 Looked at in a real browser and on a real phone, with screenshots free of personal data
