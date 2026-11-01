// PC test for include/interval.h (P03-03). Build and run: see tests/README.md
#include <cstdio>
#include <cstdint>
#include "../include/interval.h"

static int failures = 0;
#define CHECK(cond) do { if (!(cond)) { std::printf("FAIL line %d: %s\n", __LINE__, #cond); failures++; } } while (0)

int main() {
  const uint32_t FB = 60;
  // the real reply shape
  CHECK(intervalFromReply("{\"saved\": 1, \"duplicates\": 0, \"interval_s\": 300}", FB) == 300);
  CHECK(intervalFromReply("{\"interval_s\":120}", FB) == 120);
  // limits are 60 to 3600 inclusive
  CHECK(intervalFromReply("{\"interval_s\": 60}", FB) == 60);
  CHECK(intervalFromReply("{\"interval_s\": 3600}", FB) == 3600);
  // outside the limits, or not a plain whole number: keep the fallback
  CHECK(intervalFromReply("{\"interval_s\": 59}", 123) == 123);
  CHECK(intervalFromReply("{\"interval_s\": 3601}", 123) == 123);
  CHECK(intervalFromReply("{\"interval_s\": 0}", 123) == 123);
  CHECK(intervalFromReply("{\"interval_s\": -300}", 123) == 123);
  CHECK(intervalFromReply("{\"interval_s\": 90.5}", 123) == 123);
  CHECK(intervalFromReply("{\"interval_s\": \"300\"}", 123) == 123);
  CHECK(intervalFromReply("{\"interval_s\": null}", 123) == 123);
  CHECK(intervalFromReply("{\"interval_s\": 99999999999999999999}", 123) == 123);
  // missing, empty, error replies, null pointer
  CHECK(intervalFromReply("{\"saved\": 1, \"duplicates\": 0}", 123) == 123);
  CHECK(intervalFromReply("", 123) == 123);
  CHECK(intervalFromReply("{\"message\":\"rate_limited\"}", 123) == 123);
  CHECK(intervalFromReply(nullptr, 123) == 123);

  // due(): wait counted with unsigned subtraction, so it still works when millis() wraps at 2^32
  CHECK(!intervalDue(1000, 1000, 60000));
  CHECK(!intervalDue(60999, 1000, 60000));
  CHECK(intervalDue(61000, 1000, 60000));
  CHECK(!intervalDue(4294967295u - 10, 4294967295u - 20, 60000));
  CHECK(!intervalDue(30000, 4294967295u - 20, 60000));   // 30 021 ms after, across the wrap
  CHECK(intervalDue(60000, 4294967295u - 20, 60000));    // 60 021 ms after
  CHECK(intervalDue(5, 0, 1) == true);

  if (failures == 0) std::printf("all passed\n");
  return failures ? 1 : 0;
}
