# design/offline-badge/

**Approved by the owner 2026-11-02 (s16), built in P04-03.** The online/offline badge of the home page (P04-03, F-03).
Made-up readings and a made-up room name (`Room 204`). The mocks load the real stylesheet (`web/src/app.css`, `tokens.css`), so the built page is checked against `ref/` by `tests/ui-gate-badge.test.js`.

| File | What |
|---|---|
| `<state>.html` | One mock per state: `online`, `offline-12min`, `offline-3h`, `no-readings` |
| `build-mocks.mjs` | Writes the four mocks |
| `capture.mjs` | `node design/offline-badge/capture.mjs` writes `ref/<state>-<phone\|desktop>-<light\|dark>.png` (phone 390 px for all, desktop 1280 px for `offline-12min`) |
| `ref/` | The screenshots to approve |

Design notes:
- A pill under the room name. Colour is never the only cue: **online** = filled dot + "Online"; **offline** = ring with a cross + words with the age; **waiting** = clock + words.
- When offline, the cards keep their last values and category colour, but the label becomes **Last heat index** and the line below says **last reading N min ago**, so nobody reads old data as live.
- Badge text contrast on the page background (WCAG): light online 4.74, offline 6.13, waiting 5.46; dark 10.44, 7.97, 8.57 (all need 4.5).
- Not drawn: "could not load the readings" (the phone cannot reach the server). That is a page problem, not a device problem, and keeps today's line under the cards.

Rule to approve (build decision, not drawn): the device is **offline** when the newest reading is more than **2 minutes** old
(the board uploads every 60 s, so 2 missed uploads; owner changed it from 3 min to 2 min in s17). The age uses the server's `received_at`, not the device clock; the page already refreshes every 30 s.
