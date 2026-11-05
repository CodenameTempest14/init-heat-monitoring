# Continue Classroom Heat Index Monitoring (prompt generated 2026-11-05)

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
| P05 Admin, alerts and device health | 6 / 7 (+1 partly) | █████████░ | 86% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 55 / 72 | ████████░░ | **76%** |

### Recommended model for this session
**Sonnet 5.5**: the next steps are phone screenshots, a real settings save, ticks and the paper; nothing in them needs deep debugging. Switch to **Opus 5.5** for the live rollout (migration, Vault, function secrets, CSP) or if the device does not pick up a new interval.

### Next concrete step
1. Ask the phase-builder question (last answer: owner only, s32). **P04-08 (last P04 item):** owner's phone screenshots of the home page in **light mode**, and of **Offline** (unplug the board, wait about 2.5 min, plug back in). Tick P04-08 if both look right. **P05-02 (last P05 item):** in `#admin` on the phone, change the interval (e.g. 60 → 120 s) and save; read back `settings` and the gaps between new readings (device picks it up at its next upload); then put it back to **60** (the power bank needs an upload at least every 60 s, D-027). Optional for P05-03: a screenshot of the 60-min reminder, an iPhone (installed app) subscription.
   Live (later, after the device move, D-026): migration on live (SQL Editor), `node tools/vapid-keys.mjs live`, function secrets + deploy + Vault on live, **new ALERT secret** (the test one was shown in chat), `npm run config -- live` and the CSP host in `web/vercel.json`, `anon-probe` on live must give 28/28.
2. **Research paper (rule 5), every session:** `node paper/build.mjs` rebuilds the `.docx` and `.pdf`. Chapter 4 is parked until the owner says so. Names are filled in (s29: three researchers, adviser Arvin C. Trangia, Abuno High School; the title page says Adviser, not Coach). Open: more references 2021 to 2026 (7 verified (s29: Kirkil 2025, Wardani 2023 added; Cen et al. 2024, Building and Environment, a Singapore secondary-school classroom heat and cognition study, was NOT added: ScienceDirect blocked my script, so I could not read it; try again from a browser copy); the ESP32 and DHT22 datasheets are used in Table 2 but not in References for lack of a confirmable date); add anything built to the paper; look at the Word file in Word once.
3. **Teacher review (D-034):** the Reset sentence in the F-22 guide and the Readings table wording.
4. **P04-08 leftovers:** the offline page on a phone, light mode on a phone (Lighthouse re-run done s32: 85 / 100 / 100 / 100; performance held back by the 698 kB stylesheet).
5. **Test command:** `npm test` (= `node --env-file=.env --test --test-concurrency=1`, 204/204 in s28; **not run as a whole in s31**: the backend tests wipe init-test readings, and the real board keeps uploading there) and `npm run test:backend`. In s31: `push.backend.js` 14/14 alone, UI gates one file at a time (home 12, badge 9, history 17, school 14, admin 20, guide 6, heat 10, core 5, alerts 16), other non-backend tests 132/132. Run the whole suite once at a moment the owner agrees to lose the init-test readings.
6. P03-07 follow-ups: causes of the gaps (220 s and 385 s); health report says why a restart happened. Not done: sensor accuracy check (needs a reference thermometer and hygrometer); the probe does not probe `readings_hourly` / `readings_span`; page loads 2.7 to 4.2 s; stylesheet 698 kB; P03-05 setup timeout and iPhone; P03-06 queue over 50, full queue, the 400 drop. Flash is about 77 % full (matters for P08). Firmware version is still 0.6.0.
7. F-24 edge: if a page ends between two rooms of the same hour (device moved in that hour), the second room's row is skipped. F-15 P06-03 not ticked. Timing note: a room change reaches the OLED at the device's next upload (up to `interval_s`, 60 s now).
8. Before every commit run `node tools/secret-scan.mjs`. Inline SQL: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`. Flash: in `firmware/init`, `pio run -t upload --upload-port COM8`, hold BOOT on `Connecting....`. Use the Edit tool for edits with backslash escapes; look at the page in a browser, not only the build. Never build a path with `new URL(...).pathname` (use `fileURLToPath`). `.vscode/settings.json` is untracked and not ours: leave it.

### Waiting on the owner
- Phone screenshots for P04-08 (light mode, Offline) and a real interval save for P05-02 (step 1 above).
- Delete the scratchpad helper files from s31 if still present (`send-alert-test.env`, `vault_for_sql_editor.sql`, `push_alerts_for_sql_editor.sql` in the s31 Claude scratchpad folder): the first two hold test secrets.
- Teacher review of the alert title and body and the `#alerts` wording before alerts go live (D-034).
- Teacher review of the Reset sentence and of the app's other user-facing wording.
- Optional: a phone screenshot of light mode and of the offline page.
- Paper: say "put Chapter 4 back" when wanted.
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Later: dummy load or another bank (D-027). A push button for the OLED wake (D-025). Optional: confirm the S-6 passwords. Optional: a reference thermometer and hygrometer; later (P07) a USB inline meter.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
