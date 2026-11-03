# firmware/init/tests/

Tests that run on the PC, not on the board. They cover the parts of the firmware with a correct answer and no hardware in them.

- `interval_test.cpp` — `include/interval.h` (P03-03): reading `interval_s` from the server's reply, the 60 to 3600 s limits, and the wait that must survive `millis()` wrapping.

- `readings_test.cpp` — `include/readings.h` (P03-06): the offline buffer (oldest first, drops the oldest when full, wrap-around) and the upload body for 1 to 50 readings.
- `room_test.cpp` — `include/room.h` (D-028): the room name from the reply is plain printable ASCII, cut to 12 characters, and anything odd keeps the old label.
- `health_test.cpp` — `include/health.h` and the optional health part of the upload body in `include/readings.h` (P05-04): reset names, the -120..0 signal clamp, a version the server would refuse is never sent, and that 50 readings plus health still fit. `tests/firmware-health.test.js` (repo root) builds it and compares the reset names with the server's list in the health migration. Not yet wired into `main.cpp` (waits for the 24 h run).
- `heat_index_test.cpp` — `include/heat_index.h` (P03-04): the device's heat index and PAGASA band. It has no answers of its own: `tests/firmware-heat-index.test.js` (repo root, run by `npm test`) builds it and feeds it points made by `src/heat-index.js`.
- `wifi_setup_test.cpp` — `include/wifi_setup.h` (P03-05): the rules for a network name and password, HTML escaping of names, and that the pages never carry a password or an unescaped name.
- `setup_page_render.cpp` — prints the three setup page states; `tests/firmware-setup-page.test.js` (repo root) checks they equal the approved `design/device-setup/*.html` byte for byte.

Build and run `interval_test` from `firmware/init` (needs g++):
```
g++ -std=c++17 -Wall -Wextra -o interval_test tests/interval_test.cpp && ./interval_test
```
It prints `all passed`, or one `FAIL line N` per broken check. Delete the built `interval_test` file afterwards; it is not committed.
