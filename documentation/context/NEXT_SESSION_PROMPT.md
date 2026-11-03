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
| P05 Admin, alerts and device health | 3 / 7 (+3 partly) | ████░░░░░░ | 43% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 52 / 72 | ███████░░░ | **72%** |

### Recommended model for this session
**Sonnet 5.5**: the phone results and ticks, the paper (names, references, updates), P04-08 leftovers. **Opus 5.5** for the live admin rollout (P05-05) and push alerts (P05-03: Edge Function, keys, subscriptions).

### Next concrete step
1. Ask the phase-builder question (last answer: owner only). Ask the owner, who has the phone and the board: (a) does the OLED say `Unassigned` after a restart; (b) in `#admin` does **Reset** then **Save changes** work (live has no admin account yet, so use the test admin on init-test: run `npm run config` in `web/` only if the page must read init-test); (c) on the hosted page (https://init-heat-monitoring.vercel.app, deployed by the s27 push) does the **Readings table** under the history charts pick days, show hourly rows and download a CSV. Live "Init 1" has no readings yet, so the live table says "No readings yet" until a device uploads there. Tick what was seen (P05-06 and the F-24 line), with evidence.
2. **Research paper (rule 5), every session:** `node paper/build.mjs` rebuilds `paper/Init_Research_Paper.docx` and `.pdf`. Open items: researcher, coach and school names (blank); a readable PAGASA source for the tier ranges 27-32 / 33-41 / 42-51 / 52+ (none found; the paper cites D-019 only: ask the owner for a screenshot or a teacher's copy of PAGASA's table); more references 2021 to 2026 (only 4 verified; ideas: a DHT22 accuracy paper, a classroom heat and learning paper; each must be opened and read, never from memory); update the paper for every feature built. Look at the Word file in Word once (only the PDF pages were looked at).
3. **Teacher review (D-034):** the new Reset sentence in the F-22 guide, and the Readings table wording.
4. **P04-08 leftovers:** a school day with several levels, the offline page on a phone, an iPhone add-to-home-screen, F-15 `#heat` and the P05-04 health group on a phone in light mode.
5. **P05-05 live admin rollout (Opus 5.5):** a live admin account (email you own, long generated password, made in the dashboard), then `tools/make-test-admin.mjs` is test only; the three migrations are already on live (s27, `anon-probe` 21/21 on live). Then P05-03 push alerts (Opus 5.5).
6. **Test command:** `node --env-file=.env --test --test-concurrency=1` (204/204 in s27) and `node --env-file=.env --test --test-concurrency=1 "tests/backend/*.backend.js"` (80/80). Plain `npm test` fails (UI gates race on `web/dist`): consider putting this in package.json. The backend tests wipe init-test readings (the 24 h run is saved in `paper/data/`).
7. P03-07 follow-ups: causes of the gaps (the run query shows 220 s and 385 s); health report says why a restart happened. Not done: sensor accuracy check (needs a reference thermometer and hygrometer); the probe has never caught a real hole and does not probe the new public functions `readings_hourly` / `readings_span`; page loads 2.7 to 4.2 s; stylesheet 698 kB; P03-05 setup timeout and iPhone; P03-06 queue over 50, full queue, the 400 drop. Flash is about 77 % full (matters for P08).
8. F-24 edge: if a page ends between two rooms of the same hour (device moved in that hour), the second room's row is skipped. F-15 P06-03 not ticked.
9. Before every commit run `node tools/secret-scan.mjs`. Inline SQL: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`. Flash: in `firmware/init`, `pio run -t upload --upload-port COM8`, hold BOOT on `Connecting....`. Use the Edit tool (not a shell heredoc) for edits that contain backslash escapes such as a carriage-return and line-feed pair; look at the page in a browser, not only the build. Never build a path with `new URL(...).pathname` (it percent-encodes spaces: use `fileURLToPath`, s27 bug).

### Waiting on the owner
- On the phone: Reset then Save in `#admin`; the Readings table (From/To days, Download CSV) on the hosted page; what the OLED shows after a restart.
- Researcher, coach and school names for the paper; a PAGASA tier table source.
- For live: an admin email you own and a long generated password, created in the dashboard (the migrations are on live).
- Teacher review of the Reset sentence and of the app's other user-facing wording.
- Optional: try add-to-home-screen on the iPhone; send a phone screenshot of a school day with several levels and of the light mode.
- Write `SECRET_SETUP_PASS` on a sticker for the case.
- Later: dummy load or another bank (D-027). A push button for the OLED wake (D-025). Optional: confirm the S-6 passwords. Optional: a reference thermometer and hygrometer; later (P07) a USB inline meter.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
