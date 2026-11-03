# design/admin/health/

**APPROVED by the owner, and the guide wording by a teacher (s25, P05-04); built in `web/src/Admin.jsx` and `Guide.jsx`, gated by `tests/ui-gate-admin.test.js` and `ui-gate-guide.test.js`.** Mocks of a read-only **Device health** group on the admin page, added to the approved proposal-B settings page between **Room** and **Device** (owner's placement, s25), with its own **How? ›** link (owner, s25) and 22 px after every How? link so each clearly belongs to the group above it. Made-up values only (`admin@example.com`, `Room 204`).

| File | What |
|---|---|
| `h-ok.html` | Good signal (−58 dBm), restart reason Power on, firmware 0.5.0, last report 1 min ago |
| `h-trouble.html` | Weak signal (−81 dBm), restart reason "Stopped responding" (watchdog), last report 6 min ago "Late", with a one-line note |
| `h-saved.html` | The page right after a save (the approved b-saved mock) with the `h-ok` health group; used by the gate |
| `h-none.html` | A device that has not sent its health yet (the firmware running today): "Not reported yet" |
| `guide-health.html` | The new **Device health** section of the `#guide` page (section 3, the same order as the admin page; the other sections are unchanged and only renumbered). Opened by the **How? ›** link under the health group (`#guide/health`). Wording is a draft: a teacher reviews it (D-034) |
| `health.css` | The few styles that are new; everything else is `admin-b.css` / `web/src/admin.css` |
| `build-mocks.mjs`, `build-guide-mock.mjs`, `capture.mjs` | `node design/admin/health/build-mocks.mjs` and `build-guide-mock.mjs`, then `capture.mjs` writes `ref/` (phone 390 px light and dark, desktop for `h-ok`) |

## What is proposed
- Read-only: no box to edit, no unit boxes and no How? link, so it is not mistaken for a setting. It sits between Room and Device.
- Every state has a word and an icon, never colour alone: Good / Weak (signal), Just now / Late (report), restart reason in plain words with the raw code underneath.
- Signal bands (to confirm on the real board): Good at -65 dBm or stronger, Fair -66 to -75, Weak below -75.
- Restart reasons in plain words: POWERON Power on, EXT Reset pin, SW Software restart, PANIC Crash, INT_WDT / TASK_WDT / WDT Stopped responding, BROWNOUT Power dipped, DEEPSLEEP Woke from sleep, SDIO / UNKNOWN Unknown.
- "Late" when the last report is older than the 120 s offline rule used on the public page.
