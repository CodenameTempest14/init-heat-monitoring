// F-15 extended "What does this mean?" page (#heat, #heat/<level>): what the heat index is, what each PAGASA level can do to the body,
// what to prepare, and the warning signs. Plain text for students and teachers, readable without signing in, no server change.
// Markup and classes match design/heat-info/heat.html (the approved design); the wording is a DRAFT until a teacher reviews it (D-034).
// #heat opens at the top; #heat/<level> (the link in the heat card on the home page) opens at that level.
import { useEffect } from 'react';
import { art } from './heatArt.js';
import { LEVELS } from './heatText.js';

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
  useEffect(() => {
    const el = section ? document.getElementById(section) : null;
    if (el) el.scrollIntoView();
  }, [section]);

  return (
    <>
      <a className="school-back" href="#">‹ Live readings</a>
      <h2 className="visually-hidden">What the heat index means</h2>
      <p className="gd-intro">What the number means, what the heat can do to your body, and what to do about it.</p>
      <div className="gd-note" style={{ margin: '0 0 16px' }}><Warn /><span>This is general advice, not official DepEd or PAGASA guidance. If someone is very unwell, tell a teacher and get medical help.</span></div>
      <nav className="gd-toc" aria-label="Sections"><p>On this page</p><ol>
        <li><a href="#heat/what">What is the heat index?</a></li>
        {LEVELS.map((l) => <li key={l.id}><a href={`#heat/${l.id}`}>{l.name}</a></li>)}
        <li><a href="#heat/signs">Warning signs</a></li>
      </ol></nav>

      <section className="gd-sec" id="what"><h2>What is the heat index?</h2>
        <Art id="what" />
        <p>It is how hot it feels to your body. It uses the air temperature and the humidity together.</p>
        <p>When the air is humid, sweat dries slowly, so your body cannot cool down well. That is why 33 °C with high humidity feels much hotter than 33 °C in dry air.</p>
        <p>The levels and numbers below are from PAGASA. This device measures inside the classroom.</p></section>

      {LEVELS.map((l) => (
        <section key={l.id} className={`gd-sec hl-sec hl-${l.id}`} id={l.id}>
          <h2><span className={`school-chip sc-${l.id}`}><svg viewBox="0 0 24 24" aria-hidden="true">{SHAPES[l.id]}</svg></span>{l.name}</h2>
          <Art id={l.id} />
          <p className="hl-range">{l.range}</p>
          <h3>What it can do to the body</h3>
          <p>{l.body}</p>
          <h3>What to prepare and do</h3>
          <ul>{l.todo.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
      ))}

      <section className="gd-sec" id="signs"><h2>Warning signs</h2>
        <h3>Heat exhaustion</h3>
        <ul className="hl-signs"><li>Heavy sweating, cool and damp skin</li><li>Feeling dizzy, weak or very tired</li><li>Headache or feeling sick</li></ul>
        <p><strong>What to do:</strong> tell a teacher. Move to a cooler, shady place. Loosen tight clothes. Sip water.</p>
        <h3>Heat stroke</h3>
        <ul className="hl-signs"><li>Confusion, or not making sense</li><li>Fainting</li><li>Very hot skin, with or without sweat</li></ul>
        <p><strong>What to do:</strong> this is an emergency. Get an adult and medical help straight away. Move the person to a cooler place while you wait.</p>
        <div className="gd-note"><Warn /><span>When you are not sure, treat it as serious and ask for help.</span></div></section>
    </>
  );
}
