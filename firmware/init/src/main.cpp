// Init room monitor: P03-01 skeleton. Only proves the project builds with the secrets and libraries.
// The real loop arrives in P03-02 to P03-06.
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include "config.h"
#include "secrets.h"

DHT dht(PIN_DHT, DHT22);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

void setup() {
  Serial.begin(115200);
  Wire.begin(PIN_SDA, PIN_SCL);
  dht.begin();
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.clearDisplay();
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(0, 0);
  oled.println("Init");
  oled.display();
}

void loop() {
  Serial.printf("T=%.1f H=%.1f\n", dht.readTemperature(), dht.readHumidity());
  delay(2000);
}
