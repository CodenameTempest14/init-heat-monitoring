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
[P03 · Device firmware · 3/10 done · 0 blocked · unverified 0]

### Phase Progress (end of the previous session)
| Phase | Done / Total | Progress | % |
|---|---|---|---|
| P00 Kickoff and decisions | 13 / 13 | ██████████ | 100% |
| P01 Heat index core and bench bring-up | 7 / 7 | ██████████ | 100% |
| P02 Backend and secure upload | 7 / 7 | ██████████ | 100% |
| P03 Device firmware | 3 / 10 | ███░░░░░░░ | 30% |
| P04 Web app core | 3 / 13 | ██░░░░░░░░ | 23% |
| P05 Admin, alerts and device health | 0 / 6 | ░░░░░░░░░░ | 0% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 33 / 71 | █████░░░░░ | **46%** |

### Recommended model for this session
**Sonnet 5.5** for P03-01 (PlatformIO project) and P04-D4/D5 (template screenshots, UI-GATE). Switch to Opus 5.5 for P03-02 (device key in firmware, TLS certificate check) and P03-05 (setup page).

### Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. Owner chooses: **P03-01** (PlatformIO project builds, `secrets.h` gitignored; check PlatformIO is installed first; also pins the Adafruit GFX and SSD1306 versions), or **P04-D4** (template screenshots; install Playwright first) then **P04-D5** (UI-GATE). P03-04 later draws the screens from `design/oled/screens.mjs` calls and is checked against `design/oled/ref/` (photo check).
3. Carried over from s08, optional: after 18:30 UTC read `cron.job_run_details` on `init-test` to see the first scheduled retention run succeeded (`{hours:0, deleted:0}` expected).
4. In P03-04 check: `display.cp437(true)` gives the degree sign; the size-4 digits look clean on the real OLED.

### Waiting on the owner
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones (the assistant only knows the logins work).
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.
