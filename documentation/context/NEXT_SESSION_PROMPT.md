# Continue Classroom Heat Index Monitoring (prompt generated 2026-10-30)

You are continuing **classroom-heat-index-monitoring** (d:\System Documents\Documents\Codes\classroom-heat-index-monitoring): a power-bank-powered ESP32 room monitor (DHT22 + OLED) plus a public web app (PWA on Supabase + free static hosting) showing temperature, humidity and heat index for one classroom. The owner is learning: explain before and while implementing.

## HARD RULES (full text in CLAUDE.md)
1. Read in this order and nothing more: CLAUDE.md, documentation/context/CURRENT_STATE.md, the current phase checklist in documentation/phases/, the last Session Close Report.
2. Start with a Session Start Report that includes the **Phase Progress table** (`node tools/phase-report.mjs --md`) and says **which Claude model to use and why**. In the first reply ask: *"Is this phase being built only by you, or is Shem also working on it?"*
3. Open every reply with the status line from `node tools/phase-report.mjs`.
4. No new feature is planned, designed or built until the owner approves it in documentation/specs/FEATURES.md.
5. **Push only to your own branch** (owner: `codenametempest14`) and **ask before every push and every merge to `main`**, naming the target.
6. At the end: Session Close Report (with the Phase Progress table), update CURRENT_STATE.md, PROGRESS_LOG.md entry, then run `node tools/continuation-prompt.mjs` and **show the generated prompt and the progress table in the final message**.

## Where we are
[P00 · Kickoff and decisions · 13/13 done · 0 blocked · unverified 0]

### Phase Progress (end of the previous session)
| Phase | Done / Total | Progress | % |
|---|---|---|---|
| P00 Kickoff and decisions | 13 / 13 | ██████████ | 100% |
| P01 Heat index core and bench bring-up | 0 / 8 | ░░░░░░░░░░ | 0% |
| P02 Backend and secure upload | 0 / 6 | ░░░░░░░░░░ | 0% |
| P03 Device firmware | 0 / 7 | ░░░░░░░░░░ | 0% |
| P04 Web app core | 0 / 8 | ░░░░░░░░░░ | 0% |
| P05 Admin, alerts and device health | 0 / 5 | ░░░░░░░░░░ | 0% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 13 / 62 | ██░░░░░░░░ | **21%** |

### Recommended model for this session
**Sonnet 5.5**, because P01 is the heat index function written test-first plus bench bring-up, which needs care but not deep architecture. Switch to **Opus 5.5** when P02 starts (Supabase schema, row-level rules, device-key security).

### Next concrete step
1. Ask the phase-builder question, then start P01: write the heat index tests first (P01-01) and watch them fail. Explain the formula to the owner before coding.
2. In parallel, when the owner has the parts: run the power bank low-load test (P01-04).

### Waiting on the owner
- Nothing blocks the start of P01. Ask which parts the owner already has (ESP32, DHT22, OLED, resistors, breadboard).
- ROMOSS has a low-current mode (owner, 2026-10-31). Still run the auto-off test at deep-sleep current with the real bank and board (P01-04).
- Pushed `codenametempest14` to origin on 2026-10-31 (owner approved). `main` NOT pushed: the owner asked for it, but CLAUDE.md rules 3 and 4 and the pre-push hook forbid it. Waiting for the owner to either amend the rule explicitly or use a pull request.
