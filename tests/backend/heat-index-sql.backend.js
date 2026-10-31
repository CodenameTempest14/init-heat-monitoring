// D-023: the SQL heat index must give the same answers as src/heat-index.js,
// checked against the same shared table (D-015) and on a grid against the JS itself.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { heatIndexC } from '../../src/heat-index.js';
import { anon, service } from './_helpers.js';

const ref = JSON.parse(readFileSync(new URL('../heat-index-reference.json', import.meta.url), 'utf8'));
const fToC = (f) => (f - 32) / 1.8;
const sqlHI = (temp_c, rh) => service('rpc/heat_index_c', { method: 'POST', body: { temp_c, rh } });

test('chart rows match the NWS chart', async () => {
  for (const { tF, rh, hiF } of ref.chart) {
    const res = await sqlHI(fToC(tF), rh);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const gotF = res.body * 1.8 + 32;
    assert.ok(Math.abs(gotF - hiF) <= ref.chartToleranceF, `${tF}F ${rh}%: got ${gotF.toFixed(2)}F, chart ${hiF}F`);
  }
});

test('the two NWS adjustments match', async () => {
  for (const { name, tF, rh, hiF, toleranceF } of ref.adjustments) {
    const gotF = (await sqlHI(fToC(tF), rh)).body * 1.8 + 32;
    assert.ok(Math.abs(gotF - hiF) <= toleranceF, `${name}: got ${gotF.toFixed(3)}F, want ${hiF}F`);
  }
});

test('below the NWS range gives null, including the documented 80F/40% edge', async () => {
  const cases = [...ref.belowRange, { tC: fToC(ref.boundary.tF), rh: ref.boundary.rh }];
  for (const { tC, rh } of cases) {
    const res = await sqlHI(tC, rh);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body, null, `${tC}C ${rh}%`);
  }
});

test('invalid numbers are refused, like the JS', async () => {
  // The string cases in the table are a JS type check; SQL arguments are typed, so only the numeric ones apply.
  const numeric = ref.invalid.filter((c) => typeof c.tC !== 'string' && typeof c.rh !== 'string');
  assert.ok(numeric.length >= 4, 'expected null and out-of-range cases in the table');
  for (const { tC, rh } of numeric) {
    const res = await sqlHI(tC, rh);
    assert.equal(res.status, 400, `${tC}C ${rh}% should be refused, got ${res.status} ${JSON.stringify(res.body)}`);
  }
});

test('SQL equals the JS on a grid of classroom values', async () => {
  const cases = [];
  for (let t = 20; t <= 46; t += 1.3) for (let rh = 5; rh <= 100; rh += 7.5) cases.push([+t.toFixed(1), rh]);
  const results = await Promise.all(cases.map(([t, rh]) => sqlHI(t, rh)));
  cases.forEach(([t, rh], i) => {
    const js = heatIndexC(t, rh);
    const sql = results[i].body;
    if (js === null) assert.equal(sql, null, `${t}C ${rh}%: JS null, SQL ${sql}`);
    else assert.ok(Math.abs(sql - js) < 1e-9, `${t}C ${rh}%: JS ${js}, SQL ${sql}`);
  });
});

test('the public cannot call the heat index function directly', async () => {
  const res = await anon('rpc/heat_index_c', { method: 'POST', body: { temp_c: 30, rh: 60 } });
  assert.equal(res.body?.code, '42501', JSON.stringify(res.body));
});
