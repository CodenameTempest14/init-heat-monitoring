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
| P04 Web app core | 11 / 13 | █████████░ | 85% |
| P05 Admin, alerts and device health | 0 / 6 | ░░░░░░░░░░ | 0% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 47 / 71 | ███████░░░ | **66%** |

### Recommended model for this session
**Sonnet 5.5**: P04-07 build, the 24 h run evidence and P04-08. Opus 5.5 only for the admin sign-in in P05.

### Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. Ask the owner to approve a push of the s18 commits after `6c0f41e` (`53afa9b`, `c3f9fcc`, `aa3db15`, `cab3145`, `42ac211` and the s18 close commit) to `codenametempest14` and `main`, naming both targets.
3. **P03-07 is RUNNING** (owner started it 2026-11-02 18:03 local = 10:03Z, bank 100 %, board on the bank only; it ends 2026-11-03 10:03Z = 18:03 local). At the end: ask the owner for the bank level; count `init-test` rows (device "Room 1") with `received_at` between those two times (about 1 440 expected; the first row on the bank came at 10:03:55Z) and list gaps over 90 s with their cause; the drop is the result; then tick P03-07. Do not run the backend tests until then (they wipe init-test). **Do not unplug the board during the run.**
4. **The 2 min offline rule is still unseen on the hosted page** (the one unverified change). Best moment: when the run ends and the owner unplugs the board, ask for screenshots at about 2 and 3 min.
5. **Build P04-07 school-day view (F-12, D-033, all approved)**, test first. Mocks: `design/school-day/` (README lists the rules). (a) Migration `school_day(day, for_device)` in the database: Monday to Friday 6:00 AM to 7:15 PM Asia/Manila, highest and lowest heat index with the time, hottest clock hour (highest average, with that average), average (readings below the heat index range have no heat index and are left out), minutes in each PAGASA level on the heat index rounded to whole °C plus No reading; a reading counts until the next one, at most 120 s; the minutes add up to the length of the window (to now for today). Write `tests/backend/school-day.backend.js` first, **but the backend tests wipe init-test: run them only after P03-07 ends** (until then check the function with read-only queries against real rows, and the owner applies the migration to init-test and live like `history()`). (b) The web view `#school` (new `web/src/School.jsx` and `school.js`; only `web/src/school.css` exists so far), the link row on the home page under `updated ...`, a day picker (previous and next school day, weekends skipped, up to 90 days back), the four states of the mocks. (c) After the link row is in: redraw `design/{home-cards,offline-badge,history-charts}` mocks and images (their builders, then `capture.mjs`), then a new `tests/ui-gate-school.test.js`, and run the gates one at a time.
6. After P04-07: **P04-08** (a real browser and a real phone, screenshots free of personal data), then P05. Not done from P04-05: Lighthouse or Chrome's install check, an iPhone add-to-home-screen, the light-mode header and the offline page on a phone.
7. Not done: sensor accuracy check against a reference thermometer next to the board; why the sensor read 23.1 °C at 20:14Z on 2026-11-01 (real row, then a 52 min gap: ask the owner); the probe has never caught a real hole; desktop layout is gated only for the 24 h charts page; light mode of the setup page and of the badge on the phone. Open: page loads took 2.7 to 4.2 s (Supabase cold start?); the stylesheet is 694 kB (all of Tabler, trim later).
8. Not tried for P03-05: the 10-minute setup timeout, an iPhone. Not tried for P03-06: queue over 50, a full queue, the 400 drop. Flash is 77.0 % full (matters for P08 OTA).
9. Before every commit run `node tools/secret-scan.mjs` (exits 1 on a hit; it also guards the hotspot name). Inline SQL works: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"` (read-only queries on `live` work too).

### Waiting on the owner
- At 18:03 local on 2026-11-03: the power bank's level (P03-07), then unplug the board for the offline check (screenshots at about 2 and 3 min).
- Approve a push of the s18 commits after `6c0f41e` to `codenametempest14` and `main`.
- Optional: why the sensor read 23.1 °C at 04:14 local on 2026-11-02 (was the board moved?). Optional: try add-to-home-screen on the iPhone.
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Later: dummy load or another bank (D-027).
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones.
- Optional: a reference thermometer and hygrometer for the sensor check. Later (P07): a USB inline meter for the awake current.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
