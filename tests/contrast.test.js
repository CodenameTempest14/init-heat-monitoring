import test from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, checkTokens } from '../design/contrast.mjs';

test('WCAG contrast ratio: known values', () => {
  assert.equal(contrastRatio('#000000', '#ffffff').toFixed(2), '21.00');
  assert.equal(contrastRatio('#ffffff', '#ffffff').toFixed(2), '1.00');
  // #767676 on white is the classic "just passes 4.5:1" grey (4.54)
  assert.equal(contrastRatio('#767676', '#ffffff').toFixed(2), '4.54');
  assert.equal(contrastRatio('#777777', '#ffffff').toFixed(2), '4.48');
});

test('ratio is symmetric and accepts short hex', () => {
  assert.equal(contrastRatio('#fff', '#000').toFixed(2), '21.00');
  assert.equal(contrastRatio('#123456', '#abcdef'), contrastRatio('#abcdef', '#123456'));
});

test('rejects bad colours', () => {
  assert.throws(() => contrastRatio('red', '#fff'), TypeError);
});

test('checkTokens reports failures with names', () => {
  const bad = {
    themes: { light: { bg: '#ffffff', text: '#eeeeee' } },
    heat: { x: { fill: '#ffffff', text: '#eeeeee', border: { light: '#f0f0f0' } } },
  };
  const failures = checkTokens(bad);
  assert.ok(failures.some((f) => f.includes('theme light text')));
  assert.ok(failures.some((f) => f.includes('heat x text on fill')));
  assert.ok(failures.some((f) => f.includes('heat x border on light')));
});

test('checkTokens checks the status (online/offline/waiting) text colours on the page background', () => {
  const t = { themes: { light: { bg: '#ffffff', text: '#000000' } }, heat: {}, status: { online: { light: '#eeeeee' } } };
  assert.ok(checkTokens(t).some((f) => f.includes('status online on light bg')));
  assert.deepEqual(checkTokens({ ...t, status: { online: { light: '#000000' } } }), []);
});
