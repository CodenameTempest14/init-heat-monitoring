// Builds the CONTINUATION PROMPT the owner copies into the next Claude Code session (HARD RULE 2).
// Generated from files, never written from memory:
//   - progress table      <- node tools/phase-report.mjs --md
//   - status line         <- node tools/phase-report.mjs
//   - next step / model   <- documentation/context/CURRENT_STATE.md
// Writes documentation/context/NEXT_SESSION_PROMPT.md and prints it.
//
// Usage: node tools/continuation-prompt.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd, args) => execFileSync(cmd, args, { cwd: repoRoot, encoding: 'utf8' }).trim();

const table = run('node', ['tools/phase-report.mjs', '--md']);
const statusLine = run('node', ['tools/phase-report.mjs']).split('\n').filter((l) => l.startsWith('[P')).pop();
const state = await readFile(path.join(repoRoot, 'documentation/context/CURRENT_STATE.md'), 'utf8');

const section = (heading) => {
  const m = state.match(new RegExp(`## ${heading}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |$)`));
  return m ? m[1].trim() : '(missing in CURRENT_STATE.md: fix this before ending the session)';
};
const today = new Date().toISOString().slice(0, 10);

const prompt = `# Continue Classroom Heat Index Monitoring (prompt generated ${today})

You are continuing **classroom-heat-index-monitoring** (d:\\System Documents\\Documents\\Codes\\classroom-heat-index-monitoring): a power-bank-powered ESP32 room monitor (DHT22 + OLED) plus a public web app (PWA on Supabase + free static hosting) showing temperature, humidity and heat index for one classroom. The owner is learning: explain before and while implementing.

## HARD RULES (full text in CLAUDE.md)
1. Read in this order and nothing more: CLAUDE.md, documentation/context/CURRENT_STATE.md, the current phase checklist in documentation/phases/, the last Session Close Report.
2. Start with a Session Start Report that includes the **Phase Progress table** (\`node tools/phase-report.mjs --md\`) and says **which Claude model to use and why**. In the first reply ask: *"Is this phase being built only by you, or is Shem also working on it?"*
3. Open every reply with the status line from \`node tools/phase-report.mjs\`.
4. No new feature is planned, designed or built until the owner approves it in documentation/specs/FEATURES.md.
5. **Push only to your own branch** (owner: \`codenametempest14\`) and **ask before every push and every merge to \`main\`**, naming the target.
6. **Research paper (CLAUDE.md rule 5):** keep \`paper/\` (.docx and .pdf, \`node paper/build.mjs\`) in step with every feature, change and new data; every reference must be opened and read by you, published 2021 to 2026, never invented.
7. At the end: Session Close Report (with the Phase Progress table), update CURRENT_STATE.md, PROGRESS_LOG.md entry, then run \`node tools/continuation-prompt.mjs\` and **show the generated prompt and the progress table in the final message**.

## Where we are
${statusLine}

### Phase Progress (end of the previous session)
${table}

### Recommended model for this session
${section('Recommended model for the next session')}

### Next concrete step
${section('Next concrete step')}

### Waiting on the owner
${section('Waiting on the owner')}
`;

await writeFile(path.join(repoRoot, 'documentation/context/NEXT_SESSION_PROMPT.md'), prompt);
console.log(prompt);
