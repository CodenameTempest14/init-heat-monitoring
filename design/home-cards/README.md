# design/home-cards/

**Proposal, waiting for the owner (s15, 2026-11-02).** The live cards of the home page (P04-02: F-01 live reading,
F-02 heat category colour, F-21 room name). Made-up readings and a made-up room name (`Room 204`).

| File | What |
|---|---|
| `<state>.html` | One mock per PAGASA category (D-019): `caution`, `extreme-caution`, `danger`, `extreme-danger`, plus `below-range` (heat index under 27 °C, no category) |
| `build-mocks.mjs` | Writes the five mocks. Colours come from `design/tokens.json` through `web/src/tokens.css` |
| `capture.mjs` | `node design/home-cards/capture.mjs` writes `ref/<state>-<phone\|desktop>-<light\|dark>.png` (phone 390 px for all, desktop 1280 px for `extreme-caution` and `danger`) |
| `ref/` | The screenshots to approve |

The mocks load the **real** stylesheet (`web/src/app.css`, `web/src/tokens.css`, Tabler from `web/node_modules`; run `npm install` in `web/` first), so the built page can be compared with these images (UI-GATE).

Design notes:
- The heat index is the large card, filled with the category colour, with the category **in words and a shape** (circle, triangle, diamond, octagon, dash). Colour is never the only cue.
- Temperature and humidity are two smaller plain cards under it. "updated N min ago" sits below.
- The room name is under the title. The offline badge (F-03) is P04-03 and not drawn here.
- Contrast of every fill/text/border pair is checked by `node design/contrast.mjs` (tokens unchanged).
