# design/device-setup/proposal-logo/

**Proposal, not approved (s14, 2026-11-02).** The approved setup page with the Init icon (D-029) centred above the
title, as the owner asked, and the title in capitals (`INIT SETUP`, owner's request; the "Saved" page title is
unchanged until the owner says). The icon is inline SVG (about 500 bytes; the page grows from about 2.1 KB to 2.6 KB) and
gets the light edge on dark backgrounds, as in `design/brand/init-icon-dark.svg`.

Screenshots: `ref/` (`node design/device-setup/capture.mjs design/device-setup/proposal-logo`).
If the owner approves: copy these three files over `../form.html`, `../form-error.html` and `../saved.html`, re-run
the capture for `../ref/`, change `HEAD` and the headers in `firmware/init/include/wifi_setup.h` until
`tests/firmware-setup-page.test.js` passes, then flash and look at it on the phone. Delete this folder afterwards.
