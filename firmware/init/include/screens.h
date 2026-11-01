// The OLED screens (P03-04), repeated call for call from design/oled/screens.mjs, which the owner approved
// as the images in design/oled/ref/ (D-025). If you change a position here, change it there first.
// Font: the Adafruit GFX classic 5x7 scaled with setTextSize; the degree sign is glyph 248 (cp437).
#pragma once
#include <Adafruit_SSD1306.h>
#include <cstdio>
#include <cstring>
#include "heat_index.h"

#define DEG "\xF8"  // always put "C" in a separate literal after it: "\xF8C" would read C as a hex digit

namespace screens {

inline int textWidth(int size, const char* s) { return (int)std::strlen(s) * 6 * size - size; }

// fg on a transparent background, or fg on bg (like setTextColor(fg, bg)); bg < 0 = transparent
inline void text(Adafruit_SSD1306& d, int x, int y, int size, const char* s, int fg = SSD1306_WHITE, int bg = -1) {
  d.setTextSize(size);
  if (bg < 0) d.setTextColor(fg);
  else d.setTextColor(fg, bg);
  d.setCursor(x, y);
  d.print(s);
}

inline void begin(Adafruit_SSD1306& d) {
  d.clearDisplay();
  d.cp437(true);        // glyph 248 is the degree sign
  d.setTextWrap(false);
}

// room on the left; link on the right (nullptr = none); rule under it
inline void strip(Adafruit_SSD1306& d, const char* room, const char* link) {
  text(d, 2, 1, 1, room);
  if (link) text(d, 126 - textWidth(1, link), 1, 1, link);
  d.drawFastHLine(0, 9, 128, SSD1306_WHITE);
}

inline const char* categoryWord(double hiC) {
  const char* name = heatCategoryName(hiC);
  if (!std::strcmp(name, "caution")) return "CAUTION";
  if (!std::strcmp(name, "extreme-caution")) return "EXTREME CAUTION";
  if (!std::strcmp(name, "danger")) return "DANGER";
  if (!std::strcmp(name, "extreme-danger")) return "EXTREME DANGER";
  return nullptr;
}

// OLED-01, 02 and 04. queued < 0 hides the "to send" line (there is no offline buffer until P03-06).
inline void reading(Adafruit_SSD1306& d, const char* room, const char* link, float tempC, float rh, int queued = -1) {
  begin(d);
  strip(d, room, link);

  double hi = 0;
  const bool hasHi = heatIndexC(tempC, rh, hi);
  char big[8] = "--";
  if (hasHi) std::snprintf(big, sizeof big, "%d", roundedHeatIndex(hi));
  text(d, 2, 12, 4, big);  // 24 x 32 per character
  text(d, 54, 12, 2, DEG "C");
  text(d, 54, 29, 1, "HEAT INDEX");
  if (queued >= 0) {
    char q[16];
    std::snprintf(q, sizeof q, "%d to send", queued);
    text(d, 54, 37, 1, q);
  }

  const char* word = hasHi ? categoryWord(hi) : nullptr;
  if (word) {
    d.fillRect(0, 46, 128, 10, SSD1306_WHITE);
    text(d, 2, 47, 1, word, SSD1306_BLACK, SSD1306_WHITE);
  } else {
    text(d, 2, 47, 1, "NO RATING BELOW 27" DEG "C");  // below the NWS range, or under the first PAGASA band
  }

  char foot[28];
  std::snprintf(foot, sizeof foot, "T %.1f" DEG "C  RH %d%%", tempC, (int)std::floor(rh + 0.5));
  text(d, 2, 57, 1, foot);
  d.display();
}

// OLED-03
inline void starting(Adafruit_SSD1306& d) {
  begin(d);
  text(d, 46 - 18, 12, 3, "INIT");  // 4 characters x 18 px = 72 wide, centred
  text(d, 10, 44, 1, "Connecting Wi-Fi...");
  d.display();
}

// OLED-05
inline void setupMode(Adafruit_SSD1306& d) {
  begin(d);
  strip(d, "SETUP MODE", nullptr);
  text(d, 4, 14, 1, "1. Join this Wi-Fi:");
  text(d, 4, 24, 2, "Init-Setup");
  text(d, 4, 44, 1, "2. Open in browser:");
  text(d, 4, 54, 1, "192.168.4.1");
  d.display();
}

// OLED-06
inline void sensorError(Adafruit_SSD1306& d, const char* room, const char* link) {
  begin(d);
  strip(d, room, link);
  text(d, (128 - textWidth(2, "SENSOR")) / 2, 16, 2, "SENSOR");
  text(d, (128 - textWidth(2, "ERROR")) / 2, 34, 2, "ERROR");
  text(d, (128 - textWidth(1, "Check DHT22 wiring")) / 2, 54, 1, "Check DHT22 wiring");
  d.display();
}

}  // namespace screens
