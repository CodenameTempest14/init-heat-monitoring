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
[P03 · Device firmware · 8/10 done · 0 blocked · unverified 0]

### Phase Progress (end of the previous session)
| Phase | Done / Total | Progress | % |
|---|---|---|---|
| P00 Kickoff and decisions | 13 / 13 | ██████████ | 100% |
| P01 Heat index core and bench bring-up | 7 / 7 | ██████████ | 100% |
| P02 Backend and secure upload | 7 / 7 | ██████████ | 100% |
| P03 Device firmware | 8 / 10 | ████████░░ | 80% |
| P04 Web app core | 5 / 13 | ████░░░░░░ | 38% |
| P05 Admin, alerts and device health | 0 / 6 | ░░░░░░░░░░ | 0% |
| P06 Display and sharing extras | 0 / 5 | ░░░░░░░░░░ | 0% |
| P07 Field trial and hardening | 0 / 7 | ░░░░░░░░░░ | 0% |
| P08 Over-the-air updates (optional) | 0 / 3 | ░░░░░░░░░░ | 0% |
| **Whole project** | 40 / 71 | ██████░░░░ | **56%** |

### Recommended model for this session
**Opus 5.5** for P03-05 (setup page: it takes Wi-Fi passwords from a phone). **Sonnet 5.5** for P03-07.

### Next concrete step
1. Ask the phase-builder question (last answer: owner only).
2. **P03-05** setup page (D-011, Opus 5.5): the OLED-05 screen exists (`screens::setupMode`); needs an access point `Init-Setup`, a page at 192.168.4.1 that saves Wi-Fi to flash (replacing the temporary `secrets.h` Wi-Fi, D-026), and a way to open it when Wi-Fi fails. Test-first any parsing/validation on the PC.
3. Then P03-07 (24 h on the power bank, record the measured drop). P03-06 is done: the queue is RAM only, a restart loses it; not tried on the board: queue over 50, a full queue, the 400 drop.
4. **D-028 done (s13):** the upload reply carries `room`, the OLED strip shows it (fallback `Room 1`); the 7th migration is on init-test only: apply it to live `init` before the board moves to live. The sensor-error and offline screens were only checked in the screens build.
5. Open: the Tabler dashboard is about 832 px wide at a 390 px viewport (cause not diagnosed); our home page must not scroll sideways.
6. Before every commit run `node tools/secret-scan.mjs` (exits 1 on a hit). `tools/db.mjs` now quotes arguments, so inline SQL works: `node --env-file=.env tools/db.mjs test db query --linked "select 1;"`.

### Waiting on the owner
- ~~D-027 live setup~~ **Done 2026-11-02 (s13):** live `init` has all 6 migrations (read back with `live migration list`), and "Init 1" has `interval_s` 60 (owner ran the update in the dashboard SQL Editor, because the CLI token is read-only; read back by the assistant). Still to decide, later: dummy load or another bank. The board still uploads to init-test until P03 is done (D-026).
- A push button for the OLED wake (D-025: until then the screen stays on; button part of F-08 deferred).
- Optional: confirm the S-6 passwords are the generated, longer ones (the assistant only knows the logins work).
- Later (P07): a USB inline meter to measure the awake current; the schematic runtime figures are estimates until then.
- Before 2028-01-28: GlobalSign Root CA in `firmware/init/include/root_ca.h` expires (D-026).
