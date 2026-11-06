// P04-04 history charts (F-04): heat index, temperature and humidity over the last 24 hours or 7 days.
// Markup and classes match design/history-charts/*.html (the approved design). The maths is in history.js.
import { useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { useLang } from './Lang.jsx';
import { categoryLabel } from './i18n.js';
import { RANGES, niceScale, buildSeries, linePath, xTicks, pointLabel, nearestIndex, latestWith, loneBuckets } from './history.js';

const REFRESH_MS = 30000;
const H = 156;
const M = { l: 34, r: 10, t: 10, b: 28 };
// PAGASA lines (D-019), drawn only when inside the chart's range.
const LINES = [{ v: 33, cat: 'extreme-caution' }, { v: 42, cat: 'danger' }];

const whole = (v) => String(Math.round(v));
const oneDecimal = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const CHARTS = [
  { key: 'hi', cls: 's-hi', title: 'home.heatIndex', unit: '°C', fmt: whole, lines: true },
  { key: 'temp', cls: 's-temp', title: 'home.temperature', unit: '°C', fmt: oneDecimal },
  { key: 'rh', cls: 's-rh', title: 'home.humidity', unit: '%', fmt: whole },
];

async function fetchHistory(deviceId, range) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/history`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ range_hours: RANGES[range].hours, for_device: deviceId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// The drawing is 326 units wide on a phone and 456 in the desktop column (same as the mocks); CSS scales it to the card.
function useChartWidth() {
  const query = '(min-width: 520px)';
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide ? 456 : 326;
}

function Chart({ series, spec, W, hover, onHover }) {
  const { lang, t } = useLang();
  const title = t(spec.title);
  const words = t(`history.words${series.range === '24h' ? '24' : '7'}`);
  const { pts, hours, stepMs, range, startMs } = series;
  const vals = pts.map((p) => p[spec.key]).filter((v) => v !== null);
  const last = latestWith(pts, spec.key);
  const { lo, hi, ticks } = niceScale(Math.min(...vals), Math.max(...vals));
  const x = (t) => M.l + (t / hours) * (W - M.l - M.r);
  const y = (v) => M.t + (1 - (v - lo) / (hi - lo)) * (H - M.t - M.b);
  const hp = hover === null ? null : pts[hover];

  const pointer = (e) => {
    if (!pts.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const t = ((((e.clientX - rect.left) / rect.width) * W - M.l) / (W - M.l - M.r)) * hours;
    onHover(nearestIndex(pts, t));
  };
  const key = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const at = hover === null ? pts.length - 1 : hover;
    onHover(Math.max(0, Math.min(pts.length - 1, at + (e.key === 'ArrowRight' ? 1 : -1))));
  };

  return (
    <section className="card viz-card" aria-label={title}>
      <div className="card-body">
        <div className="viz-head">
          <h2 className="viz-title">{`${title} `}<span className="viz-unit">{spec.unit}</span></h2>
          <p className="viz-now"><span className={`viz-key ${spec.cls}`} />{last ? t('history.now', { value: `${spec.fmt(last[spec.key])}${spec.unit === '%' ? ' %' : ' °C'}` }) : '—'}</p>
        </div>
        <svg className="viz-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" tabIndex={0}
          aria-label={t('history.aria', { title, words })}
          onPointerMove={pointer} onPointerDown={(e) => { e.currentTarget.dataset.touched = '1'; pointer(e); }} onKeyDown={(e) => { delete e.currentTarget.dataset.touched; key(e); }}
          onBlur={(e) => { delete e.currentTarget.dataset.touched; }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') onHover(null); }}>
          {ticks.map((v) => (
            <g key={v}>
              <line className="viz-grid" x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} />
              <text className="viz-tick" x={M.l - 6} y={y(v) + 4} textAnchor="end">{spec.fmt(v)}</text>
            </g>
          ))}
          {xTicks(range, startMs + hours * 3_600_000, lang).map((k) => (
            <text key={k.t} className="viz-tick" x={x(k.t)} y={H - 10} textAnchor="middle">{k.label}</text>
          ))}
          {spec.lines && LINES.filter((L) => L.v > lo && L.v < hi).map((L) => (
            <g key={L.v}>
              <line className={`viz-ref viz-ref-${L.cat}`} x1={M.l} x2={W - M.r} y1={y(L.v)} y2={y(L.v)} />
              <text className="viz-reflabel" x={M.l + 4} y={y(L.v) - 4}>{`${categoryLabel(L.cat, lang)} ${L.v}`}</text>
            </g>
          ))}
          <path className={`viz-line ${spec.cls}`} d={linePath(pts, spec.key, x, y, stepMs)} />
          {loneBuckets(pts, spec.key, stepMs).map((p) => <circle key={p.ms} className={`viz-dot ${spec.cls}`} cx={x(p.t)} cy={y(p[spec.key])} r="3" />)}
          {last && <circle className={`viz-dot ${spec.cls}`} cx={x(last.t)} cy={y(last[spec.key])} r="4" />}
          {hp && <line className="viz-cross" x1={x(hp.t)} x2={x(hp.t)} y1={M.t} y2={H - M.b} />}
          {hp && hp[spec.key] !== null && <circle className={`viz-dot ${spec.cls}`} cx={x(hp.t)} cy={y(hp[spec.key])} r="4" />}
        </svg>
        {spec.lines && <p className="viz-caption">{t('history.caption')}</p>}
      </div>
    </section>
  );
}

function Readout({ series, hover }) {
  const { lang, t } = useLang();
  if (hover === null) return <div className="viz-tip" role="status"><p className="viz-hint">{t('history.hint')}</p></div>;
  const p = series.pts[hover];
  return (
    <div className="viz-tip" role="status">
      <p className="viz-tip-time">{pointLabel(p.ms, series.range, lang)}</p>
      <p><span className="viz-key s-hi" /><strong>{`${p.hi === null ? '—' : Math.round(p.hi)} °C`}</strong> <span>{t('home.heatIndex')}</span></p>
      <p><span className="viz-key s-temp" /><strong>{`${p.temp === null ? '—' : p.temp} °C`}</strong> <span>{t('home.temperature')}</span></p>
      <p><span className="viz-key s-rh" /><strong>{`${p.rh === null ? '—' : p.rh} %`}</strong> <span>{t('home.humidity')}</span></p>
    </div>
  );
}

function TableTwin({ series }) {
  const { lang, t } = useLang();
  const rows = series.pts.slice().reverse();
  return (
    <details className="viz-tablebox">
      <summary>{t('history.showTable')}</summary>
      <div className="viz-tablescroll">
        <table className="table table-sm viz-table">
          <thead><tr><th>{series.range === '24h' ? t('history.colTime') : t('history.colDay')}</th><th>{t('history.colHi')}</th><th>{t('history.colTemp')}</th><th>{t('history.colRh')}</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.ms}><td>{pointLabel(p.ms, series.range, lang)}</td><td>{p.hi === null ? '—' : Math.round(p.hi)}</td><td>{p.temp ?? '—'}</td><td>{p.rh ?? '—'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export default function History({ deviceId }) {
  const { t } = useLang();
  const W = useChartWidth();
  const [range, setRange] = useState('24h');
  const [data, setData] = useState(null); // { range, rows, at }: the last answer; kept while the next one loads
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const rows = await fetchHistory(deviceId, range);
        if (alive) { setData({ range, rows, at: Date.now() }); setFailed(false); }
      } catch {
        if (alive) setFailed(true);
      }
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => { alive = false; clearInterval(timer); };
  }, [deviceId, range]);

  const pick = (r) => { setRange(r); setHover(null); };
  const series = data ? buildSeries(data.rows, data.range, data.at) : null;
  const loading = !data || data.range !== range;

  return (
    <section className="viz-wrap" aria-label={t('history.title')}>
      <h2 className="viz-section">{t('history.title')}</h2>
      <div className="viz-filter" role="group" aria-label={t('history.range')}>
        <button type="button" className="btn viz-range" aria-pressed={range === '24h'} onClick={() => pick('24h')}>{t('history.last24')}</button>
        <button type="button" className="btn viz-range" aria-pressed={range === '7d'} onClick={() => pick('7d')}>{t('history.last7')}</button>
      </div>
      {failed && <p className="text-secondary">{t('history.failed')}</p>}
      {series && series.pts.length === 0 && (
        <div className="card viz-card"><div className="card-body"><p className="viz-empty">{t('history.empty', { words: t(`history.words${series.range === '24h' ? '24' : '7'}`) })}</p></div></div>
      )}
      {series && series.pts.length > 0 && (
        <div className={loading ? 'viz-loading' : undefined}>
          <Readout series={series} hover={hover} />
          <div className="viz-charts">
            {CHARTS.map((spec) => <Chart key={spec.key} series={series} spec={spec} W={W} hover={hover} onHover={setHover} />)}
          </div>
          <TableTwin series={series} />
        </div>
      )}
    </section>
  );
}
