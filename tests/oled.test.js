// OLED-GATE (P03-D3): every screen drawn by design/oled/screens.mjs must equal its approved 1:1 image in design/oled/ref/.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCREENS, drawScreen } from '../design/oled/screens.mjs';
import { diffAgainstPng } from '../design/oled/compare.mjs';

const refPng = (id) => readFileSync(new URL(`../design/oled/ref/${id}.png`, import.meta.url));

test('every screen equals its approved reference image, pixel for pixel', () => {
  assert.equal(SCREENS.length, 9);
  for (const spec of SCREENS) {
    const diff = diffAgainstPng(drawScreen(spec), refPng(spec.id));
    assert.equal(diff.length, 0, `${spec.id}: ${diff.length} pixels differ, first at ${JSON.stringify(diff[0])}`);
  }
});

test('the gate fails on a deliberate mismatch: one flipped pixel', () => {
  const spec = SCREENS[0];
  const s = drawScreen(spec);
  s.px[30 * 128 + 60] ^= 1;
  assert.equal(diffAgainstPng(s, refPng(spec.id)).length, 1);
});

test('the gate fails on a deliberate mismatch: a different number', () => {
  const spec = SCREENS[1];
  const s = drawScreen(spec);
  s.fillRect(2, 12, 48, 32, 0);
  s.text(2, 12, 4, '41'); // the approved image shows 40
  assert.ok(diffAgainstPng(s, refPng(spec.id)).length > 0);
});

test('the gate fails when the screen is compared with the wrong reference image', () => {
  assert.ok(diffAgainstPng(drawScreen(SCREENS[0]), refPng(SCREENS[4].id)).length > 0);
});
