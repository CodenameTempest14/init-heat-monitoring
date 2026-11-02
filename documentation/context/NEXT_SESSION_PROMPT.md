# Continue Classroom Heat Index Monitoring (prompt generated 2026-11-02)

You are continuing **classroom-heat-index-monitoring** (d:\System Documents\Documents\Codes\classroom-heat-index-monitoring): a power-bank-powered ESP32 room monitor (DHT22 + OLED) plus a public web app (PWA on Supabase + free static hosting) showing temperature, humidity and heat index for one classroom. The owner is learning: explain before and while implementing.

## HARD RULES (full text in CLAUDE.md)
1. Read in this order and nothing more: CLAUDE.md, documentation/context/CURRENT_STATE.md, the current phase checklist in documentation/phases/, the last Session Close Report.
2. Start with a Session Start Report that includes the **Phase Progress table** (`node tools/phase-report.mjs --md`) and says **which Claude model to use and why**. In the first reply ask: *"Is this phase being built only by you, or is Shem also working on it?"*
3. Open every reply with the status line from `node tools/phase-report.mjs`.
4. No new feature is planned, designed or built until the owner approves it in documentation/specs/FEATURES.md.
5. **Push only to your own branch** (owner: `codenametempest14`) and **ask before every push and every merge to `main`**, naming the target.
6. At the end: Session Close Report (with the Phase Progress table), update CURRENT_STATE.md, PROGRESS_LOG.md entry, then run `node tools/continuation-prompt.mjs` and **show the generated prompt and the progress table in the final message**.

## Where we are
[P03 · Device firmware · 9/10 done · 0 blocked · unverified 0]

### Phase Progress (end of the previous session)
| Phase | Done / Total | Progress | % |
|---|---|---|---|
| P00 Kickoff and decisions | 13 / 13 | ██████████ | 100% |
| P01 Heat index core and bench bring-up | 7 / 7 | ██████████ | 100% |
| P02 Backend and secure upload | 7 / 7 | ██████████ | 100% |
| P03 Device firmware | 9 / 10 | █████████░ | 90% |
| P04 Web app core | 5 / 13 | ████░░░░░░ | 38% |
| P05 Admin, alerts and device health | 0 / 6 | ░░░░░░░░░░ | 0% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 41 / 71 | ██████░░░░ | **58%** |

### Recommended model for this session
**Sonnet 5.5** for P03-07 (24 h on the power bank: mostly waiting and reading the server). **Opus 5.5** only if the logo-on-the-setup-page proposal is approved and built in the same session (it changes the page code that handles the Wi-Fi password).

### Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. **P03-07** 24-hour run on the ROMOSS bank: owner charges it fully, notes the bank's charge level and the start time, unplugs USB from the PC, runs the board on the bank. Evidence from the server: one row a minute for 24 h (init-test, "Room 1"), gaps listed with their cause; bank level at the end = the measured drop. Keep the interval at 60 s (D-027).
3. **Owner decides** on `design/device-setup/proposal-logo/` (Init icon above the title, title `INIT SETUP`; open question: should the "Saved" title be `SAVED` too?). If approved: steps in that folder's README (copy over the approved pages, re-capture `ref/`, change `wifi_setup.h` until `tests/firmware-setup-page.test.js` passes, flash, check on the phone).
4. Not tried for P03-05: the 10-minute setup timeout, an iPhone, light mode on the phone. Not tried for P03-06: queue over 50, a full queue, the 400 drop. Flash is 76.9 % full (matters for P08 OTA).
5. Before the board moves to live: apply the 7th migration to live `init` (owner).
6. Open: the Tabler dashboard is about 832 px wide at a 390 px viewport (cause not diagnosed); our home page must not scroll sideways.
7. Before every commit run `node tools/secret-scan.mjs` (exits 1 on a hit; it also guards the hotspot name through the old `SECRET_WIFI_*` lines kept in the local `secrets.h`). Inline SQL works: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`.

### Waiting on the owner
- Push of the s14 commits to `codenametempest14` and `main` (asked at close).
- Logo-on-the-setup-page proposal: approve or change (`design/device-setup/proposal-logo/ref/`).
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Apply the 7th migration to live `init` before the board moves to live (D-028). Later: dummy load or another bank (D-027).
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones.
- Later (P07): a USB inline meter to measure the awake current.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
