# design/pwa/

**Icons, theme colours and offline rule approved 2026-11-02 (s18); the revised header is awaiting approval (P04-05, F-05, D-016).** Mocks of the header logo, the icons and the installed look of the phone app. Made-up room name (`Room 204`); the logo and icon are the ones chosen in D-029 (`../brand/`).

| File | What |
|---|---|
| `header.html` | The page with the logo in the header (replaces the plain "Init" title; the title stays in the page for screen readers) |
| `icons.html` | Browser-tab icon, the home-screen icon under each phone mask, the maskable safe zone, and the list of icon files |
| `installed.html` | The installed app: no browser bar, status bar in the theme colour |
| `build-mocks.mjs`, `pwa.css` | Write the mocks; mock-only styles |
| `capture.mjs` | `node design/pwa/capture.mjs` writes `ref/<page>-phone-<light\|dark>.png` |
| `ref/` | The screenshots to approve |

## What is proposed
- **Header (revised after the owner's note, s18):** centred. The approved logo (icon + `init` wordmark, 40 px high) on top, then the title line **Init: Indoor Heat Index Tracker** (the short form of the full name in D-029; the long form is too long for a phone line), then the room, then the Online badge, with a little more space between room and badge. Light and dark logo follow the phone setting. This changes the top of every page image, so the home, badge and history mocks and their reference images are redrawn after approval, then the gates run again.
- **Icons:** drawn from the approved icon only. Rounded one for the favicon and "any"; a full-square one with the thermometer at 85 % so Android's circle or squircle never cuts it; a full-square one for iPhone (it rounds the corners itself).
- **Theme colours:** the status bar takes the page colour: `#f6f7f9` in light, `#10161d` in dark. The start-up screen background is `#10161d`.
- **Installed app:** opens full screen with no browser bar, same page.
- **Offline (service worker):** only the page files are kept, so the app opens with no signal. **Readings are never kept**: with no signal the page says "Could not load the readings. Will try again." (as today), because an old temperature shown as current would mislead. No install button of our own: the phone's browser offers "Add to home screen" itself.
