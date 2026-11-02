// P04-02 live cards: heat index (coloured by PAGASA category), temperature, humidity, room name (F-01, F-02, F-21).
// Markup and classes match design/home-cards/*.html (the approved design).
import { useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { readingView, deviceStatus } from './lib.js';
import { CATEGORY_LABEL } from './category.js';
import History from './History.jsx';

const REFRESH_MS = 30000;

// One shape per category, so colour is never the only cue (same shapes as the approved design).
const SHAPES = {
  'caution': <circle cx="12" cy="12" r="9" />,
  'extreme-caution': <path d="M12 3 22 21H2z" />,
  'danger': <path d="M12 2 22 12 12 22 2 12z" />,
  'extreme-danger': <path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" />,
  'below-range': <path d="M4 12h16" />,
};

async function latestReading() {
  const url = `${SUPABASE_URL}/rest/v1/readings?select=device_id,recorded_at,received_at,temp_c,rh_pct,heat_index_c,room&order=recorded_at.desc&limit=1`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const rows = await res.json();
  return rows[0] || null;
}

// F-03 badge icons: filled dot (online), ring with a cross (offline), clock (waiting). Same as the approved design.
const STATUS_ICON = {
  online: <circle className="dot" cx="12" cy="12" r="6" />,
  offline: <><circle cx="12" cy="12" r="9" /><path d="M8 8l8 8M16 8l-8 8" /></>,
  wait: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
};

// Follow the phone's light or dark setting (Tabler switches colours on this attribute).
function useColorScheme() {
  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => document.documentElement.setAttribute('data-bs-theme', dark.matches ? 'dark' : 'light');
    apply();
    dark.addEventListener('change', apply);
    return () => dark.removeEventListener('change', apply);
  }, []);
}

export default function App() {
  useColorScheme();
  const [view, setView] = useState({ ...readingView(undefined, Date.now()), updated: 'loading…' });
  const [status, setStatus] = useState(null); // null until the first answer, so no badge flashes before we know
  const [failed, setFailed] = useState(false);
  const [deviceId, setDeviceId] = useState(null); // the device of the newest reading: the history charts show this one

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const row = await latestReading();
        const now = Date.now();
        if (alive) { setView(readingView(row, now)); setStatus(deviceStatus(row, now)); setDeviceId(row ? row.device_id : null); setFailed(false); }
      } catch {
        if (alive) setFailed(true);
      }
    };
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  const cat = view.category;
  return (
    <main className="app-wrap">
      <header className="app-head">
        <picture className="app-logo">
          <source media="(prefers-color-scheme: dark)" srcSet="/logo-dark.svg" />
          <img src="/logo-light.svg" width="110" height="40" alt="" />
        </picture>
        <h1 className="app-fullname">Init: Indoor Heat Index Tracker</h1>
        <p className="text-secondary app-room">{`Room: ${view.room}`}</p>
        {status && (
          <p className={`status status-${status.kind}`} role="status">
            <svg viewBox="0 0 24 24" aria-hidden="true">{STATUS_ICON[status.kind]}</svg>{status.text}
          </p>
        )}
      </header>
      <section className={`card heat${cat ? ` heat-${cat}` : ''}`} aria-label="Heat index">
        <div className="card-body">
          <p className="app-label">{view.label}</p>
          <p className="heat-num">{view.heatIndex}{view.heatIndex !== '—' && <span className="heat-unit">°C</span>}</p>
          {cat && (
            <p className="heat-cat">
              <svg viewBox="0 0 24 24" aria-hidden="true">{SHAPES[cat]}</svg>{CATEGORY_LABEL[cat]}
            </p>
          )}
        </div>
      </section>
      <div className="app-pair">
        <section className="card" aria-label="Temperature"><div className="card-body"><p className="app-label">Temperature</p><p className="stat">{view.temp}</p></div></section>
        <section className="card" aria-label="Humidity"><div className="card-body"><p className="app-label">Humidity</p><p className="stat">{view.rh}</p></div></section>
      </div>
      <p className="text-secondary app-updated">{failed ? 'Could not load the readings. Will try again.' : view.updated}</p>
      {deviceId && <History deviceId={deviceId} />}
    </main>
  );
}
