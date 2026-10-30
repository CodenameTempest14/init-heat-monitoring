# CLAUDE.md — Classroom Heat Index Monitoring (brand: **Init**)

Room monitoring device (ESP32 + DHT22 + OLED, battery powered) plus a web app (works in the browser and on phones)
that shows temperature, humidity and heat index per classroom. Motivated by the expected strong El Niño.
Hardware and app are both in scope. Stack and features are NOT decided yet (see "Open decisions").
The owner is learning: explain before/while implementing.
Rules below are carried over from the Ad Astra project (`D:\System Documents\Documents\Codes\projects\ad-astra\CLAUDE.md`).

## ⛔ HARD RULES (owner, carried over 2026-10-30): never skip these
1. **Session start AND end: show the Phase Progress table** with percentages, in the Start and Close Reports.
   (The Ad Astra tooling `tools/phase-report.mjs` does not exist here yet. Until it is set up, keep the table by hand.)
2. **Session end: leave a continuation prompt** the owner can copy and paste into the next session, and
   **show it in the final message**. No prompt, no finished session.
3. **Push only to your own branch** and **ask before every push.** Owner = `codenametempest14`. Never push to
   `main` or another person's branch. Check `git config user.email`.
4. **Ask before every push AND every merge to `main`, naming the target**, even if an earlier push was approved.
   `main` changes only through a pull request that the other person reviews.

## Every session
- **Model advice:** the first reply says which Claude model to use and why. The Close Report recommends the model for the next session.
- **Phase-owner question:** in the first reply ask whether this phase is built only by the owner or if Shem Dumpor is also working on it. Record the answer in the Start Report.
- **Start:** write a Session Start Report before any change.
- **Open every reply with a status line**, e.g. `[P00 · Planning · 0/0 done · 0 blocked · unverified 0]`.
- **End:** Session Close Report (with Phase Progress table), update the state file and progress log, answer
  *"Which parts did you actually run, and what are you unsure about?"*, commit, then show the continuation prompt.

## Hard rules
- **No new feature is planned, designed or built until the owner approves it** in a features doc. Propose, then wait.
- At most **one** unverified change at a time. A blocked check still counts.
- Tick checklist items in the **same commit** as the work, with evidence. Never from memory.
- Test-first for anything with a correct answer (e.g. the heat index calculation); watch the test fail first.
- A green test is not a fix. Look at the running app and the real device.
- The repo wins over the docs: flag conflicts, fix the doc, continue.
- Server side is authoritative; hiding a UI control is not security. Validate everything the device sends.
- Secrets (Wi-Fi passwords, API keys, tokens) never get committed. Use `.env` / `secrets.h`, both gitignored.
- No real student or personal data in screenshots, fixtures or logs.
- Ask the owner before: push, merge to main, force-push, history rewrite, deleting data, architecture/scope changes.
- Every folder has a README.md.

## Open decisions
Tech stack, hosting, data transport, feature list, phase plan.

## Hardware (as stated by the owner)
ESP32 38-pin dev board · DHT22 (4-pin) · OLED display · 5V buck converter · 2 × Li-ion cells in series (8V → 5V).
