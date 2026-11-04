// P05-03 (P5-g): the words of a heat alert. supabase/functions/_shared/alert-message.js is run by the Edge Function
// (Deno) and checked here with Node, so the wording and the levels are tested without deploying anything.
import test from 'node:test';
import assert from 'node:assert/strict';
import { alertMessage, levelName } from '../supabase/functions/_shared/alert-message.js';
import { heatCategory } from '../src/heat-index.js';

test('title and body as approved in the design (section 4)', () => {
  const m = alertMessage({ heat_index_c: 43, room: 'Room 204' });
  assert.equal(m.title, 'Init heat alert');
  assert.equal(m.body, 'Heat index 43 °C (Danger) in Room 204.');
  assert.equal(m.url, '/');
});

test('the heat index is shown rounded, like the page; the level uses the same rounded value', () => {
  assert.equal(alertMessage({ heat_index_c: 41.6, room: 'Room 1' }).body, 'Heat index 42 °C (Danger) in Room 1.');
  assert.equal(alertMessage({ heat_index_c: '51.5', room: 'Room 1' }).body, 'Heat index 52 °C (Extreme danger) in Room 1.');
  assert.equal(alertMessage({ heat_index_c: 35.2, room: 'Room 1' }).body, 'Heat index 35 °C (Extreme caution) in Room 1.');
});

test('a room left Unassigned reads "in Unassigned", as on the OLED', () => {
  assert.equal(alertMessage({ heat_index_c: 44, room: 'Unassigned' }).body, 'Heat index 44 °C (Danger) in Unassigned.');
  assert.equal(alertMessage({ heat_index_c: 44, room: null }).body, 'Heat index 44 °C (Danger) in Unassigned.');
});

test('the level names follow the same PAGASA bands as src/heat-index.js for every tenth from 27 to 60', () => {
  const names = { caution: 'Caution', 'extreme-caution': 'Extreme caution', danger: 'Danger', 'extreme-danger': 'Extreme danger' };
  for (let x = 270; x <= 600; x += 1) {
    const hi = x / 10;
    assert.equal(levelName(hi), names[heatCategory(hi)], `at ${hi}`);
  }
});
