// P04-02: the page's copy of the PAGASA bands (web/src/category.js) must give the same answer as the tested original
// (src/heat-index.js, D-019), because the web package cannot import from outside web/ on Vercel.
import test from 'node:test';
import assert from 'node:assert/strict';
import { heatCategory as original } from '../src/heat-index.js';
import { categoryOf, CATEGORY_LABEL } from '../web/src/category.js';

test('same category as src/heat-index.js for every 0.1 °C from -20 to 80, and for null', () => {
  for (let i = -200; i <= 800; i++) {
    const hi = i / 10;
    assert.equal(categoryOf(hi), original(hi) ?? 'below-range', `heat index ${hi}`);
  }
  assert.equal(categoryOf(null), 'below-range');
});

test('band edges after rounding to whole degrees (D-019)', () => {
  assert.equal(categoryOf(26.4), 'below-range');
  assert.equal(categoryOf(26.5), 'caution'); // rounds to 27
  assert.equal(categoryOf(32.4), 'caution');
  assert.equal(categoryOf(32.5), 'extreme-caution'); // rounds to 33
  assert.equal(categoryOf(41.4), 'extreme-caution');
  assert.equal(categoryOf(41.5), 'danger'); // rounds to 42
  assert.equal(categoryOf(51.4), 'danger');
  assert.equal(categoryOf(51.5), 'extreme-danger'); // rounds to 52
});

test('numbers arrive from Postgres as strings; junk or missing values give no category (never "cool"), not a crash', () => {
  assert.equal(categoryOf('40.2'), 'extreme-caution');
  assert.equal(categoryOf(undefined), null);
  assert.equal(categoryOf('abc'), null);
  assert.equal(categoryOf(NaN), null);
  assert.equal(categoryOf(Infinity), null);
});

test('every category has the words shown on the approved cards', () => {
  assert.deepEqual(CATEGORY_LABEL, {
    'caution': 'Caution',
    'extreme-caution': 'Extreme caution',
    'danger': 'Danger',
    'extreme-danger': 'Extreme danger',
    'below-range': 'Below heat-index range',
  });
});
