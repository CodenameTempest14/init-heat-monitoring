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
[P02 · Backend and secure upload · 7/7 done · 0 blocked · unverified 0]

### Phase Progress (end of the previous session)
| Phase | Done / Total | Progress | % |
|---|---|---|---|
| P00 Kickoff and decisions | 13 / 13 | ██████████ | 100% |
| P01 Heat index core and bench bring-up | 7 / 7 | ██████████ | 100% |
| P02 Backend and secure upload | 7 / 7 | ██████████ | 100% |
| P03 Device firmware | 0 / 10 | ░░░░░░░░░░ | 0% |
| P04 Web app core | 3 / 13 | ██░░░░░░░░ | 23% |
| P05 Admin, alerts and device health | 0 / 6 | ░░░░░░░░░░ | 0% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 30 / 71 | ████░░░░░░ | **42%** |

### Recommended model for this session
**Sonnet 5.5**, because the next items (OLED design canvas P03-D1 to D3, web template screenshots P04-D4) are design work with no security-sensitive changes. Switch to Opus 5.5 for P03-02 (device key in firmware, TLS certificate check) and P03-05 (setup page).

### Next concrete step
1. Ask the phase-builder question (last answer: owner only). Ask whether the owner did the dashboard actions S-4, S-5, S-6 from `documentation/specs/SECURITY_REVIEW.md` on both projects; if yes, read the settings back with the read-only token (auth `disable_signup`, `ssl-enforcement`) and note it in SECURITY_REVIEW.md.
2. P03-D1: `design/oled/` with README: screen list from the approved features (F-08, offline and setup states of F-03 and D-011), the 128×64 grid spec, open-source pixel fonts (D-010). Then P03-D2 reference images for the owner to approve.
3. Interleavable: P04-D4 (template screenshots; install Playwright first) and P04-D5 (UI-GATE).
4. Optional check: after 18:30 UTC, read `cron.job_run_details` on `init-test` to see the first scheduled run succeeded (nothing to roll up yet, so `{hours:0, deleted:0}`).

### Waiting on the owner
- SECURITY_REVIEW S-4 (turn off sign-ups), S-5 (enforce SSL), S-6 (new generated DB passwords, update `.env`), on both projects.
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.
