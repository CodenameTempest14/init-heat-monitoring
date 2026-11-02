// P03-05 (D-011): the setup page the firmware builds (include/wifi_setup.h) must be exactly the page the owner
// approved in design/device-setup/ (same bytes, so the approved screenshots in ref/ hold for it). Needs g++.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('the firmware setup page equals the approved design, byte for byte', (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'fw-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const exe = path.join(dir, process.platform === 'win32' ? 'r.exe' : 'r');
  const build = spawnSync('g++', ['-std=c++17', '-Wall', '-Wextra', '-Werror', '-o', exe, path.join(root, 'firmware/init/tests/setup_page_render.cpp')], { encoding: 'utf8' });
  assert.equal(build.status, 0, `g++ failed:\n${build.stderr}`);

  for (const state of ['form', 'form-error', 'saved']) {
    const run = spawnSync(exe, [state], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    // git may check the design files out with CRLF on Windows; the device sends LF
    const approved = readFileSync(path.join(root, `design/device-setup/${state}.html`), 'utf8').replace(/\r\n/g, '\n');
    assert.equal(run.stdout, approved, `${state}: firmware page differs from design/device-setup/${state}.html`);
  }
});
