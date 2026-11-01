// Fails (exit 1) if a secret value from .env or secrets.h appears in the lines you are about to commit.
// Usage: node tools/secret-scan.mjs            scans `git diff --cached` (run before every commit)
//        node tools/secret-scan.mjs --stdin     scans a diff read from stdin
//        --secret NAME=value                    adds a value to look for (used by the tests)
// It prints the NAME of the secret and the file, never the value.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIN_LENGTH = 8; // shorter values are plain words that would match everywhere
const SECRET_NAME = /KEY|PASSWORD|PASS|TOKEN|SECRET/;
const PUBLIC_NAME = /ANON|PUBLISHABLE|URL|REF/; // public by design, safe to appear in the repo

const isSecretName = (name) => SECRET_NAME.test(name) && !PUBLIC_NAME.test(name);

// Returns Map(value -> name) from the text of .env and of secrets.h.
export function secretValues(envText, secretsHText) {
  const found = new Map();
  const add = (name, value) => {
    if (isSecretName(name) && value.length >= MIN_LENGTH) found.set(value, name);
  };
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) add(m[1], m[2].replace(/^(['"])(.*)\1$/, '$2'));
  }
  for (const line of secretsHText.split(/\r?\n/)) {
    const m = line.match(/^\s*#define\s+([A-Z0-9_]+)\s+"(.*)"/);
    if (m) add(m[1], m[2]);
  }
  return found;
}

// Looks only at added lines ("+", not "+++"). Returns [{ name, file }], no values.
export function findHits(diffText, values) {
  const hits = [];
  let file = '?';
  for (const line of diffText.split(/\r?\n/)) {
    if (line.startsWith('+++ ')) { file = line.slice(4).replace(/^b\//, ''); continue; }
    if (!line.startsWith('+')) continue;
    for (const [value, name] of values) {
      if (line.includes(value)) hits.push({ name, file });
    }
  }
  return hits;
}

function readIfThere(file) {
  try { return readFileSync(file, 'utf8'); } catch { return ''; }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const values = secretValues(readIfThere(path.join(root, '.env')), readIfThere(path.join(root, 'firmware/init/include/secrets.h')));
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--secret') {
      const [name, ...rest] = args[++i].split('=');
      values.set(rest.join('='), name);
    }
  }
  const diffText = args.includes('--stdin')
    ? readFileSync(0, 'utf8')
    : spawnSync('git', ['diff', '--cached', '--no-color'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).stdout;
  const hits = findHits(diffText, values);
  if (hits.length) {
    for (const h of hits) console.error(`SECRET FOUND: ${h.name} appears in an added line of ${h.file}`);
    console.error('Commit blocked. Remove the value from the file (use .env / secrets.h).');
    process.exit(1);
  }
  console.log(`secret-scan: clean (${values.size} secret values checked).`);
}
