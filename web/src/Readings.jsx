// F-24 readings table under the history charts: hourly averages for a from-to range of Philippine days, 500 rows a page
// ("Show more"), and a CSV of the whole range. Markup and classes match design/room-reset-readings/f24-*.html (approved).
// The logic is in readings.js. Data: readings_hourly and readings_span (supabase/migrations/20261107120000_readings_hourly.sql).
import { useLang } from './Lang.jsx';
import { useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { PAGE_SIZE, spanDays, defaultRange, checkRange, rowView, hasMore, csvOf, csvName } from './readings.js';

async function rpc(name, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
const page = (deviceId, from, to, before) =>
  rpc('readings_hourly', { from_day: from, to_day: to, for_device: deviceId, before_hour: before ?? null, page_size: PAGE_SIZE });

export default function Readings({ deviceId }) {
  const { lang, t } = useLang();
  const [days, setDays] = useState(undefined); // undefined = loading, null = no readings, { min, max }
  const [range, setRange] = useState(null); // { from, to }
  const [rows, setRows] = useState([]);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = async (from, to) => {
    setBusy(true);
    try {
      const first = await page(deviceId, from, to);
      setRows(first); setMore(hasMore(first.length)); setFailed(false);
    } catch { setFailed(true); }
    setBusy(false);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const d = spanDays(await rpc('readings_span', { for_device: deviceId }));
        if (!alive) return;
        setDays(d);
        if (d) { const r = defaultRange(d); setRange(r); load(r.from, r.to); }
      } catch { if (alive) { setFailed(true); setDays(null); } }
    })();
    return () => { alive = false; };
  }, [deviceId]);

  const check = range && days ? checkRange(range.from, range.to, days, lang) : { ok: false, error: '' };
  const pick = (next) => { setRange(next); const c = checkRange(next.from, next.to, days); if (c.ok) load(next.from, next.to); };

  const showMore = async () => {
    setBusy(true);
    try {
      const next = await page(deviceId, range.from, range.to, rows.at(-1).hour);
      setRows((was) => [...was, ...next]); setMore(hasMore(next.length)); setFailed(false);
    } catch { setFailed(true); }
    setBusy(false);
  };

  const download = async () => {
    setBusy(true);
    try {
      let all = [];
      for (let before = null; ;) {
        const next = await page(deviceId, range.from, range.to, before);
        all = all.concat(next);
        if (!hasMore(next.length)) break;
        before = next.at(-1).hour;
      }
      const url = URL.createObjectURL(new Blob([csvOf(all)], { type: 'text/csv;charset=utf-8' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: csvName(range.from, range.to) });
      document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setFailed(false);
    } catch { setFailed(true); }
    setBusy(false);
  };

  if (days === undefined) return null;
  const views = rows.map((r) => rowView(r, lang));
  return (
    <section className="viz-wrap" aria-label={t('readings.title')}>
      <h2 className="viz-section">{t('readings.title')}</h2>
      {days === null ? (
        <div className="card viz-card"><div className="card-body"><p className="viz-empty">{t('readings.none')}</p></div></div>
      ) : (
        <>
          <p className="text-secondary rr-count">{t('readings.lead')}</p>
          <div className="rr-range">
            <div><label htmlFor="rd-from">{t('readings.from')}</label><input className="form-control" id="rd-from" type="date" value={range.from} min={days.min} max={days.max} onChange={(e) => pick({ ...range, from: e.target.value })} /></div>
            <div><label htmlFor="rd-to">{t('readings.to')}</label><input className="form-control" id="rd-to" type="date" value={range.to} min={days.min} max={days.max} onChange={(e) => pick({ ...range, to: e.target.value })} /></div>
          </div>
          {!check.ok && <p className="text-secondary rr-count" role="alert">{check.error}</p>}
          {failed && <p className="text-secondary rr-count">{t('readings.failed')}</p>}
          {check.ok && views.length === 0 && !busy && !failed && (
            <div className="card viz-card"><div className="card-body"><p className="viz-empty">{t('readings.noDays')}</p></div></div>
          )}
          {check.ok && views.length > 0 && (
            <>
              <p className="rr-count" role="status">{t(views.length === 1 ? 'readings.count1' : 'readings.countN', { n: views.length })}</p>
              <div className="card viz-card"><div className="card-body rr-scroll">
                <table className="table table-sm viz-table rr-table">
                  <thead><tr><th>{t('readings.colTime')}</th><th>{t('readings.colTemp')}</th><th>{t('readings.colRh')}</th><th>{t('readings.colHi')}</th></tr></thead>
                  <tbody>
                    {views.map((v) => (
                      <tr key={v.key}>
                        <td>{v.time}<small className="d-block text-secondary">{v.room}</small></td>
                        <td>{v.temp}</td><td>{v.rh}</td>
                        <td>{v.hi}<small className="d-block text-secondary">{v.level}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div></div>
            </>
          )}
          {check.ok && (
            <div className="rr-actions">
              {more && <button type="button" className="btn rr-more" disabled={busy} onClick={showMore}>{t('readings.more')}</button>}
              <button type="button" className="btn rr-csv" disabled={busy} onClick={download}>{t('readings.csv')}</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
