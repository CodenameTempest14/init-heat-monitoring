# design/admin-guide/

**PROPOSED, waiting for the owner's approval (F-22, D-034). Nothing is built yet.** Mocks of the admin guide `#guide` and of the one change to the admin page. Made-up room and numbers only. English only (D-034). **A teacher reviews the wording before it goes live.**

| File | What |
|---|---|
| `guide.html` | The guide: a short contents list, then six sections in the order of the admin page: Before you start, Room, Reporting interval, Temperature and humidity offsets (with the worked example 30.2 − 31.0 = −0.8), Heat alerts (PAGASA levels table), If something looks wrong |
| `admin-how.html` | The approved admin page (proposal B, signed in) with one **How? ›** link under each group box: Room, Device, Heat alerts. Nothing else on the page changes |
| `guide.css` | Styles for both (only tokens from `web/src/tokens.css` and `charts.css`) |
| `build-mocks.mjs`, `capture.mjs` | `node design/admin-guide/build-mocks.mjs`, then `capture.mjs` writes `ref/<state>-phone-<light\|dark>.png` |

## What is proposed
- **Same look as the admin page:** cards with the same border, number badges on the section titles, short sentences, numbered steps, a blue-bordered **Example** box and a note box with a warning icon.
- **Readable without signing in.** The only links to it are the three **How? ›** links (they jump to Room, Reporting interval, Heat alerts). The back link says **‹ Admin**.
- **Heat alerts** has a note first: alerts come in a later step. The levels table quotes PAGASA's names and numbers only, no advice.
- **Wording is a draft** for the owner and the teacher to correct. The offset steps follow the F-22 text (30 minutes, 3 readings 5 minutes apart, average).
