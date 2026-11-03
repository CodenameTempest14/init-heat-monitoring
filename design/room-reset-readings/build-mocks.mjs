// F-23 / F-24 design mocks (made-up data, made-up room "Room 204"). Usage: node design/room-reset-readings/build-mocks.mjs
//  - f23-reset-before / f23-reset-after: the admin page of proposal B with a Reset button beside the room box
//  - f24-readings / f24-readings-empty: the History section with the readings table, date range, Show more and Download CSV
import { readFileSync, writeFileSync } from 'node:fs';

const here = (f) => new URL(`./${f}`, import.meta.url);
const NOTE = 'Reset puts Unassigned in the box. Press Save to keep it. Old readings keep their room.';

// ---- F-23: edit the approved admin mock ----
const admin = readFileSync(new URL('../admin/proposal-b/b-settings.html', import.meta.url), 'utf8');
const OLD = '<input class="form-control" id="room" maxlength="60" value="Room 204">';
if (!admin.includes(OLD)) throw new Error('room input not found in b-settings.html');
for (const [id, value, dis] of [['f23-reset-before', 'Room 204', false], ['f23-reset-after', 'Unassigned', true]]) {
  const html = admin
    .replaceAll('../../../web', '../../web')
    .replace('href="admin-b.css"', 'href="../admin/proposal-b/admin-b.css"><link rel="stylesheet" href="rr.css"')
    .replace(OLD, `<div class="rr-roomrow"><input class="form-control" id="room" maxlength="60" value="${value}"><button type="button" class="btn rr-reset"${dis ? ' disabled' : ''}>Reset</button></div>`)
    .replace('<title>Init: mock B b-settings</title>', `<title>Init: mock ${id}</title>`)
    .replace("A room name only, never a person's name. Old readings keep their room.", `A room name only, never a person's name. ${NOTE}`);
  writeFileSync(here(`${id}.html`), html);
  console.log(`${id}.html`);
}

// ---- F-24: the approved 24 h history mock with the shared readings section (design/room-reset-readings/section.mjs) ----
const src = (f) => readFileSync(new URL(`../history-charts/${f}.html`, import.meta.url), 'utf8');
for (const [id, state, from] of [['f24-readings', 'rows', '24h'], ['f24-readings-empty', 'none', 'empty']]) {
  writeFileSync(here(`${id}.html`), src(from).replace(/<title>[^<]*<[/]title>/, `<title>Init: mock ${id}</title>`));
  console.log(`${id}.html (same as history-charts/24h.html, which now carries the section; state ${state})`);
}
