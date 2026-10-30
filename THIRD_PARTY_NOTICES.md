# Third-party notices

Open-source rule (D-010): code and libraries must have open licences; hosting may be a free closed service.
Licences below were read from each project's own licence file on GitHub on 2026-10-31 (versions are those on `master`/`develop` that day; pin exact versions in `platformio.ini` in P03).

## Used or planned for the bench bring-up (P01) and firmware (P03)

| Library / tool | Used for | Licence | Source of the licence |
|---|---|---|---|
| Arduino-ESP32 core (espressif/arduino-esp32) | Arduino framework on the ESP32 | LGPL-2.1 | https://github.com/espressif/arduino-esp32/blob/master/LICENSE.md |
| PlatformIO Core | Build and upload tool | Apache-2.0 | https://github.com/platformio/platformio-core/blob/develop/LICENSE |
| PlatformIO platform-espressif32 | ESP32 platform for PlatformIO | Apache-2.0 | https://github.com/platformio/platform-espressif32/blob/develop/LICENSE |
| Adafruit DHT sensor library 1.4.7 | Read the DHT22 | MIT | https://github.com/adafruit/DHT-sensor-library/blob/master/license.txt |
| Adafruit Unified Sensor | Required by the DHT library | Apache-2.0 | https://github.com/adafruit/Adafruit_Sensor/blob/master/LICENSE.txt |
| Adafruit SSD1306 2.5.17 | Drive the OLED | BSD (text in its `license.txt`; GitHub did not auto-detect the exact variant) | https://github.com/adafruit/Adafruit_SSD1306/blob/master/license.txt |
| Adafruit GFX Library 1.13.0 | Drawing for the OLED | BSD (same note) | https://github.com/adafruit/Adafruit-GFX-Library/blob/master/license.txt |
| Adafruit BusIO | I2C helper pulled in by the Adafruit libraries | MIT | https://github.com/adafruit/Adafruit_BusIO/blob/master/LICENSE |

## Notes
- All are open source, so the D-010 condition is met. The ESP32 core is LGPL-2.1: fine for an open-source repo, and if firmware binaries are ever shared, the source (this repo) must be available.
- The Node code in `src/` and `tests/` uses only Node built-ins (no packages).
- Node, Supabase client, the app template and Playwright are not chosen or installed yet; their licences are recorded when they are added.
- Not verified: whether the SSD1306 and GFX licences are the 2-clause or 3-clause BSD variant. Both are open licences either way.
