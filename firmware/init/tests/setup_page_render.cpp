// Prints the three setup page states with the made-up values of design/device-setup/, for
// tests/firmware-setup-page.test.js to compare byte for byte with the approved HTML. Argument: form | form-error | saved.
#include <cstdio>
#include <cstring>
#include "../include/wifi_setup.h"
#ifdef _WIN32
#include <fcntl.h>
#include <io.h>
#endif

int main(int argc, char** argv) {
#ifdef _WIN32
  _setmode(_fileno(stdout), _O_BINARY);  // otherwise Windows turns every \n into \r\n
#endif
  static char page[SETUP_PAGE_MAX];
  const char* nearby[] = {"Room-Hotspot", "Faculty-WiFi"};
  const char* state = argc > 1 ? argv[1] : "";
  bool ok = false;
  if (std::strcmp(state, "form") == 0)
    ok = renderSetupPage(page, sizeof page, "Room-Hotspot", nearby, 2, "Room-Hotspot", nullptr);
  else if (std::strcmp(state, "form-error") == 0)
    ok = renderSetupPage(page, sizeof page, nullptr, nearby, 2, "Faculty-WiFi", wifiCheckMessage(WifiCheck::PassBadLength));
  else if (std::strcmp(state, "saved") == 0)
    ok = renderSavedPage(page, sizeof page, "Room-Hotspot");
  if (!ok) { std::fprintf(stderr, "render failed for '%s'\n", state); return 1; }
  std::fwrite(page, 1, std::strlen(page), stdout);
  return 0;
}
