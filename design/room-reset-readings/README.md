# design/room-reset-readings/

Mocks for **F-23** (Reset beside the room box) and **F-24** (readings table with a from-to calendar, under the history charts).
**Approved by the owner 2026-11-03 (s27), built (D-035, D-036).** The F-24 mock is now drawn by `design/history-charts/build-mocks.mjs` through the shared `section.mjs` (the readings section sits under the charts in every history state). Made-up readings and room `Room 204`.

| File | What |
|---|---|
| `f23-reset-before.html` / `f23-reset-after.html` | Admin page (proposal B): Reset beside the room box; after a tap the box says `Unassigned`, Reset is disabled, **Save changes** still has to be pressed |
| `f24-readings.html` / `f24-readings-empty.html` | Home page History with a **Readings table** under the charts: From / To date pickers, hourly averages, **Show more**, **Download CSV**; empty state |
| `build-mocks.mjs`, `capture.mjs`, `rr.css` | Writes the mocks from the approved admin and history mocks; screenshots to `ref/` (phone, light and dark); mock-only styles |
| `section.mjs` | The readings section of F-24 and its made-up rows; used by the history mocks and by `tests/ui-gate-history.test.js` |

Changes after approval (found while building): no "Show more" unless a page is full (500 rows), the status line reads "10 hours shown, newest first", the level for no heat index reads "Below range", the Download CSV border is darker.
