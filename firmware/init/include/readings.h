// Offline buffer and upload body (P03-06, F-11). No Arduino code in here, so the PC test in tests/ can run it.
#pragma once
#include <cstddef>
#include <cstdint>
#include <cstdio>
#include <ctime>

constexpr size_t MAX_BATCH = 50;          // the server refuses more than 50 readings per call
constexpr size_t BUFFER_CAPACITY = 300;   // 5 hours at 60 s; 12 bytes each, about 3.6 KB of RAM
constexpr size_t UPLOAD_BODY_MAX = 4096;  // 50 readings are about 3.4 KB with a 64-character key

struct Reading {
  uint32_t at;   // seconds since 1970 (UTC), taken when the sensor was read
  float tempC;
  float rh;
};

// The oldest readings come out first. When it is full, a new reading pushes the oldest one out and
// dropped() counts it: losing the oldest keeps the most recent picture of the room.
template <size_t CAP>
class ReadingBuffer {
 public:
  size_t size() const { return count_; }
  size_t dropped() const { return dropped_; }

  void push(const Reading& r) {
    if (count_ == CAP) {
      head_ = (head_ + 1) % CAP;
      count_--;
      dropped_++;
    }
    items_[(head_ + count_) % CAP] = r;
    count_++;
  }

  // Copies up to `max` of the oldest readings into out, without removing them. Returns how many.
  size_t peek(Reading* out, size_t max) const {
    const size_t n = count_ < max ? count_ : max;
    for (size_t i = 0; i < n; i++) out[i] = items_[(head_ + i) % CAP];
    return n;
  }

  // Removes up to n of the oldest readings (after the server has accepted them).
  void pop(size_t n) {
    if (n > count_) n = count_;
    head_ = (head_ + n) % CAP;
    count_ -= n;
  }

 private:
  Reading items_[CAP];
  size_t head_ = 0, count_ = 0, dropped_ = 0;
};

// {"device_key":"...","readings":[{"recorded_at":"2026-11-02T05:09:38Z","temp_c":31.1,"rh_pct":60.1},...]}
// With a health fragment from health.h the body ends ...],"health":{...}} (P05-04); null or "" leaves it out.
// Returns false (and leaves a terminated string) when n is 0 or more than MAX_BATCH, or it does not fit.
inline bool buildUploadBody(char* out, size_t outSize, const char* deviceKey, const Reading* r, size_t n,
                            const char* healthJson = nullptr) {
  if (!out || outSize == 0) return false;
  out[0] = '\0';
  if (!deviceKey || !r || n == 0 || n > MAX_BATCH) return false;

  size_t pos = 0;
  int w = std::snprintf(out, outSize, "{\"device_key\":\"%s\",\"readings\":[", deviceKey);
  if (w < 0 || (size_t)w >= outSize) return false;
  pos = (size_t)w;

  for (size_t i = 0; i < n; i++) {
    char when[25];
    const time_t t = (time_t)r[i].at;
    std::strftime(when, sizeof when, "%Y-%m-%dT%H:%M:%SZ", std::gmtime(&t));
    w = std::snprintf(out + pos, outSize - pos, "%s{\"recorded_at\":\"%s\",\"temp_c\":%.1f,\"rh_pct\":%.1f}",
                      i ? "," : "", when, (double)r[i].tempC, (double)r[i].rh);
    if (w < 0 || (size_t)w >= outSize - pos) return false;
    pos += (size_t)w;
  }
  const bool withHealth = healthJson && healthJson[0];
  w = std::snprintf(out + pos, outSize - pos, withHealth ? "],\"health\":%s}" : "]}", healthJson);
  return w >= 0 && (size_t)w < outSize - pos;
}
