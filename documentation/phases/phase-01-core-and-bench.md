# Phase 1 — Heat index core and bench bring-up

**Objective:** A correct, tested heat index calculation, and proof on the bench that the ESP32, DHT22, OLED and ROMOSS power bank work together.
**Entry criteria:** P00 closed; phase plan approved (D-013).
**Exit criteria:** Heat index tests pass against reference values; a breadboard device shows live readings on the OLED while running from the power bank; real sleep and awake currents measured.
**Features:** F-01 and F-02 (logic only). Model: Sonnet 5.5.

Checklist markers read by `tools/phase-report.mjs`: `- [x]` done · `UNVERIFIED:` ticked but not yet checked on the real thing · `PROG:` partly done · `BLOCKED:` waiting on someone · `RULED:` ruled out.

## Heat index logic (test-first)
- [x] P01-01 Tests for the heat index written first, covering the valid range, the below-range case and edge values, and watched failing — evidence 2026-10-31: `node --test` fails with ERR_MODULE_NOT_FOUND (src/heat-index.js absent); 7 tests in tests/heat-index.test.js. Chart rows still to be confirmed against the published chart in P01-02.
- [x] P01-02 Implementation passes the tests and matches published reference values — evidence 2026-10-31: `node --test` 8/8 pass; chart rows read from the NWS chart image (weather.gov heatindexchart-650.jpg). Found and handled the 80F/40% boundary (chart 80, rule gives 79.8 -> null).
- [x] P01-03 PAGASA category bands checked against PAGASA's own published table, with the source link recorded — evidence 2026-10-31: bands read from the rendered PAGASA infographic (https://pubfiles.pagasa.dost.gov.ph/iaas/heat_index/Heat%20days%20survival_heat%20index_infographics_%2020220302.png, linked from pagasa.dost.gov.ph/weather/heat-index); 27-32, 33-41, 42-51, 52+. `heatCategory` tests written first (red: missing export), then 10/10 pass. PAGASA notes its thresholds are adapted from NWS-NOAA.

## Bench bring-up
- [x] P01-04 Power bank low-load test: bare ESP32 on the ROMOSS Sense 8P+ stays on for at least an hour; result recorded — first result 2026-10-31 (owner): with deep sleep the bank switched off after about 57 s, also in low-current mode, so D-018 drops deep sleep. Re-test: no-sleep sketch (firmware/bench) must run one hour on the bank. Result 2026-10-31 (owner-read from the OLED): the Wi-Fi scan sketch (72dbb76) ran on the ROMOSS bank for 61 min and the bank was still on; owner also checked at 10, 20 and 30 min. Bank percentage went 73% to 72% over the first 30 min (too coarse to estimate current). Finding: the bank needs about Wi-Fi-level load; CPU and OLED alone (about 1 min) and deep sleep both made it switch off, also in low-current mode
- [x] P01-05 Breadboard built per the Rev B wire list; 3V3 pin measured — evidence 2026-10-31 (owner-measured, multimeter): 3V3 pin = 3.273 V on PC USB (an earlier 3.723 V was a misread, corrected by the owner). 38-pin board (D-017). R1 was a 5 kΩ part instead of 10 kΩ (within the DHT22 range); the sensor reads correctly, so the wiring is confirmed by P01-06.
- [x] P01-06 DHT22 and OLED show a live reading on the bench from a test sketch — evidence 2026-10-31: `pio run -t upload` to COM8 (CP210x) after setting upload_speed = 115200 (921600 gave "Invalid head of packet"); owner saw the OLED UI and "wake #4"; serial read by the agent over COM8 showed `wake #1`, `T=31.9 C  RH=57.3 %` repeating every 2 s.
- [ ] RULED: P01-07 (ruled out 2026-10-31 by owner, D-018: deep sleep dropped, so no sleep current; no USB meter; awake current to be measured in P07 when a meter is available) Sleep and awake currents measured with a USB meter; runtime estimate in the schematic corrected
- [x] P01-08 Licence of every library used recorded (open-source rule, D-010) — evidence 2026-10-31: THIRD_PARTY_NOTICES.md; licence files read on GitHub (curl to the licence API and raw licence text). Only libraries planned for the bench sketch; later libraries are added in their own phase.
