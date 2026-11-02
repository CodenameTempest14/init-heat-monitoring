// PC test for include/wifi_setup.h (P03-05, D-011): checking the Wi-Fi the setup form sends, escaping
// what goes back into the page. The pages themselves are compared with design/device-setup/ by
// tests/firmware-setup-page.test.js (setup_page_render.cpp).
#include <cstdio>
#include <cstring>
#include <initializer_list>
#include "../include/wifi_setup.h"

static int failures = 0;
#define CHECK(cond) do { if (!(cond)) { std::printf("FAIL line %d: %s\n", __LINE__, #cond); failures++; } } while (0)

int main() {
  // --- checkWifi: the rules for what may be saved
  CHECK(checkWifi("Room-Hotspot", "secret123") == WifiCheck::Ok);
  CHECK(checkWifi("Room-Hotspot", "") == WifiCheck::Ok);                   // open network
  CHECK(checkWifi("Juan\xE2\x80\x99s iPhone", "12345678") == WifiCheck::Ok);  // UTF-8 names are allowed
  CHECK(checkWifi("12345678901234567890123456789012", "12345678") == WifiCheck::Ok);   // 32 bytes
  CHECK(checkWifi("", "12345678") == WifiCheck::SsidEmpty);
  CHECK(checkWifi(nullptr, "12345678") == WifiCheck::SsidEmpty);
  CHECK(checkWifi("123456789012345678901234567890123", "12345678") == WifiCheck::SsidTooLong);  // 33 bytes
  CHECK(checkWifi("Room\tA", "12345678") == WifiCheck::SsidBadChar);
  CHECK(checkWifi("Room\x7F", "12345678") == WifiCheck::SsidBadChar);
  CHECK(checkWifi("Room", "1234567") == WifiCheck::PassBadLength);         // 7
  CHECK(checkWifi("Room", "12345678") == WifiCheck::Ok);                   // 8
  CHECK(checkWifi("Room", "123456789012345678901234567890123456789012345678901234567890123") == WifiCheck::Ok);   // 63
  CHECK(checkWifi("Room", "1234567890123456789012345678901234567890123456789012345678901234") == WifiCheck::PassBadLength);  // 64
  CHECK(checkWifi("Room", "pass word ~!") == WifiCheck::Ok);               // spaces and symbols are fine
  CHECK(checkWifi("Room", "caf\xC3\xA9" "1234") == WifiCheck::PassBadChar);  // WPA2: printable ASCII only
  CHECK(checkWifi("Room", "line\nbreak") == WifiCheck::PassBadChar);
  CHECK(checkWifi("Room", nullptr) == WifiCheck::Ok);                      // no password field: open network
  for (WifiCheck c : {WifiCheck::SsidEmpty, WifiCheck::SsidTooLong, WifiCheck::SsidBadChar, WifiCheck::PassBadLength,
                      WifiCheck::PassBadChar, WifiCheck::FormUnreadable})
    CHECK(std::strncmp(wifiCheckMessage(c), "Not saved: ", 11) == 0);

  // --- htmlEscape: whatever the phone sent or a nearby network is called, it stays text in the page
  char out[64];
  CHECK(htmlEscape("<script>&\"'", out, sizeof out));
  CHECK(std::strcmp(out, "&lt;script&gt;&amp;&quot;&#39;") == 0);
  CHECK(htmlEscape("Room-Hotspot", out, sizeof out) && std::strcmp(out, "Room-Hotspot") == 0);
  CHECK(!htmlEscape("<<<<<<", out, 10));                                   // does not fit: false, empty, never overrun
  CHECK(out[0] == '\0');

  // --- the pages never contain a password and always escape names
  static char page[SETUP_PAGE_MAX];
  const char* nearby[] = {"<b>evil</b>", "Faculty-WiFi"};
  CHECK(renderSetupPage(page, sizeof page, "x\"onmouseover=\"y", nearby, 2, "\"><script>", nullptr));
  CHECK(std::strstr(page, "<script>") == nullptr);
  CHECK(std::strstr(page, "<b>evil") == nullptr);
  CHECK(std::strstr(page, "\"onmouseover") == nullptr);
  CHECK(std::strstr(page, "&lt;b&gt;evil&lt;/b&gt;") != nullptr);
  CHECK(renderSetupPage(page, sizeof page, nullptr, nullptr, 0, "", nullptr));
  CHECK(std::strstr(page, "Saved network: <b>none</b>") != nullptr);
  CHECK(!renderSetupPage(page, 100, "Room", nullptr, 0, "Room", nullptr));  // too small: false
  CHECK(renderSavedPage(page, sizeof page, "<i>"));
  CHECK(std::strstr(page, "joins <b>&lt;i&gt;</b>") != nullptr);

  if (failures) { std::printf("%d failures\n", failures); return 1; }
  std::printf("all passed\n");
  return 0;
}
