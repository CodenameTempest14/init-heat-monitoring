# Continue Classroom Heat Index Monitoring (prompt generated 2026-10-30)

You are continuing **classroom-heat-index-monitoring** (d:\System Documents\Documents\Codes\classroom-heat-index-monitoring): a battery-powered ESP32 room monitor (DHT22 + OLED) plus a public web app (PWA on Supabase + free static hosting) showing temperature, humidity and heat index for one classroom. The owner is learning: explain before and while implementing.

## HARD RULES (full text in CLAUDE.md)
1. Read in this order and nothing more: CLAUDE.md, documentation/context/CURRENT_STATE.md, the current phase checklist in documentation/phases/, the last Session Close Report.
2. Start with a Session Start Report that includes the **Phase Progress table** (`node tools/phase-report.mjs --md`) and says **which Claude model to use and why**. In the first reply ask: *"Is this phase being built only by you, or is Shem also working on it?"*
3. Open every reply with the status line from `node tools/phase-report.mjs`.
4. No new feature is planned, designed or built until the owner approves it in documentation/specs/FEATURES.md.
5. **Push only to your own branch** (owner: `codenametempest14`) and **ask before every push and every merge to `main`**, naming the target.
6. At the end: Session Close Report (with the Phase Progress table), update CURRENT_STATE.md, PROGRESS_LOG.md entry, then run `node tools/continuation-prompt.mjs` and **show the generated prompt and the progress table in the final message**.

## Where we are
[P00 · Kickoff and decisions · 10/13 done · 0 blocked · unverified 0]

### Phase Progress (end of the previous session)
| Phase | Done / Total | Progress | % |
|---|---|---|---|
| P00 Kickoff and decisions | 10 / 13 | ████████░░ | 77% |
| **Whole project** | 10 / 13 | ████████░░ | **77%** |

### Recommended model for this session
**Sonnet 5.5**, because the work is writing the proposed feature list and phase plan for approval. Switch to **Opus 5.5** when the Supabase schema and device-security design start.

### Next concrete step
1. Owner reviews `hardware/schematic.html` and answers P00-10 (buck module, ESP32 board, BMS, OLED pin order).
2. Propose a feature list in `documentation/specs/FEATURES.md` (proposal only, nothing built) and wait for approval (P00-11).
3. Propose the phase plan (P00-12) and wait for approval.

### Waiting on the owner
- Review of Rev A hardware (P00-10).
- Approval of the feature list and phase plan (P00-11, P00-12). No feature work before that.
- Whether to run `git init` here, add a remote, and create branch `codenametempest14`. Needed before any push or the pre-push hook; nothing has been committed.
- Unmarked 18650 cells: capacity and quality are unknown. Plan to measure them (or buy branded cells) before relying on the runtime estimate.
