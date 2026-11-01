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
- [x] P03-D2 A 1:1 reference image (128×64, monochrome) of each screen with made-up readings; the owner approves them
  - Images made s09 (2026-11-01): `design/oled/ref/` 9 images from `node design/oled/build-refs.mjs`, looked at in the 4× previews. **Owner approved all 9 screens, whole-degree heat index and the setup names on 2026-11-01** (D-025).
- [x] P03-D3 OLED-GATE: the screen drawing code is checked against the approved image (rendered on the PC or photographed on the device), and the check is shown to fail on a deliberate mismatch
  - Evidence (s09): `tests/oled.test.js` (4 tests, red first: module missing) compares every screen with its `ref/` PNG pixel for pixel; shown to fail on a flipped pixel, a different number and the wrong image. Mutation of the real code (footer moved 1 px) made 2 tests fail with 185 differing pixels; restored, 4/4 pass; `npm test` 18/18. Decoder also checked on a PNG re-encoded by Pillow (0 differences). This is the PC render. The same check on the photographed real OLED is done when P03-04 draws on the device.

## Build
- [x] P03-01 PlatformIO project builds; `secrets.h` is gitignored
  - Evidence (s10, 2026-11-02): `firmware/init/`, `pio run` ends `[SUCCESS]` (222 s first build; RAM 6.7%, flash 22.9%), platform espressif32@6.9.0 and the 5 libraries pinned. `git check-ignore -v firmware/init/include/secrets.h` shows `.gitignore:6:secrets.h`; only `secrets.h.example` is committed. Not run on the board: the skeleton is only built, not flashed.
  - Run on the board (s11, 2026-11-02): flashed from `firmware/init` (log shows `Espressif 32 (6.9.0)`, owner held BOOT). Owner saw "Init" on the OLED. Serial read by the assistant on COM8: `T=28.4 H=64.5`, one line every 2.00 s (timestamps 1.71, 3.72, 5.72, 7.73, 9.73, 11.74 s). A first upload from the VS Code toolbar had flashed `bench` by mistake (serial showed `nets=`); now documented in `firmware/README.md`.
- [x] P03-02 Connects through the hotspot and an HTTPS upload is accepted by the backend; the server certificate is checked (root CA in the firmware, no `setInsecure()`, SECURITY_REVIEW S-11), and an upload to a server with the wrong certificate is shown to fail
  - Evidence (s11, 2026-11-02, real board through the owner's hotspot, project init-test per D-026): serial `upload 2026-11-01T18:16:16Z T=28.4 H=64.5 -> 200 {"saved": 1, "duplicates": 0}` and again at 18:17:16. Server query: rows from device "Room 1" at 18:15:16, 18:16:16, 18:17:16 (28.4 to 28.5 °C, 64.5 to 64.6 %), heat index 30.7 = `src/heat-index.js` 30.66. Wrong certificate: build `esp32dev_wrongca` (trusts only ISRG Root X1) logged `(-9984) X509 - Certificate verification failed` at 18:30:46 and 18:31:46, `-> -1`; on the server the newest row stayed 18:28:17 (the good build's last one before the reflash) and `last_seen_at` stayed 18:28:20. PC precheck with `openssl s_client -CAfile`: the 3-root bundle verifies (0 ok), ISRG X1 alone fails (20). Roots in `include/root_ca.h`, GTS R1/R4 byte-identical between pki.goog and the system CA bundle.
- [x] P03-03 Always-awake loop (D-018): reads and uploads on the interval, interval read from the settings, and the bank stays on through the gaps between sends
  - Evidence (s12, 2026-11-02, real board, project init-test per D-026): backend tests 47/47 (2 new for `interval_s` seen red first, then green after migration `20261102120000_ingest_returns_interval.sql`); PC test `firmware/init/tests/interval_test.cpp` passes and fails when the wrap-around handling is broken. On USB, serial: `-> 200 {... "interval_s": 90}`, `interval 60 s -> 90 s`, uploads at 10, 100, 190, 280 s; after the server value was set to 60: `interval_s: 60`, uploads 60 s apart. On the ROMOSS bank (owner, 3:11 to 3:21 AM): at 90 s the bank switched itself off after about a minute (OLED dark; server gaps 71 to 153 s from restarts); at 60 s the server shows uploads exactly 60 s apart from 19:12:33 to 19:20:33Z (9 min, no gap), owner confirms the board was still on at 10 min. **Limits:** only 10 minutes on the bank (the full day is P07/P03-07); the bank needs an upload at least every ~60 s (see D-027); not applied to live `init` yet.
- [ ] P03-04 OLED shows temperature, humidity and heat index and stays on (D-025); the wake button is added when a button is bought (F-08)
- [ ] P03-05 Setup page opens when Wi-Fi fails, and credentials can be changed from a phone (D-011)
- [ ] P03-06 Offline buffer keeps readings while the hotspot is down and uploads them later (F-11)
- [ ] P03-07 24-hour run on the power bank; measured battery drop recorded
