// F-15 extended "What does this mean?" page (#heat, #heat/<level>): what the heat index is, what each PAGASA level can do to the body,
// what to prepare, and the warning signs. Plain text for students and teachers, readable without signing in, no server change.
// Markup and classes match design/heat-info/heat.html (the approved design); the wording is a DRAFT until a teacher reviews it (D-034).
// #heat opens at the top; #heat/<level> (the link in the heat card on the home page) opens at that level.
// English and Filipino (F-18): the words are in i18n-guide.js and heatText.js.
import { useEffect } from 'react';
import { art } from './heatArt.js';
import { levelsFor } from './heatText.js';
import { useLang, Rich } from './Lang.jsx';

const Warn = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2z" /><path d="M12 10v4M12 17.5v.01" /></svg>;
const SHAPES = {
  'caution': <circle cx="12" cy="12" r="9" />,
  'extreme-caution': <path d="M12 3 22 21H2z" />,
  'danger': <path d="M12 2 22 12 12 22 2 12z" />,
  'extreme-danger': <path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" />,
};
// The pictures are our own drawings (heatArt.js), never user input, so inserting them as markup is safe.
const Art = ({ id }) => <div dangerouslySetInnerHTML={{ __html: art(id) }} />;

export default function Heat({ section }) {
  const { lang, t } = useLang();
  const levels = levelsFor(lang);
  useEffect(() => {
    const el = section ? document.getElementById(section) : null;
    if (el) el.scrollIntoView();
  }, [section]);

  return (
    <>
      <a className="school-back" href="#">{t('back')}</a>
      <h2 className="visually-hidden">{t('heat.hidden')}</h2>
      <p className="gd-intro">{t('heat.intro')}</p>
      <div className="gd-note" style={{ margin: '0 0 16px' }}><Warn /><span>{t('heat.note')}</span></div>
      <nav className="gd-toc" aria-label={t('heat.tocLabel')}><p>{t('heat.toc')}</p><ol>
        <li><a href="#heat/what">{t('heat.whatTitle')}</a></li>
        {levels.map((l) => <li key={l.id}><a href={`#heat/${l.id}`}>{l.name}</a></li>)}
        <li><a href="#heat/signs">{t('heat.signsTitle')}</a></li>
      </ol></nav>

      <section className="gd-sec" id="what"><h2>{t('heat.whatTitle')}</h2>
        <Art id="what" />
        <p>{t('heat.what1')}</p>
        <p>{t('heat.what2')}</p>
        <p>{t('heat.what3')}</p></section>

      {levels.map((l) => (
        <section key={l.id} className={`gd-sec hl-sec hl-${l.id}`} id={l.id}>
          <h2><span className={`school-chip sc-${l.id}`}><svg viewBox="0 0 24 24" aria-hidden="true">{SHAPES[l.id]}</svg></span>{l.name}</h2>
          <Art id={l.id} />
          <p className="hl-range">{l.range}</p>
          <h3>{t('heat.bodyTitle')}</h3>
          <p>{l.body}</p>
          <h3>{t('heat.todoTitle')}</h3>
          <ul>{l.todo.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
      ))}

      <section className="gd-sec" id="signs"><h2>{t('heat.signsTitle')}</h2>
        <h3>{t('heat.exhaustion')}</h3>
        <ul className="hl-signs"><li>{t('heat.exh1')}</li><li>{t('heat.exh2')}</li><li>{t('heat.exh3')}</li></ul>
        <p><Rich text={t('heat.exhDo')} /></p>
        <h3>{t('heat.stroke')}</h3>
        <ul className="hl-signs"><li>{t('heat.stroke1')}</li><li>{t('heat.stroke2')}</li><li>{t('heat.stroke3')}</li></ul>
        <p><Rich text={t('heat.strokeDo')} /></p>
        <div className="gd-note"><Warn /><span>{t('heat.sure')}</span></div></section>
    </>
  );
}
