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
**Opus 5.5** for the P05-03 build (push alerts: migration with a trigger and `pg_net`, the project's first Edge Function, VAPID keys, service worker push handlers). Sonnet 5.5 if the session is only the paper, phone results or ticks.

### Next concrete step
1. Ask the phase-builder question (last answer: owner only, s30). **P05-03 heat alerts (Opus 5.5):** first the owner answers the five DECIDEs and approves the three new pieces in `documentation/specs/P05-03_DESIGN.md` section 10 (suggested: DECIDE 1 = (a) remind every quiet period, 2 = (a) trigger + pg_net, 3 = `Heat alerts ›` row opening `#alerts`, 4 = rounded heat index, 5 = cap 300; new pieces: `alerts` log table, `tools/vapid-keys.mjs`, `#alerts` view). Record the answers in the design file. Then build in the order of section 9: backend tests red first, migration (owner applies to init-test), VAPID pair (owner sets the function secrets), `send-alert` Edge Function (check first which Web Push library runs on Supabase's Deno runtime, and that `pg_net` and Vault are on the free plan), `#alerts` mock then build, end-to-end on the owner's Android with a low threshold on init-test. Live waits for the device move (D-026). Live admin: done s30 (P05-05); a real save on live becomes possible only after the move.
2. **Research paper (rule 5), every session:** `node paper/build.mjs` rebuilds the `.docx` and `.pdf`. Chapter 4 is parked until the owner says so. Names are filled in (s29: three researchers, adviser Arvin C. Trangia, Abuno High School; the title page says Adviser, not Coach). Open: more references 2021 to 2026 (7 verified (s29: Kirkil 2025, Wardani 2023 added; Cen et al. 2024, Building and Environment, a Singapore secondary-school classroom heat and cognition study, was NOT added: ScienceDirect blocked my script, so I could not read it; try again from a browser copy); the ESP32 and DHT22 datasheets are used in Table 2 but not in References for lack of a confirmable date); add anything built to the paper; look at the Word file in Word once.
3. **Teacher review (D-034):** the Reset sentence in the F-22 guide and the Readings table wording.
4. **P04-08 leftovers:** a school day with several levels, the offline page on a phone, an iPhone add-to-home-screen, F-15 `#heat` and the P05-04 health group on a phone in light mode.
5. **Test command:** `npm test` (= `node --env-file=.env --test --test-concurrency=1`, 204/204 in s28) and `npm run test:backend` (80/80). The backend tests wipe init-test readings (the 24 h run is saved in `paper/data/`).
6. P03-07 follow-ups: causes of the gaps (220 s and 385 s); health report says why a restart happened. Not done: sensor accuracy check (needs a reference thermometer and hygrometer); the probe does not probe `readings_hourly` / `readings_span`; page loads 2.7 to 4.2 s; stylesheet 698 kB; P03-05 setup timeout and iPhone; P03-06 queue over 50, full queue, the 400 drop. Flash is about 77 % full (matters for P08). Firmware version is still 0.6.0.
7. F-24 edge: if a page ends between two rooms of the same hour (device moved in that hour), the second room's row is skipped. F-15 P06-03 not ticked. Timing note: a room change reaches the OLED at the device's next upload (up to `interval_s`, 60 s now).
8. Before every commit run `node tools/secret-scan.mjs`. Inline SQL: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`. Flash: in `firmware/init`, `pio run -t upload --upload-port COM8`, hold BOOT on `Connecting....`. Use the Edit tool for edits with backslash escapes; look at the page in a browser, not only the build. Never build a path with `new URL(...).pathname` (use `fileURLToPath`). `.vscode/settings.json` is untracked and not ours: leave it.

### Waiting on the owner
- P05-03 design answers: DECIDE 1 to 5 and the three new pieces (`documentation/specs/P05-03_DESIGN.md` section 10).
- Teacher review of the alert title and body (design section 4) before alerts go live.
- Teacher review of the Reset sentence and of the app's other user-facing wording.
- Optional: try add-to-home-screen on the iPhone; send a phone screenshot of a school day with several levels and of the light mode.
- Paper: say "put Chapter 4 back" when wanted.
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Later: dummy load or another bank (D-027). A push button for the OLED wake (D-025). Optional: confirm the S-6 passwords. Optional: a reference thermometer and hygrometer; later (P07) a USB inline meter.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
