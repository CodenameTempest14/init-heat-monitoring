// tools/secret-scan.mjs: finds secret values (from .env and secrets.h) in the added lines of a diff.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { secretValues, findHits } from '../tools/secret-scan.mjs';

const diff = (...added) => `diff --git a/x b/x\n--- a/x\n+++ b/x\n@@ -1 +1 @@\n context line\n${added.map((l) => `+${l}`).join('\n')}\n`;

test('reads secret values from .env and secrets.h text, skips public and short values', () => {
  const env = 'SUPABASE_URL=https://abc.supabase.co\nDEVICE_KEY=k3y-value-1234567890\nSUPABASE_DB_PASSWORD=hunter2hunter2\nSUPABASE_ANON_KEY=\nSHORT_TOKEN=abc\n# SECRET_X=commented-out-value\n';
  const h = '#define SECRET_WIFI_PASS "my wifi pass"\n#define SECRET_INGEST_URL "https://abc.supabase.co/rest"\n';
  const values = secretValues(env, h);
  assert.deepEqual([...values.keys()].sort(), ['hunter2hunter2', 'k3y-value-1234567890', 'my wifi pass']);
});

test('a hit is reported with the secret name but never the value', () => {
  const hits = findHits(diff('const a = 1;', 'password: hunter2hunter2'), new Map([['hunter2hunter2', 'SUPABASE_DB_PASSWORD']]));
  assert.equal(hits.length, 1);
  assert.equal(hits[0].name, 'SUPABASE_DB_PASSWORD');
  assert.ok(!JSON.stringify(hits).includes('hunter2hunter2'));
});

test('only added lines count, not removed or context lines', () => {
  const d = 'diff --git a/x b/x\n--- a/x\n+++ b/x\n@@ -1,2 +1,2 @@\n-old hunter2hunter2\n context hunter2hunter2\n+clean\n';
  assert.equal(findHits(d, new Map([['hunter2hunter2', 'P']])).length, 0);
});

test('the command exits non-zero on a hit and zero when clean', () => {
  const run = (input) => spawnSync(process.execPath, ['tools/secret-scan.mjs', '--stdin', '--secret', 'NAME=hunter2hunter2'], { input, encoding: 'utf8' });
  assert.notEqual(run(diff('x hunter2hunter2')).status, 0);
  assert.equal(run(diff('nothing here')).status, 0);
});
