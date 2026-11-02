# design/device-setup/

The Wi-Fi setup page the ESP32 serves at `192.168.4.1` on its own network `Init-Setup` (D-011, P03-05).
Hand-written HTML and CSS (no template: Tabler is far too large for the board's flash). Colours are the theme
tokens plus `muted`, `line`, `field` and `err`, contrast checked in s14 (lowest pair 4.74:1 for a border, 5.33:1 for text).

| File | What |
|---|---|
| `form.html` | The form with a saved network |
| `form-error.html` | The form after a refused entry (message in text, network name kept, password cleared) |
| `saved.html` | After a successful save, just before the restart |
| `capture.mjs` | `node design/device-setup/capture.mjs` writes `ref/<state>-<light|dark>.png` at 390 px |
| `ref/` | The approved screenshots |

The firmware must produce these pages exactly (same inputs, same bytes); a PC test checks that against `ref/`.
Owner approved the three states on 2026-11-02 (s14), with the title centred.
Made-up network names only (`Room-Hotspot`, `Faculty-WiFi`).
