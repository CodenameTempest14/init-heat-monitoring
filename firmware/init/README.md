# firmware/init

The product firmware for the Init room monitor (P03). Arduino framework on PlatformIO (D-002).

Status: P03-02 done. Joins the hotspot, gets the time (NTP, UTC) and sends one reading every 60 s over HTTPS
with the server certificate checked (S-11). The OLED shows only a status line for now. Interval from settings,
OLED screens, setup page and offline buffer come in P03-03 to P03-06.
See `../README.md` for how to flash this project and not `bench`.

## Build

    cp include/secrets.h.example include/secrets.h   # then edit it; secrets.h is gitignored
    pio run                  # build
    pio run -t upload        # flash (board on USB)
    pio device monitor

    pio run -e esp32dev_wrongca -t upload   # TEST ONLY: trusts the wrong root, uploads must fail (P03-02)

## Files
- `platformio.ini`: board, platform and library versions, all pinned.
- `include/config.h`: pins and fixed, non-secret settings.
- `include/secrets.h.example`: template for `secrets.h` (ingest URL, public key, device key, and the hotspot
  name and password, the last two only until the setup page exists, D-026).
- `include/root_ca.h`: the root certificates the device trusts (D-026). GlobalSign Root CA expires 2028-01-28.
- `src/main.cpp`: the program.
