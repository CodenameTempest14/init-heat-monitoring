# firmware/init/tests/

Tests that run on the PC, not on the board. They cover the parts of the firmware with a correct answer and no hardware in them.

- `interval_test.cpp` — `include/interval.h` (P03-03): reading `interval_s` from the server's reply, the 60 to 3600 s limits, and the wait that must survive `millis()` wrapping.

Build and run from `firmware/init` (needs g++):
```
g++ -std=c++17 -Wall -Wextra -o interval_test tests/interval_test.cpp && ./interval_test
```
It prints `all passed`, or one `FAIL line N` per broken check. Delete the built `interval_test` file afterwards; it is not committed.
