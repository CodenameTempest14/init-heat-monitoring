// Fails if any folder (outside .git and node_modules) has no README.md (hard rule: every folder has a README).
// Usage: node tools/check-readmes.mjs
import { readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skip = new Set(['node_modules']); // dot-folders (.git, .claude, .qodo) belong to tools, not to the project
const missing = [];

async function walk(dir) {
  try { await access(path.join(dir, 'README.md')); } catch { missing.push(path.relative(repoRoot, dir) || '.'); }
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !skip.has(entry.name) && !entry.name.startsWith('.')) await walk(path.join(dir, entry.name));
  }
}

await walk(repoRoot);
if (missing.length) {
  console.log(`Folders without README.md (${missing.length}):\n  - ${missing.join('\n  - ')}`);
  process.exit(1);
}
console.log('Every folder has a README.md.');
