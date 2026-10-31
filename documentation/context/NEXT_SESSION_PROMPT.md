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
[P02 · Backend and secure upload · 4/7 done · 0 blocked · unverified 0]

### Phase Progress (end of the previous session)
| Phase | Done / Total | Progress | % |
|---|---|---|---|
| P00 Kickoff and decisions | 13 / 13 | ██████████ | 100% |
| P01 Heat index core and bench bring-up | 7 / 7 | ██████████ | 100% |
| P02 Backend and secure upload | 4 / 7 (+1 partly) | ██████░░░░ | 57% |
| P03 Device firmware | 0 / 10 | ░░░░░░░░░░ | 0% |
| P04 Web app core | 3 / 13 | ██░░░░░░░░ | 23% |
| P05 Admin, alerts and device health | 0 / 6 | ░░░░░░░░░░ | 0% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 27 / 71 | ████░░░░░░ | **38%** |

### Recommended model for this session
**Opus 5.5**, because P02-05 (retention job), P02-06 (security review) and the first push to the live database are security and data-loss sensitive. Return to Sonnet 5.5 for P03 firmware and P04 UI work.

### Next concrete step
1. Ask the phase-builder question (last answer: owner only). Then P02-05: test-first retention job (`pg_cron`, daily): readings older than 90 days → `readings_hourly` (avg/min/max, max with its exact time, grouped by room), then deleted, in one transaction. The test inserts old readings with the secret key and runs the job function directly. This also finishes P02-07 (hourly rows keep the room).
2. P02-06: security review of the backend; record findings. Known items to include: the accepted advisor warning (anon may run `ingest_reading`, intended); wrong-key calls are not rate limited (only accepted calls are); the free-tier project pause risk.
3. Then ask the owner before applying the migrations to the live `init` project (`node --env-file=.env tools/db.mjs live db push`) and registering the device there (`node --env-file=.env tools/device-key.mjs register live "<name>"`; room stays "Unassigned", owner s07).
4. Interleavable software work: P04-D4 (template screenshots; install Playwright first) and P04-D5 (UI-GATE). P03 starts with the OLED design canvas P03-D1 to D3 (D-022).

### Waiting on the owner
- Nothing blocking.
- Approval before the first push of migrations to the live `init` project.
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.
