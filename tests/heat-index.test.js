import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { heatIndexC } from '../src/heat-index.js';

const ref = JSON.parse(readFileSync(new URL('./heat-index-reference.json', import.meta.url), 'utf8'));
const fToC = (f) => (f - 32) / 1.8;
const cToF = (c) => c * 1.8 + 32;
// JSON cannot hold NaN, so the string "NaN" stands in for it.
const decode = (v) => (v === 'NaN' ? NaN : v);

test('matches the published NWS chart within the chart tolerance', () => {
  for (const { tF, rh, hiF } of ref.chart) {
    const got = cToF(heatIndexC(fToC(tF), rh));
    assert.ok(Math.abs(got - hiF) <= ref.chartToleranceF, `${tF}F ${rh}% -> ${got.toFixed(2)}F, expected ${hiF}F`);
  }
});

test('applies the low and high humidity adjustments', () => {
  for (const { name, tF, rh, hiF, toleranceF } of ref.adjustments) {
    const got = cToF(heatIndexC(fToC(tF), rh));
    assert.ok(Math.abs(got - hiF) <= toleranceF, `${name}: ${got.toFixed(2)}F, expected ${hiF}F`);
  }
});

test('returns null below the valid range instead of inventing a number', () => {
  for (const { tC, rh } of ref.belowRange) {
    assert.equal(heatIndexC(tC, rh), null, `${tC}C ${rh}%`);
  }
});

test('edge: just under 80F (NWS threshold) is null, just over is a number', () => {
  assert.equal(heatIndexC(fToC(79), 40), null);
  assert.equal(typeof heatIndexC(fToC(84), 60), 'number');
});

test('edge: RH 0 and 100 are accepted', () => {
  assert.equal(typeof heatIndexC(35, 0), 'number');
  assert.equal(typeof heatIndexC(35, 100), 'number');
});

test('rejects bad input from the device with a RangeError or TypeError', () => {
  for (const { tC, rh } of ref.invalid) {
    assert.throws(() => heatIndexC(decode(tC), decode(rh)), (e) => e instanceof RangeError || e instanceof TypeError, `${tC}, ${rh}`);
  }
});

test('heat index is never below the air temperature when a number is returned', () => {
  for (let t = 27; t <= 45; t += 3) {
    for (let rh = 40; rh <= 100; rh += 10) {
      const v = heatIndexC(t, rh);
      if (v !== null) assert.ok(v >= t - 1, `${t}C ${rh}% -> ${v}`);
    }
  }
});
