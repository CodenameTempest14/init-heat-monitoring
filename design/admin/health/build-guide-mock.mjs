// P05-04 guide mock (D-034): the new "Device health" part of the #guide page, as section 3 (the same order as the admin page:
// Room, Device health, Device). The other sections of design/admin-guide/guide.html stay as approved, only renumbered (4 to 7).
// Wording is a draft: a teacher reviews it before it goes live. Made-up values only.
// Usage: node design/admin/health/build-guide-mock.mjs   (writes guide-health.html next to this file)
import { writeFileSync } from 'node:fs';

const HEADER = '<picture class="app-logo"><source media="(prefers-color-scheme: dark)" srcset="../../../web/public/logo-dark.svg"><img src="../../../web/public/logo-light.svg" width="110" height="40" alt=""></picture><h1 class="app-fullname">Init: Indoor Heat Index Tracker</h1>';
const WARN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2z"/><path d="M12 10v4M12 17.5v.01"/></svg>';
const sec = (n, id, title, inner) => `<section class="gd-sec" id="${id}"><h2><span class="gd-num">${n}</span>${title}</h2>${inner}</section>`;

const toc = ['Before you start', 'Room', 'Device health', 'Reporting interval', 'Temperature and humidity offsets', 'Heat alerts', 'If something looks wrong']
  .map((t, i) => `<li><a href="#${['start', 'room', 'health', 'interval', 'offsets', 'alerts', 'wrong'][i]}">${t}</a></li>`).join('\n    ');

const health = sec(3, 'health', 'Device health', `
    <h3>What it does</h3>
    <p>It shows how the device is doing right now. It is only for looking. You cannot change anything here.</p>
    <h3>When to look at it</h3>
    <p>When readings are missing, or the page says Offline. It helps you find out why.</p>
    <h3>What each line means</h3>
    <table class="gd-table gd-table-text"><thead><tr><th>Line</th><th>What it tells you</th></tr></thead><tbody>
      <tr><td>Wi-Fi signal</td><td>How strong the connection is. <strong>Good</strong> and <strong>Fair</strong> are fine. <strong>Weak</strong> can make readings go missing.</td></tr>
      <tr><td>Last restart</td><td>Why the device last started. See the list below.</td></tr>
      <tr><td>Firmware</td><td>The version of the program on the device. Tell it to the person who set up the device when you ask for help.</td></tr>
      <tr><td>Last report</td><td>When the device last sent a reading. <strong>Late</strong> means more than 2 minutes ago.</td></tr></tbody></table>
    <h3>If the signal is Weak</h3>
    <p>Move the Wi-Fi hotspot closer to the device, or the device closer to the hotspot. Then look again after a few minutes.</p>
    <div class="gd-example"><span class="gd-label">Example</span>The number is in dBm, and closer to 0 is stronger. −58 dBm is stronger than −81 dBm.</div>
    <h3>If you see a restart reason</h3>
    <table class="gd-table gd-table-text"><thead><tr><th>It says</th><th>What to do</th></tr></thead><tbody>
      <tr><td>Power on</td><td>Nothing. Someone plugged the device in.</td></tr>
      <tr><td>Reset pin, Software restart</td><td>Nothing, if someone pressed the reset button or updated the device.</td></tr>
      <tr><td>Power dipped</td><td>The power was too low for a moment. Check the cable and the power bank.</td></tr>
      <tr><td>Stopped responding, Crash</td><td>The device froze and restarted by itself. If it keeps happening, tell the person who set up the device.</td></tr></tbody></table>
    <div class="gd-note">${WARN}<span>Not reported yet means the device has not sent its health. This is normal until it gets its next update.</span></div>`);

const body = `<h2 class="visually-hidden">Admin guide</h2>
  <p class="gd-intro">How to set up the device. Read it before you change anything.</p>
  <nav class="gd-toc" aria-label="Sections"><p>In this guide</p><ol>
    ${toc}
  </ol></nav>
  <p class="gd-intro">(Mock: only the new section is drawn. The other sections stay as approved.)</p>
  ${health}`;

writeFileSync(new URL('./guide-health.html', import.meta.url), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Init: mock P05-04 guide-health</title>
<link rel="stylesheet" href="../../../web/node_modules/@tabler/core/dist/css/tabler.min.css">
<link rel="stylesheet" href="../../../web/src/tokens.css">
<link rel="stylesheet" href="../../../web/src/app.css">
<link rel="stylesheet" href="../../../web/src/charts.css">
<link rel="stylesheet" href="../../../web/src/school.css">
<link rel="stylesheet" href="../../../web/src/admin.css">
<link rel="stylesheet" href="../../admin-guide/guide.css">
<link rel="stylesheet" href="health.css">
</head>
<body>
<main class="app-wrap">
  <header class="app-head">${HEADER}</header>
  <a class="school-back" href="#">‹ Admin</a>
  ${body}
</main>
</body>
</html>
`);
console.log('guide-health.html');
