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
| P04 Web app core | 8 / 13 | ██████░░░░ | 62% |
| P05 Admin, alerts and device health | 0 / 6 | ░░░░░░░░░░ | 0% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 44 / 71 | ██████░░░░ | **62%** |

### Recommended model for this session
**Sonnet 5.5**: checking the deploy, waiting on the 24 h run, the P04-03 design. Opus 5.5 only for the admin sign-in in P05.

### Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. Ask the owner to approve a push of the s16 close commits to `codenametempest14` and `main`, naming both targets.
3. **P03-07** 24-hour run on the ROMOSS bank, **when the owner says it is full** (not confirmed full at s16 close). Owner notes the bank level and start time, unplugs USB, runs the board on the bank. Evidence from the server: one row a minute for 24 h (init-test, device "Room 1"; the room shows `Unassigned`, which is fine), gaps listed with their cause; bank level at the end = the measured drop. Interval stays 60 s (D-027). Old init-test rows stay (owner told to leave them; count with a time window; the s16 unplug test left one 435 s gap, 09:05:45Z to 09:13:00Z, before the run). Do not run the backend tests during the run (they wipe init-test).
4. Next P04 items, each needs a **design mock approved first** (D-016): P04-04 24 h and 7 d charts (F-04; read the `dataviz` skill first), then P04-05 PWA (manifest, service worker, **favicon, home-screen icons and the header logo: the owner chose to add them here**), P04-06 to P04-08. Also confirm with the owner that 3 min is the wanted offline limit (a short Wi-Fi drop can show Offline for a few minutes).
5. Not done: sensor accuracy check against a reference thermometer next to the board; the anonymous-write recheck; desktop layout is in the mocks only; iPhone; light mode of the setup page and of the badge on the phone. Open: page loads took 2.7 to 4.2 s (Supabase cold start?); the stylesheet is 692 kB (all of Tabler, trim later).
6. Not tried for P03-05: the 10-minute setup timeout, an iPhone. Not tried for P03-06: queue over 50, a full queue, the 400 drop. Flash is 77.0 % full (matters for P08 OTA).
7. Before the board moves to live: apply the 7th migration to live `init` (owner).
8. Before every commit run `node tools/secret-scan.mjs` (exits 1 on a hit; it also guards the hotspot name). Inline SQL works: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`.

### Waiting on the owner
- Say when the power bank is full, the start time and the bank's level (P03-07).
- Approve a push of the s16 close commits to `codenametempest14` and `main`.
- Say if 3 min is the wanted offline limit.
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Apply the 7th migration to live `init` before the board moves to live (D-028). Later: dummy load or another bank (D-027).
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones.
- Optional: a reference thermometer and hygrometer for the sensor check. Later (P07): a USB inline meter for the awake current.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
