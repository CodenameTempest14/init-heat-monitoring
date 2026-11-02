// P04-04 history charts (F-04): heat index, temperature and humidity over the last 24 hours or 7 days.
// Markup and classes match design/history-charts/*.html (the approved design). The maths is in history.js.
import { useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { RANGES, niceScale, buildSeries, linePath, xTicks, pointLabel, nearestIndex, latestWith, loneBuckets } from './history.js';

const REFRESH_MS = 30000;
const H = 156;
const M = { l: 34, r: 10, t: 10, b: 28 };
// PAGASA lines (D-019), drawn only when inside the chart's range.
const LINES = [{ v: 33, cat: 'extreme-caution', name: 'Extreme caution' }, { v: 42, cat: 'danger', name: 'Danger' }];

const whole = (v) => String(Math.round(v));
const oneDecimal = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const CHARTS = [
  { key: 'hi', cls: 's-hi', title: 'Heat index', unit: '°C', fmt: whole, lines: true },
  { key: 'temp', cls: 's-temp', title: 'Temperature', unit: '°C', fmt: oneDecimal },
  { key: 'rh', cls: 's-rh', title: 'Humidity', unit: '%', fmt: whole },
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
    <section className="card viz-card" aria-label={spec.title}>
      <div className="card-body">
        <div className="viz-head">
          <h2 className="viz-title">{`${spec.title} `}<span className="viz-unit">{spec.unit}</span></h2>
          <p className="viz-now"><span className={`viz-key ${spec.cls}`} />{last ? `${spec.fmt(last[spec.key])}${spec.unit === '%' ? ' %' : ' °C'} now` : '—'}</p>
        </div>
        <svg className="viz-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" tabIndex={0}
          aria-label={`${spec.title}, ${RANGES[range].words}; arrow keys move through the times; the table below has every value`}
          onPointerMove={pointer} onPointerDown={(e) => { e.currentTarget.dataset.touched = '1'; pointer(e); }} onKeyDown={(e) => { delete e.currentTarget.dataset.touched; key(e); }}
          onBlur={(e) => { delete e.currentTarget.dataset.touched; }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') onHover(null); }}>
          {ticks.map((v) => (
            <g key={v}>
              <line className="viz-grid" x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} />
              <text className="viz-tick" x={M.l - 6} y={y(v) + 4} textAnchor="end">{spec.fmt(v)}</text>
            </g>
          ))}
          {xTicks(range, startMs + hours * 3_600_000).map((k) => (
            <text key={k.t} className="viz-tick" x={x(k.t)} y={H - 10} textAnchor="middle">{k.label}</text>
          ))}
          {spec.lines && LINES.filter((L) => L.v > lo && L.v < hi).map((L) => (
            <g key={L.v}>
              <line className={`viz-ref viz-ref-${L.cat}`} x1={M.l} x2={W - M.r} y1={y(L.v)} y2={y(L.v)} />
              <text className="viz-reflabel" x={M.l + 4} y={y(L.v) - 4}>{`${L.name} ${L.v}`}</text>
            </g>
          ))}
          <path className={`viz-line ${spec.cls}`} d={linePath(pts, spec.key, x, y, stepMs)} />
          {loneBuckets(pts, spec.key, stepMs).map((p) => <circle key={p.ms} className={`viz-dot ${spec.cls}`} cx={x(p.t)} cy={y(p[spec.key])} r="3" />)}
          {last && <circle className={`viz-dot ${spec.cls}`} cx={x(last.t)} cy={y(last[spec.key])} r="4" />}
          {hp && <line className="viz-cross" x1={x(hp.t)} x2={x(hp.t)} y1={M.t} y2={H - M.b} />}
          {hp && hp[spec.key] !== null && <circle className={`viz-dot ${spec.cls}`} cx={x(hp.t)} cy={y(hp[spec.key])} r="4" />}
        </svg>
        {spec.lines && <p className="viz-caption">No line where the heat index is below its calculation range (about 27 °C).</p>}
      </div>
    </section>
  );
}

function Readout({ series, hover }) {
  if (hover === null) return <div className="viz-tip" role="status"><p className="viz-hint">Touch or hover a chart to read the values at that time.</p></div>;
  const p = series.pts[hover];
  return (
    <div className="viz-tip" role="status">
      <p className="viz-tip-time">{pointLabel(p.ms, series.range)}</p>
      <p><span className="viz-key s-hi" /><strong>{`${p.hi === null ? '—' : Math.round(p.hi)} °C`}</strong> <span>Heat index</span></p>
      <p><span className="viz-key s-temp" /><strong>{`${p.temp === null ? '—' : p.temp} °C`}</strong> <span>Temperature</span></p>
      <p><span className="viz-key s-rh" /><strong>{`${p.rh === null ? '—' : p.rh} %`}</strong> <span>Humidity</span></p>
    </div>
  );
}

function TableTwin({ series }) {
  const rows = series.pts.slice().reverse();
  return (
    <details className="viz-tablebox">
      <summary>Show as table</summary>
      <div className="viz-tablescroll">
        <table className="table table-sm viz-table">
          <thead><tr><th>{series.range === '24h' ? 'Time' : 'Day and hour'}</th><th>Heat index °C</th><th>Temp °C</th><th>Humidity %</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.ms}><td>{pointLabel(p.ms, series.range)}</td><td>{p.hi === null ? '—' : Math.round(p.hi)}</td><td>{p.temp ?? '—'}</td><td>{p.rh ?? '—'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export default function History({ deviceId }) {
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
    <section className="viz-wrap" aria-label="History">
      <h2 className="viz-section">History</h2>
      <div className="viz-filter" role="group" aria-label="Time range">
        <button type="button" className="btn viz-range" aria-pressed={range === '24h'} onClick={() => pick('24h')}>Last 24 hours</button>
        <button type="button" className="btn viz-range" aria-pressed={range === '7d'} onClick={() => pick('7d')}>Last 7 days</button>
      </div>
      {failed && <p className="text-secondary">Could not load the history. Will try again.</p>}
      {series && series.pts.length === 0 && (
        <div className="card viz-card"><div className="card-body"><p className="viz-empty">{`No readings in the ${RANGES[series.range].words} yet.`}</p></div></div>
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
