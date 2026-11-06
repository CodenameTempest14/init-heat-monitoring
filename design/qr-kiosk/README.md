# design/qr-kiosk/

**APPROVED by the owner (s35, 2026-11-06) and built** in `web/src/Kiosk.jsx` and `Poster.jsx` (routes `#kiosk`, `#poster`), gated by `tests/ui-gate-qr-kiosk.test.js` (0 differing pixels against `ref/`). Made-up readings and a made-up room (`Room 204`).

| File | What |
|---|---|
| `poster.html` | Printable poster for a classroom door: logo, "How hot is our classroom?", a **real scannable QR code** to https://init-heat-monitoring.vercel.app, the four PAGASA levels (27 / 33 / 42 / 52, same as `web/src/category.js`), a "school project, not official" line. Black on white so it prints well. A Print button that is hidden when printed |
| `kiosk.html` | Full-screen display for a hallway TV or projector: room, huge heat index, level name with its shape, temperature and humidity, online status. Background is the level colour (shown: Danger) |
| `build-mocks.mjs`, `capture.mjs` | Write the mocks; `node design/qr-kiosk/capture.mjs` writes `ref/poster-a4.png`, `ref/kiosk-tv.png`, `ref/kiosk-phone.png` |

Proposed routes (same address, no server change): `#poster` and `#kiosk`. The QR is drawn in the browser by `qrcode-generator` 2.0.4 (MIT, open source, D-010), already added to `web/package.json` (not yet used by the app). The kiosk refreshes on the same polling as the home page and shows Offline when the newest reading is older than 120 s.
