// P04-06 (F-07): what can a stranger with only the public key do? Read-only checks plus write attempts that must be refused.
// Safe on a running system: every write targets an id that matches nothing or carries the marker room `P04-06-probe`,
// and the end of the run counts marker rows (must be 0). Never run the backend tests for this: they wipe init-test.
// Usage: node tools/anon-probe.mjs              (the project the web app uses: web/src/config.js)
//        node tools/anon-probe.mjs <url> <key>  (another project, e.g. live `init`, before the app moves there)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const cfg = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'web', 'src', 'config.js'), 'utf8');
const url = process.argv[2] || cfg.match(/SUPABASE_URL = "([^"]+)"/)[1];
const key = process.argv[3] || cfg.match(/SUPABASE_ANON_KEY = "([^"]+)"/)[1];
const NOTHING = '00000000-0000-0000-0000-000000000000'; // an id no row has
const MARK = 'P04-06-probe';

async function call(p, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${url}/rest/v1/${p}`, {
    method, body: body && JSON.stringify(body),
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...headers },
  });
  const text = await res.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
  return { status: res.status, json, text };
}
const reading = { device_id: NOTHING, recorded_at: new Date().toISOString(), temp_c: 30, rh_pct: 60, temp_offset_c: 0, rh_offset_pct: 0, heat_index_c: 33, room: MARK };

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `   -> ${detail}`}`); };
const readable = async (name, p) => { const r = await call(p); check(`read ${name}`, r.status === 200 && Array.isArray(r.json), `${r.status} ${r.text.slice(0, 120)}`); return r; };
// "Refused" = permission denied (42501), or, for a change that matches no row, a harmless empty answer. Never a changed row.
const refused = async (name, p, opts) => {
  const r = await call(p, opts);
  const denied = r.json?.code === '42501' || r.status === 401 || r.status === 403;
  const changedNothing = (r.status === 200 || r.status === 204) && (!r.json || (Array.isArray(r.json) && r.json.length === 0));
  check(`refused: ${name}`, denied || changedNothing, `${r.status} ${r.text.slice(0, 120)}`);
};

console.log(`Probing ${url} as an anonymous visitor\n`);
await readable('readings', 'readings?select=recorded_at,temp_c,rh_pct,heat_index_c&limit=1');
await readable('readings_hourly', 'readings_hourly?limit=1');
await readable('settings', 'settings?limit=1');
await readable('device_status', 'device_status?limit=1');
await readable('device name, room and last seen', 'devices?select=id,name,room,last_seen_at&limit=1');
const h = await call('rpc/history', { method: 'POST', body: { range_hours: 24, for_device: NOTHING } });
check('read history() for a device', h.status === 200 && Array.isArray(h.json), `${h.status} ${h.text.slice(0, 120)}`);

const secret = await call('devices?select=key_hash&limit=1');
check('the device key hash stays hidden', secret.json?.code === '42501', `${secret.status} ${secret.text.slice(0, 120)}`);

await refused('insert a reading', 'readings', { method: 'POST', body: reading });
await refused('change a reading', `readings?device_id=eq.${NOTHING}`, { method: 'PATCH', body: { temp_c: 99 } });
await refused('delete a reading', `readings?device_id=eq.${NOTHING}`, { method: 'DELETE' });
await refused('insert hourly summary', 'readings_hourly', { method: 'POST', body: { device_id: NOTHING, hour: new Date().toISOString() } });
await refused('change a setting', `settings?device_id=eq.${NOTHING}`, { method: 'PATCH', body: { interval_s: 3600 } });
await refused('insert a device', 'devices', { method: 'POST', body: { id: NOTHING, name: MARK } });
await refused('change a device', `devices?id=eq.${NOTHING}`, { method: 'PATCH', body: { name: MARK } });
await refused('delete a device', `devices?id=eq.${NOTHING}`, { method: 'DELETE' });

// The one write door is ingest_reading, and it needs the device's own key: a wrong key must not save anything.
const door = await call('rpc/ingest_reading', { method: 'POST', body: { device_key: 'not-a-real-key', readings: [{ recorded_at: new Date().toISOString(), temp_c: 30, rh_pct: 60 }] } });
check('ingest_reading with a wrong device key is rejected (403 bad_key)', door.status === 403 && door.json?.message === 'bad_key', `${door.status} ${door.text.slice(0, 160)}`);

const left = await call(`readings?room=eq.${MARK}&select=room`);
check(`no probe row was saved (room "${MARK}")`, left.status === 200 && left.json.length === 0, `${left.status} ${left.text.slice(0, 120)}`);

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
