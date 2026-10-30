# design/

Everything visual that web pages are checked against (D-016, lightweight version of the Ad Astra technique).

| File | What |
|---|---|
| `pages.json` | Source of truth: one entry per page, with its template, source, licence and status |
| `REGISTRY.md` | Generated from `pages.json` by `node design/build-registry.mjs` |
| `tokens.json` | Colours (including the four heat categories), type and spacing. Provisional until P04-D3 |

Rules: no page is built without an Approved template; templates must be open source (D-010); colour is never the only signal; no real personal data in any image. UI-GATE comes in P04-D5.
