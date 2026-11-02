// The PC tests of the firmware headers that have no Arduino code in them (firmware/init/tests/*_test.cpp).
// heat_index_test.cpp needs input and has its own test (firmware-heat-index.test.js). Needs g++.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const name of ['interval', 'room', 'readings', 'wifi_setup']) {
  test(`firmware/init/tests/${name}_test.cpp builds and passes`, () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'fw-'));
    try {
      const exe = path.join(dir, process.platform === 'win32' ? 't.exe' : 't');
      const build = spawnSync('g++', ['-std=c++17', '-Wall', '-Wextra', '-Werror', '-o', exe, path.join(root, `firmware/init/tests/${name}_test.cpp`)], { encoding: 'utf8' });
      assert.equal(build.status, 0, `g++ failed:\n${build.stderr}`);
      const run = spawnSync(exe, [], { encoding: 'utf8' });
      assert.equal(run.status, 0, run.stdout);
      assert.match(run.stdout, /all passed/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}
