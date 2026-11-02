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
| P04 Web app core | 12 / 13 (+1 partly) | █████████░ | 92% |
| P05 Admin, alerts and device health | 1 / 6 (+3 partly) | ██░░░░░░░░ | 17% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 49 / 71 | ███████░░░ | **69%** |

### Recommended model for this session
**Sonnet 5.5**: the 24 h run evidence (P03-07), the offline check, `npm test`, P04-08 and the first real admin saves. Opus 5.5 for P05-03 (push alerts: Edge Function, keys, subscriptions) and the live admin rollout (P05-05 on live).

### Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. **P03-07 is RUNNING** (owner started it 2026-11-02 18:03 local = 10:03Z, bank 100 %, board on the bank only; it ends 2026-11-03 10:03Z = 18:03 local). At the end: ask the owner for the bank level; count `init-test` rows (device "Room 1") with `received_at` between those two times (about 1 440 expected; the first row on the bank came at 10:03:55Z) and list gaps over 90 s with their cause; the drop is the result; then tick P03-07. Do not run the backend tests (other than `school-day`) until then (they wipe init-test). **Do not unplug the board during the run.**
2b. **Lone-bucket dot (s20, `f8390dc`): verified on the hosted page** in a fresh Chromium at 390 px, dark and light (dots at about 05:00 and 06:30 on all three charts, no console messages). The owner will also send a phone screenshot with the run-end values (they wrote "6:03 AM": the run ends 6:03 PM, confirm).
2c. **P04-08 partly done (s20, hosted page, Chromium):** Chrome's installability check passes (no errors, manifest readable, one service worker); Lighthouse 12 mobile: performance 98, accessibility 100, best practices 100, SEO 91 (missing meta description; render-blocking CSS, 87 KiB unused CSS). Light-mode home page and header look right. s21: the meta description is live (seen in the served page; Lighthouse not re-run), and the owner's phone screenshots (dark mode: home, 24 h history, school day for Mon 2 Nov with one level plus no reading) show no defect. Still needs: the school-day view with a day in several levels, the offline page on a phone, an iPhone add-to-home-screen, light mode on the phone.
3. **The 2 min offline rule is still unseen on the hosted page** (the one unverified change). Best moment: when the run ends and the owner unplugs the board, ask for screenshots at about 2 and 3 min.
4. After the run: run the whole backend suite once (`npm test`), then **P04-08** (a real browser and a real phone, screenshots free of personal data; include the school-day view, the link row spacing and a day with readings in several levels), then P05. **P05 state (s22):** P05-01 done; P05-02, P05-05, P05-06 partly done (see the checklist). After the run: (a) owner changes the room once from `#admin` (phone) and a setting (e.g. interval 60 → 90 → back to 60) and we watch the device pick up the interval from the upload reply (P05-02, P05-06); (b) admin migration on live (owner runs `node --env-file=.env tools/db.mjs live db push`), live admin account with an email the owner owns and a long generated password, `node tools/anon-probe.mjs <live url> <live key>` (P05-05); (c) P05-04 device health (migration + firmware + tests); (d) P05-03 push alerts last. `npm test` now includes `tests/web-admin.test.js` and `tests/ui-gate-admin.test.js`; `npm run test:backend` includes `admin.backend.js`. Not done from P04-05: Lighthouse or Chrome's install check, an iPhone add-to-home-screen, the light-mode header and the offline page on a phone.
5. Not done: sensor accuracy check against a reference thermometer next to the board; (the 23.1 °C reading at 20:14Z on 2026-11-01 was the board being moved, owner s21); the probe has never caught a real hole; desktop layout is gated only for the 24 h charts page and the finished school day; light mode of the setup page and of the badge on the phone. Open: page loads took 2.7 to 4.2 s (Supabase cold start?); the stylesheet is 698 kB (all of Tabler, trim later).
6. Not tried for P03-05: the 10-minute setup timeout, an iPhone. Not tried for P03-06: queue over 50, a full queue, the 400 drop. Flash is 77.0 % full (matters for P08 OTA).
7. Before every commit run `node tools/secret-scan.mjs` (exits 1 on a hit; it also guards the hotspot name). Inline SQL works: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"` (read-only queries on `live` work too). Scripted edits through a shell heredoc with backslash-n or backticks can silently not apply: use the Edit tool and open the page in a browser, not only the build.

### Waiting on the owner
- At 18:03 local on 2026-11-03: the power bank's level (P03-07), then unplug the board for the offline check (screenshots at about 2 and 3 min).
- Try `#admin` on the phone with the test admin (seen in the computer browser, s22); after the run ends, one real room save and one setting change.
- For live: an admin email you own and a long generated password, created in the dashboard; then the admin migration on live (`node --env-file=.env tools/db.mjs live db push`, owner runs it) and `anon-probe` against live.
- Optional: try add-to-home-screen on the iPhone; send a phone screenshot of a school day with several levels (e.g. an earlier day) and of the light mode.
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Later: dummy load or another bank (D-027).
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones.
- Optional: a reference thermometer and hygrometer for the sensor check. Later (P07): a USB inline meter for the awake current.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
