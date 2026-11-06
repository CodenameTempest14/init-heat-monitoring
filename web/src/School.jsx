// P04-07 school-day view (F-12): highest, hottest hour, lowest and average heat index, and the time spent in each level,
// for one school day (Mon to Fri, 6:00 AM to 7:15 PM, Philippine time). Markup and classes match design/school-day/*.html.
// The numbers come from the database function school_day(); the words and the bar are made in school.js.
import { useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { useLang } from './Lang.jsx';
import { manilaDay, prevSchoolDay, nextSchoolDay, startDay, dayLabel, windowText, statsView, bandsView, barSegments } from './school.js';

const REFRESH_MS = 30000;
const BAR_W = 326;

// One shape per level, so colour is never the only cue (same shapes as the home cards).
const SHAPES = {
  'below-range': <path d="M4 12h16" />,
  'caution': <circle cx="12" cy="12" r="9" />,
  'extreme-caution': <path d="M12 3 22 21H2z" />,
  'danger': <path d="M12 2 22 12 12 22 2 12z" />,
  'extreme-danger': <path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" />,
  'no-reading': <path d="M8 12h8" strokeDasharray="2 3" />,
};
const cls = (key) => (key === 'no-reading' ? 'none' : key); // the CSS names the last one "none"

async function fetchSchoolDay(deviceId, day) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/school_day`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ day, for_device: deviceId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// `ready` is false until the home page knows which device it shows; `deviceId` stays null if there are no readings at all.
export default function School({ deviceId, ready }) {
  const { lang, t } = useLang();
  const [start] = useState(() => startDay(Date.now()));
  const [day, setDay] = useState(start.day);
  const [body, setBody] = useState(null); // null until the first answer for this day
  const [failed, setFailed] = useState(false);
  const today = manilaDay(Date.now());

  useEffect(() => {
    if (!deviceId) return undefined;
    let alive = true;
    setBody(null);
    setFailed(false);
    const load = async () => {
      try {
        const b = await fetchSchoolDay(deviceId, day);
        if (alive) { setBody(b); setFailed(false); }
      } catch {
        if (alive) setFailed(true);
      }
    };
    load();
    const timer = day === today ? setInterval(load, REFRESH_MS) : null; // only today still changes
    return () => { alive = false; if (timer) clearInterval(timer); };
  }, [deviceId, day, today]);

  const shown = body && body.day === day ? body : null; // never the previous day's numbers under the new day's name
  const prev = prevSchoolDay(day, today);
  const next = nextSchoolDay(day, today);
  const note = (
    <p className="viz-note">
      {start.weekend && day === start.day && <>{t('school.weekend')}<br /></>}
      <strong>{dayLabel(day, today, lang)}</strong>{shown ? ` · ${windowText(shown, lang)}` : ''}
    </p>
  );
  const nav = (
    <div className="school-nav" role="group" aria-label={t('school.choose')}>
      <button type="button" className="btn viz-range" disabled={!prev} onClick={() => setDay(prev)}>{prev ? `‹ ${dayLabel(prev, today, lang)}` : `‹ ${t('school.prev')}`}</button>
      <button type="button" className="btn viz-range" disabled={!next} onClick={() => setDay(next)}>{next ? `${dayLabel(next, today, lang)} ›` : `${t('school.next')} ›`}</button>
    </div>
  );
  const card = (children) => <div className="card viz-card"><div className="card-body">{children}</div></div>;

  let content;
  if (ready && !deviceId) content = card(<p className="viz-empty">{t('school.noDevice')}</p>);
  else if (failed) content = card(<p className="viz-empty">{t('school.failed')}</p>);
  else if (!shown) content = card(<p className="viz-empty">{t('loading')}</p>);
  else if (shown.readings === 0) content = card(<p className="viz-empty">{t('school.noHours')}</p>);
  else {
    const stats = statsView(shown, lang);
    const segs = barSegments(shown.levels, BAR_W);
    const bands = bandsView(shown.levels, lang);
    content = (
      <>
        {card(
          <>
            <dl className="school-stats">
              {[['highest', stats.highest], ['hottestHour', stats.hour], ['lowest', stats.lowest], ['average', stats.average]].map(([name, [value, small]]) => (
                <div className="school-stat" key={name}><dt>{t(`school.${name}`)}</dt><dd>{value}{small && <small>{small}</small>}</dd></div>
              ))}
            </dl>
            <p className="viz-caption">{t('school.caption')}</p>
          </>,
        )}
        {card(
          <>
            <h3 className="viz-title">{t('school.barTitle')}</h3>
            <svg className="school-bar" viewBox={`0 0 ${BAR_W} 24`} role="img"
              aria-label={t('school.barAria', { list: bands.filter((b) => b.seconds).map((b) => `${b.name} ${b.text}`).join(', ') })}>
              {segs.map((s) => <rect key={s.key} className={`sb-${cls(s.key)}`} x={s.x.toFixed(1)} y="1" width={s.w.toFixed(1)} height="22" rx="3" />)}
            </svg>
            <ul className="school-bands">
              {bands.map((b) => (
                <li key={b.key}>
                  <span className={`school-chip sc-${cls(b.key)}`}><svg viewBox="0 0 24 24" aria-hidden="true">{SHAPES[b.key]}</svg></span>
                  <span>{b.name}</span><strong>{b.text}</strong>
                </li>
              ))}
            </ul>
          </>,
        )}
      </>
    );
  }

  return (
    <>
      <a className="school-back" href="#">{t('back')}</a>
      <section className="viz-wrap" aria-label={t('school.title')}>
        <h2 className="viz-section">{t('school.title')}</h2>
        {note}
        {nav}
        {content}
      </section>
    </>
  );
}
