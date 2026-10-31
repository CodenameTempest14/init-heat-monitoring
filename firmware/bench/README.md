# firmware/bench

Bring-up sketch for P01-06 (live DHT22 + OLED reading) and P01-07 (sleep and awake current).

Build and upload from this folder (board plugged in by USB):

    pio run -t upload
    pio device monitor

Pins (Rev B wire list): DHT22 DATA = GPIO4 (4.7 to 10 kΩ pull-up; 5 kΩ used on the bench to 3V3), OLED SDA = GPIO21, SCL = GPIO22 (address 0x3C), button = GPIO33 (not used yet).

Behaviour (D-018, no deep sleep): scans Wi-Fi continuously (load for the power bank, no password), reads the DHT22 every 2 s, shows temperature, humidity, uptime in minutes and the number of networks seen. Used for the one-hour power bank test (P01-04).

Status: Wi-Fi scan version ran 61 min on the ROMOSS bank on 2026-10-31 (P01-04). The no-Wi-Fi no-sleep version and the deep-sleep version both made the bank switch off.
