# tests/

Run with `npm test` (or `node --test`) from the repository root. `npm install` first (Playwright, for the UI-GATE).

- `backend/` holds the online Supabase tests: `npm run test:backend` (see its README).
- `heat-index.test.js` tests `src/heat-index.js`.
- `heat-index-reference.json` is the shared table of expected values. The C++ port (P03) must pass the same table (D-015).
- `oled.test.js` is the OLED-GATE (P03-D3): each screen in `design/oled/screens.mjs` must equal its approved image in `design/oled/ref/`. If a screen is changed on purpose, get the new image approved, then run `node design/oled/build-refs.mjs`.
- `firmware-heat-index.test.js` builds `firmware/init/tests/heat_index_test.cpp` with g++ and checks the device's C++ heat index against `src/heat-index.js` and the reference JSON (needs g++).
- `oled-dump.test.js` tests the reader for the frame-buffer dump of the real OLED (`design/oled/dump.mjs`); `node design/oled/check-dump.mjs <capture>` is the OLED-GATE on the board.
- `secret-scan.test.js` tests `tools/secret-scan.mjs`, the commit-time secret check.
- `ui-gate.test.js` is the UI-GATE mechanism (P04-D5): `design/ui-gate.mjs` screenshots a page with Playwright and compares it with an approved image (colour tolerance 8/255, different size always fails). It is shown to fail on a changed number, a changed colour and a different width, using `fixtures/ui-gate/page.html`. App pages are checked the same way once they exist (P04-01 onward).
- `fixtures/` holds test input files (README inside).
