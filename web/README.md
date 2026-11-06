# web/

The Init web app (P04). **Vite + React** (owner's choice, s15, 2026-11-02), built to static files and hosted on **Vercel** (D-030). Everything here is open source (MIT): React, Vite, `@tabler/core` (the approved template CSS).

Status: P04-01 skeleton. One page that reads the newest reading as a logged-out visitor. Cards, charts, badge and PWA come in P04-02 to P04-05.

| Path | What it is |
|---|---|
| `src/App.jsx` | The page: fetches the newest row from the Supabase REST address every 30 s and shows it |
| `src/history.js`, `src/History.jsx`, `src/charts.css` | The 24 h / 7 d charts (P04-04): maths (tested by `tests/web-history.test.js`), the page part, and its styles. Data from `rpc/history`, checked against `design/history-charts/ref/` by `tests/ui-gate-history.test.js` |
| `src/school.js`, `src/School.jsx`, `src/school.css` | The school-day view `#school` (P04-07, F-12): words, day picker and bar (tested by `tests/web-school.test.js`), the page part, and its styles. Data from `rpc/school_day` (needs the `20261104120000_school_day` migration). Mocks in `design/school-day/`; gated by `tests/ui-gate-school.test.js` |
| `src/admin.js`, `src/Admin.jsx`, `src/admin.css` | The admin view `#admin` (P05-01, P05-02, P05-06; proposal B, owner s22): form checks and session timing (tested by `tests/web-admin.test.js`), the page part (sign-in with plain `fetch` to `/auth/v1`, token in `sessionStorage`, `is_admin()`, room via `rpc/admin_set_room`, settings via PATCH), and its styles. Needs the `20261105120000_admin` migration. Mocks in `design/admin/proposal-b/`; gated by `tests/ui-gate-admin.test.js` |
| `src/Guide.jsx`, `src/guide.css` | The admin guide `#guide` and `#guide/<room\|interval\|alerts>` (F-22, D-034): plain text for the admins, readable without signing in, linked only from the **How? ›** links on the admin page. Wording is a draft until a teacher reviews it. Mocks in `design/admin-guide/`; gated by `tests/ui-gate-guide.test.js` |
| `src/i18n.js`, `src/Lang.jsx`, `src/lang.css` | English / Filipino switch (F-18, P06-05): all words of the home page, status line, `#school` and `#alerts` in one list per language (`i18n.js`, plain functions, tested), the switch on the Room line and the remembered choice (`Lang.jsx`, `lang.css`). The Filipino is a draft awaiting a teacher (D-034). Charts, readings table, `#heat`, `#guide`, `#admin`, kiosk and poster are still English |
| `src/Kiosk.jsx`, `kiosk.js`, `src/Poster.jsx`, `poster.js`, `qr-kiosk.css` | The kiosk page `#kiosk` (F-13, P06-01: huge numbers for a hallway TV, level colour, Offline when the newest reading is over 120 s old) and the QR poster `#poster` (F-14, P06-02: a printable sheet with a QR code drawn in the browser by `qrcode-generator`, always pointing at the hosted address). Neither has the app header or a link from the home page. Tests: `tests/web-qr-kiosk.test.js`; gate `tests/ui-gate-qr-kiosk.test.js` against `design/qr-kiosk/ref/` |
| `src/lib.js` | Plain text helpers (`ageText`, `readingView`). Tested by `tests/web-lib.test.js` (run by `npm test` from the project root) |
| `src/config.js` | Supabase address and the **public** key. Made by `npm run config`. Meant to be public (row-level rules, SCHEMA.md) |
| `src/tokens.css` | Colours from `design/tokens.json`. Made by `npm run tokens`, never edited by hand |
| `src/app.css` | Our own small styles (no inline styles: the Content-Security-Policy forbids them) |
| `vercel.json` | Build settings and security headers (Content-Security-Policy, nosniff, no referrer). The CSP names the Supabase host: change it together with `config.js` when the app moves to the live project |
| `public/` | Manifest, service worker, icons and logos (P04-05); see its README |
| `build-config.mjs`, `build-tokens.mjs`, `build-icons.mjs` | The generators: Supabase config, colours, icons (`npm run icons`) |

## Use
```
cd web
npm install
npm run dev         # local page with live reload
npm run build       # makes dist/ (not committed)
npm run config -- live   # switch to the live project (default is init-test, D-026)
```
On Vercel: Root Directory = `web`, framework preset Vite (build `npm run build`, output `dist`).

Never put the secret key or a device key in this folder.
