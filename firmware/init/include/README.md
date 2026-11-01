# firmware/init/include

Headers. `heat_index.h` (heat index and PAGASA band, P03-04), `interval.h` (upload interval rules, P03-03), `screens.h` (the OLED screens, repeated from `design/oled/screens.mjs`) and `screen_test.h` (only for the `esp32dev_screens` build, which dumps the display over serial) are pure code or drawing code. `config.h` is committed. `secrets.h` is created from `secrets.h.example`, is gitignored and must never be committed.
