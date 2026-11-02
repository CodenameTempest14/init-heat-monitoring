# firmware/init

The product firmware for the Init room monitor (P03). Arduino framework on PlatformIO (D-002).

Status: P03-01 to P03-06 done (P03-05 tried on the board s14). At start-up it reads the hotspot
saved in flash and joins it; with nothing saved, or when that fails for 20 s, it opens its own network
`Init-Setup` with the setup page at 192.168.4.1 (D-011). Then: time from NTP (UTC), a reading every `interval_s`
(from the server's reply), queued in RAM while offline (F-11) and sent over HTTPS with the server certificate
checked (S-11). The OLED shows the approved screens and stays on (D-025).
See `../README.md` for how to flash this project and not `bench`.

## Build

    cp include/secrets.h.example include/secrets.h   # then edit it; secrets.h is gitignored
    pio run                  # build
    pio run -t upload        # flash (board on USB)
    pio device monitor

    pio run -e esp32dev_wrongca -t upload   # TEST ONLY: trusts the wrong root, uploads must fail (P03-02)
    pio run -e esp32dev_screens -t upload   # TEST ONLY: draws the 9 screens and dumps them over serial (P03-04)

## Changing the Wi-Fi (P03-05)
1. Switch the old hotspot off (or take the device out of its range) and restart the device (unplug, plug back in).
2. After about 20 s the OLED shows SETUP MODE. Join `Init-Setup` from a phone with the password on the sticker
   (`SECRET_SETUP_PASS`). The page usually opens by itself; if not, open `192.168.4.1`.
3. Type the hotspot name and password, tap **Save and restart**. The device restarts and joins it.
Setup mode closes itself after 10 minutes and tries the saved network again. A hotspot that drops while the
device is running does not open setup mode: the readings are queued until it is back (owner's choice, s14).

## Files
- `platformio.ini`: board, platform and library versions, all pinned.
- `include/config.h`: pins and fixed, non-secret settings.
- `include/secrets.h.example`: template for `secrets.h` (ingest URL, public key, device key, setup network password).
  The hotspot name and password are no longer here: they are saved in flash by the setup page (D-026 ended).
- `include/root_ca.h`: the root certificates the device trusts (D-026). GlobalSign Root CA expires 2028-01-28.
- `include/wifi_setup.h`: setup page rules (name 1-32 bytes, password empty or 8-63 printable ASCII), escaping, and
  the pages, which must equal `design/device-setup/` (PC tests in `tests/`).
- `include/interval.h`, `room.h`, `readings.h`, `heat_index.h`, `screens.h`, `screen_test.h`: see the comment at the
  top of each; each pure header has a PC test in `tests/`.
- `src/main.cpp`: the program.
