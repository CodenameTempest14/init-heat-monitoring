// The device's health object (firmware/init/include/health.h, P05-04) must only use what the server accepts.
// Builds firmware/init/tests/health_test.cpp with g++, runs its checks, and compares the reset names it can send
// with the list in the health migration (a name the server does not know would make it refuse the whole batch).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function build(dir) {
  const exe = path.join(dir, process.platform === 'win32' ? 'health.exe' : 'health');
  const r = spawnSync('g++', ['-std=c++17', '-Wall', '-Wextra', '-o', exe, path.join(root, 'firmware/init/tests/health_test.cpp')], { encoding: 'utf8' });
  assert.equal(r.status, 0, `g++ failed (is it installed?):\n${r.stderr}`);
  return exe;
}

test('health.h: the PC checks pass, and every reset name the device can send is in the server list', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'health-'));
  try {
    const exe = build(dir);
    const run = spawnSync(exe, [], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stdout);
    assert.match(run.stdout, /all passed/);

    const names = new Set(spawnSync(exe, ['names'], { encoding: 'utf8' }).stdout.split(/\r?\n/).filter(Boolean));
    const sql = readFileSync(path.join(root, 'supabase/migrations/20261106120000_device_health.sql'), 'utf8');
    const allowed = new Set(sql.match(/reset_reason in\s*\(([^)]*)\)/)[1].match(/'([A-Z_]+)'/g).map((s) => s.slice(1, -1)));
    for (const n of names) assert.ok(allowed.has(n), `the device can send ${n}, which the server does not accept`);
    assert.deepEqual([...allowed].sort(), [...names].sort(), 'the server list and the device list differ');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
