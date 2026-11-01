// Init room monitor. P03-04: join the hotspot, get the time, send one reading over HTTPS every interval_s seconds
// (the server tells us in its reply; 60 s until the first reply), and keep the OLED showing the latest reading.
// The server certificate is checked against root_ca.h (S-11): no setInsecure().
// Still to come: setup page (P03-05), offline buffer (P03-06).
// Build `esp32dev_screens` instead draws the 9 approved screens and dumps them over serial (screen_test.h).
#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <time.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include "config.h"
#include "secrets.h"
#include "root_ca.h"
#include "interval.h"
#include "screens.h"
#ifdef SCREEN_TEST
#include "screen_test.h"
#endif

DHT dht(PIN_DHT, DHT22);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

uint32_t intervalS = INTERVAL_MIN_S;  // until the server says otherwise; it refuses more than one call per 30 s

// Latest sensor reading, refreshed every DISPLAY_REFRESH_MS; the upload sends this one.
float lastT = NAN, lastH = NAN;
bool sensorOk = false;

void showReading() {
  const char* link = WiFi.status() == WL_CONNECTED ? "Wi-Fi OK" : "NO WI-FI";
  if (sensorOk) screens::reading(oled, OLED_ROOM_LABEL, link, lastT, lastH);
  else screens::sensorError(oled, OLED_ROOM_LABEL, link);
}

void readSensor() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  sensorOk = !isnan(t) && !isnan(h);
  if (sensorOk) { lastT = t; lastH = h; }
  else Serial.println("sensor read failed");
}

bool joinWifi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  WiFi.mode(WIFI_STA);
  WiFi.begin(SECRET_WIFI_SSID, SECRET_WIFI_PASS);
  for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) delay(500);  // up to 20 s
  return WiFi.status() == WL_CONNECTED;
}

// The certificate check needs the real date (certificates have a valid-from and valid-to),
// and every reading carries its time, so nothing is sent before the clock is set.
bool clockSet() {
  return time(nullptr) > 1700000000;  // later than Nov 2023: NTP has answered
}

// Returns the HTTP status, or a negative HTTPClient error (-1 = connection or TLS handshake failed).
// On 200 it also updates intervalS from the reply.
int upload(float t, float h) {
  char when[25];
  time_t now = time(nullptr);
  strftime(when, sizeof when, "%Y-%m-%dT%H:%M:%SZ", gmtime(&now));

  char body[200];
  snprintf(body, sizeof body,
           "{\"device_key\":\"%s\",\"readings\":[{\"recorded_at\":\"%s\",\"temp_c\":%.1f,\"rh_pct\":%.1f}]}",
           SECRET_DEVICE_KEY, when, t, h);

  WiFiClientSecure tls;
  tls.setCACert(ROOT_CA);
  HTTPClient http;
  http.begin(tls, SECRET_INGEST_URL);
  http.addHeader("apikey", SECRET_ANON_KEY);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);
  // Print the reading and the server's answer, never the key.
  String reply = code > 0 ? http.getString() : http.errorToString(code);
  Serial.printf("upload %s T=%.1f H=%.1f -> %d %s\n", when, t, h, code, reply.c_str());
  if (code == 200) {
    uint32_t next = intervalFromReply(reply.c_str(), intervalS);  // a bad or missing value keeps the old one
    if (next != intervalS) Serial.printf("  interval %lu s -> %lu s\n", (unsigned long)intervalS, (unsigned long)next);
    intervalS = next;
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
  Serial.println("joining Wi-Fi");
  if (!joinWifi()) Serial.println("Wi-Fi failed");
  configTime(0, 0, "pool.ntp.org", "time.google.com");  // UTC; the app shows local time
}

uint32_t lastUpload = 0;
uint32_t lastRead = 0;
bool first = true;

void loop() {
  const uint32_t now = millis();
  if (first || intervalDue(now, lastRead, DISPLAY_REFRESH_MS)) {
    lastRead = now;
    readSensor();
    showReading();
  }

  if (!first && !intervalDue(now, lastUpload, intervalS * 1000UL)) {
    delay(200);
    return;
  }
  if (!joinWifi()) {
    Serial.println("Wi-Fi failed");
    showReading();  // now says NO WI-FI
    delay(5000);
    return;
  }
  if (!clockSet()) {
    Serial.println("waiting for time");
    delay(1000);
    return;
  }
  if (!sensorOk) {  // nothing to send; try again after the next read, not after a whole interval
    first = false;
    delay(200);
    return;
  }
  first = false;
  lastUpload = millis();
  upload(lastT, lastH);
  showReading();
}
#endif
