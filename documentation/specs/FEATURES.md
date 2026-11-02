# Init: proposed features (PROPOSAL, nothing approved, nothing built)

Status: **owner approved Tiers 1, 2 and 3 in full on 2026-10-31, on the condition that everything is open source** (condition to be confirmed, see D-010). Wi-Fi setup: option 1 (device setup page, no Wi-Fi password in the database), D-011. Phase plan still to be proposed. Only approved features may be planned or built (CLAUDE.md). Scope stays as in D-003: one room, public read-only viewing, free hosting. Power is a USB power bank (D-008).

Effort: S = about a session, M = a few sessions, L = a phase of its own.

## Tier 1: the minimum that does the job

| ID | Feature | What the user sees | Notes / risk | Effort |
|---|---|---|---|---|
| F-01 | Live reading | Big cards for temperature, humidity and heat index, with "updated 2 min ago". | The heat index formula is written test-first (CLAUDE.md). It uses the NWS rule: below a heat index of about 80 °F (26.7 °C) the regression is not valid; below that the app says "below heat-index range" instead of a made-up number. | S |
| F-02 | Heat category colour | The card turns Caution / Extreme caution / Danger / Extreme danger, using the PAGASA heat index bands (27–32, 33–41, 42–51, 52 °C and up). | I'll check the bands against PAGASA's published table before building. | S |
| F-03 | Device online / offline | A badge: online, or "no reading for 12 min". | Replaces a battery level: a power bank can't report its charge, so "offline" is the warning that it died or lost the hotspot. | S |
| F-04 | History chart | 24 hours and 7 days of temperature, humidity and heat index. | Free tier is enough: 288 readings a day. | M |
| F-05 | Installable phone app (PWA) | Add to home screen, phone-first layout, light and dark. | iOS only allows web push for installed apps. | S |
| F-06 | Secure device upload | The ESP32 posts a reading over HTTPS with its own device key. The server checks the key, the value ranges and the rate before saving. | "Server side is authoritative." Device key lives in `secrets.h`, never committed. | M |
| F-07 | Public read-only access | Anyone with the link sees the readings; nobody can write except the device and the admin. | Database row-level rules decide this, not hidden buttons. | S |
| F-08 | On-device OLED | Temperature, humidity and heat index on the OLED; the wake button shows it on demand. | Firmware, no app work. | M |

**Approved design work (not a new feature):** OLED screen design canvas for F-08, owner's request (s06), placed at the start of P03 as P03-D1 to D3 (D-022, owner approved 2026-10-31).

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
| F-18 | Tagalog / English toggle (kept, owner s22, D-034: still Tier 3, later) | Fits the brand. | M |
| F-19 | Over-the-air firmware updates | Convenient but a security risk (a bad update bricks the device). Not before F-06 is solid. | L |
| F-20 | Data housekeeping | Keep raw readings 90 days, then store hourly averages, to stay inside the free tier. | S |

## Added 2026-10-31 (s07), owner's request: APPROVED by the owner (D-024)

| ID | Feature | What the user sees | Notes / risk | Effort |
|---|---|---|---|---|
| F-21 | Device room assignment | The app shows which room the device is in ("Room 204"). The admin can change it when the device is moved. Old readings keep the room they were taken in. | Still one device and one room at a time (D-003). History: the room is saved on each reading (owner's choice). Data part in P02 (before the live database is created), admin screen in P05 with F-09, room name on the public page in P04. | S |

## Added 2026-11-02 (s22), owner's request: APPROVED by the owner (D-034), not built yet

| ID | Feature | What the user sees | Notes / risk | Effort |
|---|---|---|---|---|
| F-22 | Admin guide | A plain "How to set this up" page for the admins, who are **high-school students**. Each admin setting gets: what it does, when to change it, and numbered steps with a worked example. The admin page gets a small **How? ›** link under each group (Room, Device, Heat alerts) that opens the guide at that part. | Text only, no new data or server change. Wording must not read as official health advice (same rule as F-15); the heat-level part quotes PAGASA's names and numbers only. Part of P05 (with F-09). | S |

**Shape (approved as written, s22):**
- **Where:** `#guide` on the same address. It can be read without signing in, because nothing in it is secret, and students can read it before they get the password. The only links to it are on the admin page, not on the public page.
- **Reading level:** short sentences, one idea each, numbered steps, a real example with numbers, no jargon (or jargon explained once). About Grade 8 level.
- **Sections, in the order of the admin page:**
  1. **Before you start:** who the admin is, what changes when you press Save, and that the device picks up a new setting within about a minute.
  2. **Room:** when to change it (the device was moved), how to type it ("Room 204"), and why no names of people.
  3. **Reporting interval:** what it means (how often the device sends a reading), why to keep 60 s on the power bank, and when a longer value is fine (only on a wall charger).
  4. **Temperature and humidity offsets (calibration):** what an offset is, with an example. "The device says 31.0 °C, a trusted thermometer next to it says 30.2 °C, so the offset is 30.2 − 31.0 = −0.8." Steps: put a trusted thermometer next to the device, out of the sun; wait 30 minutes; write down both numbers 3 times, 5 minutes apart; take the average difference; type it and Save. Offsets change new readings only.
  5. **Heat alerts:** the PAGASA levels table (Caution 27-32, Extreme caution 33-41, Danger 42-51, Extreme danger 52 and up), what "Alert at heat index" means (42 = alert at Danger), and what the quiet period is (no repeated alert for that many minutes). A note that alerts arrive in a later step (P05-03).
  6. **If something looks wrong:** "Not saved", "Not an admin", and the device showing Offline, each with what to do.
- **How? links:** one under each group label on the admin page, jumping to that section. The approved admin images change by these links only (redrawn after approval).

**Owner answers (s22):** The guide is written in English; the rest of the app stays English for now, and the Tagalog / English toggle (F-18) is **kept** for later (owner corrected s22, D-034). A teacher reads the guide before it goes live, and the same rule applies to every other user-facing wording (D-034).

## Needs your decision (not a feature, a design choice)

**Changing Wi-Fi from the web app (D-003).** If the device can only reach the internet through the hotspot, a wrong Wi-Fi name sent from the app would cut it off for good. Two options:
1. **Recommended:** the device keeps its Wi-Fi in `secrets.h` and, if it can't connect, opens its own setup page you reach from a phone. The app never stores a Wi-Fi password.
2. The admin types the Wi-Fi password in the app and the database stores it. Possible, but a password in a public-facing database is a risk, and a typo strands the device.

## Not proposing

Multiple rooms or schools (D-003), student accounts or any personal data, cellular module, on-board battery charger, paid hosting.

## What I'd approve first

Tier 1 as phase one (the device sends, the app shows), then F-09, F-10, F-12 and F-13. That order is only my suggestion.

## P05 details to confirm (APPROVED by the owner as written, P5-a to P5-j, 2026-11-02, s22; nothing built yet)

F-09, F-10, F-17 and F-21 are already approved (Tiers 1 to 3 in full, 2026-10-31; F-21 by D-024). What follows is not new features. These are the choices inside them that the checklist leaves open. Mark each one OK or change it.

| # | Item | Proposal | Why / risk |
|---|---|---|---|
| P5-a | Admin login (P05-01) | Supabase Auth, email + password, one account. Sign-ups stay off, so the account is created by hand. A one-row `admins` table lists the allowed user id; every policy checks that list, never just "signed in" (S-4, P05-05). | Server side decides. Optional: a second factor (an authenticator app), free in Supabase. |
| P5-b | Where the admin lives | A `#admin` view in the same web app, no link on the public pages. | Hiding the link is not security; the policies are. |
| P5-c | Settings (P05-02) | Reporting interval, alert threshold (default Danger = heat index 42 °C), quiet period (default 60 min), temperature offset and humidity offset. Each has a minimum and maximum checked by the database. | The device already gets `interval_s` in the reply (D-027). |
| P5-d | Interval limit | Maximum 60 s while the device runs on the power bank, because the bank switches off with a low draw (D-027). The admin page says so. | Without the cap, one bad setting makes the device go dark. |
| P5-e | Calibration offset | Applied on the server when the reading is stored, within ±5 °C and ±10 % RH. The raw value is kept next to it. The device stays unchanged. | The heat index is computed on the server (D-023), so the offset must go in before it. Needs the sensor check against a reference thermometer to set a real value. |
| P5-f | Push alert (P05-03) | Web Push (free). A "Send me heat alerts" button on the installed app stores the phone's subscription. The database sends one alert when the heat index first reaches the threshold, then stays quiet for the quiet period. | Needs a sending service: a Supabase Edge Function and a key pair, with the private key in secrets only. iOS needs the app installed, and I have not seen the install on an iPhone yet. |
| P5-g | Alert wording | Plain: "Heat index 43 °C (Danger) in <room>." No advice text until a teacher reviews it (F-15). | As in the Tier 2 note. |
| P5-h | Who can subscribe | Anyone with the app, one subscription per phone, nothing but the push address is stored (no name, no email). A stranger can add or remove only their own. | A push address is not personal data here, but it is not for public reading: only the sender reads it. |
| P5-i | Device health (P05-04) | The device adds Wi-Fi signal (RSSI), reset reason and firmware version to each upload. The server checks them. The admin page shows the latest. | Firmware change plus a migration. The public pages never show it. |
| P5-j | Room edit (P05-06) | A text box on the admin page. New readings get the new room, old ones keep theirs. The box says not to use people's names (S-10). | Data part already built (D-024). |

**Suggested order:** P05-01 and P05-05 together (login and the admin list, with the refusal tests), then P05-06 (small, proves the admin path), P05-02, P05-04, and P05-03 last because it needs the most new parts.

**Tests first:** refused calls (anonymous and a signed-in non-admin) get written and seen failing before the policies exist. The offset and the alert's quiet period are correctness rules, so they get tests first too.

**Model:** Opus 5.5 for P05-01 and P05-05 (login and policies). Sonnet 5.5 for the rest.
