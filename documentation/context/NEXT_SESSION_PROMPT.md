# Continue Classroom Heat Index Monitoring (prompt generated 2026-11-03)

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
| P05 Admin, alerts and device health | 4 / 7 (+2 partly) | ██████░░░░ | 57% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 53 / 72 | ███████░░░ | **74%** |

### Recommended model for this session
**Opus 5.5** for the live admin rollout (P05-05) and then push alerts (P05-03: Edge Function, keys, subscriptions). Sonnet 5.5 for the paper, phone results and ticks.

### Next concrete step
1. Ask the phase-builder question (last answer: owner only). **Live admin rollout (P05-05, Opus 5.5), the owner's chosen start:** the owner makes a live admin account in the Supabase dashboard (an email they own, a long generated password, never in chat or the repo); then add that email to `admins` on live (the owner runs live writes in the terminal: Claude Code's classifier blocks `tools/db.mjs live ...` writes), sign in on the hosted page against live (`npm run config -- live` in `web/` also changes the Supabase host in `web/vercel.json`, whose CSP names it), try a real save, and run the admin backend checks and `node tools/anon-probe.mjs` against live. The three admin migrations are already on live (21/21). `tools/make-test-admin.mjs` is test only. The device still uploads to init-test; moving it to live "Init 1" is a separate decision (D-026). Then P05-03 push alerts.
2. **Research paper (rule 5), every session:** `node paper/build.mjs` rebuilds the `.docx` and `.pdf`. Chapter 4 is parked until the owner says so. Skipped by the owner: researcher, coach and school names. Open: more references 2021 to 2026 (only 5 verified; each must be opened and read, never from memory; the ESP32 and DHT22 datasheets are used in Table 2 but not in References for lack of a confirmable date); add anything built to the paper; look at the Word file in Word once.
3. **Teacher review (D-034):** the Reset sentence in the F-22 guide and the Readings table wording.
4. **P04-08 leftovers:** a school day with several levels, the offline page on a phone, an iPhone add-to-home-screen, F-15 `#heat` and the P05-04 health group on a phone in light mode.
5. **Test command:** `npm test` (= `node --env-file=.env --test --test-concurrency=1`, 204/204 in s28) and `npm run test:backend` (80/80). The backend tests wipe init-test readings (the 24 h run is saved in `paper/data/`).
6. P03-07 follow-ups: causes of the gaps (220 s and 385 s); health report says why a restart happened. Not done: sensor accuracy check (needs a reference thermometer and hygrometer); the probe does not probe `readings_hourly` / `readings_span`; page loads 2.7 to 4.2 s; stylesheet 698 kB; P03-05 setup timeout and iPhone; P03-06 queue over 50, full queue, the 400 drop. Flash is about 77 % full (matters for P08). Firmware version is still 0.6.0.
7. F-24 edge: if a page ends between two rooms of the same hour (device moved in that hour), the second room's row is skipped. F-15 P06-03 not ticked. Timing note: a room change reaches the OLED at the device's next upload (up to `interval_s`, 60 s now).
8. Before every commit run `node tools/secret-scan.mjs`. Inline SQL: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`. Flash: in `firmware/init`, `pio run -t upload --upload-port COM8`, hold BOOT on `Connecting....`. Use the Edit tool for edits with backslash escapes; look at the page in a browser, not only the build. Never build a path with `new URL(...).pathname` (use `fileURLToPath`). `.vscode/settings.json` is untracked and not ours: leave it.

### Waiting on the owner
- For the live admin rollout: an admin email you own and a long generated password, created in the dashboard (the migrations are on live).
- Teacher review of the Reset sentence and of the app's other user-facing wording.
- Optional: try add-to-home-screen on the iPhone; send a phone screenshot of a school day with several levels and of the light mode.
- Paper: researcher, coach and school names (skipped for now); say "put Chapter 4 back" when wanted.
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Later: dummy load or another bank (D-027). A push button for the OLED wake (D-025). Optional: confirm the S-6 passwords. Optional: a reference thermometer and hygrometer; later (P07) a USB inline meter.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
