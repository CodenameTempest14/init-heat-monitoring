# design/school-day/

**Approved by the owner (P04-07, F-12, D-016, D-033); built in `web/src/School.jsx`, gated by `tests/ui-gate-school.test.js`.** Mocks of the school-day view. Made-up readings and a made-up room (`Room 204`).
School hours (owner, 2026-11-02): **Monday to Friday, 6:00 AM to 7:15 PM.** The summary shows both the extremes and the time in each level (owner, same answer).

| File | What |
|---|---|
| `home-link.html` | The home page with its one change: a **School day summary ›** row under "updated ..." (the rest of the page, charts included, stays as approved) |
| `school-day.html` | A finished school day: highest, hottest hour, lowest, average, then the time in each level |
| `school-today.html` | Today so far (window ends at "now", Next is disabled) |
| `school-weekend.html` | Opened on a Saturday or Sunday: shows the last school day with a note |
| `school-empty.html` | A day with no readings in school hours |
| `build-mocks.mjs`, `capture.mjs` | Write the mocks; `node design/school-day/capture.mjs` writes `ref/<state>-<phone\|desktop>-<light\|dark>.png` |
| `ref/` | The screenshots to approve (the desktop image is the full day in the 520 px column) |

## What is proposed
- **A separate view, not a section on the home page.** The home page only gains one link row, so the approved home, badge and history images change by that row only (I redraw them after approval). The view is `#school` on the same address (no server change), with **‹ Live readings** to go back.
- **Day picker:** ‹ previous school day and next school day › (weekends skipped). Raw readings are kept 90 days, so older days are not offered.
- **Four numbers** (heat index): **Highest** (with the time), **Hottest hour** (the clock hour with the highest average, with that average), **Lowest** (with the time), **Average**. Moments below the heat index range (about 27 °C) have no heat index, so they are left out of these four; the caption says so.
- **Time in each level:** a bar and a list, hottest first: Extreme danger, Danger, Extreme caution, Caution, Below heat-index range, and **No reading**. Every row has a shape and a name (colour is never the only signal), same shapes as the home cards. All rows add up to the length of the school day, so a gap can never pass as "cool".
- **How a reading counts (needs your yes):** a reading counts for the time until the next one, at most 2 minutes (the same limit that makes the badge say Offline). Anything longer is "No reading". Levels use the heat index rounded to whole °C (D-019).
- **Time zone:** fixed to Philippine time (Asia/Manila), whatever the visitor's phone says, because the school day is a place's day. (The charts follow the phone's clock; this view does not.)
- **Computed in the database** (as F-12 says): a function `school_day(day, for_device)` in a new migration, applied by the owner to both projects like `history()`. The page only draws what it returns. Tests come first (needs the backend tests, so after the P03-07 run ends).
