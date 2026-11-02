# web/public/

Files served as they are at the site's root (P04-05, F-05, installable app).

| File | What |
|---|---|
| `manifest.webmanifest` | App name, full-screen mode, theme colours and the icon list (owner-approved, s18) |
| `sw.js` | Service worker: keeps the page's own files so the app opens with no signal; **never** touches readings (another origin). Tested in `tests/web-pwa.test.js` |
| `favicon.svg`, `favicon-32.png` | Browser-tab icon |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | Home-screen icons (rounded, rounded, full square for Android masks, full square for iPhone) |
| `logo-light.svg`, `logo-dark.svg` | The header logo |

All of these except `manifest.webmanifest` and `sw.js` are made by `npm run icons` (in `web/`) from the approved drawings in `design/brand/` (see `design/pwa/icons.mjs`). Do not edit them by hand.
