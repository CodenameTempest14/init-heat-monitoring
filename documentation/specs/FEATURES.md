# Init: proposed features (PROPOSAL, nothing approved, nothing built)

Status: **owner approved Tiers 1, 2 and 3 in full on 2026-10-31, on the condition that everything is open source** (condition to be confirmed, see D-010). Wi-Fi setup: option 1 (device setup page, no Wi-Fi password in the database), D-011. Phase plan still to be proposed. Only approved features may be planned or built (CLAUDE.md). Scope stays as in D-003: one room, public read-only viewing, free hosting. Power is a USB power bank (D-008).

Effort: S = about a session, M = a few sessions, L = a phase of its own.

## Tier 1: the minimum that does the job

| ID | Feature | What the user sees | Notes / risk | Effort |
|---|---|---|---|---|
| F-01 | Live reading | Big cards for temperature, humidity and heat index, with "updated 2 min ago". | The heat index formula is written test-first (CLAUDE.md). It is only valid above about 27 °C and 40 % RH; below that the app says "below heat-index range" instead of a made-up number. | S |
| F-02 | Heat category colour | The card turns Caution / Extreme caution / Danger / Extreme danger, using the PAGASA heat index bands (27–32, 33–41, 42–51, 52 °C and up). | I'll check the bands against PAGASA's published table before building. | S |
| F-03 | Device online / offline | A badge: online, or "no reading for 12 min". | Replaces a battery level: a power bank can't report its charge, so "offline" is the warning that it died or lost the hotspot. | S |
| F-04 | History chart | 24 hours and 7 days of temperature, humidity and heat index. | Free tier is enough: 288 readings a day. | M |
| F-05 | Installable phone app (PWA) | Add to home screen, phone-first layout, light and dark. | iOS only allows web push for installed apps. | S |
| F-06 | Secure device upload | The ESP32 posts a reading over HTTPS with its own device key. The server checks the key, the value ranges and the rate before saving. | "Server side is authoritative." Device key lives in `secrets.h`, never committed. | M |
| F-07 | Public read-only access | Anyone with the link sees the readings; nobody can write except the device and the admin. | Database row-level rules decide this, not hidden buttons. | S |
| F-08 | On-device OLED | Temperature, humidity and heat index on the OLED; the wake button shows it on demand. | Firmware, no app work. | M |

## Tier 2: strong additions (my recommendation)

| ID | Feature | What the user sees | Notes / risk | Effort |
|---|---|---|---|---|
| F-09 | Admin login and settings | You sign in and change the reporting interval, alert thresholds and a sensor calibration offset. | The device fetches these on every wake. One admin account to start. | M |
| F-10 | Heat alerts | A phone notification when the heat index reaches Danger, with a quiet period so it doesn't repeat. | Free web push. Needs the app installed on iOS. Wording of any advice is reviewed by a teacher first. | M |
| F-11 | Offline buffer on the device | If the hotspot is down, the device keeps readings and uploads them later. | Memory is limited, so cap at a few hundred readings. | M |
| F-12 | Daily summary | Today's high, the hottest hour, and how many school hours were in Danger. A school-hours filter (for example 7:00–17:00). | Computed in the database, no extra service. | S |
| F-13 | Kiosk display page | A full-screen page with huge numbers for a hallway TV or a projector. | Same data as F-01, a different layout. | S |
| F-14 | QR code poster | A printable page with the app's QR code, for the classroom door. | | S |
| F-15 | Advice by category | Short guidance under the category colour (drink water, open windows, move activities). | Advisory wording only. Not official DepEd or PAGASA guidance unless a teacher confirms it. | S |

## Tier 3: later, only if you ask

| ID | Feature | Notes | Effort |
|---|---|---|---|
| F-16 | CSV export of history | Useful for a report to the school. | S |
| F-17 | Device health page | Wi-Fi signal, last reboot reason, firmware version (admin only). | S |
| F-18 | Tagalog / English toggle | Fits the brand. | M |
| F-19 | Over-the-air firmware updates | Convenient but a security risk (a bad update bricks the device). Not before F-06 is solid. | L |
| F-20 | Data housekeeping | Keep raw readings 90 days, then store hourly averages, to stay inside the free tier. | S |

## Needs your decision (not a feature, a design choice)

**Changing Wi-Fi from the web app (D-003).** If the device can only reach the internet through the hotspot, a wrong Wi-Fi name sent from the app would cut it off for good. Two options:
1. **Recommended:** the device keeps its Wi-Fi in `secrets.h` and, if it can't connect, opens its own setup page you reach from a phone. The app never stores a Wi-Fi password.
2. The admin types the Wi-Fi password in the app and the database stores it. Possible, but a password in a public-facing database is a risk, and a typo strands the device.

## Not proposing

Multiple rooms or schools (D-003), student accounts or any personal data, cellular module, on-board battery charger, paid hosting.

## What I'd approve first

Tier 1 as phase one (the device sends, the app shows), then F-09, F-10, F-12 and F-13. That order is only my suggestion.
