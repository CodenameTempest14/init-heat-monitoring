# Continue Classroom Heat Index Monitoring (prompt generated 2026-11-03)

You are continuing **classroom-heat-index-monitoring** (d:\System Documents\Documents\Codes\classroom-heat-index-monitoring): a power-bank-powered ESP32 room monitor (DHT22 + OLED) plus a public web app (PWA on Supabase + free static hosting) showing temperature, humidity and heat index for one classroom. The owner is learning: explain before and while implementing.

## HARD RULES (full text in CLAUDE.md)
1. Read in this order and nothing more: CLAUDE.md, documentation/context/CURRENT_STATE.md, the current phase checklist in documentation/phases/, the last Session Close Report.
2. Start with a Session Start Report that includes the **Phase Progress table** (`node tools/phase-report.mjs --md`) and says **which Claude model to use and why**. In the first reply ask: *"Is this phase being built only by you, or is Shem also working on it?"*
3. Open every reply with the status line from `node tools/phase-report.mjs`.
4. No new feature is planned, designed or built until the owner approves it in documentation/specs/FEATURES.md.
5. **Push only to your own branch** (owner: `codenametempest14`) and **ask before every push and every merge to `main`**, naming the target.
6. At the end: Session Close Report (with the Phase Progress table), update CURRENT_STATE.md, PROGRESS_LOG.md entry, then run `node tools/continuation-prompt.mjs` and **show the generated prompt and the progress table in the final message**.

## Where we are
[P03 · Device firmware · 10/10 done · 0 blocked · unverified 0]

### Phase Progress (end of the previous session)
| Phase | Done / Total | Progress | % |
|---|---|---|---|
| P00 Kickoff and decisions | 13 / 13 | ██████████ | 100% |
| P01 Heat index core and bench bring-up | 7 / 7 | ██████████ | 100% |
| P02 Backend and secure upload | 7 / 7 | ██████████ | 100% |
| P03 Device firmware | 10 / 10 | ██████████ | 100% |
| P04 Web app core | 12 / 13 (+1 partly) | █████████░ | 92% |
| P05 Admin, alerts and device health | 2 / 7 (+3 partly) | ███░░░░░░░ | 29% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 51 / 72 | ███████░░░ | **71%** |

### Recommended model for this session
**Sonnet 5.5**: `npm test`, the P05-04 migration and wiring, P04-08 and the first real admin saves. Opus 5.5 for P05-03 (push alerts: Edge Function, keys, subscriptions) and the live admin rollout (P05-05 on live).

### Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. **P03-07 DONE (s25, ticked `70223d6`):** 24 h run in two legs on the bank only, 1 429 of about 1 440 rows, gaps 221 s, 385 s (the break), 95 s (causes unconfirmed), bank 100 % to 95 % to 90 %. The board was replugged for the offline check; **ask the owner whether it is running again** before `npm test`.
2a. Run details: see P03-07 evidence in `documentation/phases/phase-03-firmware.md`.
2a2. **P05-04 server side written, NOT applied (s25, owner: apply after the run):** `supabase/migrations/20261106120000_device_health.sql` (table `device_health`, `ingest_reading` with an optional third argument `health`, drops and re-creates the function), `tests/backend/health.backend.js` (6 tests, seen red 0/6 first, throwaway devices only), design `documentation/specs/P05-04_DESIGN.md`. After the run ends: owner or I apply it to init-test (`node --env-file=.env tools/db.mjs test db push`), run `health.backend.js` to green, then `npm test`. The admin Device health group (`Admin.jsx`, between Room and Device, own How? link) and guide section 3 `#guide/health` are built and gated (admin gate 18/18, guide gate 6/6, `web-admin` 11/11; mocks `design/admin/health/`, teacher approved the wording). Firmware: `include/health.h` + `tests/health_test.cpp` + `tests/firmware-health.test.js` done, `readings.h` takes an optional health part; `main.cpp` NOT wired, nothing flashed (waits for the run). Everything is uncommitted; a push would deploy the new admin page to Vercel, where it shows "Not reported yet" until the migration and firmware are in. Also found: the 16:15Z gap looks like a reboot (no queue backfill, upload phase shifted :28 to :08), cause unconfirmed.
2a3. **F-15 extended "What does this mean?" (s25, owner approved the proposal and the mocks): BUILT, NOT PUSHED.** Route `#heat` and `#heat/<level>` (`web/src/Heat.jsx`, `heatText.js`, `heatArt.js` clip art, `heat.css`), a **What does this mean? ›** link inside the heat card (not on Below range; style in `app.css`). Gates: `tests/ui-gate-heat.test.js` 10/10 (red first), home 12, badge 9, history 13, school 14, guide 6, admin 18, pwa 5 (home mocks redrawn with the link), `tests/web-heat.test.js` 4/4 (the page's ranges equal `category.js`; seen red with a wrong range). **Teacher reviewed the wording and the owner said it is approved as is (s25, 2026-11-03); pushed to `main` in s25 at the owner's word.** PAGASA's own level table was not readable (effects per level are from news summaries); warning signs are general first-aid knowledge; D-019 ranges vs an older 32/41/54 table to confirm. Checklist P06-03 NOT ticked (F-15 line under the heat level is not built). Not seen on a phone yet.
2b. **Lone-bucket dot (s20, `f8390dc`): verified on the hosted page** in a fresh Chromium at 390 px, dark and light (dots at about 05:00 and 06:30 on all three charts, no console messages). The owner will also send a phone screenshot with the run-end values (they wrote "6:03 AM": the run ends 6:03 PM, confirm).
2c. **P04-08 partly done (s20, hosted page, Chromium):** Chrome's installability check passes (no errors, manifest readable, one service worker); Lighthouse 12 mobile: performance 98, accessibility 100, best practices 100, SEO 91 (missing meta description; render-blocking CSS, 87 KiB unused CSS). Light-mode home page and header look right. s21: the meta description is live (seen in the served page; Lighthouse not re-run), and the owner's phone screenshots (dark mode: home, 24 h history, school day for Mon 2 Nov with one level plus no reading) show no defect. s24: light mode on the phone seen (owner's screenshots of home, history, school day, admin, guide: no defect). Still needs: the school-day view with a day in several levels (Mon 2 Nov has only Extreme caution plus no reading), the offline page on a phone, an iPhone add-to-home-screen.
3. **The 2 min offline rule: SEEN on the hosted page (s25, 2026-11-03).** Last row 13:43:36Z (unplugged by the owner), the owner's phone screenshot at 2 min shows `Offline: no reading for 2 min` and `last reading 2 min ago`. Not seen: still Online before 2 min, and the 3 min mark. No unverified change left.
4. After the run: run the whole backend suite once (`npm test`), then **P04-08** (a real browser and a real phone, screenshots free of personal data; include the school-day view, the link row spacing and a day with readings in several levels), then P05. **P05 state (s23):** P05-01 and P05-07 (admin guide) done; P05-02, P05-05, P05-06 partly done (see the checklist). After the run: (a) owner changes the room once from `#admin` (phone) and a setting (e.g. interval 60 → 90 → back to 60) and we watch the device pick up the interval from the upload reply (P05-02, P05-06); (b) admin migration on live (owner runs `node --env-file=.env tools/db.mjs live db push`), live admin account with an email the owner owns and a long generated password, `node tools/anon-probe.mjs <live url> <live key>` (P05-05); (c) P05-04 device health (migration + firmware + tests); (d) F-22 admin guide: done in s23 (see above); (e) P05-03 push alerts last. `npm test` now includes `tests/web-admin.test.js` and `tests/ui-gate-admin.test.js`; `npm run test:backend` includes `admin.backend.js`. Not done from P04-05: Lighthouse or Chrome's install check, an iPhone add-to-home-screen, the light-mode header and the offline page on a phone.
5. Not done: sensor accuracy check against a reference thermometer next to the board; (the 23.1 °C reading at 20:14Z on 2026-11-01 was the board being moved, owner s21); the probe has never caught a real hole; desktop layout is gated only for the 24 h charts page and the finished school day; light mode of the setup page and of the badge on the phone. Open: page loads took 2.7 to 4.2 s (Supabase cold start?); the stylesheet is 698 kB (all of Tabler, trim later).
6. Not tried for P03-05: the 10-minute setup timeout, an iPhone. Not tried for P03-06: queue over 50, a full queue, the 400 drop. Flash is 77.0 % full (matters for P08 OTA).
7. Before every commit run `node tools/secret-scan.mjs` (exits 1 on a hit; it also guards the hotspot name). Inline SQL works: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"` (read-only queries on `live` work too). Scripted edits through a shell heredoc with backslash-n or backticks can silently not apply: use the Edit tool and open the page in a browser, not only the build.

### Waiting on the owner
- Confirm the board is replugged and sending rows (needed before `npm test`/P05-04 flashing work).
- Try `#admin` on the phone with the test admin (seen in the computer browser, s22); after the run ends, one real room save and one setting change.
- For live: an admin email you own and a long generated password, created in the dashboard; then the admin migration on live (`node --env-file=.env tools/db.mjs live db push`, owner runs it) and `anon-probe` against live.
- Optional: try add-to-home-screen on the iPhone; send a phone screenshot of a school day with several levels (e.g. an earlier day) and of the light mode.
- Teacher review of the app's other user-facing wording (the guide and F-15 `#heat` are approved, D-034).
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Later: dummy load or another bank (D-027).
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones.
- Optional: a reference thermometer and hygrometer for the sensor check. Later (P07): a USB inline meter for the awake current.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
