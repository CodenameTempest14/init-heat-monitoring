// Init room monitor. P03-06: join the hotspot, get the time, read the sensor every interval_s seconds (the server
// tells us in its reply; 60 s until the first reply), queue each reading and send the queue over HTTPS.
// While the hotspot or the server is down the readings stay in the queue (F-11) and go out in batches later.
// The OLED shows the latest reading all the time. The server certificate is checked against root_ca.h (S-11):
// no setInsecure(). P03-05: the hotspot name and password live in flash; with none saved, or when the saved network
// cannot be joined at start-up, the device opens its own network Init-Setup with a setup page (D-011).
// Build `esp32dev_screens` instead draws the 9 approved screens and dumps them over serial (screen_test.h).
#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <Preferences.h>
#include <time.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include "config.h"
#include "secrets.h"
#include "root_ca.h"
#include "interval.h"
#include "room.h"
#include "readings.h"
#include "screens.h"
#include "wifi_setup.h"
#ifdef SCREEN_TEST
#include "screen_test.h"
#endif

DHT dht(PIN_DHT, DHT22);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

uint32_t intervalS = INTERVAL_MIN_S;  // until the server says otherwise; it refuses more than one call per 30 s

// Latest sensor reading, refreshed every DISPLAY_REFRESH_MS and again at every sampling tick.
float lastT = NAN, lastH = NAN;
bool sensorOk = false;

// Readings waiting for the server (F-11). RAM only: a restart loses them.
ReadingBuffer<BUFFER_CAPACITY> pending;
char body[UPLOAD_BODY_MAX];

// Name in the status strip. Starts as the label in config.h; the server's reply replaces it (D-028).
char roomLabel[ROOM_BUF] = OLED_ROOM_LABEL;

void showReading() {
  const char* link = WiFi.status() == WL_CONNECTED ? "Wi-Fi OK" : "NO WI-FI";
  if (sensorOk) screens::reading(oled, roomLabel, link, lastT, lastH, pending.size() ? (int)pending.size() : -1);
  else screens::sensorError(oled, roomLabel, link);
}

void readSensor() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  sensorOk = !isnan(t) && !isnan(h);
  if (sensorOk) { lastT = t; lastH = h; }
  else Serial.println("sensor read failed");
}

static_assert(sizeof(SECRET_SETUP_PASS) - 1 >= PASS_MIN && sizeof(SECRET_SETUP_PASS) - 1 <= PASS_MAX,
              "SECRET_SETUP_PASS in secrets.h must be 8 to 63 characters (WPA2)");

// The hotspot, saved in flash by the setup page (Preferences namespace "wifi"). Empty name: nothing saved yet.
char wifiSsid[SSID_MAX + 1] = "";
char wifiPass[PASS_MAX + 1] = "";

bool loadWifi() {
  Preferences prefs;
  if (!prefs.begin("wifi", true)) return false;  // the namespace does not exist until the first save
  prefs.getString("ssid", wifiSsid, sizeof wifiSsid);
  prefs.getString("pass", wifiPass, sizeof wifiPass);
  prefs.end();
  return checkWifi(wifiSsid, wifiPass) == WifiCheck::Ok;
}

// Blocks up to WIFI_JOIN_MS. Only used once at start-up, while the "Connecting Wi-Fi..." screen is up.
bool joinWifi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiSsid, wifiPass);
  for (uint32_t t = millis(); millis() - t < WIFI_JOIN_MS && WiFi.status() != WL_CONNECTED; ) delay(500);
  return WiFi.status() == WL_CONNECTED;
}

// --- Setup mode (P03-05, D-011) -----------------------------------------------------------------------------------
// The device becomes its own network Init-Setup (WPA2, SECRET_SETUP_PASS) and serves the approved page at
// 192.168.4.1. A DNS server answers every name with that address, so most phones open the page by themselves.
// Never returns: a good save restarts into the new network, and after SETUP_TIMEOUT_MS it restarts to try again.
WebServer web(80);
DNSServer dns;
char page[SETUP_PAGE_MAX];
char nearbyNames[NEARBY_MAX][SSID_MAX + 1];
const char* nearby[NEARBY_MAX];
size_t nNearby = 0;

// Names of the networks around, for the suggestions under the name field. Done before the access point starts.
void scanNearby() {
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  const int n = WiFi.scanNetworks();
  for (int i = 0; i < n && nNearby < NEARBY_MAX; i++) {
    const String s = WiFi.SSID(i);
    if (s.isEmpty() || s.length() > SSID_MAX) continue;
    bool seen = false;
    for (size_t j = 0; j < nNearby; j++) seen = seen || strcmp(nearbyNames[j], s.c_str()) == 0;
    if (seen) continue;
    strcpy(nearbyNames[nNearby], s.c_str());
    nearby[nNearby] = nearbyNames[nNearby];
    nNearby++;
  }
  WiFi.scanDelete();
}

void sendPage(bool rendered) {
  if (!rendered) { web.send(500, "text/plain", "page too large"); return; }
  web.sendHeader("Cache-Control", "no-store");
  web.send(200, "text/html; charset=utf-8", page);
}

void handleSetupForm() {
  sendPage(renderSetupPage(page, sizeof page, wifiSsid, nearby, nNearby, wifiSsid, nullptr));
}

// WebServer has already decoded the form. A value with a NUL inside (%00) would be cut short by every C function
// after this, so it counts as unreadable. The password is never printed or sent back.
void handleSetupSave() {
  const String s = web.arg("s"), p = web.arg("p");
  WifiCheck c = WifiCheck::FormUnreadable;
  if (web.hasArg("s") && s.length() == strlen(s.c_str()) && p.length() == strlen(p.c_str()))
    c = checkWifi(s.c_str(), p.c_str());
  if (c != WifiCheck::Ok) {
    Serial.printf("setup: refused (%s)\n", wifiCheckMessage(c));
    sendPage(renderSetupPage(page, sizeof page, wifiSsid, nearby, nNearby, s.length() <= SSID_MAX ? s.c_str() : "",
                             wifiCheckMessage(c)));
    return;
  }
  Preferences prefs;
  const bool stored = prefs.begin("wifi", false) && prefs.putString("ssid", s) == s.length() &&
                      prefs.putString("pass", p) == p.length();
  prefs.end();
  if (!stored) { web.send(500, "text/plain", "could not store the network, please try again"); return; }
  Serial.printf("setup: saved network \"%s\", restarting\n", s.c_str());
  sendPage(renderSavedPage(page, sizeof page, s.c_str()));
  delay(2000);  // let the phone receive the page
  ESP.restart();
}

void runSetupMode() {
  Serial.println("setup mode");
  screens::setupMode(oled);
  scanNearby();
  WiFi.mode(WIFI_AP);
  if (!WiFi.softAP(SETUP_AP_NAME, SECRET_SETUP_PASS)) Serial.println("setup: access point failed");
  dns.start(53, "*", WiFi.softAPIP());
  web.on("/", HTTP_GET, handleSetupForm);
  web.on("/save", HTTP_POST, handleSetupSave);
  web.onNotFound([] {  // phones probe addresses like /generate_204: send them to the page
    web.sendHeader("Location", "http://192.168.4.1/");
    web.send(302, "text/plain", "");
  });
  web.begin();
  for (const uint32_t start = millis(); millis() - start < SETUP_TIMEOUT_MS; ) {
    dns.processNextRequest();
    web.handleClient();
    delay(2);
  }
  Serial.println("setup: nothing saved in time, restarting");
  ESP.restart();
}

// The loop must keep reading and drawing while the hotspot is away, so this never waits: if the link is down
// it starts a new connection attempt every WIFI_RETRY_MS and the loop just looks again next time round.
uint32_t lastWifiTry = 0;
bool wifiUp() {
  if (WiFi.status() == WL_CONNECTED) return true;
  if (intervalDue(millis(), lastWifiTry, WIFI_RETRY_MS)) {
    lastWifiTry = millis();
    WiFi.disconnect();
    WiFi.begin(wifiSsid, wifiPass);
  }
  return false;
}

// The certificate check needs the real date (certificates have a valid-from and valid-to),
// and every reading carries its time, so nothing is read into the queue before the clock is set.
bool clockSet() {
  return time(nullptr) > 1700000000;  // later than Nov 2023: NTP has answered
}

// Sends up to MAX_BATCH of the oldest queued readings. Returns the HTTP status, or a negative HTTPClient
// error (-1 = connection or TLS handshake failed).
//   200  the readings are saved (or were already): remove them from the queue, take interval_s and room from the reply
//   400  the server refused the whole batch for a rule it will never accept: drop it, or it would block the queue
//   else keep them for the next try (429 rate limit, 403, 5xx, no connection)
int sendPending() {
  Reading batch[MAX_BATCH];
  const size_t n = pending.peek(batch, MAX_BATCH);
  if (!buildUploadBody(body, sizeof body, SECRET_DEVICE_KEY, batch, n)) {
    Serial.println("upload body did not fit: dropping the batch");
    pending.pop(n);
    return -2;
  }

  WiFiClientSecure tls;
  tls.setCACert(ROOT_CA);
  HTTPClient http;
  http.begin(tls, SECRET_INGEST_URL);
  http.addHeader("apikey", SECRET_ANON_KEY);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);

  // Print the newest reading and the server's answer, never the key.
  const Reading& newest = batch[n - 1];
  char when[25];
  const time_t t = (time_t)newest.at;
  strftime(when, sizeof when, "%Y-%m-%dT%H:%M:%SZ", gmtime(&t));
  String reply = code > 0 ? http.getString() : http.errorToString(code);
  Serial.printf("upload %s T=%.1f H=%.1f n=%u -> %d %s\n", when, newest.tempC, newest.rh, (unsigned)n, code, reply.c_str());

  if (code == 200) {
    pending.pop(n);
    uint32_t next = intervalFromReply(reply.c_str(), intervalS);  // a bad or missing value keeps the old one
    if (next != intervalS) Serial.printf("  interval %lu s -> %lu s\n", (unsigned long)intervalS, (unsigned long)next);
    intervalS = next;

    char before[ROOM_BUF];
    strcpy(before, roomLabel);
    if (roomFromReply(reply.c_str(), roomLabel, sizeof roomLabel) && strcmp(before, roomLabel) != 0)
      Serial.printf("  room \"%s\" -> \"%s\"\n", before, roomLabel);
  } else if (code == 400) {
    Serial.printf("  server refused the batch: dropping %u readings\n", (unsigned)n);
    pending.pop(n);
  }
  if (code < 0) {
    char err[100];
    tls.lastError(err, sizeof err);
    Serial.printf("  TLS: %s\n", err);
  }
  http.end();
  return code;
}

void setup() {
  Serial.begin(115200);
  Wire.begin(PIN_SDA, PIN_SCL);
  dht.begin();
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
#ifdef WRONG_CA_TEST
  Serial.println("*** WRONG_CA_TEST build: uploads are expected to FAIL ***");
#endif
#ifdef SCREEN_TEST
}

void loop() {
  screenTestLoop(oled);
}
#else
  screens::starting(oled);
  // Setup mode only at start-up (owner, s14): an outage while running is handled by the queue (F-11), not by setup.
  if (!loadWifi()) {
    Serial.println("no network saved");
    runSetupMode();
  }
  Serial.printf("joining Wi-Fi \"%s\"\n", wifiSsid);
  if (!joinWifi()) {
    Serial.println("Wi-Fi failed");
    runSetupMode();
  }
  lastWifiTry = millis();
  configTime(0, 0, "pool.ntp.org", "time.google.com");  // UTC; the app shows local time
}

uint32_t lastRead = 0;      // last display refresh
uint32_t lastSample = 0;    // last reading put in the queue
uint32_t lastSend = 0;      // last attempt to send the queue
bool firstRead = true;
bool sampled = false;       // false until the first reading is queued
bool sentOnce = false;
size_t lastDropped = 0;

void loop() {
  const uint32_t now = millis();

  // 1. Keep the screen alive: read and draw every few seconds, online or not.
  if (firstRead || intervalDue(now, lastRead, DISPLAY_REFRESH_MS)) {
    firstRead = false;
    lastRead = now;
    readSensor();
    showReading();
  }

  // 2. Every interval, a fresh reading with its time goes into the queue. No clock yet (no NTP answer): nothing
  //    can be timestamped, so wait. A failed sensor read tries again on the next pass.
  if ((!sampled || intervalDue(now, lastSample, intervalS * 1000UL)) && clockSet()) {
    readSensor();
    if (sensorOk) {
      pending.push(Reading{(uint32_t)time(nullptr), lastT, lastH});
      sampled = true;
      lastSample = now;
      if (pending.dropped() != lastDropped) {
        lastDropped = pending.dropped();
        Serial.printf("queue full: %u oldest readings lost so far\n", (unsigned)lastDropped);
      }
    }
    showReading();
  }

  // 3. Send what is queued whenever the link is up. After an attempt wait SEND_GAP_MS (the server takes one call
  //    per 30 s); that also paces a long queue: 50 readings per call.
  if (pending.size() > 0 && wifiUp() && clockSet() && (!sentOnce || intervalDue(now, lastSend, SEND_GAP_MS))) {
    sentOnce = true;
    lastSend = millis();
    sendPending();
    showReading();
  }

  delay(200);
}
#endif
