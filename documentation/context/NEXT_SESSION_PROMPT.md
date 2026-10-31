# Continue Classroom Heat Index Monitoring (prompt generated 2026-10-31)

You are continuing **classroom-heat-index-monitoring** (d:\System Documents\Documents\Codes\classroom-heat-index-monitoring): a power-bank-powered ESP32 room monitor (DHT22 + OLED) plus a public web app (PWA on Supabase + free static hosting) showing temperature, humidity and heat index for one classroom. The owner is learning: explain before and while implementing.

## HARD RULES (full text in CLAUDE.md)
1. Read in this order and nothing more: CLAUDE.md, documentation/context/CURRENT_STATE.md, the current phase checklist in documentation/phases/, the last Session Close Report.
2. Start with a Session Start Report that includes the **Phase Progress table** (`node tools/phase-report.mjs --md`) and says **which Claude model to use and why**. In the first reply ask: *"Is this phase being built only by you, or is Shem also working on it?"*
3. Open every reply with the status line from `node tools/phase-report.mjs`.
4. No new feature is planned, designed or built until the owner approves it in documentation/specs/FEATURES.md.
5. **Push only to your own branch** (owner: `codenametempest14`) and **ask before every push and every merge to `main`**, naming the target.
6. At the end: Session Close Report (with the Phase Progress table), update CURRENT_STATE.md, PROGRESS_LOG.md entry, then run `node tools/continuation-prompt.mjs` and **show the generated prompt and the progress table in the final message**.

## Where we are
[P01 · Heat index core and bench bring-up · 7/7 done · 0 blocked · unverified 0]

### Phase Progress (end of the previous session)
| Phase | Done / Total | Progress | % |
|---|---|---|---|
| P00 Kickoff and decisions | 13 / 13 | ██████████ | 100% |
| P01 Heat index core and bench bring-up | 7 / 7 | ██████████ | 100% |
| P02 Backend and secure upload | 0 / 6 | ░░░░░░░░░░ | 0% |
| P03 Device firmware | 0 / 7 | ░░░░░░░░░░ | 0% |
| P04 Web app core | 3 / 13 | ██░░░░░░░░ | 23% |
| P05 Admin, alerts and device health | 0 / 5 | ░░░░░░░░░░ | 0% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 23 / 66 | ████░░░░░░ | **35%** |

### Recommended model for this session
**Opus 5.5**, because P02 is the Supabase schema, row-level rules and device-key security, which needs deeper reasoning. Return to Sonnet 5.5 for P03 firmware and P04 UI work.

### Next concrete step
1. Ask the phase-builder question (last answer: owner only). Start P02: read `documentation/phases/phase-02-backend.md`. P02-01 first: propose the schema (readings, device, settings) and wait for the owner's approval before building. Remember D-018: the device stays awake and the bank needs about Wi-Fi-level load, so the ingest rate should assume a reading every few minutes from an always-on device.
2. Software-only work that can interleave: P04-D4 (screenshots of the chosen templates; install Playwright first, it is not in the repo) and P04-D5 (UI-GATE).
3. Owner request (s06): design the OLED screens (128x64) with the same canvas method as D-016 and Ad Astra (design/ entry, tokens or a small pixel-font spec, reference mock-ups the owner approves, check against the approved image). Not started. Propose where it sits (suggest a short step at the start of P03) and get it approved in documentation/specs/FEATURES.md before building. Read the Ad Astra method at D:/System Documents/Documents/Codes/projects/ad-astra first.

### Waiting on the owner
- Nothing blocking. Bench work is finished and the board can stay unplugged.
- Approval of where the OLED screen design (owner's request) sits in the phase plan (see next step 3).
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.
- Work up to commit `0c4a1ca` is pushed to `codenametempest14` and `main`. The s06 close commit is not. Ask before the next push, naming the target.
