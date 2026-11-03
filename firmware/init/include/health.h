// Device health for the upload body (P05-04, F-17). No Arduino code in here, so the PC test in tests/ can run it.
// The server refuses a whole batch (400 bad_health) when this object is wrong, and the firmware drops a refused batch,
// so nothing the server would refuse is ever built: healthJson() returns false and writes nothing instead.
#pragma once
#include <cstddef>
#include <cstdio>
#include <cstring>

constexpr size_t HEALTH_JSON_MAX = 128;  // {"rssi_dbm":-120,"reset_reason":"DEEPSLEEP","fw_version":<20 chars>} is under 100

// esp_reset_reason_t (0..10) in the words the server accepts (the list in supabase/migrations/20261106120000_device_health.sql).
// Anything else, such as a value from a newer chip, is UNKNOWN.
inline const char* resetReasonName(int reason) {
  switch (reason) {
    case 1: return "POWERON";
    case 2: return "EXT";
    case 3: return "SW";
    case 4: return "PANIC";
    case 5: return "INT_WDT";
    case 6: return "TASK_WDT";
    case 7: return "WDT";
    case 8: return "DEEPSLEEP";
    case 9: return "BROWNOUT";
    case 10: return "SDIO";
    default: return "UNKNOWN";
  }
}

// The server accepts 1 to 20 characters of 0-9 A-Z a-z . _ + -
inline bool healthVersionOk(const char* v) {
  if (!v) return false;
  const size_t n = std::strlen(v);
  if (n < 1 || n > 20) return false;
  for (size_t i = 0; i < n; i++) {
    const char c = v[i];
    const bool ok = (c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
                    c == '.' || c == '_' || c == '+' || c == '-';
    if (!ok) return false;
  }
  return true;
}

// {"rssi_dbm":-67,"reset_reason":"POWERON","fw_version":"0.5.0"}
// rssi is kept inside the server's -120..0 (WiFi.RSSI() can be 0 with no link). Returns false, and leaves `out`
// an empty string, when the version is not acceptable or the buffer is too small.
inline bool healthJson(char* out, size_t outSize, int rssiDbm, int resetReason, const char* fwVersion) {
  if (!out || outSize == 0) return false;
  out[0] = '\0';
  if (!healthVersionOk(fwVersion)) return false;
  if (rssiDbm > 0) rssiDbm = 0;
  if (rssiDbm < -120) rssiDbm = -120;
  const int w = std::snprintf(out, outSize, "{\"rssi_dbm\":%d,\"reset_reason\":\"%s\",\"fw_version\":\"%s\"}",
                              rssiDbm, resetReasonName(resetReason), fwVersion);
  if (w < 0 || (size_t)w >= outSize) {
    out[0] = '\0';
    return false;
  }
  return true;
}
