// PC test for include/room.h (D-028): reading the room name for the OLED strip out of the server's reply.
#include <cstdio>
#include <cstring>
#include "../include/room.h"

static int failures = 0;
#define CHECK(cond) do { if (!(cond)) { std::printf("FAIL line %d: %s\n", __LINE__, #cond); failures++; } } while (0)

// Runs roomFromReply on a buffer that starts as "OLD" and returns the buffer.
static const char* run(const char* body, bool* changed = nullptr) {
  static char buf[ROOM_BUF];
  std::strcpy(buf, "OLD");
  bool c = roomFromReply(body, buf, sizeof buf);
  if (changed) *changed = c;
  return buf;
}

int main() {
  bool ch = false;
  // the real reply shape (jsonb puts the short key first)
  CHECK(std::strcmp(run("{\"room\": \"Room 204\", \"saved\": 1, \"duplicates\": 0, \"interval_s\": 60}", &ch), "Room 204") == 0 && ch);
  CHECK(std::strcmp(run("{\"saved\": 1, \"room\":\"Lab 2\"}"), "Lab 2") == 0);
  CHECK(std::strcmp(run("{\"room\"  :  \"Lab 2\"}"), "Lab 2") == 0);
  CHECK(std::strcmp(run("{\"room\": \"Unassigned\"}"), "Unassigned") == 0);

  // too long for the strip beside "NO WI-FI": cut to ROOM_MAX_CHARS (12), trailing space dropped
  CHECK(std::strcmp(run("{\"room\": \"Computer Laboratory\"}"), "Computer Lab") == 0);
  CHECK(std::strcmp(run("{\"room\": \"Science Lab 1234\"}"), "Science Lab") == 0);  // 12th char is a space

  // anything odd keeps the old label: missing, empty, null, not a string, escapes, non-ASCII, control characters
  CHECK(std::strcmp(run("{\"saved\": 1}", &ch), "OLD") == 0 && !ch);
  CHECK(std::strcmp(run("{\"room\": \"\"}"), "OLD") == 0);
  CHECK(std::strcmp(run("{\"room\": \"   \"}"), "OLD") == 0);
  CHECK(std::strcmp(run("{\"room\": null}"), "OLD") == 0);
  CHECK(std::strcmp(run("{\"room\": 204}"), "OLD") == 0);
  CHECK(std::strcmp(run("{\"room\": \"Room \\\"A\\\"\"}"), "OLD") == 0);   // escaped quote
  CHECK(std::strcmp(run("{\"room\": \"Sala \\u00e9\"}"), "OLD") == 0);     // \u escape
  CHECK(std::strcmp(run("{\"room\": \"Silid \xC3\xA9\"}"), "OLD") == 0);   // raw UTF-8
  CHECK(std::strcmp(run("{\"room\": \"A\tB\"}"), "OLD") == 0);
  CHECK(std::strcmp(run("{\"room\": \"never closed"), "OLD") == 0);
  CHECK(std::strcmp(run("{\"message\":\"rate_limited\"}"), "OLD") == 0);
  CHECK(std::strcmp(run(""), "OLD") == 0);
  CHECK(std::strcmp(run(nullptr), "OLD") == 0);

  // a tiny buffer is never overrun
  char small[4] = "OLD";
  CHECK(roomFromReply("{\"room\": \"Room 204\"}", small, sizeof small));
  CHECK(std::strcmp(small, "Roo") == 0);
  CHECK(!roomFromReply("{\"room\": \"Room 204\"}", small, 0));

  if (failures) { std::printf("%d failures\n", failures); return 1; }
  std::printf("all passed\n");
  return 0;
}
