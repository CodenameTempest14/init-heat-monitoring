# Phase 3 — Device firmware

**Objective:** Firmware that stays awake (D-018), reads the sensor on an interval, shows it on the OLED and uploads over the hotspot.
**Entry criteria:** P01 and P02 closed.
**Exit criteria:** The device runs a full day on the power bank and every reading reaches the backend.
**Features:** F-08, F-11, D-011. Model: Sonnet 5.5 (Opus 5.5 for the key handling and setup page).

Checklist markers: see phase-01.

## OLED design canvas (D-022, owner approved the placement 2026-10-31)
Same method as the web canvas (D-016). Must be finished and approved before P03-04 draws anything on the real OLED.
- [x] P03-D1 `design/oled/` entry with README: screen list taken from the approved features (F-08, plus the offline / setup states of F-03 and D-011), and a small spec of the 128×64 grid, fonts (open-source pixel fonts only, D-010) and sizes
  - Evidence (s09, 2026-11-01): `design/oled/README.md` has the grid, font and the screen list with the source feature of each; `node tools/check-readmes.mjs` passes. The three open questions were answered by the owner (D-025).
- [ ] P03-D2 A 1:1 reference image (128×64, monochrome) of each screen with made-up readings; the owner approves them
  - Images made s09 (2026-11-01): `design/oled/ref/` 9 images from `node design/oled/build-refs.mjs`, looked at in the 4× previews. **Owner approval pending**, so not ticked.
- [ ] P03-D3 OLED-GATE: the screen drawing code is checked against the approved image (rendered on the PC or photographed on the device), and the check is shown to fail on a deliberate mismatch

## Build
- [ ] P03-01 PlatformIO project builds; `secrets.h` is gitignored
- [ ] P03-02 Connects through the hotspot and an HTTPS upload is accepted by the backend; the server certificate is checked (root CA in the firmware, no `setInsecure()`, SECURITY_REVIEW S-11), and an upload to a server with the wrong certificate is shown to fail
- [ ] P03-03 Always-awake loop (D-018): reads and uploads on the interval, interval read from the settings, and the bank stays on through the gaps between sends
- [ ] P03-04 OLED shows temperature, humidity and heat index and stays on (D-025); the wake button is added when a button is bought (F-08)
- [ ] P03-05 Setup page opens when Wi-Fi fails, and credentials can be changed from a phone (D-011)
- [ ] P03-06 Offline buffer keeps readings while the hotspot is down and uploads them later (F-11)
- [ ] P03-07 24-hour run on the power bank; measured battery drop recorded
