# Phase 1 — Heat index core and bench bring-up

**Objective:** A correct, tested heat index calculation, and proof on the bench that the ESP32, DHT22, OLED and ROMOSS power bank work together.
**Entry criteria:** P00 closed; phase plan approved (D-013).
**Exit criteria:** Heat index tests pass against reference values; a breadboard device shows live readings on the OLED while running from the power bank; real sleep and awake currents measured.
**Features:** F-01 and F-02 (logic only). Model: Sonnet 5.5.

Checklist markers read by `tools/phase-report.mjs`: `- [x]` done · `UNVERIFIED:` ticked but not yet checked on the real thing · `PROG:` partly done · `BLOCKED:` waiting on someone · `RULED:` ruled out.

## Heat index logic (test-first)
- [x] P01-01 Tests for the heat index written first, covering the valid range, the below-range case and edge values, and watched failing — evidence 2026-10-31: `node --test` fails with ERR_MODULE_NOT_FOUND (src/heat-index.js absent); 7 tests in tests/heat-index.test.js. Chart rows still to be confirmed against the published chart in P01-02.
- [x] P01-02 Implementation passes the tests and matches published reference values — evidence 2026-10-31: `node --test` 8/8 pass; chart rows read from the NWS chart image (weather.gov heatindexchart-650.jpg). Found and handled the 80F/40% boundary (chart 80, rule gives 79.8 -> null).
- [ ] P01-03 PAGASA category bands checked against PAGASA's own published table, with the source link recorded

## Bench bring-up
- [ ] P01-04 Power bank low-load test: bare ESP32 on the ROMOSS Sense 8P+ stays on for at least an hour; result recorded
- [ ] P01-05 Breadboard built per the Rev B wire list; 3V3 pin measured
- [ ] P01-06 DHT22 and OLED show a live reading on the bench from a test sketch
- [ ] P01-07 Sleep and awake currents measured with a USB meter; runtime estimate in the schematic corrected
- [ ] P01-08 Licence of every library used recorded (open-source rule, D-010)
