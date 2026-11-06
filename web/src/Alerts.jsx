// P05-03 (F-10, P5-h): the #alerts view. Anyone can ask for heat alerts on their phone and stop them again.
// Markup and classes match design/alerts/*.html (approved by the owner, s31); the logic is in alerts.js.
// Permission is asked only when the button is tapped, never on load. Only the push address and the browser's keys go
// to the database (push_subscribe); nothing about the person.
import { useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY, VAPID_PUBLIC_KEY } from './config.js';
import { useLang, Rich } from './Lang.jsx';
import { pushState, isIOS, keyToBytes, subscribeBody, unsubscribeBody, ruleView } from './alerts.js';

const ICON = {
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  off: <><path d="M6 8a6 6 0 0 1 9.3-5" /><path d="M18 8c0 7 3 9 3 9H9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /><path d="m2 2 20 20" /></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></>,
};
const Icon = ({ name }) => <svg viewBox="0 0 24 24" aria-hidden="true">{ICON[name]}</svg>;

const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' };
const rpc = (fn, body) => fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(body) });

async function fetchSettings(deviceId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/settings?device_id=eq.${deviceId}&select=alert_heat_index_c,alert_quiet_min`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json())[0] || null;
}

// The service worker's registration, or null when there is none within a few seconds (e.g. the dev server).
const registration = () => Promise.race([navigator.serviceWorker.ready, new Promise((ok) => setTimeout(() => ok(null), 5000))]);

function browserNow() {
  return {
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPushManager: 'PushManager' in window,
    hasNotification: 'Notification' in window,
    ios: isIOS(navigator),
    standalone: window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
    permission: 'Notification' in window ? Notification.permission : 'default',
    subscribed: false,
  };
}

export default function Alerts({ deviceId, ready, room }) {
  const { lang, t } = useLang();
  const [state, setState] = useState(null); // null until the browser has been checked
  const [settings, setSettings] = useState(undefined); // undefined = not loaded yet; null = no row (defaults)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const env = browserNow();
      if (['off', 'blocked'].includes(pushState(env))) {
        const reg = await registration();
        env.subscribed = Boolean(reg && (await reg.pushManager.getSubscription()));
      }
      if (alive) setState(pushState(env));
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    if (!deviceId) { setSettings(null); return undefined; }
    let alive = true;
    fetchSettings(deviceId).then((s) => alive && setSettings(s)).catch(() => alive && setSettings(null));
    return () => { alive = false; };
  }, [deviceId, ready]);

  async function start() {
    setBusy(true); setError(false);
    try {
      const answer = await Notification.requestPermission();
      if (answer === 'denied') { setState('blocked'); return; }
      if (answer !== 'granted') return; // the prompt was closed: nothing changes
      const reg = await registration();
      if (!reg) throw new Error('no service worker');
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(VAPID_PUBLIC_KEY) });
      const res = await rpc('push_subscribe', subscribeBody(sub.toJSON()));
      if (!res.ok) { await sub.unsubscribe(); throw new Error(`HTTP ${res.status}`); }
      setState('on');
    } catch {
      setError(true);
    } finally { setBusy(false); }
  }

  async function stop() {
    setBusy(true); setError(false);
    try {
      const reg = await registration();
      const sub = reg && (await reg.pushManager.getSubscription());
      if (sub) {
        await rpc('push_unsubscribe', unsubscribeBody(sub.toJSON())).catch(() => {}); // the server also drops it on its first failed send
        await sub.unsubscribe();
      }
      setState('off');
    } catch {
      setError(true);
    } finally { setBusy(false); }
  }

  const r = settings === undefined ? null : ruleView(settings, room, lang);
  const rule = r && (
    <>
      <p className="alerts-lead">{t('alerts.lead')}</p>
      <ul className="alerts-rule">
        <li><span><Rich text={t('alerts.rule1', { room: r.room, threshold: r.threshold, level: r.level })} /></span></li>
        <li><span><Rich text={t('alerts.rule2', { quiet: r.quiet })} /></span></li>
      </ul>
    </>
  );
  const fine = <p className="alerts-fine">{t('alerts.fine')}</p>;
  const failed = error && <p className="alerts-fine" role="alert">{t('alerts.failed')}</p>;
  const said = (icon, text, live = true) => <p className="alerts-state" role={live ? 'status' : undefined}><Icon name={icon} /><span>{text}</span></p>;

  let body = <p className="viz-empty">{t('loading')}</p>;
  if (rule && state === 'off') {
    body = <>{rule}<button type="button" className="btn btn-primary alerts-btn" disabled={busy} onClick={start}><Icon name="bell" /><span>{t('alerts.start')}</span></button>{failed}{fine}</>;
  } else if (rule && state === 'on') {
    body = <>{said('check', t('alerts.on'))}{rule}<button type="button" className="btn alerts-btn" disabled={busy} onClick={stop}>{t('alerts.stop')}</button>{failed}{fine}</>;
  } else if (rule && state === 'iphone') {
    body = (
      <>
        {rule}
        {said('phone', t('alerts.iphone'), false)}
        <ol className="alerts-steps"><li><Rich text={t('alerts.step1')} /></li><li><Rich text={t('alerts.step2')} /></li><li><Rich text={t('alerts.step3')} /></li></ol>
      </>
    );
  } else if (rule && state === 'blocked') {
    body = <>{said('off', t('alerts.blocked'))}{rule}<p className="alerts-lead">{t('alerts.blockedHelp')}</p></>;
  } else if (rule && state === 'unsupported') {
    body = <>{said('off', t('alerts.unsupported'))}{rule}<p className="alerts-lead">{t('alerts.unsupportedHelp')}</p></>;
  }

  return (
    <>
      <a className="school-back" href="#">{t('back')}</a>
      <section className="viz-wrap" aria-label={t('alerts.title')}>
        <h2 className="viz-section">{t('alerts.title')}</h2>
        <div className="card viz-card"><div className="card-body" data-alerts-ready={rule && state ? '' : undefined}>
          {body}
        </div></div>
      </section>
    </>
  );
}
