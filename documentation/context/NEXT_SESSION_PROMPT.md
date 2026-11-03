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
| P05 Admin, alerts and device health | 3 / 7 (+3 partly) | ████░░░░░░ | 43% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 52 / 72 | ███████░░░ | **72%** |

### Recommended model for this session
**Sonnet 5.5**: `npm test`, the P05-04 migration and wiring, P04-08 and the first real admin saves. Opus 5.5 for P05-03 (push alerts: Edge Function, keys, subscriptions) and the live admin rollout (P05-05 on live).

### Next concrete step
1. Ask the phase-builder question (last answer: owner only). Ask whether the board is still running and whether `3e3a849` and the s26 close commit were pushed (`git status -sb`).
2. **F-23 (owner asked, s26; proposed in FEATURES.md, nothing built):** (a) a **Reset** next to the room box in `#admin` that sets the room back to `Unassigned`; (b) the default room name is always `Unassigned` unless an admin assigns one. Check first: the `devices.room` default, the firmware `OLED_ROOM_LABEL` in `config.h` (now "Room 1", shown until the first upload reply), the init-test device (named "Room 1"; live is already "Unassigned"). Propose the design and a mock (phone, light and dark) first, then test-first; update the F-22 Room guide and the admin gate. A firmware default change needs a flash. Part of P05-06.
3. **Real saves (P05-02, P05-06), owner on the phone:** change the room (12 characters or fewer; what the OLED does with longer names is unchecked), watch the OLED and the home page follow within about 60 s; change the interval 60 -> 90 -> 60 and watch the device pick it up. Then tick what was seen.
4. **P05-04 done (s26, `3e3a849`):** migration on init-test only, firmware 0.6.0 flashed, seen in `#admin`. **Live still lacks `20261106120000_device_health.sql` and the admin migration** (owner runs `node --env-file=.env tools/db.mjs live db push`, P05-05). Not seen: a reset reason other than POWERON, a weak signal, light mode.
5. **Test command:** `npm test` fails (UI gates race on `web/dist`). Use `node --env-file=.env --test --test-concurrency=1` (187/187 in s26) and `node --env-file=.env --test --test-concurrency=1 "tests/backend/*.backend.js"` (73/73). Consider putting this in package.json. The backend tests wipe init-test readings.
6. **P04-08 leftovers:** a school day with several levels, the offline page on a phone, an iPhone add-to-home-screen, F-15 `#heat` and the P05-04 health group on a phone in light mode.
7. P03-07 follow-ups: causes of the three gaps (95 s, 221 s, 385 s); the health report now says why a restart happened (BROWNOUT / PANIC / WDT / POWERON). Online-before-2-min and 3 min offline marks not seen.
8. Then P05-03 push alerts (Opus 5.5), live admin rollout (P05-05: live admin account, live migrations, `anon-probe` against live). F-15 P06-03 not ticked (the F-15 line under the heat level is not built).
9. Not done: sensor accuracy check; the probe has never caught a real hole; page loads 2.7 to 4.2 s; stylesheet 698 kB; P03-05 setup timeout and iPhone; P03-06 queue over 50, full queue, the 400 drop. Flash is about 77 % full (matters for P08).
10. Before every commit run `node tools/secret-scan.mjs`. Inline SQL: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`. Flash: in `firmware/init`, `pio run -t upload --upload-port COM8`, hold BOOT on `Connecting....` (s26: the first try failed "Wrong boot mode" until BOOT was held). Use the Edit tool for scripted edits; look at the page in a browser, not only the build.

### Waiting on the owner
- Approve (or change) the F-23 design next session.
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
