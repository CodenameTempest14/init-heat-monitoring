# design/alerts/

**Mock for P05-03 (F-10, DECIDE 3): WAITING for the owner's approval.** The `#alerts` view where anyone can ask for heat
alerts on their phone (P5-h), and the one new row on the home page. Made-up room (`Room 204`), default settings
(threshold 42 °C, quiet period 60 min; the real page reads both from the admin's settings). The wording is a draft:
a teacher reviews it before live (D-034).

| File | What |
|---|---|
| `home-link.html` | The home page with one new row **Heat alerts ›** under **School day summary ›** (rest unchanged) |
| `alerts-off.html` | The usual start: what an alert is, **Send me heat alerts** (permission is asked only after the tap) |
| `alerts-on.html` | After subscribing: "Heat alerts are on for this phone." and **Stop alerts** |
| `alerts-iphone.html` | iPhone or iPad not opened from the Home Screen: iOS allows web push only for installed apps; three steps |
| `alerts-blocked.html` | Notifications blocked for the site: how to allow them |
| `alerts-unsupported.html` | A browser with no web push |
| `build-mocks.mjs`, `capture.mjs` | Write the mocks; `node design/alerts/capture.mjs` writes `ref/<state>-<phone\|desktop>-<light\|dark>.png` |
| `ref/` | The screenshots to approve |

Styles: `web/src/alerts.css` (used by the mock and later by the page). Every state has an icon and words (colour is never
the only signal). The page never asks for notification permission on load, only when the button is tapped.
