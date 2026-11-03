// Writes the P05-04 mocks: the approved settings page (proposal B) with a read-only "Device health" group between Room and Device.
// Usage: node design/admin/health/build-mocks.mjs   (then capture.mjs). Made-up values only.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const base = readFileSync(join(here, '..', 'proposal-b', 'b-settings.html'), 'utf8');

const ico = {
  ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7.5"/></svg>',
  warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2z"/><path d="M12 10v4M12 17.5v.01"/></svg>',
  bad: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
};
const state = (kind, word) => `<span class="ab-state ab-state-${kind}">${ico[kind]}${word}</span>`;
const row = (label, hint, value) =>
  `<div class="ab-row"><div class="ab-row-text"><span class="fw-semibold d-block">${label}</span><small>${hint}</small></div><div class="ab-val">${value}</div></div>`;
const HOW = '<a class="ab-how" href="#guide/health"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.01"/></svg>How? ›</a>';
const group = (rows, note) => `
    <p class="ab-group-label">Device health</p>
    <div class="ab-group">
      ${rows.join('\n      ')}
    </div>${note ? `\n    <p class="ab-health-note">${note}</p>` : ''}
    ${HOW}`;

const states = {
  'h-ok': group([
    row('Wi-Fi signal', 'Stronger is closer to 0', `${state('ok', 'Good')}<small>−58 dBm</small>`),
    row('Last restart', 'Why the device last started', `Power on<small>POWERON</small>`),
    row('Firmware', 'Version on the device', '0.5.0'),
    row('Last report', 'When it last sent a reading', `${state('ok', 'Just now')}<small>1 min ago</small>`),
  ]),
  'h-trouble': group([
    row('Wi-Fi signal', 'Stronger is closer to 0', `${state('warn', 'Weak')}<small>−81 dBm</small>`),
    row('Last restart', 'Why the device last started', `${state('warn', 'Stopped responding')}<small>TASK_WDT</small>`),
    row('Firmware', 'Version on the device', '0.5.0'),
    row('Last report', 'When it last sent a reading', `${state('bad', 'Late')}<small>6 min ago</small>`),
  ], 'A weak signal or repeated restarts can leave gaps in the readings.'),
  'h-none': group([
    row('Wi-Fi signal', 'Stronger is closer to 0', '<small>Not reported yet</small>'),
    row('Last restart', 'Why the device last started', '<small>Not reported yet</small>'),
    row('Firmware', 'Version on the device', '<small>Not reported yet</small>'),
  ], 'This device has not sent its health yet. It does after its next firmware update.'),
};

states['h-saved'] = states['h-ok']; // the page right after a save (the approved b-saved mock) with the same health
const savedBase = readFileSync(join(here, '..', 'proposal-b', 'b-saved.html'), 'utf8');

for (const [name, block] of Object.entries(states)) {
  const html = (name === 'h-saved' ? savedBase : base)
    .replace(/<title>Init: mock B b-\w+<\/title>/, `<title>Init: mock P05-04 ${name}</title>`)
    .replace('href="admin-b.css"', 'href="../proposal-b/admin-b.css">\n<link rel="stylesheet" href="health.css"')
    .replaceAll('../../../web', '../../../web')
    .replace('\n    <p class="ab-group-label">Device</p>', `${block}\n\n    <p class="ab-group-label">Device</p>`);
  if (!html.includes('Device health')) throw new Error('insert point not found');
  writeFileSync(join(here, `${name}.html`), html);
  console.log(`${name}.html`);
}
