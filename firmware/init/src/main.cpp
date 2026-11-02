// Init room monitor. P03-06: join the hotspot, get the time, read the sensor every interval_s seconds (the server
// tells us in its reply; 60 s until the first reply), queue each reading and send the queue over HTTPS.
// While the hotspot or the server is down the readings stay in the queue (F-11) and go out in batches later.
// The OLED shows the latest reading all the time. The server certificate is checked against root_ca.h (S-11):
// no setInsecure(). Still to come: setup page (P03-05).
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
#include "room.h"
#include "readings.h"
#include "screens.h"
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

// Blocks up to 20 s. Only used once at start-up, while the "Connecting Wi-Fi..." screen is up.
bool joinWifi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  WiFi.mode(WIFI_STA);
  WiFi.begin(SECRET_WIFI_SSID, SECRET_WIFI_PASS);
  for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) delay(500);
  return WiFi.status() == WL_CONNECTED;
}

// The loop must keep reading and drawing while the hotspot is away, so this never waits: if the link is down
// it starts a new connection attempt every WIFI_RETRY_MS and the loop just looks again next time round.
uint32_t lastWifiTry = 0;
bool wifiUp() {
  if (WiFi.status() == WL_CONNECTED) return true;
  if (intervalDue(millis(), lastWifiTry, WIFI_RETRY_MS)) {
    lastWifiTry = millis();
    WiFi.disconnect();
    WiFi.begin(SECRET_WIFI_SSID, SECRET_WIFI_PASS);
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
  Serial.println("joining Wi-Fi");
  if (!joinWifi()) Serial.println("Wi-Fi failed");
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
