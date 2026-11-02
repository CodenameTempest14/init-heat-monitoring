# P04-01 Proposal: app skeleton on free hosting

**Status: PROPOSAL, not approved (s15, 2026-11-02). Nothing is built.** Written for the owner to approve or change.
Features F-01 to F-07 and F-12 are already approved (D-010). This proposal only decides *how the first skeleton is built and where it lives*.

## What P04-01 is
A tiny web page, built in a `web/` folder and live on a free hosting URL, that reads the newest reading from the
backend as a logged-out visitor. It has no cards, no chart and no PWA yet (those are P04-02 to P04-05). The point is
to prove the whole path works once: **GitHub, then hosting, then the browser, then Supabase (public read)**.

## Decisions I need from you

### 1. Hosting (D-002 left this open: Cloudflare Pages or Vercel) — **DECIDED: Vercel (owner, 2026-11-02, D-030)**
| Option | For | Against |
|---|---|---|
| **A. Cloudflare Pages (recommended)** | Free plan; deploys from the GitHub repo on every push; a `_headers` file lets us set security headers such as a Content-Security-Policy (matches "server side is authoritative"). | One more account to make. |
| B. Vercel | Free hobby plan; also deploys from GitHub; easy previews. | Free hobby plan is for non-commercial use, so we would need to keep it that way; one more account. |
| C. GitHub Pages | No new account (the repo is already on GitHub). | Cannot set custom headers, so no CSP header. |

I'll re-check the current free-plan terms on the provider's own page before we commit to one. I am working from memory of them.

### 2. How to build it: no build step (recommended)
Plain HTML, CSS and JavaScript modules in `web/`. No npm build, no framework.
- **Why:** you are learning, and with no build step you can open the file and read exactly what the browser runs. Fewer
  dependencies means fewer things to update or to go wrong. The app is small (one live page, one chart).
- **Tabler (MIT, already chosen for the pages):** copy its CSS file into `web/vendor/` (not loaded from a CDN, so the
  page works if the CDN is down and the CSP can stay strict). Licence file kept next to it (D-010).
- **Data access:** plain `fetch` to the Supabase REST address with the public (anon) key, instead of the `supabase-js`
  library. Smaller, and you can see every request. (The library can be added later if the admin sign-in in P05 needs it.)
- **Chart (P04-04, later):** a small MIT chart library, chosen then, not now.
- **Our colours:** `design/tokens.json` is turned into `web/tokens.css` by a small script, so the approved colours are the single source.

Alternative: a framework and build tool (for example Vite). More power, but more to learn and more to maintain. I
would only suggest it if you want to learn that.

### 3. Which backend does the first skeleton read?
- **Recommended: `init-test`**, as D-026 did for the firmware. Live `init` has no readings yet and still lacks the 7th
  migration. We switch the address to live in one place when the board moves to live (P07).
- The public (anon) key is meant to be public: row-level rules only allow `SELECT` on four tables (SCHEMA.md). It may
  be written into `web/config.js`. **Please confirm** that you are comfortable with the anon key in the repo and in a
  public site. The secret key and the device keys never go near `web/`.

## What I would build (only after you approve)
1. `web/` with a README: `index.html` (Tabler shell, one heading, one box that shows the latest reading and "updated N min ago"), `config.js` (address and anon key), `tokens.css` (generated), `vendor/` (Tabler CSS and licence).
2. Test first: a PC test that the "updated N min ago" and the row-to-text code give the right answer for fixed inputs (red first).
3. Deploy to the free host from the GitHub repo.
4. Security check: headers in `vercel.json` (Vercel, D-030) with a CSP that allows only our own files and the Supabase address; look at the console for blocked requests.

## How P04-01 will be called done (evidence I will show)
- The hosted address opened in a **logged-out** private browser window shows the newest init-test reading (screenshot, no personal data).
- The same address on your phone.
- A direct anonymous write attempt from the page's address still fails (already tested server side; I re-run it).
- The Tabler page width is looked at at a 390 px viewport (open issue from s13: the Tabler dashboard is about 832 px wide). Our page must not scroll sideways.

## What this does NOT include
Cards and heat colours (P04-02), the offline badge (P04-03), charts (P04-04), manifest and service worker (P04-05), custom domain, admin.

## Your answers
1. Hosting: ~~A, B or C?~~ Vercel (D-030).
2. Build style: no build step (recommended), or a framework?
3. Read from `init-test` first, and anon key in the repo: OK?
