# Continue Classroom Heat Index Monitoring (prompt generated 2026-11-11)

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
[P07 · Field trial and hardening · 0/7 done · 0 blocked · unverified 0]

### Phase Progress (end of the previous session)
| Phase | Done / Total | Progress | % |
|---|---|---|---|
| P00 Kickoff and decisions | 13 / 13 | ██████████ | 100% |
| P01 Heat index core and bench bring-up | 7 / 7 | ██████████ | 100% |
| P02 Backend and secure upload | 7 / 7 | ██████████ | 100% |
| P03 Device firmware | 10 / 10 | ██████████ | 100% |
| P04 Web app core | 13 / 13 | ██████████ | 100% |
| P05 Admin, alerts and device health | 7 / 7 | ██████████ | 100% |
| P06 Display and sharing extras | 4 / 5 | ████████░░ | 80% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 61 / 72 | █████████░ | **85%** |

### Recommended model for this session
**Sonnet 5.5** for the case design (OpenSCAD edits, renders), the print guide and the paper. Switch to **Opus 5.5** when P07 firmware, power-bank runtime, data-gap or security-review work starts.

### Next concrete step
**s38 close (2026-11-11):** the owner buys one roll of light PETG (white or light grey) and a dark acrylic paint pen, then pings Claude. Meanwhile: review draft 6 (`enclosure/preview/draft6_*.png`, `init_case.scad`), confirm the EST guesses in `enclosure/PRINT_GUIDE.md` section 5, and measure one M2.5 flat-head screw head. Then: a short PLA test slice (port opening, button window, arm foot, logo), fix, then the final PETG print. Web and database stay ON HOLD (D-039). The s38 close commit is local until the owner approves a push.
**s37 close (2026-11-11):** the owner measures what is listed in `enclosure/MEASURE_NEXT.md` (sketch: `enclosure/preview/measure_guide.png`) on 2026-11-12; then draft 6 of `enclosure/init_case.scad` with the real sizes, OLED posts, DHT22 mount, pod lid; then the print guide (`enclosure/PRINT_GUIDE.md`, each value marked Bambu profile or estimate) and a short test print (vestibule + port opening) in PLA before the final PETG print. Website and database on hold (D-039). Open question to the owner: keep the arm on top of the cover (warm air) or hang the pod lower. Longer M3 screws needed (about M3 x 10 for the arm).
0. **Status after s38 (nothing changed in P06):** P06 is 4/5 (only P06-03 advice text left, waits for a teacher). P07 is 0/7; P07-01 (enclosure) is in design only. Everything is pushed to `codenametempest14` and `main` (check `git status -sb`).
1. Ask the phase-builder question (last answer: owner only, s37; not answered in s38). Web and database work are ON HOLD (D-039): do not touch `web/`, `supabase/` or the live rollout until the owner lifts it. Pending owner items: teacher review of the Reset sentence, alert wording and the app's other wording (D-034); a printed poster sheet (not confirmed); optional P05-03 leftovers (60-min reminder, an iPhone subscription).
   Live (later, after the device move, D-026): migration on live (SQL Editor), `node tools/vapid-keys.mjs live`, function secrets + deploy + Vault on live, **new ALERT secret** (the test one was shown in chat), `npm run config -- live` and the CSP host in `web/vercel.json`, `anon-probe` on live must give 28/28.
2. **Research paper (rule 5), every session:** `node paper/build.mjs` rebuilds the `.docx` and `.pdf`. Chapter 4 is parked until the owner says so. Names are filled in (s29: three researchers, adviser Arvin C. Trangia, Abuno High School; the title page says Adviser, not Coach). Open: more references 2021 to 2026 (7 verified (s29: Kirkil 2025, Wardani 2023 added; Cen et al. 2024, Building and Environment, a Singapore secondary-school classroom heat and cognition study, was NOT added: ScienceDirect blocked my script, so I could not read it; try again from a browser copy); the ESP32 and DHT22 datasheets are used in Table 2 but not in References for lack of a confirmable date); add anything built to the paper; look at the Word file in Word once.
3. **Teacher review (D-034):** the Reset sentence in the F-22 guide and the Readings table wording.
4. **P04-08:** done s33. Lighthouse 85 / 100 / 100 / 100 (performance held back by the 698 kB stylesheet; optional trim).
5. **Test command:** `npm test` (= `node --env-file=.env --test --test-concurrency=1`, 204/204 in s28; **not run as a whole in s31**: the backend tests wipe init-test readings, and the real board keeps uploading there) and `npm run test:backend`. In s31: `push.backend.js` 14/14 alone, UI gates one file at a time (home 12, badge 9, history 17, school 14, admin 20, guide 6, heat 10, core 5, alerts 16), other non-backend tests 132/132. Run the whole suite once at a moment the owner agrees to lose the init-test readings.
6. P03-07 follow-ups: causes of the gaps (220 s and 385 s); health report says why a restart happened. Not done: sensor accuracy check (needs a reference thermometer and hygrometer); the probe does not probe `readings_hourly` / `readings_span`; page loads 2.7 to 4.2 s; stylesheet 698 kB; P03-05 setup timeout and iPhone; P03-06 queue over 50, full queue, the 400 drop. Flash is about 77 % full (matters for P08). Firmware version is still 0.6.0.
7. F-24 edge: if a page ends between two rooms of the same hour (device moved in that hour), the second room's row is skipped. F-15 P06-03 not ticked. Timing note: a room change reaches the OLED at the device's next upload (up to `interval_s`, 60 s now).
8. Before every commit run `node tools/secret-scan.mjs`. Inline SQL: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`. Flash: in `firmware/init`, `pio run -t upload --upload-port COM8`, hold BOOT on `Connecting....`. Use the Edit tool for edits with backslash escapes; look at the page in a browser, not only the build. Never build a path with `new URL(...).pathname` (use `fileURLToPath`). `.vscode/settings.json` is untracked and not ours: leave it.

### Waiting on the owner
- Decide what comes next (step 1 above); say whether a shorter raw-readings window than 90 days is wanted (the roll-up already exists, F-20).
- Delete the scratchpad helper files from s31 if still present (`send-alert-test.env`, `vault_for_sql_editor.sql`, `push_alerts_for_sql_editor.sql` in the s31 Claude scratchpad folder): the first two hold test secrets.
- Teacher review of the alert title and body and the `#alerts` wording before alerts go live (D-034).
- Teacher review of the Reset sentence and of the app's other user-facing wording.
- Paper: say "put Chapter 4 back" when wanted.
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Later: dummy load or another bank (D-027). A push button for the OLED wake (D-025). Optional: confirm the S-6 passwords. Optional: a reference thermometer and hygrometer; later (P07) a USB inline meter.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
