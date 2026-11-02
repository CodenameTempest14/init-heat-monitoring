// Room name from the server's upload reply (D-028). No Arduino code in here, so the PC test in tests/ can run it.
#pragma once
#include <cstddef>
#include <cstring>

// The status strip is 21 characters wide. The right side can hold "NO WI-FI" (8), so the room gets 12.
constexpr size_t ROOM_MAX_CHARS = 12;
constexpr size_t ROOM_BUF = ROOM_MAX_CHARS + 1;

// Reads "room" from the reply, e.g. {"room": "Room 204", "saved": 1, ...}, into out.
// The name is shown on the OLED, whose font has only printable ASCII, and it came over the network, so it is
// accepted only as a plain string of characters 0x20 to 0x7E: an escape (\), a control character, non-ASCII,
// null, a number, a missing or empty name all return false and leave `out` untouched (the caller keeps its label).
// A name longer than ROOM_MAX_CHARS is cut, and trailing spaces left by the cut are dropped.
inline bool roomFromReply(const char* body, char* out, size_t outSize) {
  if (!body || !out || outSize == 0) return false;
  const char* p = std::strstr(body, "\"room\"");
  if (!p) return false;
  p += std::strlen("\"room\"");
  while (*p == ' ') p++;
  if (*p != ':') return false;
  p++;
  while (*p == ' ') p++;
  if (*p != '"') return false;                         // rejects null and numbers
  p++;

  char name[ROOM_BUF];
  size_t n = 0;
  while (*p != '"') {
    const unsigned char c = (unsigned char)*p;
    if (c < 0x20 || c > 0x7E || c == '\\') return false;  // also ends the loop on '\0' (string never closed)
    if (n < ROOM_MAX_CHARS) name[n++] = (char)c;
    p++;
  }
  while (n > 0 && name[n - 1] == ' ') n--;
  if (n == 0) return false;

  const size_t keep = n < outSize - 1 ? n : outSize - 1;
  std::memcpy(out, name, keep);
  out[keep] = '\0';
  return true;
}
