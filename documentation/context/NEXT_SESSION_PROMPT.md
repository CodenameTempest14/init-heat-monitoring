# Continue Classroom Heat Index Monitoring (prompt generated 2026-11-04)

You are continuing **classroom-heat-index-monitoring** (d:\System Documents\Documents\Codes\classroom-heat-index-monitoring): a power-bank-powered ESP32 room monitor (DHT22 + OLED) plus a public web app (PWA on Supabase + free static hosting) showing temperature, humidity and heat index for one classroom. The owner is learning: explain before and while implementing.

## HARD RULES (full text in CLAUDE.md)
1. Read in this order and nothing more: CLAUDE.md, documentation/context/CURRENT_STATE.md, the current phase checklist in documentation/phases/, the last Session Close Report.
2. Start with a Session Start Report that includes the **Phase Progress table** (`node tools/phase-report.mjs --md`) and says **which Claude model to use and why**. In the first reply ask: *"Is this phase being built only by you, or is Shem also working on it?"*
3. Open every reply with the status line from `node tools/phase-report.mjs`.
4. No new feature is planned, designed or built until the owner approves it in documentation/specs/FEATURES.md.
5. **Push only to your own branch** (owner: `codenametempest14`) and **ask before every push and every merge to `main`**, naming the target.
6. **Research paper (CLAUDE.md rule 5):** keep `paper/` (.docx and .pdf, `node paper/build.mjs`) in step with every feature, change and new data; every reference must be opened and read by you, published 2021 to 2026, never invented.
7. At the end: Session Close Report (with the Phase Progress table), update CURRENT_STATE.md, PROGRESS_LOG.md entry, then run `node tools/continuation-prompt.mjs` and **show the generated prompt and the progress table in the final message**.

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
| P05 Admin, alerts and device health | 5 / 7 (+1 partly) | ███████░░░ | 71% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 54 / 72 | ████████░░ | **75%** |

### Recommended model for this session
**Opus 5.5** if the phone test fails (debugging the push chain: service worker, Edge Function logs, `alerts.sent/failed`, `net._http_response`). **Sonnet 5.5** is enough if the session is only the phone test, the tick, the paper and the P04-08 leftovers.

### Next concrete step
1. Ask the phase-builder question (last answer: owner only, s31). **P05-03 end-to-end on the owner's Android (init-test, hosted site already has `87a88eb`):** open the installed Init app (if it shows the old page, close it fully and reopen), **Heat alerts ›** → **Send me heat alerts** → Allow → "Heat alerts are on for this phone." In `#admin` set the heat index alert to **30 °C** and save (also the first real save from the page: counts toward P05-02). Within about a minute a notification should arrive ("Init heat alert — Heat index NN °C (...) in Unassigned."); no second one within 60 min. Owner's screenshots. Then read back `alerts` (`sent` 1, `failed` 0) with `db query --linked` (read-only), put the threshold back to **42**, and tick P05-03 if all holds. If nothing arrives: check `select * from alerts order by id desc limit 5`, `net._http_response` (newest rows), the function's logs in the dashboard, and `push_subscriptions` count. Optional: iPhone (installed app) subscribe too.
   Live (later, after the device move, D-026): migration on live (SQL Editor), `node tools/vapid-keys.mjs live`, function secrets + deploy + Vault on live, **new ALERT secret** (the test one was shown in chat), `npm run config -- live` and the CSP host in `web/vercel.json`, `anon-probe` on live must give 28/28.
2. **Research paper (rule 5), every session:** `node paper/build.mjs` rebuilds the `.docx` and `.pdf`. Chapter 4 is parked until the owner says so. Names are filled in (s29: three researchers, adviser Arvin C. Trangia, Abuno High School; the title page says Adviser, not Coach). Open: more references 2021 to 2026 (7 verified (s29: Kirkil 2025, Wardani 2023 added; Cen et al. 2024, Building and Environment, a Singapore secondary-school classroom heat and cognition study, was NOT added: ScienceDirect blocked my script, so I could not read it; try again from a browser copy); the ESP32 and DHT22 datasheets are used in Table 2 but not in References for lack of a confirmable date); add anything built to the paper; look at the Word file in Word once.
3. **Teacher review (D-034):** the Reset sentence in the F-22 guide and the Readings table wording.
4. **P04-08 leftovers:** the offline page on a phone, light mode on a phone, Lighthouse re-run (several levels and the iPhone installed app were seen in s31).
5. **Test command:** `npm test` (= `node --env-file=.env --test --test-concurrency=1`, 204/204 in s28; **not run as a whole in s31**: the backend tests wipe init-test readings, and the real board keeps uploading there) and `npm run test:backend`. In s31: `push.backend.js` 14/14 alone, UI gates one file at a time (home 12, badge 9, history 17, school 14, admin 20, guide 6, heat 10, core 5, alerts 16), other non-backend tests 132/132. Run the whole suite once at a moment the owner agrees to lose the init-test readings.
6. P03-07 follow-ups: causes of the gaps (220 s and 385 s); health report says why a restart happened. Not done: sensor accuracy check (needs a reference thermometer and hygrometer); the probe does not probe `readings_hourly` / `readings_span`; page loads 2.7 to 4.2 s; stylesheet 698 kB; P03-05 setup timeout and iPhone; P03-06 queue over 50, full queue, the 400 drop. Flash is about 77 % full (matters for P08). Firmware version is still 0.6.0.
7. F-24 edge: if a page ends between two rooms of the same hour (device moved in that hour), the second room's row is skipped. F-15 P06-03 not ticked. Timing note: a room change reaches the OLED at the device's next upload (up to `interval_s`, 60 s now).
8. Before every commit run `node tools/secret-scan.mjs`. Inline SQL: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`. Flash: in `firmware/init`, `pio run -t upload --upload-port COM8`, hold BOOT on `Connecting....`. Use the Edit tool for edits with backslash escapes; look at the page in a browser, not only the build. Never build a path with `new URL(...).pathname` (use `fileURLToPath`). `.vscode/settings.json` is untracked and not ours: leave it.

### Waiting on the owner
- The P05-03 phone test above (Android; iPhone optional), with screenshots.
- Delete the scratchpad helper files from s31 if still present (`send-alert-test.env`, `vault_for_sql_editor.sql`, `push_alerts_for_sql_editor.sql` in the s31 Claude scratchpad folder): the first two hold test secrets.
- Teacher review of the alert title and body and the `#alerts` wording before alerts go live (D-034).
- Teacher review of the Reset sentence and of the app's other user-facing wording.
- Optional: a phone screenshot of light mode and of the offline page.
- Paper: say "put Chapter 4 back" when wanted.
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Later: dummy load or another bank (D-027). A push button for the OLED wake (D-025). Optional: confirm the S-6 passwords. Optional: a reference thermometer and hygrometer; later (P07) a USB inline meter.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
