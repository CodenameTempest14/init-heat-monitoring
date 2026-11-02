// Writes web/src/config.js from .env. Run: npm run config [test|live]   (default: test, D-026)
// Only the PUBLIC (publishable/anon) key goes into the page. Row-level rules decide what it may read (SCHEMA.md).
import { writeFileSync } from 'node:fs';

const which = process.argv[2] || 'test';
const names = which === 'live' ? ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] : ['SUPABASE_TEST_URL', 'SUPABASE_TEST_ANON_KEY'];
const [url, key] = names.map((n) => process.env[n]);
if (!url || !key) { console.error(`Missing ${names.join(' / ')} in .env`); process.exit(1); }
if (!key.startsWith('sb_publishable_') && key.split('.').length !== 3) { console.error('That does not look like a public key: refusing to write it.'); process.exit(1); }

const out = `// Made by web/build-config.mjs (${which} project). The key below is the PUBLIC key; it is meant to be seen.
export const SUPABASE_URL = ${JSON.stringify(url.replace(/\/$/, ''))};
export const SUPABASE_ANON_KEY = ${JSON.stringify(key)};
`;
writeFileSync(new URL('./src/config.js', import.meta.url), out);
console.log(`web/src/config.js written for the ${which} project`);
