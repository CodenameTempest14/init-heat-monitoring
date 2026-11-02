# design/admin/proposal-b/

**PROPOSED (s22), the owner's request: "another design that is simple yet appealing".** An alternative to proposal A (the mocks one folder up). Same template family (Tabler sign-in and settings), same tokens, made-up account and room only.

| File | What |
|---|---|
| `b-sign-in.html`, `b-sign-in-error.html` | A centred card with a lock badge, one-line subtitle, inputs with icons and a show-password eye; the error is a bordered line with an icon |
| `b-not-admin.html` | A centred "Not an admin" card with a shield badge and Sign out |
| `b-settings.html`, `b-saved.html` | Signed in: account line (initial, email, Sign out), then grouped rows **Room / Device / Heat alerts** with the unit next to each box, and **one Save changes** for everything |
| `admin-b.css` | Its styles (moves to `web/src/admin.css` if chosen) |
| `build-mocks.mjs`, `capture.mjs` | `node design/admin/proposal-b/build-mocks.mjs`, then `capture.mjs` writes `ref/` |

## How it differs from A
- Fewer words: the ranges sit under each label, the long hints are one line each.
- Units (s, °C, %, min) are on the boxes, so labels are shorter.
- One Save for the room and the settings, instead of two buttons.
- Sign-in labels are hidden visually but still read by screen readers; the placeholder shows the field name.
