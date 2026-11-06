// P05-01 / P05-02 / P05-06 admin view at #admin: sign-in, then the room and the device settings, one Save for both.
// Markup and classes match design/admin/proposal-b/*.html (owner chose proposal B, s22). Plain fetch, no supabase-js (D-031).
// The page only shows or hides; the database refuses every change from anyone who is not in `admins` (P05-05).
import { useEffect, useState } from 'react';
import { useLang } from './Lang.jsx';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { checkRoom, canReset, RESET_ROOM, checkSettings, sessionFrom, needsRefresh, initialOf, SETTING_RANGES, signalState, restartState, reportState } from './admin.js';

const STORE = 'init-admin'; // sessionStorage: gone when the tab closes
const KEYS = Object.keys(SETTING_RANGES);
// Offsets always show one decimal (0.0), like the hints; the other values show as stored.
const formFrom = (s) => Object.fromEntries(KEYS.map((k) => [k, k.endsWith('offset_c') || k.endsWith('offset_pct') ? Number(s[k]).toFixed(1) : String(Number(s[k]))]));

const ICON = {
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m10.8 12.2 7.2-7.2M15 8l3 3M17 6l2 2" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16v.01" /></>,
  warn: <><path d="M12 3 22 21H2z" /><path d="M12 10v4M12 17.5v.01" /></>,
  tick: <path d="M5 12l5 5L20 7" />,
  ok: <path d="M5 12.5 10 17.5 19 7.5" />,
  bad: <><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.01" /></>,
  shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9.5 9.5 5 5M14.5 9.5l-5 5" /></>,
};
// F-22: the link under each group box that opens the admin guide at that part.
const How = ({ part }) => { const { t } = useLang(); return <a className="ab-how" href={`#guide/${part}`}><Svg k="help" />{t('admin.how')}</a>; };
const Svg = ({ k }) => <svg viewBox="0 0 24 24" aria-hidden="true">{ICON[k]}</svg>;

function load() { try { return JSON.parse(sessionStorage.getItem(STORE)); } catch { return null; } }
function save(s) { try { if (s) sessionStorage.setItem(STORE, JSON.stringify(s)); else sessionStorage.removeItem(STORE); } catch { /* private mode: stays signed in for this page only */ } }

async function auth(path, body, token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, json: await res.json().catch(() => null) };
}

async function rest(token, path, { method = 'GET', body } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, json: text ? JSON.parse(text) : null };
}

// [id, key of the label, hint (a text key, or the numbers themselves), unit]
const ROWS = [
  ['interval_s', 'admin.interval', '60 to 3600', 's'],
  ['temp_offset_c', 'admin.tempOffset', '−5.0 to +5.0', '°C'],
  ['rh_offset_pct', 'admin.rhOffset', '−10.0 to +10.0', '%'],
];
const ALERT_ROWS = [
  ['alert_heat_index_c', 'admin.alertAt', 'admin.alertAtHint', '°C'],
  ['alert_quiet_min', 'admin.quiet', '10 to 1440', 'min'],
];

function SignIn({ onSession }) {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shown, setShown] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await auth('token?grant_type=password', { email: email.trim(), password });
      const s = r.ok && sessionFrom(r.json, Date.now());
      if (s) { setPassword(''); onSession(s); } else setError(t('admin.wrongLogin'));
    } catch { setError(t('admin.unreachable')); }
    setBusy(false);
  };

  return (
    <div className="ab-center">
      <form className="card ab-card" onSubmit={submit}><div className="card-body">
        <div className="ab-badge"><Svg k="lock" /></div>
        <h2 className="ab-title">{t('admin.title')}</h2>
        <p className="ab-sub">{t('admin.signinSub')}</p>
        {error && <div className="ab-alert" role="alert"><Svg k="alert" />{error}</div>}
        <div className="ab-field"><label className="visually-hidden" htmlFor="email">{t('admin.email')}</label>
          <div className="input-icon"><span className="input-icon-addon"><Svg k="mail" /></span>
            <input className="form-control" id="email" type="email" autoComplete="username" placeholder={t('admin.email')} required value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
        <div className="ab-field"><label className="visually-hidden" htmlFor="pw">{t('admin.password')}</label>
          <div className="input-icon position-relative"><span className="input-icon-addon"><Svg k="key" /></span>
            <input className="form-control" id="pw" type={shown ? 'text' : 'password'} autoComplete="current-password" placeholder={t('admin.password')} required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="ab-eye" aria-label={shown ? t('admin.hidePw') : t('admin.showPw')} aria-pressed={shown} onClick={() => setShown(!shown)}><Svg k="eye" /></button></div></div>
        <button type="submit" className="btn btn-primary w-100 ab-btn" disabled={busy}>{busy ? t('admin.signingIn') : t('admin.signIn')}</button>
      </div></form>
      <p className="ab-foot">{t('admin.viewFoot')}</p>
    </div>
  );
}

function Who({ email, onSignOut }) {
  const { t } = useLang();
  return (
    <div className="ab-who"><span className="ab-avatar" aria-hidden="true">{initialOf(email)}</span>
      <div className="ab-who-text"><strong>{email}</strong><span>{t('admin.title')}</span></div>
      <button type="button" className="ab-link" onClick={onSignOut}>{t('admin.signOut')}</button></div>
  );
}

function Row({ id, label, hint, unit, value, error, onChange, disabled }) {
  const [min, max, step] = SETTING_RANGES[id];
  return (
    <div className="ab-row"><div className="ab-row-text"><label htmlFor={id}>{label}</label><small>{hint}</small>
      {error && <small className="ab-err" id={`${id}-err`}>{error}</small>}</div>
      <div className="input-group"><input className="form-control" id={id} type="number" inputMode="decimal" min={min} max={max} step={step}
        value={value} onChange={(e) => onChange(id, e.target.value)} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-err` : undefined} />
        <span className="input-group-text">{unit}</span></div></div>
  );
}

// P05-04: what the device last said about itself (read-only). `health` is the device_health row, or null when there is none yet.
const State = ({ kind, children }) => <span className={`ab-state ab-state-${kind}`}><Svg k={kind === 'warn' ? 'warn' : kind} />{children}</span>;
const HealthRow = ({ label, hint, children }) => (
  <div className="ab-row"><div className="ab-row-text"><span className="fw-semibold d-block">{label}</span><small>{hint}</small></div><div className="ab-val">{children}</div></div>
);
function Health({ health, nowMs }) {
  const { lang, t } = useLang();
  const NotYet = <small>{t('admin.notYet')}</small>;
  const signal = health && signalState(health.rssi_dbm, lang);
  const restart = health && restartState(health.reset_reason, lang);
  const report = health && reportState(health.reported_at, nowMs, lang);
  const trouble = health && (signal.kind === 'warn' || restart.kind === 'warn' || report?.kind === 'bad');
  return (
    <>
      <p className="ab-group-label">{t('admin.healthGroup')}</p>
      <div className="ab-group">
        <HealthRow label={t('admin.wifi')} hint={t('admin.wifiHint')}>{signal ? <><State kind={signal.kind}>{signal.word}</State><small>{signal.dbm}</small></> : NotYet}</HealthRow>
        <HealthRow label={t('admin.restart')} hint={t('admin.restartHint')}>{restart ? <>{restart.kind ? <State kind={restart.kind}>{restart.word}</State> : restart.word}<small>{restart.code || 'UNKNOWN'}</small></> : NotYet}</HealthRow>
        <HealthRow label={t('admin.firmware')} hint={t('admin.firmwareHint')}>{health ? health.fw_version : NotYet}</HealthRow>
        {health && report && <HealthRow label={t('admin.report')} hint={t('admin.reportHint')}><State kind={report.kind}>{report.word}</State><small>{report.ago}</small></HealthRow>}
      </div>
      {!health && <p className="ab-health-note">{t('admin.noHealth')}</p>}
      {trouble && <p className="ab-health-note">{t('admin.trouble')}</p>}
      <How part="health" />
    </>
  );
}

function Settings({ session, call, deviceId, onSignOut }) {
  const { lang, t } = useLang();
  const [loaded, setLoaded] = useState(null); // { room, settings } as stored
  const [room, setRoom] = useState('');
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null); // { kind: 'saved' | 'error', text }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [d, s, h] = await Promise.all([
        call(`device_status?id=eq.${deviceId}&select=room`),
        call(`settings?device_id=eq.${deviceId}`),
        call(`device_health?device_id=eq.${deviceId}`).catch(() => null), // health is extra: a failure here never blocks the settings
      ]);
      if (!alive) return;
      const stored = { room: d.json?.[0]?.room ?? '', settings: s.json?.[0] || null, health: Array.isArray(h?.json) ? h.json[0] || null : null, nowMs: Date.now() };
      setLoaded(stored);
      setRoom(stored.room);
      if (stored.settings) setForm(formFrom(stored.settings));
    })().catch(() => alive && setMessage({ kind: 'error', text: t('admin.loadFailed') }));
    return () => { alive = false; };
  }, [deviceId, call]);

  const change = (id, v) => { setForm((f) => ({ ...f, [id]: v })); setMessage(null); };

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const r = checkRoom(room, lang);
    const s = loaded.settings ? checkSettings(form, lang) : { ok: true, values: {}, errors: {} };
    setErrors({ ...s.errors, ...(r.ok ? {} : { room: r.error }) });
    if (!r.ok || !s.ok) return;
    setBusy(true);
    try {
      if (r.value !== loaded.room) {
        const res = await call('rpc/admin_set_room', { method: 'POST', body: { p_device: deviceId, p_room: r.value } });
        if (!res.ok) throw new Error(res.status);
      }
      const changed = Object.fromEntries(KEYS.filter((k) => loaded.settings && s.values[k] !== Number(loaded.settings[k])).map((k) => [k, s.values[k]]));
      let settings = loaded.settings;
      if (Object.keys(changed).length) {
        const res = await call(`settings?device_id=eq.${deviceId}`, { method: 'PATCH', body: changed });
        if (!res.ok || !res.json?.length) throw new Error(res.status); // an empty answer = refused by the row rule
        settings = res.json[0];
      }
      setLoaded((was) => ({ ...was, room: r.value, settings }));
      setRoom(r.value);
      setMessage({ kind: 'saved', text: t('admin.saved') });
    } catch { setMessage({ kind: 'error', text: t('admin.notSaved') }); }
    setBusy(false);
  };

  if (!loaded) return <><Who email={session.email} onSignOut={onSignOut} />{message ? <div className="ab-alert" role="alert"><Svg k="alert" />{message.text}</div> : <p className="ab-foot">{t('loading')}</p>}</>;
  const noSettings = !loaded.settings;
  return (
    <>
      <Who email={session.email} onSignOut={onSignOut} />
      <form onSubmit={submit} noValidate>
        <p className="ab-group-label">{t('admin.roomGroup')}</p>
        <div className="ab-group"><div className="ab-row ab-row-wide"><label className="fw-semibold" htmlFor="room">{t('admin.roomLabel')}</label>
          <div className="ab-roomrow"><input className="form-control" id="room" maxLength={60} value={room} onChange={(e) => { setRoom(e.target.value); setMessage(null); }} aria-invalid={Boolean(errors.room)} />
            <button type="button" className="btn ab-reset" disabled={!canReset(room)} onClick={() => { setRoom(RESET_ROOM); setMessage(null); setErrors((was) => ({ ...was, room: undefined })); }}>{t('admin.reset')}</button></div>
          {errors.room && <small className="ab-err">{errors.room}</small>}
          <small className="d-block mt-1 text-secondary">{t('admin.roomHelp')}</small></div></div>
        <How part="room" />

        <Health health={loaded.health} nowMs={loaded.nowMs} />

        <p className="ab-group-label">{t('admin.deviceGroup')}</p>
        <div className="ab-group">
          {noSettings && <div className="ab-note"><Svg k="warn" /><span>{t('admin.noSettings')}</span></div>}
          <Row id={ROWS[0][0]} label={t(ROWS[0][1])} hint={ROWS[0][2]} unit={ROWS[0][3]} value={form[ROWS[0][0]] ?? ''} error={errors[ROWS[0][0]]} onChange={change} disabled={noSettings} />
          <div className="ab-note"><Svg k="warn" /><span>{t('admin.bankNote')}</span></div>
          {ROWS.slice(1).map(([id, label, hint, unit]) => <Row key={id} id={id} label={t(label)} hint={hint} unit={unit} value={form[id] ?? ''} error={errors[id]} onChange={change} disabled={noSettings} />)}
        </div>
        <How part="interval" />

        <p className="ab-group-label">{t('admin.alertsGroup')}</p>
        <div className="ab-group">
          {ALERT_ROWS.map(([id, label, hint, unit]) => <Row key={id} id={id} label={t(label)} hint={hint.startsWith('admin.') ? t(hint) : hint} unit={unit} value={form[id] ?? ''} error={errors[id]} onChange={change} disabled={noSettings} />)}
        </div>
        <How part="alerts" />

        <div className="ab-save"><button type="submit" className="btn btn-primary ab-btn" disabled={busy}>{busy ? t('admin.saving') : t('admin.save')}</button>
          {message?.kind === 'saved' && <span className="ab-saved" role="status"><Svg k="tick" />{t('admin.saved')}</span>}</div>
        {message?.kind === 'error' && <div className="ab-alert" role="alert"><Svg k="alert" />{message.text}</div>}
      </form>
    </>
  );
}

export default function Admin({ deviceId, ready }) {
  const { t } = useLang();
  const [session, setSession] = useState(load);
  const [role, setRole] = useState(null); // null = asking, 'admin', 'not-admin'

  const signIn = (s) => { save(s); setSession(s); setRole(null); };
  const signOut = () => {
    if (session) auth('logout', {}, session.token).catch(() => {});
    save(null); setSession(null); setRole(null);
  };

  // Every call goes through here: refresh the token in its last minute; a failed refresh signs out.
  const [call] = useState(() => async (path, opts) => {
    let s = load();
    if (needsRefresh(s, Date.now())) {
      const r = await auth('token?grant_type=refresh_token', { refresh_token: s.refresh });
      s = r.ok ? sessionFrom(r.json, Date.now()) : null;
      save(s); setSession(s);
      if (!s) throw new Error('signed out');
    }
    return rest(s.token, path, opts);
  });

  useEffect(() => {
    if (!session) return;
    let alive = true;
    call('rpc/is_admin', { method: 'POST', body: {} })
      .then((r) => alive && setRole(r.ok && r.json === true ? 'admin' : 'not-admin'))
      .catch(() => alive && setRole('not-admin'));
    return () => { alive = false; };
  }, [session?.token, call]); // eslint-disable-line react-hooks/exhaustive-deps

  let body;
  if (!session) body = <SignIn onSession={signIn} />;
  else if (role === null) body = <p className="ab-foot">{t('admin.checking')}</p>;
  else if (role === 'not-admin') {
    body = (
      <div className="ab-center"><div className="card ab-card ab-empty"><div className="card-body">
        <div className="ab-badge"><Svg k="shield" /></div>
        <h2 className="ab-title">{t('admin.notAdmin')}</h2>
        <p className="ab-sub">{t('admin.notAdminSub', { email: session.email })}</p>
        <button type="button" className="btn w-100 ab-btn" onClick={signOut}>{t('admin.signOut')}</button>
      </div></div></div>
    );
  } else if (!ready) body = <p className="ab-foot">{t('loading')}</p>;
  else if (!deviceId) body = <><Who email={session.email} onSignOut={signOut} /><p className="ab-foot">{t('admin.noDevice')}</p></>;
  else body = <Settings session={session} call={call} deviceId={deviceId} onSignOut={signOut} />;

  return (<><a className="school-back" href="#">{t('back')}</a>{body}</>);
}
