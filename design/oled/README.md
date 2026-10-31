# design/oled/

OLED screen design canvas (D-022, same method as the web canvas in D-016). P03-D1 is this README. P03-D2 adds a 1:1 reference image per screen, which the owner approves. P03-D3 checks the drawing code against those images. Nothing is drawn on the real OLED (P03-04) before the images are approved.

Status: **P03-D1 done; reference images (P03-D2) waiting for owner approval.** Owner answers of 2026-11-01 are applied below (D-025).

## The display
SSD1306, 128 x 64 pixels, 1 bit per pixel (D-009). Origin top-left, x 0 to 127, y 0 to 63. Pixels are on or off: no colour, no grey. The owner's module is **blue only** (single colour), so the preview images are blue on black. The 1:1 reference images are white on black, because only on/off matters.

The screen stays **on all the time** (owner, 2026-11-01, D-025). There is no wake button yet, so no blank screen is designed. The button idea stays on the list for when one is bought.

Rules carried over from the web design:
- The heat category is always **words**, never only an icon or a filled bar (colour is never the only signal).
- Open-source fonts only (D-010).
- Made-up readings only in reference images. No real room or person.

## Font and grid
One font only: the Adafruit GFX classic 5 x 7 font (BSD, already listed in `THIRD_PARTY_NOTICES.md`), scaled by whole numbers with `setTextSize(n)`. This replaces the font candidates in the first draft. It needs no extra library and the PC render is exactly what the firmware draws.

| Size | Character cell | Characters per line | Used for |
|---|---|---|---|
| 1 | 6 x 8 px | 21 | status strip, labels, footer |
| 2 | 12 x 16 px | 10 | degree sign, setup network name, error words |
| 3 | 18 x 24 px | 7 | "INIT" start screen |
| 4 | 24 x 32 px | 5 | the heat index number |

The degree sign is glyph 248 of the font, so the firmware calls `display.cp437(true)`.

Rows of the reading screens (y in pixels): strip 1 to 7, rule at y 9, heat index number 12 to 43 (x 2 to 49), `°C` and labels at x 54, category bar 46 to 55 (inverted text), footer 57 to 63. Left and right margin 2 px.

## Screens
Each screen is code in `screens.mjs`: the same calls as Adafruit_GFX, so the firmware repeats them one for one. The heat index and category on the samples come from `src/heat-index.js`; a wrong sample fails the build. Readings are made up. The heat index is shown in **whole °C**, the same rounding that picks the category (D-019); temperature to one decimal, humidity whole.

| ID | Screen | Shows | Source |
|---|---|---|---|
| OLED-01-caution, -extreme-caution, -danger, -extreme-danger | Reading | Heat index (big), category in words on an inverted bar, temperature and humidity, room name, `Wi-Fi OK` | F-08, D-019, F-21 |
| OLED-02 | Reading, heat index below range | `--`, and `NO RATING BELOW 27°C` (no heat index under the NWS range) | F-08, D-020 |
| OLED-03 | Starting | `INIT`, `Connecting Wi-Fi...` | D-011 |
| OLED-04 | Offline | Like OLED-01 plus `NO WI-FI` and `12 to send` (readings waiting) | F-03, F-11 |
| OLED-05 | Setup mode | Join `Init-Setup`, open `192.168.4.1` | D-011 |
| OLED-06 | Sensor error | `SENSOR ERROR`, `Check DHT22 wiring` | F-08 (owner approved 2026-11-01) |

Category words: CAUTION (27 to 32), EXTREME CAUTION (33 to 41), DANGER (42 to 51), EXTREME DANGER (52 and up).

### Open for owner review
- The setup network name `Init-Setup` and the address `192.168.4.1` (the ESP32 default) are proposals. P03-05 decides the final values.
- Whether the heat index should show a decimal (`39.5`) instead of whole degrees. Whole degrees match the category rule and fit at size 4.
- An always-on OLED wears out (blue SSD1306 modules are typically rated for some tens of thousands of hours). Not a problem for the field trial. A later option is dimming at night; not planned.

## Files
| File | What | Item |
|---|---|---|
| `README.md` | This spec | P03-D1 |
| `font5x7.mjs` | The Adafruit 5 x 7 font as data (BSD, see notices) | P03-D2 |
| `render.mjs` | 128 x 64 one-bit screen with Adafruit_GFX-style calls, and the PNG writer | P03-D2 |
| `screens.mjs` | The screens as drawing code with made-up inputs | P03-D2 |
| `build-refs.mjs` | `node design/oled/build-refs.mjs` writes `ref/` and `preview/` | P03-D2 |
| `ref/*.png` | 128 x 64 reference images, 1:1 (what the owner approves, and what P03-D3 compares against) | P03-D2 |
| `preview/*@4x.png` | The same, 4 times larger and blue, for looking at | P03-D2 |
