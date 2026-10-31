# tests/

Run with `node --test` from the repository root (no install needed).

- `backend/` holds the online Supabase tests: `npm run test:backend` (see its README).
- `heat-index.test.js` tests `src/heat-index.js`.
- `heat-index-reference.json` is the shared table of expected values. The C++ port (P03) must pass the same table (D-015).
- `oled.test.js` is the OLED-GATE (P03-D3): each screen in `design/oled/screens.mjs` must equal its approved image in `design/oled/ref/`. If a screen is changed on purpose, get the new image approved, then run `node design/oled/build-refs.mjs`.
