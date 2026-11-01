# firmware/

ESP32 code (Arduino framework on PlatformIO, D-002).

- `bench/` is the throw-away bring-up sketch for P01-06 and P01-07: DHT22 + OLED + a Wi-Fi scan loop as load (it never sleeps, D-018). It is not the product firmware (that is P03).
- `init/` is the product firmware (P03).

## Flashing the right project
Both projects name their environment `esp32dev`, so the PlatformIO status bar cannot tell them apart, and the
VS Code toolbar is hidden when the repo root is open. On 2026-11-02 an upload from the toolbar flashed `bench`
instead of `init`. Flash from the terminal inside the project folder instead:

    cd firmware/init
    pio run -t upload --upload-port COM8

Check the log: `init` prints `PLATFORM: Espressif 32 (6.9.0)` (version pinned); `bench` has no version.
On the serial monitor `init` prints `T=28.4 H=64.5`, `bench` prints `T=28.4 C  RH=64.5 %  nets=4`.
If the upload stops at `Connecting....` (wrong boot mode), hold BOOT until `Chip is ESP32...` appears.
