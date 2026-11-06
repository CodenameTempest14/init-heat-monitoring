# design/language-toggle/

**PROPOSED, waiting for the owner's approval. Nothing is built** (P06-05, F-18: English / Filipino toggle). The Filipino words are a **DRAFT written by the assistant**; a teacher or fluent speaker must review every one before it goes live (D-034).

| File | What |
|---|---|
| `home-en.html`, `home-fil.html` | The home page with the switch, in English and in Filipino (made-up room and readings) |
| `home-fil-longest.html` | Stress case at 360 px: the longest Filipino texts (offline line, "Matinding panganib", "Huling heat index") |
| `ref/*.png` | Light-mode screenshots made by `capture.mjs` (dark mode is not drawn here: the app sets its dark theme from script, a plain mock does not) |
| `build-mocks.mjs`, `capture.mjs` | Write the mocks and the screenshots |

## What is proposed
- **The switch:** two buttons, English and Filipino, in one outlined pill on the same line as "Room: ...", right-aligned (owner, s36) (30 px tall, 12 px text; WCAG 2.2 minimum target is 24 px). The chosen one is filled and has a check mark, so colour is not the only signal. Choice kept on the phone (localStorage), default English; the page's `lang` attribute follows it.
- **Everything the app says** moves into one English list and one Filipino list. Not translated on purpose: the brand "Init", "heat index" (PAGASA uses the English term), units, and numbers.
- **Not covered by the first version (say if you want them):** the `#heat` page paragraphs, the `#guide` pages, the admin view, alerts push text, the kiosk and the poster. The proposal is to do the home, school day, alerts page and status texts first; the long advice and guide pages after a teacher has reviewed the first set.

## Draft Filipino (to be reviewed)
| English | Filipino draft |
|---|---|
| Room | Silid |
| Temperature | Temperatura |
| Humidity | Halumigmig |
| Caution / Extreme caution | Pag-iingat / Matinding pag-iingat |
| Danger / Extreme danger | Panganib / Matinding panganib |
| What does this mean? | Ano ang ibig sabihin nito? |
| School day summary | Buod ng araw sa paaralan |
| Heat alerts | Mga babala sa init |
| updated just now | na-update ngayon lang |
| Offline: no reading for 12 min | Offline: walang reading sa loob ng 12 min |
| last reading 12 min ago | huling reading 12 min na ang nakalipas |
