// Runs the pinned Supabase CLI against ONE project, passing only that project's secrets.
// Usage: node --env-file=.env tools/db.mjs <test|live> <supabase args...>
//   e.g. node --env-file=.env tools/db.mjs test db push
// It links to the named project first, so a command can't land on the other one by accident.
import { spawnSync } from 'node:child_process';

const [target, ...args] = process.argv.slice(2);
const prefix = { test: 'SUPABASE_TEST_', live: 'SUPABASE_' }[target];
if (!prefix || args.length === 0) {
  console.error('usage: node --env-file=.env tools/db.mjs <test|live> <supabase args...>');
  process.exit(2);
}

const ref = process.env[`${prefix}PROJECT_REF`];
const password = process.env[`${prefix}DB_PASSWORD`];
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!ref || !password || !token) {
  console.error(`missing ${prefix}PROJECT_REF, ${prefix}DB_PASSWORD or SUPABASE_ACCESS_TOKEN in .env`);
  process.exit(2);
}

// Only the system basics plus this project's secrets: no other SUPABASE_* value reaches the CLI.
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('SUPABASE_')));
Object.assign(env, { SUPABASE_ACCESS_TOKEN: token, SUPABASE_DB_PASSWORD: password });

const run = (cliArgs) => spawnSync('npx', ['supabase', ...cliArgs], { env, stdio: 'inherit', shell: true }).status;

console.log(`[db] target: ${target}`);
if (run(['link', '--project-ref', ref]) !== 0) process.exit(1);
process.exit(run(args) ?? 1);
