# design/history-charts/

**Proposed 2026-11-02 (s17), waiting for the owner's approval (D-016).** The 24 hour and 7 day charts of the home page (P04-04, F-04).
Made-up readings and a made-up room name (`Room 204`); the heat index in the mocks comes from `src/heat-index.js`. The mocks load the real stylesheets plus `charts.css`, which moves into `web/src/app.css` when the page is built.

| File | What |
|---|---|
| `<state>.html` | One mock per state: `24h`, `7d`, `24h-hover` (a time picked), `24h-table` (table opened), `empty` (no readings); `24h-wide` is the 24h page in the 520 px desktop column |
| `build-mocks.mjs` | Writes the mocks |
| `charts.css` | Chart styles and the three series colours |
| `capture.mjs` | `node design/history-charts/capture.mjs` writes `ref/<state>-<phone\|desktop>-<light\|dark>.png` |
| `ref/` | The screenshots to approve |

## What is proposed
- **Under the cards, a History section**: one range choice (Last 24 hours / Last 7 days) above everything it scopes, then three charts: **Heat index**, **Temperature**, **Humidity**.
- **Three charts, not one**: temperature is about 25 to 35 and humidity about 50 to 90, so on one plot they would need two scales (misleading). One series per chart, so no legend box; the title names it and the "now" value sits at the right of the title.
- **Colours** (dataviz default palette slots 1 to 3): heat index blue, temperature orange, humidity aqua; checked with its validator in light and dark (all pass; CVD worst pair 9.2 / 9.4, normal-vision 27.6 / 26.5). Light-mode aqua is 2.82:1 on white, a warning the palette says must be covered by a table view, which is why **Show as table** exists. The selected range button is blue with white text (4.6:1 light, step 550 in dark).
- **Marks**: 2 px lines, hairline solid gridlines, one end dot with a 2 px surface ring, no number on every point.
- **Readout**: touch or hover a chart and one box above the charts lists the time and all three values; the crosshair shows on all three charts. It sits in the page, not on the chart, so a finger never hides the data.
- **Gaps**: where the board sent nothing (an outage), the line breaks; nothing is drawn across it (mock: Sunday 19:00 to 20:00 in 24h, Friday in 7d).
- **Heat index below its range**: the function gives no value below about 27 °C (D-020), so the line stops there and a caption says so. At night in a cool room that is normal.
- **PAGASA lines (owner: keep or drop?)**: hairline lines at 33 (Extreme caution) and 42 (Danger) on the heat index chart, drawn only when inside the chart's range, named in words.
- **Empty state**: `No readings in the last 24 hours yet.`
- **Table**: each chart range has a table of the same values, newest first (24h: every 15 min, 7d: every hour).

## Build decisions (not drawn)
- 24h shows 15 minute averages (97 points) and 7d hourly averages (169 points), not the raw one-a-minute rows (1 440 and 10 080 points). The page asks the server for the range and averages in the browser, or in a database view; to be settled when built.
- Axis times are in the viewer's local time.
- The charts redraw on the page's 30 s refresh; while reloading, the old chart stays (no flash).
