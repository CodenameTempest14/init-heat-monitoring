# design/heat-info/

**PROPOSED, waiting for the owner's approval of the mocks and for a teacher's review of every sentence (F-15 extended, s25; the owner approved the proposal, not these mocks yet).** Mocks of the "What does this mean?" link on the home page and of the public `#heat` page. Made-up room only. The wording is a **draft**: general advice, not official DepEd or PAGASA guidance. Level ranges are D-019 (27 / 33 / 42 / 52).

| File | What |
|---|---|
| `home-danger.html`, `home-caution.html` | The approved home mock with one new link, **What does this mean? ›**, inside the heat card under the level name (it opens `#heat/<level>`); same text colour as the level, so the contrast of the card is unchanged |
| `heat.html` | The `#heat` page: a "general advice" note, what the heat index is, one part per level, each with a small picture (range, picture, what it can do to the body, what to prepare and do). The pictures are friendly clip-art cartoons (outlined, flat colour, a kid, the sun, a bottle, a fan, an umbrella), drawn in `art.mjs` as inline SVG: no image files, no copyright, they work offline. They sit on a pale panel in both light and dark mode so the colours always read well, and they are decoration only (hidden from screen readers). Caution = a smiling sun and a kid with a water bottle; Extreme caution = a sweating kid, a window, a fan and a glass of water; Danger = a tired kid under an umbrella, a clock and a cross sun; Extreme danger = a thermometer, a dizzy kid and a red-cross sign; the intro = a thermometer plus a smiling water drop, and warning signs for heat exhaustion and heat stroke |
| `art.mjs` | The clip-art pictures (inline SVG), used by `build-mocks.mjs` |
| `heat-info.css` | The few new styles |
| `build-mocks.mjs`, `capture.mjs` | `node design/heat-info/build-mocks.mjs`, then `capture.mjs` writes `ref/<state>-<phone\|desktop>-<light\|dark>.png` |

## Sources and what is still unchecked
- Advice (less outdoor activity 12:00 to 4:00, drink water, rest in shade, light-coloured clothes): PAGASA's 25 March 2024 outlook, `pagasa.dost.gov.ph/article/154`, read in full.
- Effects per level: from news summaries of PAGASA's classification; PAGASA's own table was not readable. A teacher confirms them.
- The warning signs and first steps are general first-aid knowledge, not from PAGASA; a teacher (or the school nurse) must confirm them.
- One older PAGASA-derived table has other ranges (32 / 41 / 54). D-019 stays until a teacher or PAGASA's current legend says otherwise.
