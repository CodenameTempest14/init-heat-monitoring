// Upload interval rules (P03-03). No Arduino code in here, so the PC test in tests/ can run it.
#pragma once
#include <cstdint>
#include <cstring>

constexpr uint32_t INTERVAL_MIN_S = 60;    // same limits as the server's settings table
constexpr uint32_t INTERVAL_MAX_S = 3600;

// Reads "interval_s" from the server's reply, e.g. {"saved": 1, "duplicates": 0, "interval_s": 300}.
// Anything that is not a plain whole number from 60 to 3600 gives back fallbackS: the server checks
// the value too, but the device does not trust a reply blindly.
inline uint32_t intervalFromReply(const char* body, uint32_t fallbackS) {
  if (!body) return fallbackS;
  const char* p = std::strstr(body, "\"interval_s\"");
  if (!p) return fallbackS;
  p += std::strlen("\"interval_s\"");
  while (*p == ' ') p++;
  if (*p != ':') return fallbackS;
  p++;
  while (*p == ' ') p++;
  if (*p < '0' || *p > '9') return fallbackS;          // rejects "300", null and -300
  uint32_t value = 0;
  while (*p >= '0' && *p <= '9') {
    value = value * 10 + (uint32_t)(*p - '0');
    if (value > INTERVAL_MAX_S) return fallbackS;      // stops before it can overflow
    p++;
  }
  if (*p != ',' && *p != '}' && *p != ' ' && *p != '\0') return fallbackS;  // rejects 90.5
  return value < INTERVAL_MIN_S ? fallbackS : value;
}

// True when intervalMs has passed since last. The unsigned subtraction stays right when
// millis() wraps around to 0 (after about 49 days).
inline bool intervalDue(uint32_t nowMs, uint32_t lastMs, uint32_t intervalMs) {
  return (uint32_t)(nowMs - lastMs) >= intervalMs;
}
