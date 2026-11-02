// P05 design: mock pages of the admin view (#admin): sign-in (P05-01), room (P05-06) and settings (P05-02).
// Template: Tabler sign-in.html and settings.html (pages.json "admin", Approved). Made-up account and room only.
// Usage: node design/admin/build-mocks.mjs   (writes <state>.html next to this file)
import { writeFileSync } from 'node:fs';
import { HEADER_TOP } from '../pwa/header.mjs';

const EMAIL = 'admin@example.com'; // made up, never a real address
const WARN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2z"/><path d="M12 10v4M12 17.5v.01"/></svg>';
const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';

const head = (title) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Init: mock ${title}</title>
<link rel="stylesheet" href="../../web/node_modules/@tabler/core/dist/css/tabler.min.css">
<link rel="stylesheet" href="../../web/src/tokens.css">
<link rel="stylesheet" href="../../web/src/app.css">
<link rel="stylesheet" href="../../web/src/charts.css">
<link rel="stylesheet" href="../../web/src/school.css">
<link rel="stylesheet" href="../../web/src/admin.css">
</head>`;
const page = (title, body) => `${head(title)}
<body>
<main class="app-wrap">
  <header class="app-head">${HEADER_TOP}</header>
  <a class="school-back" href="#">‹ Live readings</a>
  ${body}
</main>
</body>
</html>
`;

function signIn(error) {
  return `<h2 class="admin-title">Admin sign in</h2>
  <p class="admin-intro">Only the school's admin has an account. Viewing the readings needs no sign-in.</p>
  <form class="card admin-card"><div class="card-body">
    ${error ? `<div class="alert alert-danger" role="alert">${error}</div>` : ''}
    <div class="admin-field"><label class="form-label" for="email">Email address</label>
      <input class="form-control" id="email" type="email" autocomplete="username" value="${error ? EMAIL : ''}" placeholder="admin@school.example"></div>
    <div class="admin-field"><label class="form-label" for="pw">Password</label>
      <input class="form-control" id="pw" type="password" autocomplete="current-password" value="${error ? 'xxxxxxxxxxxx' : ''}"></div>
    <button type="submit" class="btn btn-primary w-100 admin-btn">Sign in</button>
  </div></form>`;
}

const who = `<div class="admin-who"><span>Signed in as <strong>${EMAIL}</strong></span>
  <button type="button" class="btn admin-btn">Sign out</button></div>`;

const notAdmin = `<h2 class="admin-title">Admin</h2>${who}
  <div class="card admin-card"><div class="card-body">
    <div class="alert alert-warning mb-0" role="alert">This account is not an admin. Nothing here can be changed with it.</div>
  </div></div>`;

function settings({ roomSaved } = {}) {
  return `<h2 class="admin-title">Admin</h2>${who}
  <form class="card admin-card"><div class="card-body">
    <h3 class="card-title">Room</h3>
    <div class="admin-field"><label class="form-label" for="room">Where the device is now</label>
      <input class="form-control" id="room" maxlength="60" value="${roomSaved ? 'Room 305' : 'Room 204'}">
      <small class="form-hint">Use a room name such as Room 204. Do not use people's names. New readings get the new room; old readings keep theirs.</small></div>
    <div class="admin-actions"><button type="submit" class="btn btn-primary admin-btn">Save room</button>
      ${roomSaved ? `<span class="admin-saved" role="status">${TICK}Saved</span>` : ''}</div>
  </div></form>
  <form class="card admin-card"><div class="card-body">
    <h3 class="card-title">Device settings</h3>
    <div class="admin-field"><label class="form-label" for="iv">Reporting interval (seconds)</label>
      <input class="form-control" id="iv" type="number" min="60" max="3600" step="1" value="60">
      <small class="form-hint">60 to 3600. The device picks it up on its next upload.</small>
      <p class="admin-warn">${WARN}<span>On the power bank, keep it at 60 s. A longer gap can let the bank switch itself off.</span></p></div>
    <div class="admin-pair">
      <div class="admin-field"><label class="form-label" for="to">Temperature offset (°C)</label>
        <input class="form-control" id="to" type="number" min="-5" max="5" step="0.1" value="0.0">
        <small class="form-hint">−5.0 to +5.0</small></div>
      <div class="admin-field"><label class="form-label" for="ho">Humidity offset (%)</label>
        <input class="form-control" id="ho" type="number" min="-10" max="10" step="0.1" value="0.0">
        <small class="form-hint">−10.0 to +10.0</small></div>
    </div>
    <p class="form-hint mt-0 mb-3">Offsets are added to new readings only, after a check against a reference thermometer.</p>
    <div class="admin-pair">
      <div class="admin-field"><label class="form-label" for="al">Alert at heat index (°C)</label>
        <input class="form-control" id="al" type="number" min="27" max="60" step="1" value="42">
        <small class="form-hint">42 = Danger</small></div>
      <div class="admin-field"><label class="form-label" for="qp">Quiet period (min)</label>
        <input class="form-control" id="qp" type="number" min="10" max="1440" step="1" value="60">
        <small class="form-hint">10 to 1440</small></div>
    </div>
    <p class="form-hint mt-0 mb-3">Heat alerts come in a later step; these two are stored now.</p>
    <button type="submit" class="btn btn-primary admin-btn">Save settings</button>
  </div></form>`;
}

const states = {
  'admin-sign-in': signIn(),
  'admin-sign-in-error': signIn('Email or password is wrong.'),
  'admin-not-admin': notAdmin,
  'admin-settings': settings(),
  'admin-room-saved': settings({ roomSaved: true }),
};
for (const [name, body] of Object.entries(states)) { writeFileSync(new URL(`./${name}.html`, import.meta.url), page(name, body)); console.log(`${name}.html`); }
