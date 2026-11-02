// The new page header (P04-05, owner-approved s18): logo and title line centred; the room and status follow, left.
// The mocks in home-cards/, offline-badge/ and history-charts/ use this, so they match the app (web/src/App.jsx).
// The logo files are web/public/logo-*.svg (made by web/build-icons.mjs from design/brand/).
export const HEADER_TOP = '<picture class="app-logo"><source media="(prefers-color-scheme: dark)" srcset="../../web/public/logo-dark.svg"><img src="../../web/public/logo-light.svg" width="110" height="40" alt=""></picture><h1 class="app-fullname">Init: Indoor Heat Index Tracker</h1>';
