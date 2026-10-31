# design/oled/

OLED screen design canvas (D-022, same method as the web canvas in D-016). P03-D1 is this README. P03-D2 adds a 1:1 reference image per screen, which the owner approves. P03-D3 checks the drawing code against those images. Nothing is drawn on the real OLED (P03-04) before the images are approved.

Status: **draft for owner review**. Items marked "Question" are not decided.

## The display
SSD1306, 128 × 64 pixels, 1 bit per pixel (D-009). Origin top-left, x 0 to 127, y 0 to 63. Pixels are either on or off, so there is no colour and no grey. Some SSD1306 modules have a yellow strip on the top 16 rows and blue below. The module's actual colours are not recorded yet. They do not change the drawing, only how it looks.

Rules that carry over from the web design:
- The heat category is always **words**, never only an icon or an inverted bar (colour is never the only signal).
- Open-source fonts only (D-010). Each font used is listed with its licence in `THIRD_PARTY_NOTICES.md` before the code uses it.
- Made-up readings only in reference images. No real room or person.

## Grid
Layout works on a text grid so the images and code share numbers.

| Item | Value |
|---|---|
| Screen | 128 × 64 |
| Margin | 2 px on every side (usable area x 2 to 125, y 2 to 61) |
| Big number font | about 20 px tall digits (heat index) |
| Medium font | about 10 px tall (temperature, humidity, labels) |
| Small font | 5 × 7 px (status line, hints) |
| Rows (top to bottom) | status strip y 0 to 9, main area y 12 to 51, footer y 54 to 63 |

Font candidates (all pixel fonts that fit Adafruit GFX or U8g2, both open source). **Licence of each chosen font is checked and recorded in P03-D2, before it is used:**
- Adafruit GFX built-in 5 × 7 font (small).
- A U8g2 bitmap font family, such as the `u8g2_font_helvB*` or `logisoso*` fonts (medium and big).

## Screens
Taken from approved features only: F-08 (readings on the OLED, wake button), F-03 (offline state), F-11 (offline buffer), F-21 (room name), D-011 (setup page). Readings below are made up.

| ID | Screen | Shows | Source |
|---|---|---|---|
| OLED-01 | Reading | Heat index (big, °C), PAGASA category in words, temperature and humidity (medium), room name in the status strip | F-08, D-019, F-21 |
| OLED-02 | Reading, heat index below range | Same as OLED-01, but the heat index shows `--` and the category line says `Below 27`, because `heatIndexC` returns null under the NWS range and `heatCategory` is null below 27 °C | F-08, D-020 |
| OLED-03 | Starting / connecting | Name `Init`, `Connecting to Wi-Fi...` | D-011 |
| OLED-04 | Offline | Latest reading as in OLED-01 plus `NO WI-FI` in the status strip and the number of readings waiting to upload | F-03, F-11 |
| OLED-05 | Setup mode | `SETUP`, the name of the device's own Wi-Fi network, and the address to open on the phone | D-011 |

Category words, from `heatCategory`: Caution (27 to 32), Extreme Caution (33 to 41), Danger (42 to 51), Extreme Danger (52 and up). The band for each whole °C is in `src/heat-index.js`.

### Questions for the owner
1. **Wake button and D-018.** F-08 says the wake button "shows it on demand", which suggests the screen goes dark when idle. D-018 only rules out deep sleep, so the screen can still blank. Should the screen (a) stay on all the time, or (b) blank after some seconds and the button turns it on? If (b), how many seconds? (b) adds a screen: OLED-06 blank. It also lengthens OLED life.
2. **Sensor error.** If the DHT22 gives no valid reading, the device needs something to show (for example `SENSOR ERROR`). It is not in the approved feature list. I propose adding it as a state of F-08, as OLED-07, but I need your OK.
3. **Is the module single colour, or the yellow top / blue bottom type?** It only affects how the reference images are photographed later.

## Files (planned)
| File | What | Item |
|---|---|---|
| `README.md` | This spec | P03-D1 |
| `screens.json` | One entry per screen: id, text, font, position, status | P03-D2 |
| `ref/OLED-nn.png` | 128 × 64 monochrome reference image per screen | P03-D2 |
| render and compare script | Draws from the same numbers and compares with `ref/` | P03-D3 |
