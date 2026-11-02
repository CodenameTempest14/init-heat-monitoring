# design/admin/

**PROPOSED (s22), waiting for the owner's approval.** Mocks of the admin view `#admin` (P05-01 sign-in, P05-06 room, P05-02 settings). Template: Tabler `sign-in.html` and `settings.html` (`pages.json` entry `admin`, Approved, MIT). Made-up account `admin@example.com` and room `Room 204`.

| File | What |
|---|---|
| `admin-sign-in.html` | Sign-in form: email and password. No "sign up" and no "forgot password" (sign-ups are off; the owner resets the password in the Supabase dashboard). |
| `admin-sign-in-error.html` | A wrong email or password: one message that does not say which was wrong. |
| `admin-not-admin.html` | Signed in, but the account is not in the admin list: nothing to change, only Sign out. |
| `admin-settings.html` | Signed in as the admin: Room card and Device settings card. |
| `admin-room-saved.html` | Same, right after saving a new room. |
| `build-mocks.mjs`, `capture.mjs` | Write the mocks; `node design/admin/capture.mjs` writes `ref/<state>-<phone\|desktop>-<light\|dark>.png` |
| `ref/` | The screenshots to approve |

## What is proposed
- **Reached at `#admin`** on the same address, with no link from the public pages. Hiding it is not the protection; the database refuses non-admins (P05-05, tested).
- **Header:** logo and title only (no room or online badge, which belong to the live page), then **‹ Live readings**.
- **Room card:** the room box with the S-10 rule ("Do not use people's names") and how history is kept (F-21). A **Saved** tick with the word, so colour is not the only signal.
- **Device settings card:** interval with the power-bank warning (DECIDE 1, owner s22), both offsets, alert threshold and quiet period, each with its allowed range. The database checks the same ranges.
- **Styles:** `web/src/admin.css`. The alert text uses our ink, not Tabler's orange or red, because those were too faint on the tint.
