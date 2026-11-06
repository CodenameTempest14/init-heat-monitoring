// P06-05 (F-18): the chosen language for the whole app, the switch on the Room line, and a helper for **bold** pieces of a text.
// The words are in i18n.js. The choice is kept in this browser (localStorage) and the page's lang attribute follows it.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translate, readLang, saveLang, richParts, normalizeLang } from './i18n.js';

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (key, vars) => translate('en', key, vars) });

const store = () => { try { return window.localStorage; } catch { return undefined; } };

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => readLang(store()));
  useEffect(() => { document.documentElement.setAttribute('lang', lang); }, [lang]);
  const value = useMemo(() => ({
    lang,
    setLang: (next) => { saveLang(store(), next); setLangState(normalizeLang(next)); },
    t: (key, vars) => translate(lang, key, vars),
  }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** The switch: two buttons in one pill. The chosen one is filled and has a check mark (colour is never the only signal). */
export function LangSwitch() {
  const { lang, setLang, t } = useLang();
  const btn = (code, name) => (
    <button type="button" className="lang-btn" lang={code} aria-pressed={lang === code} onClick={() => setLang(code)}>
      {lang === code && <span aria-hidden="true">✓ </span>}{name}
    </button>
  );
  return <div className="lang-switch" role="group" aria-label={t('lang.group')}>{btn('en', 'English')}{btn('fil', 'Filipino')}</div>;
}

/** A text from i18n.js with **bold** pieces drawn as <strong>. */
export const Rich = ({ text }) => <>{richParts(text).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : p.text))}</>;
