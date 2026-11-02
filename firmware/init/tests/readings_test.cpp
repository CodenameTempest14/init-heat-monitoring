// PC test for include/readings.h (P03-06, F-11): the offline buffer and the upload body.
#include <cstdio>
#include <cstring>
#include "../include/readings.h"

static int failures = 0;
#define CHECK(cond) do { if (!(cond)) { std::printf("FAIL line %d: %s\n", __LINE__, #cond); failures++; } } while (0)

static Reading R(uint32_t at, float t = 30.0f, float h = 60.0f) { return Reading{at, t, h}; }

int main() {
  // ── buffer ────────────────────────────────────────────────────────────────
  ReadingBuffer<4> b;
  Reading out[8];
  CHECK(b.size() == 0 && b.dropped() == 0);
  CHECK(b.peek(out, 8) == 0);
  b.pop(3);  // popping an empty buffer is harmless
  CHECK(b.size() == 0);

  b.push(R(100)); b.push(R(160)); b.push(R(220));
  CHECK(b.size() == 3);
  CHECK(b.peek(out, 2) == 2 && out[0].at == 100 && out[1].at == 160);  // oldest first, only what was asked for
  CHECK(b.peek(out, 8) == 3 && out[2].at == 220);
  CHECK(b.peek(out, 0) == 0);
  b.pop(2);
  CHECK(b.size() == 1 && b.peek(out, 8) == 1 && out[0].at == 220);

  // wrap-around and overflow: capacity 4, so pushing 6 in total keeps the newest 4 and counts 2 lost
  ReadingBuffer<4> w;
  for (uint32_t i = 1; i <= 6; i++) w.push(R(i * 60));
  CHECK(w.size() == 4 && w.dropped() == 2);
  CHECK(w.peek(out, 8) == 4 && out[0].at == 180 && out[1].at == 240 && out[2].at == 300 && out[3].at == 360);
  w.pop(1);
  w.push(R(420));  // the write position has wrapped round; order must still be oldest first
  CHECK(w.peek(out, 8) == 4 && out[0].at == 240 && out[3].at == 420);
  w.pop(99);       // more than there is: clamps to empty
  CHECK(w.size() == 0 && w.peek(out, 8) == 0);
  w.push(R(500));
  CHECK(w.size() == 1 && w.peek(out, 8) == 1 && out[0].at == 500);

  // ── upload body ───────────────────────────────────────────────────────────
  char body[UPLOAD_BODY_MAX];
  // 1700000000 = 2023-11-14T22:13:20Z
  Reading two[2] = {R(1700000000, 31.2f, 64.5f), R(1700000060, 29.0f, 70.0f)};
  CHECK(buildUploadBody(body, sizeof body, "KEY", two, 2));
  CHECK(std::strcmp(body,
    "{\"device_key\":\"KEY\",\"readings\":["
    "{\"recorded_at\":\"2023-11-14T22:13:20Z\",\"temp_c\":31.2,\"rh_pct\":64.5},"
    "{\"recorded_at\":\"2023-11-14T22:14:20Z\",\"temp_c\":29.0,\"rh_pct\":70.0}]}") == 0);

  // nothing to send is not a request
  CHECK(!buildUploadBody(body, sizeof body, "KEY", two, 0));
  CHECK(!buildUploadBody(body, sizeof body, "KEY", two, MAX_BATCH + 1));
  CHECK(!buildUploadBody(nullptr, 100, "KEY", two, 1));

  // a full batch of 50 with a realistic key fits in UPLOAD_BODY_MAX
  Reading fifty[MAX_BATCH];
  for (size_t i = 0; i < MAX_BATCH; i++) fifty[i] = R(1700000000 + (uint32_t)i * 60, 31.2f, 64.5f);
  const char* longKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  CHECK(buildUploadBody(body, sizeof body, longKey, fifty, MAX_BATCH));
  CHECK(std::strlen(body) < sizeof body);

  // too small a buffer: false, and nothing written past the end
  char small[60];
  std::memset(small, 'X', sizeof small);
  CHECK(!buildUploadBody(small, 40, "KEY", two, 2));
  CHECK(small[40] == 'X' && small[59] == 'X');
  CHECK(std::memchr(small, '\0', 40) != nullptr);  // whatever was written is still a terminated string

  if (failures) { std::printf("%d failures\n", failures); return 1; }
  std::printf("all passed\n");
  return 0;
}
