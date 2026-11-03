// PC test for include/health.h (P05-04, F-17) and the optional health part of the upload body in include/readings.h.
// The server refuses a whole batch with 400 bad_health when the health object is wrong, and the firmware drops a refused
// batch (see sendPending), so a wrong health object would lose readings: these checks pin what the device may send.
// Build and run: see tests/README.md. With the argument "names" it prints the reset names, one per line (used by
// tests/firmware-health.test.js to compare them with the server's allowed list).
#include <cstdio>
#include <cstring>
#include <string>
#include "../include/health.h"
#include "../include/readings.h"

static int failures = 0;
#define CHECK(cond) do { if (!(cond)) { std::printf("FAIL line %d: %s\n", __LINE__, #cond); failures++; } } while (0)

int main(int argc, char** argv) {
  if (argc > 1 && std::strcmp(argv[1], "names") == 0) {
    for (int i = 0; i <= 10; i++) std::printf("%s\n", resetReasonName(i));
    return 0;
  }

  // the ESP32 reset reasons (esp_reset_reason_t 0..10) in the server's words
  CHECK(std::strcmp(resetReasonName(0), "UNKNOWN") == 0);
  CHECK(std::strcmp(resetReasonName(1), "POWERON") == 0);
  CHECK(std::strcmp(resetReasonName(2), "EXT") == 0);
  CHECK(std::strcmp(resetReasonName(3), "SW") == 0);
  CHECK(std::strcmp(resetReasonName(4), "PANIC") == 0);
  CHECK(std::strcmp(resetReasonName(5), "INT_WDT") == 0);
  CHECK(std::strcmp(resetReasonName(6), "TASK_WDT") == 0);
  CHECK(std::strcmp(resetReasonName(7), "WDT") == 0);
  CHECK(std::strcmp(resetReasonName(8), "DEEPSLEEP") == 0);
  CHECK(std::strcmp(resetReasonName(9), "BROWNOUT") == 0);
  CHECK(std::strcmp(resetReasonName(10), "SDIO") == 0);
  // anything else (a newer chip, a bad value) is UNKNOWN, never a made-up name
  CHECK(std::strcmp(resetReasonName(11), "UNKNOWN") == 0);
  CHECK(std::strcmp(resetReasonName(-1), "UNKNOWN") == 0);
  CHECK(std::strcmp(resetReasonName(1000000), "UNKNOWN") == 0);

  // the health object, exactly the three keys the server wants
  char h[HEALTH_JSON_MAX];
  CHECK(healthJson(h, sizeof h, -67, 1, "0.5.0"));
  CHECK(std::strcmp(h, "{\"rssi_dbm\":-67,\"reset_reason\":\"POWERON\",\"fw_version\":\"0.5.0\"}") == 0);
  CHECK(healthJson(h, sizeof h, -120, 6, "1.2.3-rc.1+b5"));
  CHECK(std::strcmp(h, "{\"rssi_dbm\":-120,\"reset_reason\":\"TASK_WDT\",\"fw_version\":\"1.2.3-rc.1+b5\"}") == 0);

  // WiFi.RSSI() can be 0 with no link, or odd: kept inside the server's -120..0
  CHECK(healthJson(h, sizeof h, 0, 1, "0.5.0") && std::strstr(h, "\"rssi_dbm\":0,"));
  CHECK(healthJson(h, sizeof h, 7, 1, "0.5.0") && std::strstr(h, "\"rssi_dbm\":0,"));
  CHECK(healthJson(h, sizeof h, -121, 1, "0.5.0") && std::strstr(h, "\"rssi_dbm\":-120,"));
  CHECK(healthJson(h, sizeof h, -32768, 1, "0.5.0") && std::strstr(h, "\"rssi_dbm\":-120,"));

  // a version the server would refuse is never sent: no health at all, and `out` is left empty
  const char* badVersions[] = {"", "0.5.0 beta", "<b>", "a\"b", "a\\b", "ü", "1234567890123456789012", nullptr};
  for (const char* v : badVersions) {
    std::strcpy(h, "x");
    CHECK(!healthJson(h, sizeof h, -60, 1, v));
    CHECK(h[0] == '\0');
  }
  CHECK(healthJson(h, sizeof h, -60, 1, "12345678901234567890"));   // 20 characters is the limit
  CHECK(!healthJson(h, sizeof h, -60, 1, "123456789012345678901")); // 21 is too long
  // a buffer that is too small is a failure, not a cut string
  char tiny[20];
  CHECK(!healthJson(tiny, sizeof tiny, -60, 1, "0.5.0"));
  CHECK(tiny[0] == '\0');
  CHECK(!healthJson(nullptr, 10, -60, 1, "0.5.0"));
  CHECK(!healthJson(h, 0, -60, 1, "0.5.0"));

  // the upload body: health goes after the readings, nothing else moves
  const Reading one[] = {{1793596178u, 31.1f, 60.1f}};
  char body[UPLOAD_BODY_MAX];
  CHECK(healthJson(h, sizeof h, -67, 1, "0.5.0"));
  CHECK(buildUploadBody(body, sizeof body, "KEY", one, 1, h));
  CHECK(std::string(body) ==
        "{\"device_key\":\"KEY\",\"readings\":[{\"recorded_at\":\"2026-11-02T05:09:38Z\",\"temp_c\":31.1,\"rh_pct\":60.1}],"
        "\"health\":{\"rssi_dbm\":-67,\"reset_reason\":\"POWERON\",\"fw_version\":\"0.5.0\"}}");
  // without health the body is the one the firmware sends today
  CHECK(buildUploadBody(body, sizeof body, "KEY", one, 1));
  CHECK(std::string(body) ==
        "{\"device_key\":\"KEY\",\"readings\":[{\"recorded_at\":\"2026-11-02T05:09:38Z\",\"temp_c\":31.1,\"rh_pct\":60.1}]}");
  CHECK(buildUploadBody(body, sizeof body, "KEY", one, 1, nullptr));
  CHECK(buildUploadBody(body, sizeof body, "KEY", one, 1, ""));  // an empty fragment means "no health"
  CHECK(std::string(body).find("health") == std::string::npos);

  // the biggest body: 50 readings, a 64-character key and health still fit
  char key[65];
  std::memset(key, 'k', 64);
  key[64] = '\0';
  Reading fifty[MAX_BATCH];
  for (size_t i = 0; i < MAX_BATCH; i++) fifty[i] = {1793596178u + (uint32_t)i * 60, 31.1f, 60.1f};
  CHECK(buildUploadBody(body, sizeof body, key, fifty, MAX_BATCH, h));
  CHECK(std::strlen(body) < UPLOAD_BODY_MAX);
  CHECK(std::strstr(body, "\"health\":{") != nullptr);

  // a body that does not fit still fails and leaves a terminated string
  char small[200];
  CHECK(!buildUploadBody(small, sizeof small, "KEY", fifty, MAX_BATCH, h));

  if (failures == 0) std::printf("all passed\n");
  return failures ? 1 : 0;
}
