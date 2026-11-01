// The C++ heat index on the device (firmware/init/include/heat_index.h) must give what src/heat-index.js gives (D-015).
// Builds firmware/init/tests/heat_index_test.cpp with g++ and feeds it points from the JS code and the shared reference JSON.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { heatIndexC, heatCategory } from '../src/heat-index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ref = JSON.parse(readFileSync(path.join(root, 'tests/heat-index-reference.json'), 'utf8'));
const fToC = (f) => (f - 32) / 1.8;

function points() {
  const pts = [];
  // the points of the shared reference table (chart, adjustments, below range, the NWS edge)
  for (const c of [...ref.chart, ...ref.adjustments, ref.boundary]) pts.push([fToC(c.tF), c.rh]);
  for (const c of ref.belowRange) pts.push([c.tC, c.rh]);
  // a coarse grid over the whole DHT22 range that makes sense indoors, and a fine one at the sensor's 0.1 steps
  for (let t = -10; t <= 60; t += 0.5) for (let rh = 0; rh <= 100; rh += 2) pts.push([t, rh]);
  for (let t10 = 250; t10 <= 450; t10++) for (let rh = 30; rh <= 100; rh++) pts.push([t10 / 10, rh]);
  return pts;
}

const lines = () => points().map(([t, rh]) => {
  const hi = heatIndexC(t, rh);
  return `${t} ${rh} ${hi === null ? 'null' : hi} ${heatCategory(hi) ?? '-'}`;
}).join('\n');

function build(dir) {
  const exe = path.join(dir, process.platform === 'win32' ? 'hi.exe' : 'hi');
  const r = spawnSync('g++', ['-std=c++17', '-Wall', '-Wextra', '-o', exe, path.join(root, 'firmware/init/tests/heat_index_test.cpp')], { encoding: 'utf8' });
  assert.equal(r.status, 0, `g++ failed (is it installed?):\n${r.stderr}`);
  return exe;
}

test('the device C++ gives the same heat index and PAGASA band as the JS on about 20 000 points', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'hi-'));
  try {
    const run = spawnSync(build(dir), [], { input: lines(), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.match(run.stdout, /all passed \(\d+ points\)/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the check can fail: a wrong expected value is reported', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'hi-'));
  try {
    const run = spawnSync(build(dir), [], { input: '33 70 99.9 caution\n', encoding: 'utf8' });
    assert.notEqual(run.status, 0);
    assert.match(run.stdout, /FAIL 33 70/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
