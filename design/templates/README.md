# design/templates/

Reference screenshots of the chosen Tabler demo pages (MIT, see `../REGISTRY.md`), for owner approval (P04-D4).

Regenerate: `node design/templates/capture.mjs` (needs network and `npx playwright install chromium`). The script hides Tabler's sales banner and floating "customize" button and turns off animations; nothing else is changed.

| Page in our app | Tabler page | Phone 390 px | Desktop 1280 px |
|---|---|---|---|
| home (F-01 to F-05, F-12, F-15) | `/` dashboard | `home-phone.png` | `home-desktop.png` |
| kiosk, QR poster (P06) | `cards.html` | `cards-phone.png` | `cards-desktop.png` |
| admin sign-in (P05) | `sign-in.html` | `sign-in-phone.png` | `sign-in-desktop.png` |
| admin settings (P05) | `settings.html` | `settings-phone.png` | `settings-desktop.png` |

Notes for the review:
- These show the template's own demo content (made-up numbers, stock avatars). Our pages will use our tokens and our data; the template gives the layout and components only.
- The dashboard on a phone is wider than the screen (about 832 px at a 390 px viewport, horizontal scroll). Cause not diagnosed. Our home page must not do this; it is checked at 390 px when it is built.
- The avatars are demo photos of people. They are reference images only and no app page will use them.
