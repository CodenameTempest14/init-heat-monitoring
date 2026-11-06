# tests/

Run with `npm test` (or `node --test`) from the repository root. `npm install` first (Playwright, for the UI-GATE).

- `backend/` holds the online Supabase tests: `npm run test:backend` (see its README).
- `heat-index.test.js` tests `src/heat-index.js`.
- `heat-index-reference.json` is the shared table of expected values. The C++ port (P03) must pass the same table (D-015).
- `oled.test.js` is the OLED-GATE (P03-D3): each screen in `design/oled/screens.mjs` must equal its approved image in `design/oled/ref/`. If a screen is changed on purpose, get the new image approved, then run `node design/oled/build-refs.mjs`.
- `firmware-pc.test.js` builds and runs the PC tests of `interval.h`, `room.h` and `readings.h` (g++, `-Werror`).
- `firmware-heat-index.test.js` builds `firmware/init/tests/heat_index_test.cpp` with g++ and checks the device's C++ heat index against `src/heat-index.js` and the reference JSON (needs g++).
- `oled-dump.test.js` tests the reader for the frame-buffer dump of the real OLED (`design/oled/dump.mjs`); `node design/oled/check-dump.mjs <capture>` is the OLED-GATE on the board.
- `secret-scan.test.js` tests `tools/secret-scan.mjs`, the commit-time secret check.
- `web-history.test.js` (chart maths), `ui-gate-history.test.js` (built page vs `design/history-charts/ref/`, with the mock's own made-up data, fixed clock and UTC) and `backend/history.backend.js` (the `history()` function on the test project) belong to P04-04.
- `ui-gate.test.js` is the UI-GATE mechanism (P04-D5): `design/ui-gate.mjs` screenshots a page with Playwright and compares it with an approved image (colour tolerance 8/255, different size always fails). It is shown to fail on a changed number, a changed colour and a different width, using `fixtures/ui-gate/page.html`. App pages are checked the same way once they exist (P04-01 onward).
- `web-admin.test.js` (form checks and session timing), `ui-gate-admin.test.js` (built `#admin` vs `design/admin/proposal-b/ref/` with a faked Supabase: sign-in, wrong password, not an admin, settings, saved; also checks that only changed values are sent and an out-of-range value sends nothing) and `backend/admin.backend.js` (who may change settings and the room) belong to P05-01, P05-02, P05-05 and P05-06.
- `web-qr-kiosk.test.js` (the poster's QR equals the approved mock's, the level list, the kiosk's words and colour classes) and `ui-gate-qr-kiosk.test.js` (built `#kiosk` and `#poster` vs `design/qr-kiosk/ref/`; Offline, no reading, level colours, no sign-in, dark mode, print) belong to P06-01 and P06-02. Run the gate alone.
- `ui-gate-guide.test.js` (built `#guide` vs `design/admin-guide/ref/`, phone light and dark; also checks that the guide sends nothing but the header's readings request and that the three How? links on the admin page open the guide at Room, Reporting interval and Heat alerts) belongs to P05-07. The admin gate now compares with the redrawn `design/admin/proposal-b/ref/` images that include the How? links.
- `fixtures/` holds test input files (README inside).
