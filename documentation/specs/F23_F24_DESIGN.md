# F-23 and F-24: design proposal (s27, 2026-11-03): WAITING FOR THE OWNER'S APPROVAL, nothing built

CLAUDE.md: no feature is built until the owner approves it. Below is what I checked and what I propose. Mocks (phone, light and dark) come after you approve the shape.

## F-23: Reset room, and "Unassigned" as the only default (part of P05-06)

**What I checked in the repo**
| Place | Today | Needed |
|---|---|---|
| `devices.room` column default (`20261031130000_device_room.sql`) | `Unassigned` | nothing |
| `admin_set_room(p_device, p_room)` (`20261105120000_admin.sql`) | accepts 1 to 60 characters, admin only | accepts `Unassigned` already: **Reset needs no migration** |
| `OLED_ROOM_LABEL` in `firmware/init/include/config.h` | `Room 1`, shown until the first upload reply | change to `Unassigned` (10 characters, fits the 12 limit); **needs one flash** |
| init-test device | room `Room 1` | one Reset or one SQL update; live is already `Unassigned` |
| Admin page `Admin.jsx` | one room box, one Save for room and settings | add a **Reset** button beside the box |

**Proposal**
1. **Reset** is a small secondary button right of the room box. Tapping it puts `Unassigned` in the box (it does not save by itself); the one **Save** button then writes it, like every other change. Disabled when the box already says `Unassigned`. This keeps "one Save, nothing happens by accident".
2. The guide's Room section (F-22) gets one sentence: "Reset sets the room back to Unassigned." The teacher reviews that sentence (D-034).
3. Old readings keep their room (F-21, unchanged).
4. Tests first: `admin.js` (page logic) and the admin UI gate (button, disabled state, saves `Unassigned`); a backend test that an admin Reset reads back as `Unassigned` and a non-admin cannot.

**Needs from you:** OK, or: should Reset save immediately instead (one tap, no Save)? I recommend the two-step way above.

## F-24: Calendar from-to filter for a readings table (user side)

Your answers (s27): a **new readings table**; a **from-to range**; as long as data exists.

**Proposal**
1. A new public page `#readings`, linked from the History page ("Readings table ›", same style as the school-day link).
2. Two date pickers, **From** and **To** (the phone's native calendar). Allowed dates are limited to the first and last day that have data (a small function `readings_span(for_device)` returns them). Defaults: both set to the newest day with data. Days are Philippine time (Asia/Manila), like the school-day view.
3. The table: Time, Temperature, Humidity, Heat index, PAGASA level, Room. Newest first. **500 rows per page with a "Show more" button**, because one day is 1,440 readings and a month is about 43,000; the free tier must not be hit with one huge download. A line above says "1,440 readings from 3 Nov to 3 Nov".
4. Server: one new read-only function `readings_range(from_ts, to_ts, for_device, before_ts, page_size)` (security invoker, same public read rules as `history()`), page size capped at 500. New migration: **init-test first, then live (you run the live push)**. `anon-probe` gets a check that a stranger can read only what the page already reads and cannot write.
5. Tests first: function tests (range, order, cap, bad input rejected), `readings.js` logic (date to Manila range), UI gate against approved mocks.

**Questions for you**
- (a) Raw one-per-minute rows (my recommendation, exact data), or hourly averages when the range is longer than, say, 7 days?
- (b) Add a **Download CSV** button? It is a new feature; I would not add it unless you ask.
- (c) Place: own page `#readings` (recommended), or inside the History page under the charts?

## Order
F-23 first (small, one flash), then F-24. Both Sonnet 5.5. The paper (rule 5) gets updated in the same session as each build.

## Owner's answers (s27, 2026-11-03)
- F-23: **Reset fills the box, Save writes it** (the recommended way).
- F-24: **hourly averages** (not raw rows); **Download CSV: yes**; placed **under the history charts** (not a separate page).
- Mocks drawn: `design/room-reset-readings/` (phone, light and dark). **Waiting for the owner to approve the mocks**, then build test-first (F-23 first).
- Open points the mocks show, for the owner to confirm: the table shows hourly averages for any range (the 500-row page and Show more stay: 24 hours a day, so 500 rows is about 20 days); the CSV holds the same hourly rows for the chosen range; date pickers limited to days that have data; times in Philippine time.
