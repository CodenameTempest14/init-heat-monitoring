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
3. **Push only to your own branch (and, while the owner is the only builder, `main`; see D-014)** and **ask before
   every push.** Owner = `codenametempest14`. Never push to another person's branch. Check `git config user.email`.
4. **Ask before every push AND every merge to `main`, naming the target**, even if an earlier push was approved.
   *Amended 2026-10-31 (D-014, owner):* while the owner is the only builder, the owner's email may push `main`
   directly (no force-push, no deletion). **The moment Shem or anyone else works on the repo, this exception ends:**
   `main` changes only through a pull request that the other person reviews, and the hook entry for `main` is removed.
5. **The research paper is kept in step with the project (owner, 2026-11-03, s27).** This is a high school
   investigatory project. A ready-made paper exists as a `.docx` **and** a `.pdf` (short bond paper 8.5 x 11 in,
   Times New Roman 12, 1.5 line spacing), built from scratch in the structure of the owner's reference paper
   (`REF.pdf`: title page, Ch. 1 Introduction, Ch. 2 Methodology, Ch. 3 Presentation and Analysis of Data,
   References, Appendices). It includes the diagrams of everything that involves the process (hardware, schematic,
   software, data flow) and the gathered data. **Whenever a feature, a change to the code or hardware, or new data
   is added, the paper and both files are updated in the same session** and listed in the Close Report.
   **No hallucinated references (owner, s27):** every reference must be legit and reliable. Each has a link I
   opened and read in this session (the page itself, not a search snippet, and not a subagent's word alone for
   anything I cite); never invent or "complete from memory" an author, title, date, volume, pages, DOI or URL.
   Prefer peer-reviewed papers and official bodies (PAGASA, DOST, NWS, journals). Published 2021 to 2026 only.
   Unverified source = left out, and the gap is reported in the Close Report. The list is kept in
   `paper/references.json` with the date checked and what each source was used for.

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
