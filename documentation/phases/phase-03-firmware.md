# Phase 3 — Device firmware

**Objective:** Firmware that wakes on an interval, reads the sensor, shows it on the OLED, uploads over the hotspot and sleeps.
**Entry criteria:** P01 and P02 closed.
**Exit criteria:** The device runs a full day on the power bank and every reading reaches the backend.
**Features:** F-08, F-11, D-011. Model: Sonnet 5.5 (Opus 5.5 for the key handling and setup page).

Checklist markers: see phase-01.

- [ ] P03-01 PlatformIO project builds; `secrets.h` is gitignored
- [ ] P03-02 Connects through the hotspot and an HTTPS upload is accepted by the backend
- [ ] P03-03 Deep-sleep cycle on the interval, interval read from the settings
- [ ] P03-04 OLED shows temperature, humidity and heat index; wake button works (F-08)
- [ ] P03-05 Setup page opens when Wi-Fi fails, and credentials can be changed from a phone (D-011)
- [ ] P03-06 Offline buffer keeps readings while the hotspot is down and uploads them later (F-11)
- [ ] P03-07 24-hour run on the power bank; measured battery drop recorded
