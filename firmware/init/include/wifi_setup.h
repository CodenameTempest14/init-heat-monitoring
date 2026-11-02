// Wi-Fi setup page (P03-05, D-011): checks the network name and password a phone sends to 192.168.4.1 (the ESP32
// WebServer library has already decoded the form) and builds the pages the owner approved in design/device-setup/. No Arduino code in here, so the PC tests in tests/
// can run it: firmware/init/tests/wifi_setup_test.cpp, and tests/firmware-setup-page.test.js for the exact pages.
#pragma once
#include <cstddef>
#include <cstring>

constexpr size_t SSID_MAX = 32;         // bytes, 802.11 limit
constexpr size_t PASS_MIN = 8, PASS_MAX = 63;  // WPA2 passphrase
constexpr size_t SETUP_PAGE_MAX = 6144;  // the form is about 2 KB; room for 12 escaped nearby names
constexpr size_t NEARBY_MAX = 12;

enum class WifiCheck { Ok, SsidEmpty, SsidTooLong, SsidBadChar, PassBadLength, PassBadChar, FormUnreadable };

// Network name: 1 to 32 bytes, no control characters (UTF-8 is fine: phone hotspots are often "Juan’s iPhone").
// Password: empty (open network) or 8 to 63 printable ASCII characters, as WPA2 requires.
inline WifiCheck checkWifi(const char* ssid, const char* pass) {
  if (!ssid || !*ssid) return WifiCheck::SsidEmpty;
  if (std::strlen(ssid) > SSID_MAX) return WifiCheck::SsidTooLong;
  for (const unsigned char* p = (const unsigned char*)ssid; *p; p++)
    if (*p < 0x20 || *p == 0x7F) return WifiCheck::SsidBadChar;
  if (!pass) pass = "";
  const size_t n = std::strlen(pass);
  if (n != 0 && (n < PASS_MIN || n > PASS_MAX)) return WifiCheck::PassBadLength;
  for (const unsigned char* p = (const unsigned char*)pass; *p; p++)
    if (*p < 0x20 || *p > 0x7E) return WifiCheck::PassBadChar;
  return WifiCheck::Ok;
}

inline const char* wifiCheckMessage(WifiCheck c) {
  switch (c) {
    case WifiCheck::Ok: return "";
    case WifiCheck::SsidEmpty: return "Not saved: the network name is empty.";
    case WifiCheck::SsidTooLong: return "Not saved: the network name is longer than 32 bytes.";
    case WifiCheck::SsidBadChar: return "Not saved: the network name contains a control character.";
    case WifiCheck::PassBadLength: return "Not saved: the password must be 8 to 63 characters, or empty for an open network.";
    case WifiCheck::PassBadChar: return "Not saved: the password may only use the letters, digits, spaces and symbols of a keyboard (no accents or emoji).";
    case WifiCheck::FormUnreadable: return "Not saved: the form could not be read. Please try again.";
  }
  return "Not saved.";
}

// Copies `in` into `out` with & < > " ' replaced, so a name always stays text in the page. If it does not fit,
// returns false and leaves `out` empty (never half a name).
inline bool htmlEscape(const char* in, char* out, size_t outSize) {
  if (!out || outSize == 0) return false;
  size_t n = 0;
  for (const char* p = in ? in : ""; *p; p++) {
    const char* rep = nullptr;
    switch (*p) {
      case '&': rep = "&amp;"; break;
      case '<': rep = "&lt;"; break;
      case '>': rep = "&gt;"; break;
      case '"': rep = "&quot;"; break;
      case '\'': rep = "&#39;"; break;
    }
    const size_t len = rep ? std::strlen(rep) : 1;
    if (n + len + 1 > outSize) { out[0] = '\0'; return false; }
    if (rep) std::memcpy(out + n, rep, len); else out[n] = *p;
    n += len;
  }
  out[n] = '\0';
  return true;
}

namespace setup_page_detail {
// Appends to a fixed buffer; after the first thing that does not fit, ok stays false.
struct Page {
  char* buf; size_t size; size_t len = 0; bool ok = true;
  Page(char* b, size_t s) : buf(b), size(s) { if (size) buf[0] = '\0'; else ok = false; }
  void add(const char* s) {
    const size_t n = std::strlen(s);
    if (!ok || len + n + 1 > size) { ok = false; return; }
    std::memcpy(buf + len, s, n + 1);
    len += n;
  }
  void addEscaped(const char* s) {
    char tmp[SSID_MAX * 6 + 1];  // worst case: every byte becomes &quot; (6)
    char longTmp[512];           // the error messages
    const bool small = std::strlen(s ? s : "") <= SSID_MAX;
    char* t = small ? tmp : longTmp;
    if (!htmlEscape(s, t, small ? sizeof tmp : sizeof longTmp)) { ok = false; return; }
    add(t);
  }
};

// Shared head of every page. Must stay byte for byte the same as design/device-setup/*.html. Plain "\n" strings,
// not a raw string: a raw string would copy the line ends of this file, and git may check it out with CRLF.
constexpr const char* HEAD =
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Init setup</title><style>\n"
    ":root{--bg:#f6f7f9;--text:#1b2430;--muted:#4a5562;--line:#6b7480;--field:#fff;--err:#b34100}\n"
    "@media (prefers-color-scheme:dark){:root{--bg:#10161d;--text:#e8edf3;--muted:#aab4bf;--line:#8b95a1;--field:#1a222b;--err:#ff8a4c}.logo .bg{stroke:var(--line);stroke-width:4}}\n"
    "*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 system-ui,sans-serif}\n"
    "main{max-width:420px;margin:0 auto;padding:24px 16px}header{text-align:center;margin-bottom:24px}header p{margin:0}.logo{display:block;width:56px;height:56px;margin:0 auto 12px}h1{font-size:28px;margin:0 0 4px}p{margin:0 0 16px}\n"
    ".muted{color:var(--muted)}.err{color:var(--err);border-left:4px solid var(--err);padding-left:12px;font-weight:600}\n"
    "label{display:block;font-weight:600;margin:16px 0 4px}input[type=text],input[type=password]{width:100%;font:inherit;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--field);color:var(--text)}\n"
    ".show{display:flex;gap:8px;align-items:center;font-weight:400;margin-top:8px}button{width:100%;margin-top:24px;padding:12px;font:inherit;font-weight:600;border:0;border-radius:8px;background:var(--text);color:var(--bg)}\n"
    "</style></head><body><main>\n";
}  // namespace setup_page_detail

// The form. `saved` is the network in flash (nullptr: "none"); its password is never passed in, so it can never
// be shown. `nearby` are names from a scan (at most NEARBY_MAX used), `prefill` goes into the name field, `error`
// (nullptr: none) is a wifiCheckMessage. Returns false if the page does not fit in `out`.
inline bool renderSetupPage(char* out, size_t outSize, const char* saved, const char* const* nearby, size_t nNearby,
                            const char* prefill, const char* error) {
  setup_page_detail::Page pg(out, outSize);
  pg.add(setup_page_detail::HEAD);
  pg.add("<header><svg class=\"logo\" viewBox=\"0 0 96 96\" aria-hidden=\"true\"><rect class=\"bg\" width=\"96\" height=\"96\" rx=\"22\" fill=\"#1b2430\"/><circle cx=\"48\" cy=\"20\" r=\"8\" fill=\"#ffc53d\"/><rect x=\"39\" y=\"34\" width=\"18\" height=\"40\" rx=\"9\" fill=\"none\" stroke=\"#fff\" stroke-width=\"5\"/><rect x=\"45\" y=\"48\" width=\"6\" height=\"22\" rx=\"3\" fill=\"#c2410c\"/><circle cx=\"48\" cy=\"72\" r=\"12\" fill=\"#c2410c\" stroke=\"#fff\" stroke-width=\"5\"/></svg><h1>Init setup</h1><p class=\"muted\">Room monitor Wi-Fi</p></header>\n<p>Saved network: <b>");
  if (saved && *saved) pg.addEscaped(saved); else pg.add("none");
  pg.add("</b></p>\n");
  if (error && *error) { pg.add("<p class=\"err\">"); pg.addEscaped(error); pg.add("</p>\n"); }
  pg.add("<form method=\"post\" action=\"/save\">\n<label for=\"s\">Network name</label>\n"
         "<input type=\"text\" id=\"s\" name=\"s\" maxlength=\"32\" required autocomplete=\"off\" autocapitalize=\"none\" list=\"n\" value=\"");
  pg.addEscaped(prefill);
  pg.add("\">\n<datalist id=\"n\">");
  for (size_t i = 0; nearby && i < nNearby && i < NEARBY_MAX; i++) {
    pg.add("<option value=\"");
    pg.addEscaped(nearby[i]);
    pg.add("\">");
  }
  pg.add("</datalist>\n<label for=\"p\">Password</label>\n"
         "<input type=\"password\" id=\"p\" name=\"p\" maxlength=\"63\" autocomplete=\"off\">\n"
         "<label class=\"show\"><input type=\"checkbox\" onchange=\"p.type=this.checked?'text':'password'\"> Show password</label>\n"
         "<button type=\"submit\">Save and restart</button>\n</form>\n"
         "<p class=\"muted\" style=\"margin-top:16px\">Leave the password empty only for an open network. The saved password is never shown here.</p>\n"
         "</main></body></html>\n");
  return pg.ok;
}

// The page after a good save, just before the restart.
inline bool renderSavedPage(char* out, size_t outSize, const char* ssid) {
  setup_page_detail::Page pg(out, outSize);
  pg.add(setup_page_detail::HEAD);
  pg.add("<header><svg class=\"logo\" viewBox=\"0 0 96 96\" aria-hidden=\"true\"><rect class=\"bg\" width=\"96\" height=\"96\" rx=\"22\" fill=\"#1b2430\"/><circle cx=\"48\" cy=\"20\" r=\"8\" fill=\"#ffc53d\"/><rect x=\"39\" y=\"34\" width=\"18\" height=\"40\" rx=\"9\" fill=\"none\" stroke=\"#fff\" stroke-width=\"5\"/><rect x=\"45\" y=\"48\" width=\"6\" height=\"22\" rx=\"3\" fill=\"#c2410c\"/><circle cx=\"48\" cy=\"72\" r=\"12\" fill=\"#c2410c\" stroke=\"#fff\" stroke-width=\"5\"/></svg><h1>Saved</h1></header>\n<p>Init restarts now and joins <b>");
  pg.addEscaped(ssid);
  pg.add("</b>.</p>\n<p class=\"muted\">You can close this page and leave the Init-Setup network. "
         "If Init cannot join, the setup network comes back after about 20 seconds.</p>\n</main></body></html>\n");
  return pg.ok;
}
