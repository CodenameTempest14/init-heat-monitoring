# Continue Classroom Heat Index Monitoring (prompt generated 2026-11-01)

You are continuing **classroom-heat-index-monitoring** (d:\System Documents\Documents\Codes\classroom-heat-index-monitoring): a power-bank-powered ESP32 room monitor (DHT22 + OLED) plus a public web app (PWA on Supabase + free static hosting) showing temperature, humidity and heat index for one classroom. The owner is learning: explain before and while implementing.

## HARD RULES (full text in CLAUDE.md)
1. Read in this order and nothing more: CLAUDE.md, documentation/context/CURRENT_STATE.md, the current phase checklist in documentation/phases/, the last Session Close Report.
2. Start with a Session Start Report that includes the **Phase Progress table** (`node tools/phase-report.mjs --md`) and says **which Claude model to use and why**. In the first reply ask: *"Is this phase being built only by you, or is Shem also working on it?"*
3. Open every reply with the status line from `node tools/phase-report.mjs`.
4. No new feature is planned, designed or built until the owner approves it in documentation/specs/FEATURES.md.
5. **Push only to your own branch** (owner: `codenametempest14`) and **ask before every push and every merge to `main`**, naming the target.
6. At the end: Session Close Report (with the Phase Progress table), update CURRENT_STATE.md, PROGRESS_LOG.md entry, then run `node tools/continuation-prompt.mjs` and **show the generated prompt and the progress table in the final message**.

## Where we are
[P03 · Device firmware · 5/10 done · 0 blocked · unverified 0]

### Phase Progress (end of the previous session)
| Phase | Done / Total | Progress | % |
|---|---|---|---|
| P00 Kickoff and decisions | 13 / 13 | ██████████ | 100% |
| P01 Heat index core and bench bring-up | 7 / 7 | ██████████ | 100% |
| P02 Backend and secure upload | 7 / 7 | ██████████ | 100% |
| P03 Device firmware | 5 / 10 | █████░░░░░ | 50% |
| P04 Web app core | 5 / 13 | ████░░░░░░ | 38% |
| P05 Admin, alerts and device health | 0 / 6 | ░░░░░░░░░░ | 0% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 37 / 71 | █████░░░░░ | **52%** |

### Recommended model for this session
**Sonnet 5.5** for P03-03, P03-04 and P03-06. **Opus 5.5** for P03-05 (setup page: it takes Wi-Fi passwords from a phone).

### Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. **Reflash the normal build**: the board still runs the `esp32dev_wrongca` test build from the P03-02 proof (every upload fails by design). In `firmware/init`: `pio run -t upload --upload-port COM8`, then read COM8 and check `-> 200`.
3. **P03-03**: upload interval read from the server settings instead of the fixed 60 s in `main.cpp`; the loop stays awake (D-018) and the bank stays on between sends.
4. In P03-04 check: `display.cp437(true)` gives the degree sign; the size-4 digits look clean on the real OLED.
5. Open: the Tabler dashboard is about 832 px wide at a 390 px viewport (cause not diagnosed); our home page must not scroll sideways.
6. Owner to decide: `firmware/init/.gitignore` and `firmware/init/.vscode/` (made by the PlatformIO extension) are untracked; commit, ignore or delete.

### Waiting on the owner
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones (the assistant only knows the logins work).
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
