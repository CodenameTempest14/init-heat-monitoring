// Init room monitor. P03-02: join the hotspot, get the time, send one reading over HTTPS every minute.
// The server certificate is checked against root_ca.h (S-11): no setInsecure().
// Still to come: interval from settings (P03-03), OLED screens (P03-04), setup page (P03-05), offline buffer (P03-06).
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

DHT dht(PIN_DHT, DHT22);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

constexpr uint32_t UPLOAD_EVERY_MS = 60000;  // fixed for now; the server refuses more than one call per 30 s

void status(const char* line) {
  Serial.println(line);
  oled.clearDisplay();
  oled.setCursor(0, 0);
  oled.println("Init");
  oled.println(line);
  oled.display();
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
  Serial.printf("upload %s T=%.1f H=%.1f -> %d %s\n", when, t, h, code,
                code > 0 ? http.getString().c_str() : http.errorToString(code).c_str());
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
  status("joining Wi-Fi");
  if (!joinWifi()) status("Wi-Fi failed");
  configTime(0, 0, "pool.ntp.org", "time.google.com");  // UTC; the app shows local time
}

uint32_t lastUpload = 0;
bool first = true;

void loop() {
  if (!first && millis() - lastUpload < UPLOAD_EVERY_MS) {
    delay(200);
    return;
  }
  if (!joinWifi()) {
    status("Wi-Fi failed");
    delay(5000);
    return;
  }
  if (!clockSet()) {
    status("waiting for time");
    delay(1000);
    return;
  }
  first = false;
  lastUpload = millis();

  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (isnan(t) || isnan(h)) {
    status("sensor read failed");
    return;
  }
  int code = upload(t, h);
  char line[24];
  snprintf(line, sizeof line, "sent: %d", code);
  status(line);
}
