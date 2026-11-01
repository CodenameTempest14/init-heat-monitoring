// OLED-GATE on the real board (P03-04). Only built by `pio run -e esp32dev_screens`.
// Draws the 9 approved screens one after another with the same made-up readings as design/oled/screens.mjs
// and prints the display's frame buffer over serial: "SCREEN <id> <2048 hex digits>".
// design/oled/check-dump.mjs compares that dump with design/oled/ref/*.png pixel for pixel.
#pragma once
#include <Adafruit_SSD1306.h>
#include "screens.h"

inline void screenTestDump(Adafruit_SSD1306& d, const char* id) {
  const uint8_t* buf = d.getBuffer();
  Serial.printf("SCREEN %s ", id);
  for (int i = 0; i < 128 * 64 / 8; i++) Serial.printf("%02x", buf[i]);
  Serial.println();
}

inline void screenTestLoop(Adafruit_SSD1306& d) {
  const char* room = "Room 204";
  const char* ok = "Wi-Fi OK";
  screens::reading(d, room, ok, 30, 55);  screenTestDump(d, "OLED-01-caution");  delay(1500);
  screens::reading(d, room, ok, 33, 60);  screenTestDump(d, "OLED-01-extreme-caution");  delay(1500);
  screens::reading(d, room, ok, 38, 50);  screenTestDump(d, "OLED-01-danger");  delay(1500);
  screens::reading(d, room, ok, 40, 60);  screenTestDump(d, "OLED-01-extreme-danger");  delay(1500);
  screens::reading(d, room, ok, 24, 50);  screenTestDump(d, "OLED-02");  delay(1500);
  screens::starting(d);                   screenTestDump(d, "OLED-03");  delay(1500);
  screens::reading(d, room, "NO WI-FI", 33, 60, 12);  screenTestDump(d, "OLED-04");  delay(1500);
  screens::setupMode(d);                  screenTestDump(d, "OLED-05");  delay(1500);
  screens::sensorError(d, room, ok);      screenTestDump(d, "OLED-06");  delay(1500);
}
