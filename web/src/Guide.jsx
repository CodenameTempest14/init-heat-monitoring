// F-22 admin guide (#guide, D-034): plain text for the admins (high-school students), readable without signing in.
// Markup and classes match design/admin-guide/guide.html (the approved design); the wording is a draft until a teacher reviews it.
// #guide opens at the top; #guide/room, #guide/health, #guide/interval and #guide/alerts (the How? links on the admin page) open at that part.
// English and Filipino (F-18): the words are in i18n-guide.js; **bold** pieces are drawn by <Rich>.
import { Fragment, useEffect } from 'react';
import { useLang, Rich } from './Lang.jsx';

const Warn = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2z" /><path d="M12 10v4M12 17.5v.01" /></svg>;

const IDS = ['start', 'room', 'health', 'interval', 'offsets', 'alerts', 'wrong'];

export default function Guide({ section }) {
  const { t } = useLang();
  const R = ({ k }) => <Rich text={t(k)} />;
  const Note = ({ k }) => <div className="gd-note"><Warn /><span>{t(k)}</span></div>;
  const Example = ({ k }) => <div className="gd-example"><span className="gd-label">{t('guide.example')}</span><Rich text={t(k)} /></div>;
  const Sec = ({ n, id, children }) => (
    <section className="gd-sec" id={id}><h2><span className="gd-num">{n}</span>{t(`guide.s.${id}`)}</h2>{children}</section>
  );
  const Table = ({ head, rows, text }) => (
    <table className={`gd-table${text ? ' gd-table-text' : ''}`}><thead><tr><th>{t(head[0])}</th><th>{t(head[1])}</th></tr></thead>
      <tbody>{rows.map(([a, b]) => <tr key={a}><td>{t(a)}</td><td><R k={b} /></td></tr>)}</tbody></table>
  );
  useEffect(() => {
    const el = section ? document.getElementById(section) : null;
    if (el) el.scrollIntoView();
  }, [section]);

  return (
    <>
      <a className="school-back" href="#admin">{t('guide.back')}</a>
      <h2 className="visually-hidden">{t('guide.hidden')}</h2>
      <p className="gd-intro">{t('guide.intro')}</p>
      <nav className="gd-toc" aria-label={t('guide.tocLabel')}><p>{t('guide.toc')}</p><ol>
        {IDS.map((id) => <li key={id}><a href={`#guide/${id}`}>{t(`guide.s.${id}`)}</a></li>)}
      </ol></nav>

      <Sec n={1} id="start">
        <p>{t('guide.start1')}</p>
        <p><R k="guide.start2" /></p>
        <p>{t('guide.start3')}</p>
      </Sec>

      <Sec n={2} id="room">
        <h3>{t('guide.what')}</h3>
        <p>{t('guide.room1')}</p>
        <h3>{t('guide.when')}</h3>
        <p>{t('guide.room2')}</p>
        <h3>{t('guide.steps')}</h3>
        <ol><li>{t('guide.room3a')}</li><li><R k="guide.room3b" /></li><li><R k="guide.room3c" /></li></ol>
        <p><R k="guide.room4" /></p>
        <Note k="guide.room5" />
      </Sec>

      <Sec n={3} id="health">
        <h3>{t('guide.what')}</h3>
        <p>{t('guide.health1')}</p>
        <h3>{t('guide.whenLook')}</h3>
        <p>{t('guide.health2')}</p>
        <h3>{t('guide.health3')}</h3>
        <Table text head={['guide.th.line', 'guide.th.tells']} rows={[
          ['guide.row.wifi', 'guide.row.wifiText'], ['guide.row.restart', 'guide.row.restartText'],
          ['guide.row.firmware', 'guide.row.firmwareText'], ['guide.row.report', 'guide.row.reportText']]} />
        <h3>{t('guide.health4')}</h3>
        <p>{t('guide.health5')}</p>
        <Example k="guide.health6" />
        <h3>{t('guide.health7')}</h3>
        <Table text head={['guide.th.says', 'guide.th.do']} rows={[
          ['guide.why1', 'guide.why1Text'], ['guide.why2', 'guide.why2Text'], ['guide.why3', 'guide.why3Text'], ['guide.why4', 'guide.why4Text']]} />
        <Note k="guide.health8" />
      </Sec>

      <Sec n={4} id="interval">
        <h3>{t('guide.what')}</h3>
        <p>{t('guide.interval1')}</p>
        <h3>{t('guide.when')}</h3>
        <p><R k="guide.interval2" /></p>
        <h3>{t('guide.steps')}</h3>
        <ol><li><R k="guide.interval3a" /></li><li>{t('guide.interval3b')}</li><li><R k="guide.interval3c" /></li></ol>
        <Example k="guide.interval4" />
      </Sec>

      <Sec n={5} id="offsets">
        <h3>{t('guide.what')}</h3>
        <p>{t('guide.offsets1')}</p>
        <h3>{t('guide.when')}</h3>
        <p>{t('guide.offsets2')}</p>
        <h3>{t('guide.steps')}</h3>
        <ol><li>{t('guide.offsets3a')}</li><li>{t('guide.offsets3b')}</li><li>{t('guide.offsets3c')}</li><li>{t('guide.offsets3d')}</li><li>{t('guide.offsets3e')}</li><li><R k="guide.offsets3f" /></li></ol>
        <Example k="guide.offsets4" />
        <p>{t('guide.offsets5')}</p>
        <Note k="guide.offsets6" />
      </Sec>

      <Sec n={6} id="alerts">
        <Note k="guide.alerts1" />
        <h3>{t('guide.alerts2')}</h3>
        <p>{t('guide.alerts3')}</p>
        <table className="gd-table"><thead><tr><th>{t('guide.th.level')}</th><th>{t('guide.th.hi')}</th></tr></thead><tbody>
          {['caution', 'extreme-caution', 'danger', 'extreme-danger'].map((l) => <tr key={l}><td>{t(`level.${l}`)}</td><td>{t(`guide.range.${l}`)}</td></tr>)}</tbody></table>
        <h3>{t('guide.alerts4')}</h3>
        <p><R k="guide.alerts5" /></p>
        <h3>{t('guide.alerts6')}</h3>
        <p>{t('guide.alerts7')}</p>
        <h3>{t('guide.steps')}</h3>
        <ol><li><R k="guide.alerts8a" /></li><li><R k="guide.alerts8b" /></li><li><R k="guide.alerts8c" /></li></ol>
      </Sec>

      <Sec n={7} id="wrong">
        <dl className="gd-qa">
          {[1, 2, 3].map((i) => <Fragment key={i}><dt>{t(`guide.wrong${i}q`)}</dt><dd>{t(`guide.wrong${i}a`)}</dd></Fragment>)}
        </dl>
      </Sec>
    </>
  );
}
