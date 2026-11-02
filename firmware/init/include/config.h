// Fixed settings that are not secret. Pins follow the Rev B wire list (same as ../bench).
#pragma once
#include <Arduino.h>

constexpr uint8_t PIN_DHT = 4;      // DHT22 DATA, pull-up 4.7 to 10 kΩ to 3V3
constexpr uint8_t PIN_SDA = 21;     // OLED
constexpr uint8_t PIN_SCL = 22;     // OLED
constexpr uint8_t OLED_ADDR = 0x3C;
// Name on the left of the OLED status strip until the first upload reply brings the room set on the server (D-028).
// At most 12 characters (room.h).
#define OLED_ROOM_LABEL "Room 1"
constexpr uint32_t DISPLAY_REFRESH_MS = 5000;  // the DHT22 needs 2 s between reads
constexpr uint32_t WIFI_RETRY_MS = 15000;      // while the hotspot is away: a new connection attempt this often
constexpr uint32_t SEND_GAP_MS = 35000;        // after a send attempt, wait this long (the server takes one call per 30 s)
constexpr uint8_t PIN_BUTTON = 33;  // reserved for the OLED wake button (F-08), not used yet
