// Counts the checklists in documentation/phases/*.md and prints the phase report.
// Numbers come from the files, never from memory. Adapted from Ad Astra's tools/phase-report.mjs.
//
// Usage:  node tools/phase-report.mjs            (all phases + status line)
//         node tools/phase-report.mjs --md       (Phase Progress table only, for reports and prompts)
//
// Checklist line markers: "- [x]" done · "BLOCKED:" blocked · "RULED:" ruled out (not counted)
//                         "PROG:" partly done · "UNVERIFIED:" done but not yet checked on the real thing
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const phasesDir = path.join(repoRoot, 'documentation', 'phases');

function classify(line) {
  if (/^\s*- \[x\]/i.test(line)) return /UNVERIFIED:/.test(line) ? 'unverified' : 'done';
  if (/BLOCKED:/.test(line)) return 'blocked';
  if (/RULED:/.test(line)) return 'ruled';
  if (/PROG:/.test(line)) return 'prog';
  return 'todo';
}

const files = (await readdir(phasesDir)).filter((f) => /^phase-\d\d-.*\.md$/.test(f)).sort();
const rows = [];

for (const file of files) {
  const text = await readFile(path.join(phasesDir, file), 'utf8');
  const heading = text.match(/^# (.+)$/m)?.[1] ?? file;            // "Phase 0 — Kickoff and decisions"
  const name = heading.includes('—') ? heading.split('—')[1].trim() : heading;
  const counts = { done: 0, unverified: 0, prog: 0, todo: 0, blocked: 0, ruled: 0 };
  for (const line of text.split('\n')) {
    if (!/^\s*- \[[ xX]\] /.test(line)) continue;
    counts[classify(line)]++;
  }
  // An item ticked but marked UNVERIFIED is not done yet: it counts as unverified, not as done.
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const denominator = total - counts.ruled;
  const pct = denominator ? Math.round((counts.done / denominator) * 100) : 0;
  rows.push({ file, label: `P${file.slice(6, 8)}`, name, ...counts, total, denominator, pct });
}

if (process.argv.includes('--md')) {
  const bar = (p) => '█'.repeat(Math.round(p / 10)) + '░'.repeat(10 - Math.round(p / 10));
  const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
  const denom = sum('total') - sum('ruled');
  const overall = denom ? Math.round((sum('done') / denom) * 100) : 0;
  console.log('| Phase | Done / Total | Progress | % |');
  console.log('|---|---|---|---|');
  for (const r of rows) {
    const extra = `${r.prog ? ` (+${r.prog} partly)` : ''}${r.unverified ? `, ${r.unverified} unverified` : ''}${r.blocked ? `, ${r.blocked} blocked` : ''}`;
    console.log(`| ${r.label} ${r.name} | ${r.done} / ${r.denominator}${extra} | ${bar(r.pct)} | ${r.pct}% |`);
  }
  console.log(`| **Whole project** | ${sum('done')} / ${denom} | ${bar(overall)} | **${overall}%** |`);
  process.exit(0);
}

const pad = (v, n) => String(v).padStart(n);
console.log('Phase                          done unver prog todo BLOCKED ruled total    %');
for (const r of rows) {
  console.log(`${`${r.label} ${r.name}`.padEnd(30).slice(0, 30)} ${pad(r.done, 4)} ${pad(r.unverified, 5)} ${pad(r.prog, 4)} ${pad(r.todo, 4)} ${pad(r.blocked, 7)} ${pad(r.ruled, 5)} ${pad(r.total, 5)} ${pad(r.pct, 3)}%`);
}

// Current phase is read from CURRENT_STATE.md ("**Current phase:** P00 ...").
let current = rows[0];
try {
  const state = await readFile(path.join(repoRoot, 'documentation', 'context', 'CURRENT_STATE.md'), 'utf8');
  const id = state.match(/\*\*Current phase:\*\*\s*P(\d\d)/)?.[1];
  current = rows.find((r) => r.file.startsWith(`phase-${id}-`)) ?? current;
} catch { /* no state file */ }

const totalUnverified = rows.reduce((a, r) => a + r.unverified, 0);
console.log(`\nStatus line:\n[${current.label} · ${current.name} · ${current.done}/${current.denominator} done · ${current.blocked} blocked · unverified ${totalUnverified}]`);
