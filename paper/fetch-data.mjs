// Saves the P03-07 24 h run (init-test, 2026-11-02 10:03:55Z to 2026-11-03 10:03:55Z) as small JSON files in paper/data.
// Aggregates only: no keys, no personal data. Run: node --env-file=.env paper/fetch-data.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const W = "recorded_at >= '2026-11-02 10:03:55+00' and recorded_at < '2026-11-03 10:03:55+00'";
const queries = {
  hourly: `select to_char(date_trunc('hour', recorded_at at time zone 'Asia/Manila'),'YYYY-MM-DD HH24:00') hour_manila, count(*)::int n, round(avg(temp_c),1) temp_avg, round(avg(rh_pct),1) rh_avg, round(max(heat_index_c),1) hi_max from readings where ${W} group by 1 order by 1;`,
  bands: `select case when round(heat_index_c)<27 then 'below range' when round(heat_index_c)<=32 then 'Caution' when round(heat_index_c)<=41 then 'Extreme caution' when round(heat_index_c)<=51 then 'Danger' else 'Extreme danger' end band, count(*)::int n from readings where ${W} group by 1;`,
  summary: `select count(*)::int n, min(recorded_at) first, max(recorded_at) last, round(min(temp_c),1) tmin, round(avg(temp_c),1) tavg, round(max(temp_c),1) tmax, round(min(rh_pct),1) rmin, round(avg(rh_pct),1) ravg, round(max(rh_pct),1) rmax, round(min(heat_index_c),1) himin, round(avg(heat_index_c),1) hiavg, round(max(heat_index_c),1) himax from readings where ${W};`,
  gaps: `select recorded_at, gap_s from (select recorded_at, extract(epoch from recorded_at - lag(recorded_at) over (order by recorded_at))::int gap_s from readings where ${W}) x where gap_s > 90 order by recorded_at;`,
};
for (const [name, sql] of Object.entries(queries)) {
  const out = execFileSync('node', ['--env-file=.env', 'tools/db.mjs', 'test', 'db', 'query', '--linked', sql], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const i = out.indexOf('{\n  "boundary"');
  const rows = JSON.parse(out.slice(i, out.lastIndexOf('}') + 1)).rows;
  writeFileSync(`paper/data/${name}.json`, JSON.stringify(rows, null, 1));
  console.log(name, rows.length, 'rows');
}
