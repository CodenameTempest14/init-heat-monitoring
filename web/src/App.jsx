// P04-02 live cards: heat index (coloured by PAGASA category), temperature, humidity, room name (F-01, F-02, F-21).
// Markup and classes match design/home-cards/*.html (the approved design).
import { useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { readingView, deviceStatus } from './lib.js';
import { categoryLabel } from './i18n.js';
import { LangSwitch, useLang } from './Lang.jsx';
import History from './History.jsx';
import Readings from './Readings.jsx';
import School from './School.jsx';
import Admin from './Admin.jsx';
import Guide from './Guide.jsx';
import Heat from './Heat.jsx';
import Alerts from './Alerts.jsx';
import Kiosk from './Kiosk.jsx';
import Poster from './Poster.jsx';

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

// The school-day view lives at #school, the admin view at #admin, the admin guide at #guide (or #guide/<part>) and the "what does this mean?" page at #heat (or #heat/<level>), the kiosk at #kiosk and the QR poster at #poster, on the same address (F-12, P05, F-22, F-15, F-13, F-14); no server change.
function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const apply = () => { setHash(window.location.hash); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);
  return hash;
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
  const { lang, t } = useLang();
  const route = useRoute();
  const schoolRoute = route === '#school';
  const adminRoute = route === '#admin';
  const guideRoute = route === '#guide' || route.startsWith('#guide/');
  const heatRoute = route === '#heat' || route.startsWith('#heat/');
  const alertsRoute = route === '#alerts'; // P05-03 heat alerts (F-10): keeps the room and status line, like #school
  const quietHeader = adminRoute || guideRoute || heatRoute; // these pages have no room or status line
  // The newest row and the moment we read it; the words are made from these on every render, so the language switch takes effect at once.
  const [latest, setLatest] = useState(null); // null until the first answer, so no badge flashes before we know
  const view = latest ? readingView(latest.row, latest.now, lang) : { ...readingView(undefined, Date.now(), lang), updated: t('home.loading') };
  const status = latest ? deviceStatus(latest.row, latest.now, lang) : null;
  const [failed, setFailed] = useState(false);
  const [deviceId, setDeviceId] = useState(null); // the device of the newest reading: the history charts show this one

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const row = await latestReading();
        const now = Date.now();
        if (alive) { setLatest({ row, now }); setDeviceId(row ? row.device_id : null); setFailed(false); }
      } catch {
        if (alive) setFailed(true);
      }
    };
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  // #kiosk (F-13) and #poster (F-14) are whole pages of their own: no app header, no links.
  // (the kiosk and the poster stay English in this first version of the language switch)
  if (route === '#kiosk') return <Kiosk view={latest ? readingView(latest.row, latest.now) : { ...readingView(undefined, Date.now()), updated: 'loading…' }} status={latest ? deviceStatus(latest.row, latest.now) : null} failed={failed} />;
  if (route === '#poster') return <Poster />;

  const cat = view.category;
  return (
    <main className="app-wrap">
      <header className="app-head">
        <picture className="app-logo">
          <source media="(prefers-color-scheme: dark)" srcSet="/logo-dark.svg" />
          <img src="/logo-light.svg" width="110" height="40" alt="" />
        </picture>
        <h1 className="app-fullname">Init: Indoor Heat Index Tracker</h1>
        {!quietHeader && <div className="room-row"><p className="text-secondary app-room">{t('home.room', { room: view.room })}</p><LangSwitch /></div>}
        {status && !quietHeader && (
          <p className={`status status-${status.kind}`} role="status">
            <svg viewBox="0 0 24 24" aria-hidden="true">{STATUS_ICON[status.kind]}</svg>{status.text}
          </p>
        )}
      </header>
      {guideRoute ? <Guide section={route.slice('#guide/'.length)} /> : heatRoute ? <Heat section={route.slice('#heat/'.length)} /> : adminRoute ? <Admin deviceId={deviceId} ready={status !== null} /> : alertsRoute ? <Alerts deviceId={deviceId} ready={status !== null} room={view.room} /> : schoolRoute ? <School deviceId={deviceId} ready={status !== null} /> : (
        <>
        <section className={`card heat${cat ? ` heat-${cat}` : ''}`} aria-label="Heat index">
          <div className="card-body">
            <p className="app-label">{view.label}</p>
            <p className="heat-num">{view.heatIndex}{view.heatIndex !== '—' && <span className="heat-unit">°C</span>}</p>
            {cat && (
              <p className="heat-cat">
                <svg viewBox="0 0 24 24" aria-hidden="true">{SHAPES[cat]}</svg>{categoryLabel(cat, lang)}
              </p>
            )}
            {cat && cat !== 'below-range' && <a className="heat-more" href={`#heat/${cat}`}>{`${t('home.more')} ›`}</a>}
          </div>
        </section>
        <div className="app-pair">
          <section className="card" aria-label={t('home.temperature')}><div className="card-body"><p className="app-label">{t('home.temperature')}</p><p className="stat">{view.temp}</p></div></section>
          <section className="card" aria-label={t('home.humidity')}><div className="card-body"><p className="app-label">{t('home.humidity')}</p><p className="stat">{view.rh}</p></div></section>
        </div>
        <p className="text-secondary app-updated">{failed ? t('home.loadFailed') : view.updated}</p>
        <a className="school-link" href="#school"><span>{t('home.school')}</span><span aria-hidden="true">›</span></a>
        <a className="school-link alerts-link" href="#alerts"><span>{t('home.alerts')}</span><span aria-hidden="true">›</span></a>
        {deviceId && <History deviceId={deviceId} />}
        {deviceId && <Readings deviceId={deviceId} />}
        </>
      )}
    </main>
  );
}
