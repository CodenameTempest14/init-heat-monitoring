// Bench bring-up sketch (P01-06, P01-07). Not product firmware.
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

constexpr uint8_t PIN_DHT = 4;
constexpr uint8_t PIN_SDA = 21;
constexpr uint8_t PIN_SCL = 22;
constexpr uint8_t OLED_ADDR = 0x3C;
constexpr uint32_t AWAKE_MS = 60000;
constexpr uint64_t SLEEP_US = 60ULL * 1000000ULL;

DHT dht(PIN_DHT, DHT22);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
RTC_DATA_ATTR uint32_t wakeCount = 0;  // survives deep sleep

void show(const char* l1, const char* l2, const char* l3) {
  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(0, 0);
  oled.println(l1);
  oled.println(l2);
  oled.println(l3);
  oled.display();
}

void setup() {
  Serial.begin(115200);
  wakeCount++;
  Wire.begin(PIN_SDA, PIN_SCL);
  if (!oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println("OLED not found at 0x3C: check SDA/SCL wiring");
  }
  dht.begin();
  Serial.printf("wake #%u\n", wakeCount);

  uint32_t start = millis();
  while (millis() - start < AWAKE_MS) {
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    char a[24], b[24], c[24];
    snprintf(a, sizeof a, "wake #%u", wakeCount);
    if (isnan(t) || isnan(h)) {
      snprintf(b, sizeof b, "DHT22 read failed");
      c[0] = 0;
      Serial.println("DHT22 read failed: check DATA wire and pull-up");
    } else {
      snprintf(b, sizeof b, "Temp %.1f C", t);
      snprintf(c, sizeof c, "Hum  %.1f %%", h);
      Serial.printf("T=%.1f C  RH=%.1f %%\n", t, h);
    }
    show(a, b, c);
    delay(2000);  // DHT22 needs at least 2 s between reads
  }

  show("sleeping 60 s", "", "");
  Serial.println("sleeping");
  oled.ssd1306_command(SSD1306_DISPLAYOFF);
  esp_sleep_enable_timer_wakeup(SLEEP_US);
  esp_deep_sleep_start();
}

void loop() {}
