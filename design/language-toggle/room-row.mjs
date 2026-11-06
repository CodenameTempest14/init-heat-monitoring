// The Room line with the English / Filipino switch (P06-05, owner approved s36). Shared by the home, badge, history, school-day and alerts mocks
// so they match web/src/App.jsx + Lang.jsx. `text` is the whole line, e.g. 'Room: Room 204'; English is the chosen language.
export const ROOM_ROW = (text) => `<div class="room-row"><p class="text-secondary app-room">${text}</p><div class="lang-switch" role="group" aria-label="Language / Wika"><button type="button" class="lang-btn" lang="en" aria-pressed="true"><span aria-hidden="true">✓ </span>English</button><button type="button" class="lang-btn" lang="fil" aria-pressed="false">Filipino</button></div></div>`;
export const LANG_CSS_LINK = '<link rel="stylesheet" href="../../web/src/lang.css">';
