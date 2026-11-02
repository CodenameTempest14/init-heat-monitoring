// P04-01 skeleton: one public (logged-out) read of the newest reading, shown as text.
import { useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { readingView } from './lib.js';

const REFRESH_MS = 30000;

async function latestReading() {
  const url = `${SUPABASE_URL}/rest/v1/readings?select=recorded_at,temp_c,rh_pct,heat_index_c,room&order=recorded_at.desc&limit=1`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const rows = await res.json();
  return rows[0] || null;
}

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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const v = readingView(await latestReading(), Date.now());
        if (alive) { setView(v); setFailed(false); }
      } catch {
        if (alive) setFailed(true);
      }
    };
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  return (
    <main className="app-wrap">
      <h1 className="app-title">Init</h1>
      <p className="text-secondary">Room: {view.room}</p>
      <div className="card"><div className="card-body">
        <p className="app-label">Latest reading</p>
        <ul className="app-list" aria-live="polite">
          <li>Temperature <strong>{view.temp}</strong></li>
          <li>Humidity <strong>{view.rh}</strong></li>
          <li>Heat index <strong>{view.heatIndex}</strong></li>
        </ul>
        <p className="text-secondary mb-0">{failed ? 'Could not load the readings. Will try again.' : view.updated}</p>
      </div></div>
    </main>
  );
}
