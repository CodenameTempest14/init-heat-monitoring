# Phase 5 — Admin, alerts and device health

**Objective:** One admin can sign in, change settings and receive heat alerts; device health is visible.
**Entry criteria:** P04 closed.
**Exit criteria:** Settings changed in the app reach the device on its next wake; an alert arrives on a phone; anonymous users cannot reach admin features.
**Features:** F-09, F-10, F-17, F-21 (admin edits the room). Model: Opus 5.5.

Checklist markers: see phase-01.

- [x] P05-01 Admin login (single account) — evidence 2026-11-02 (s22): `#admin` on the hosted page (init-test). Owner signed in as the test admin in their computer browser and sent cropped screenshots (wrong password -> "Email or password is wrong.", then signed in with the values loaded, dark mode). Assistant drove it in Chromium on the hosted page at 390 px light and dark: sign-in, reload keeps the session, sign out, a non-admin sees "Not an admin". `tests/web-admin.test.js` 7/7 (red first). Live admin account not made yet (see P05-05).
- [ ] P05-02 Settings page: interval, thresholds and calibration offset; the device picks them up (F-09) — PROG: page built (s22), ranges checked by page and database (`admin.backend.js`), an unchanged save writes nothing. Not tried: a real change from the page and the device picking up a new interval (after the 24 h run).
- [ ] P05-03 Push alert at Danger level with a quiet period, received on a phone (F-10)
- [ ] P05-04 Device health page: Wi-Fi signal, last reboot reason, firmware version (F-17)
- [ ] P05-05 Admin actions refused for anonymous users **and for any signed-in user who is not the named admin** (SECURITY_REVIEW S-4: policies check an admin list, never just `authenticated`), tested on the server — PROG: init-test done s22 (`tests/backend/admin.backend.js` 8/8, red first; policies read back; `anon-probe` 21/21). Not done: migration on live and the probe against live
- [ ] P05-06 Admin can change the device's room; new readings get the new room, old readings keep theirs (F-21, D-024). The room input says not to use people's names (SECURITY_REVIEW S-10) — PROG: `admin_set_room()` tested on init-test (new readings get the new room, old keep theirs); room box built with the S-10 text. Not tried: a real room save from the page (after the run)
