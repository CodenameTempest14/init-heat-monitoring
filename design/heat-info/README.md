# design/heat-info/

**Mocks APPROVED by the owner (s25); built in `web/src/Heat.jsx` (route `#heat`, `#heat/<level>`), gated by `tests/ui-gate-heat.test.js`. NOT LIVE until a teacher has reviewed every sentence (D-034): do not push the wording to `main` before that.** F-15 extended, "What does this mean?". Made-up values only. The wording is a **draft**: general advice, not official DepEd or PAGASA guidance. Level ranges are D-019 (27 / 33 / 42 / 52).

| File | What |
|---|---|
| `heat.html` | The `#heat` page: a "general advice" note, what the heat index is, one part per level (range, a clip-art picture, what it can do to the body, what to prepare and do), and warning signs for heat exhaustion and heat stroke. Written by `build-mocks.mjs` from the same text and pictures the page uses (`web/src/heatText.js`, `web/src/heatArt.js`) |
| `build-mocks.mjs`, `capture.mjs` | `node design/heat-info/build-mocks.mjs`, then `capture.mjs` writes `ref/heat-<phone\|desktop>-<light\|dark>.png` |

The **What does this mean? ›** link inside the heat card on the home page is drawn in the home mocks (`design/home-cards`, `history-charts`, `offline-badge`, `pwa`, `school-day`), whose pictures were redrawn for it; its style is in `web/src/app.css`. The pictures are friendly clip-art cartoons drawn as inline SVG (no image files, no copyright, they work offline), on a pale panel in both light and dark mode, hidden from screen readers.

## Sources and what is still unchecked
- Advice (less outdoor activity 12:00 to 4:00, drink water, rest in shade, light-coloured clothes): PAGASA's 25 March 2024 outlook, `pagasa.dost.gov.ph/article/154`, read in full.
- Effects per level: from news summaries of PAGASA's classification; PAGASA's own table was not readable. A teacher confirms them.
- The warning signs and first steps are general first-aid knowledge, not from PAGASA; a teacher (or the school nurse) must confirm them.
- One older PAGASA-derived table has other ranges (32 / 41 / 54). D-019 stays until a teacher or PAGASA's current legend says otherwise.
