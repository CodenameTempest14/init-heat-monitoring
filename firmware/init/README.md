# firmware/init

The product firmware for the Init room monitor (P03). Arduino framework on PlatformIO (D-002).

Status: P03-01 skeleton only. It builds, and since 2026-11-02 it runs on the board: "Init" on the OLED and one
`T=.. H=..` line every 2 s on serial. Reading, upload, setup page and buffer come in P03-02 to P03-06.
See `../README.md` for how to flash this project and not `bench`.

## Build

    cp include/secrets.h.example include/secrets.h   # then edit it; secrets.h is gitignored
    pio run                  # build
    pio run -t upload        # flash (board on USB)
    pio device monitor

## Files
- `platformio.ini`: board, platform and library versions, all pinned.
- `include/config.h`: pins and fixed, non-secret settings.
- `include/secrets.h.example`: template for `secrets.h` (ingest URL and device key). Wi-Fi is not stored here (D-011).
- `src/main.cpp`: the program.
