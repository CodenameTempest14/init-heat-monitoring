# web/

The Init web app (P04). **Vite + React** (owner's choice, s15, 2026-11-02), built to static files and hosted on **Vercel** (D-030). Everything here is open source (MIT): React, Vite, `@tabler/core` (the approved template CSS).

Status: P04-01 skeleton. One page that reads the newest reading as a logged-out visitor. Cards, charts, badge and PWA come in P04-02 to P04-05.

| Path | What it is |
|---|---|
| `src/App.jsx` | The page: fetches the newest row from the Supabase REST address every 30 s and shows it |
| `src/history.js`, `src/History.jsx`, `src/charts.css` | The 24 h / 7 d charts (P04-04): maths (tested by `tests/web-history.test.js`), the page part, and its styles. Data from `rpc/history`, checked against `design/history-charts/ref/` by `tests/ui-gate-history.test.js` |
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
