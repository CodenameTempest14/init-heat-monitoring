# firmware/bench

Bring-up sketch for P01-06 (live DHT22 + OLED reading) and P01-07 (sleep and awake current).

Build and upload from this folder (board plugged in by USB):

    pio run -t upload
    pio device monitor

Pins (Rev B wire list): DHT22 DATA = GPIO4 (4.7 to 10 kΩ pull-up; 5 kΩ used on the bench to 3V3), OLED SDA = GPIO21, SCL = GPIO22 (address 0x3C), button = GPIO33 (not used yet).

Behaviour: reads and shows temperature and humidity every 2 s for 60 s (awake current), then prints "sleeping" and deep-sleeps for 60 s (sleep current), then repeats. A wake counter survives sleep so you can see the cycles.

Status: compiled and run on the 38-pin board on 2026-10-31 (upload at 115200 baud; OLED and serial readings confirmed, P01-06). Sleep current not yet measured (P01-07).
