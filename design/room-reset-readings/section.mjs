// F-24 mock section: the readings table under the history charts. Used by build-mocks.mjs (this folder) and by
// design/history-charts/build-mocks.mjs; tests/ui-gate-history.test.js feeds ROWS to the page through a fake database call.
// Made-up hourly averages for the made-up room "Room 204" (UTC hours; the page shows Philippine time = UTC + 8).
import { heatCategory } from '../../src/heat-index.js';

export const SPAN = { first_at: '2026-11-02T10:04:52+00:00', last_at: '2026-11-03T10:03:10+00:00' }; // Manila 2 Nov 18:04 to 3 Nov 18:03
const h = (hourUtc, temp_c, rh_pct, heat_index_c) => ({ hour: `2026-11-03T${String(hourUtc).padStart(2, '0')}:00:00+00:00`, room: 'Room 204', temp_c, rh_pct, heat_index_c, n: 60 });
export const ROWS = [
  h(8, 32.0, 58.1, 41.1), h(7, 31.4, 52.3, 34.9), h(6, 32.1, 52.8, 36.1), h(5, 31.9, 54.1, 36.0), h(4, 31.7, 55.3, 35.9),
  h(3, 31.4, 55.5, 34.8), h(2, 31.2, 57.8, 35.3), h(1, 32.3, 67.0, 43.8), h(0, 31.1, 73.3, 40.7), { ...h(19, 24.6, 72.3, null), hour: '2026-11-02T19:00:00+00:00' }, // 3 Nov 03:00 in Manila
].sort((a, b) => Date.parse(b.hour) - Date.parse(a.hour));

const LABEL = { 'caution': 'Caution', 'extreme-caution': 'Extreme caution', 'danger': 'Danger', 'extreme-danger': 'Extreme danger' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const when = (iso) => { const d = new Date(Date.parse(iso) + 8 * 3_600_000); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${String(d.getUTCHours()).padStart(2, '0')}:00`; };
const tr = (r) => `<tr><td>${when(r.hour)}<small class="d-block text-secondary">${r.room}</small></td><td>${r.temp_c.toFixed(1)} °C</td><td>${r.rh_pct.toFixed(1)} %</td><td>${r.heat_index_c === null ? '—' : `${Math.round(r.heat_index_c)} °C`}<small class="d-block text-secondary">${r.heat_index_c === null ? 'Below range' : LABEL[heatCategory(Math.round(r.heat_index_c))]}</small></td></tr>`;

/** @param {'rows'|'none'} state rows = the table with 10 hours; none = a database with no readings at all */
export function readingsSection(state) {
  if (state === 'none') return `
  <section class="viz-wrap" aria-label="Readings table"><h2 class="viz-section">Readings table</h2>
    <div class="card viz-card"><div class="card-body"><p class="viz-empty">No readings yet.</p></div></div>
  </section>`;
  return `
  <section class="viz-wrap" aria-label="Readings table"><h2 class="viz-section">Readings table</h2>
    <p class="text-secondary rr-count">Hourly averages. Pick the days to show.</p>
    <div class="rr-range"><div><label for="rd-from">From</label><input class="form-control" id="rd-from" type="date" value="2026-11-03" min="2026-11-02" max="2026-11-03"></div>
    <div><label for="rd-to">To</label><input class="form-control" id="rd-to" type="date" value="2026-11-03" min="2026-11-02" max="2026-11-03"></div></div>
    <p class="rr-count" role="status">10 hours shown, newest first. Times are Philippine time.</p>
    <div class="card viz-card"><div class="card-body rr-scroll"><table class="table table-sm viz-table rr-table"><thead><tr><th>Time / room</th><th>Temp</th><th>Humidity</th><th>Heat index / level</th></tr></thead><tbody>${ROWS.map(tr).join('')}</tbody></table></div></div>
    <div class="rr-actions"><button type="button" class="btn rr-csv">Download CSV</button></div>
  </section>`;
}
