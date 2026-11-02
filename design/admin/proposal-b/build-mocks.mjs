// P05 design, proposal B: a simpler admin view. Centred sign-in card with icons; signed in, settings as grouped rows with
// units and one Save for everything. Same template family (Tabler sign-in / settings), same tokens. Made-up data only.
// Usage: node design/admin/proposal-b/build-mocks.mjs   (writes <state>.html next to this file)
import { writeFileSync } from 'node:fs';

const EMAIL = 'admin@example.com'; // made up
const HEADER = '<picture class="app-logo"><source media="(prefers-color-scheme: dark)" srcset="../../../web/public/logo-dark.svg"><img src="../../../web/public/logo-light.svg" width="110" height="40" alt=""></picture><h1 class="app-fullname">Init: Indoor Heat Index Tracker</h1>';
const I = {
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 7.2-7.2M15 8l3 3M17 6l2 2"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.01"/>',
  warn: '<path d="M12 3 22 21H2z"/><path d="M12 10v4M12 17.5v.01"/>',
  tick: '<path d="M5 12l5 5L20 7"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9.5 9.5 5 5M14.5 9.5l-5 5"/>',
};
const svg = (k, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;

const page = (title, body, { back = true } = {}) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Init: mock B ${title}</title>
<link rel="stylesheet" href="../../../web/node_modules/@tabler/core/dist/css/tabler.min.css">
<link rel="stylesheet" href="../../../web/src/tokens.css">
<link rel="stylesheet" href="../../../web/src/app.css">
<link rel="stylesheet" href="../../../web/src/charts.css">
<link rel="stylesheet" href="../../../web/src/school.css">
<link rel="stylesheet" href="admin-b.css">
</head>
<body>
<main class="app-wrap">
  <header class="app-head">${HEADER}</header>
  ${back ? '<a class="school-back" href="#">‹ Live readings</a>' : ''}
  ${body}
</main>
</body>
</html>
`;

function signIn(error) {
  return `<div class="ab-center"><form class="card ab-card"><div class="card-body">
    <div class="ab-badge">${svg('lock')}</div>
    <h2 class="ab-title">Admin</h2>
    <p class="ab-sub">Sign in to change the room and settings.</p>
    ${error ? `<div class="ab-alert" role="alert">${svg('alert')}${error}</div>` : ''}
    <div class="ab-field"><label class="visually-hidden" for="email">Email address</label>
      <div class="input-icon"><span class="input-icon-addon">${svg('mail')}</span>
      <input class="form-control" id="email" type="email" autocomplete="username" placeholder="Email address" value="${error ? EMAIL : ''}"></div></div>
    <div class="ab-field"><label class="visually-hidden" for="pw">Password</label>
      <div class="input-icon position-relative"><span class="input-icon-addon">${svg('key')}</span>
      <input class="form-control" id="pw" type="password" autocomplete="current-password" placeholder="Password" value="${error ? 'xxxxxxxxxxxx' : ''}">
      <button type="button" class="ab-eye" aria-label="Show password">${svg('eye')}</button></div></div>
    <button type="submit" class="btn btn-primary w-100 ab-btn">Sign in</button>
  </div></form>
  <p class="ab-foot">Viewing the readings needs no sign-in.</p></div>`;
}

const who = `<div class="ab-who"><span class="ab-avatar" aria-hidden="true">A</span>
  <div class="ab-who-text"><strong>${EMAIL}</strong><span>Admin</span></div>
  <button type="button" class="ab-link">Sign out</button></div>`;

const notAdmin = `<div class="ab-center"><div class="card ab-card ab-empty"><div class="card-body">
    <div class="ab-badge">${svg('shield')}</div>
    <h2 class="ab-title">Not an admin</h2>
    <p class="ab-sub">${EMAIL} can view the readings, but it cannot change anything here.</p>
    <button type="button" class="btn w-100 ab-btn">Sign out</button>
  </div></div></div>`;

const row = (id, label, hint, value, unit, attrs) => `<div class="ab-row"><div class="ab-row-text"><label for="${id}">${label}</label><small>${hint}</small></div>
      <div class="input-group"><input class="form-control" id="${id}" type="number" ${attrs} value="${value}"><span class="input-group-text">${unit}</span></div></div>`;

function settings({ saved } = {}) {
  return `${who}
  <form>
    <p class="ab-group-label">Room</p>
    <div class="ab-group"><div class="ab-row ab-row-wide"><label class="fw-semibold" for="room">Where the device is now</label>
      <input class="form-control" id="room" maxlength="60" value="${saved ? 'Room 305' : 'Room 204'}">
      <small class="d-block mt-1 text-secondary">A room name only, never a person's name. Old readings keep their room.</small></div></div>

    <p class="ab-group-label">Device</p>
    <div class="ab-group">
      ${row('iv', 'Reporting interval', '60 to 3600', 60, 's', 'min="60" max="3600" step="1"')}
      <div class="ab-note">${svg('warn')}<span>On the power bank keep it at 60 s, or the bank may switch off.</span></div>
      ${row('to', 'Temperature offset', '−5.0 to +5.0', '0.0', '°C', 'min="-5" max="5" step="0.1"')}
      ${row('ho', 'Humidity offset', '−10.0 to +10.0', '0.0', '%', 'min="-10" max="10" step="0.1"')}
    </div>

    <p class="ab-group-label">Heat alerts (coming later)</p>
    <div class="ab-group">
      ${row('al', 'Alert at heat index', '42 = Danger', 42, '°C', 'min="27" max="60" step="1"')}
      ${row('qp', 'Quiet period', '10 to 1440', 60, 'min', 'min="10" max="1440" step="1"')}
    </div>

    <div class="ab-save"><button type="submit" class="btn btn-primary ab-btn">Save changes</button>
      ${saved ? `<span class="ab-saved" role="status">${svg('tick')}Saved</span>` : ''}</div>
  </form>`;
}

const states = {
  'b-sign-in': signIn(),
  'b-sign-in-error': signIn('Email or password is wrong.'),
  'b-not-admin': notAdmin,
  'b-settings': settings(),
  'b-saved': settings({ saved: true }),
};
for (const [name, body] of Object.entries(states)) { writeFileSync(new URL(`./${name}.html`, import.meta.url), page(name, body)); console.log(`${name}.html`); }
