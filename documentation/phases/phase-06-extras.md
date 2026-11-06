# Phase 6 — Display and sharing extras

**Objective:** The low-risk extras that make the app easier to share and use.
**Entry criteria:** P05 closed.
**Exit criteria:** Each extra works in the running app.
**Features:** F-13, F-14, F-15, F-16, F-18. Model: Sonnet 5.5.

Checklist markers: see phase-01.

- [x] P06-01 Kiosk page with huge numbers for a TV or projector (F-13) — evidence 2026-11-06 (s35): owner approved the mocks `design/qr-kiosk/ref/` (kiosk-tv, kiosk-phone). Built test-first as `#kiosk` (`web/src/Kiosk.jsx`, `kiosk.js`, `qr-kiosk.css`): `tests/web-qr-kiosk.test.js` 7/7 (seen red first: module not found), `tests/ui-gate-qr-kiosk.test.js` 12/12 (built page has 0 differing pixels against the approved TV and phone images, also in dark mode; offline keeps the level colour and says Offline; no reading shows a neutral screen with dashes; every level has its own colour; needs no sign-in and sends only the readings request). First gate run found a real defect: 109 pixels differed because React split the "updated ... · address" line into two text nodes; fixed with one string. Looked at the running local build on real init-test data: 38 °C, Extreme caution, Online, room Unassigned (screenshot read in session). Not yet on the hosted page (push pending); no link to it from the home page on purpose (would change the approved home mocks).
- [x] P06-02 Printable QR poster (F-14) — built s35 (2026-11-06) as `#poster` (`web/src/Poster.jsx`, `poster.js`): the QR is drawn by `qrcode-generator` 2.0.4 (MIT) and equals the approved mock's QR (test). Gate: built page 0 differing pixels against `poster-a4.png`; the approved image was decoded with jsQR 1.4.0 (scratch install, not in the repo) and gave `https://init-heat-monitoring.vercel.app`; poster stays black on white in dark mode; Print button hidden in print media. **Verified s36 (2026-11-06): the owner scanned the poster at https://init-heat-monitoring.vercel.app/#poster with a phone and it worked (owner's word). Not tried: a printed sheet.**
- [ ] P06-03 Advice text per category, wording reviewed by a teacher (F-15)
- [x] P06-04 CSV export of history (F-16) — covered by F-24 (owner confirmed s35, 2026-11-06): the Readings table under the charts downloads a CSV of the picked from-to range (hourly rows); owner saw it work on the hosted page 2026-11-03 (s28, "Yes"); `tests/web-readings.test.js`.
- [ ] P06-05 Tagalog / English toggle (F-18)
