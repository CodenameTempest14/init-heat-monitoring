// P06-05 (F-18): English / Filipino. Plain data and functions (no browser or React code) so tests/web-i18n.test.js can run them.
// ALL user-facing words of the home page, the status line, the school-day view and the alerts view live here, one list per language.
// The Filipino list is a DRAFT written by the assistant: a teacher or fluent speaker must review it before it counts as final (D-034).
// Not translated on purpose: the name "Init", "heat index" (the term PAGASA uses), units and numbers.
// Not in this first version: the history charts, the readings table, #heat, #guide, #admin, the kiosk and the poster (still English).
// A {name} in a text is filled from the values passed to translate(); **text** is shown in bold (see richParts).

export const LANGS = ['en', 'fil'];
export const STORAGE_KEY = 'init-lang';

export const STRINGS = {
  en: {
    'lang.group': 'Language / Wika',
    'home.room': 'Room: {room}',
    'home.heatIndex': 'Heat index',
    'home.lastHeatIndex': 'Last heat index',
    'home.temperature': 'Temperature',
    'home.humidity': 'Humidity',
    'home.more': 'What does this mean?',
    'home.school': 'School day summary',
    'home.alerts': 'Heat alerts',
    'home.loadFailed': 'Could not load the readings. Will try again.',
    'home.updated': 'updated {age}',
    'home.lastReading': 'last reading {age}',
    'home.noReadings': 'no readings yet',
    'home.loading': 'loading…',
    'status.wait': 'Waiting for the first reading',
    'status.offline': 'Offline: no reading for {d}',
    'status.online': 'Online',
    'age.now': 'just now',
    'age.ago': '{d} ago',
    'age.unknown': 'unknown',
    'dur.min': '{n} min',
    'dur.h': '{n} h',
    'dur.day1': '1 day',
    'dur.days': '{n} days',
    'level.caution': 'Caution',
    'level.extreme-caution': 'Extreme caution',
    'level.danger': 'Danger',
    'level.extreme-danger': 'Extreme danger',
    'level.below-range': 'Below heat-index range',
    'level.no-reading': 'No reading',
    'back': '‹ Live readings',
    'loading': 'Loading…',
    'range': '{a} to {b}',
    'weekdays': 'Sun,Mon,Tue,Wed,Thu,Fri,Sat',
    'months': 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',
    'school.title': 'School day',
    'school.today': 'Today, {day}',
    'school.weekend': 'No school on weekends. Showing the last school day.',
    'school.choose': 'Choose a school day',
    'school.prev': 'Previous',
    'school.next': 'Next',
    'school.noDevice': 'No readings yet.',
    'school.failed': 'Could not load this day. Will try again.',
    'school.noHours': 'No readings during school hours on this day.',
    'school.highest': 'Highest',
    'school.hottestHour': 'Hottest hour',
    'school.lowest': 'Lowest',
    'school.average': 'Average',
    'school.at': 'at {time}',
    'school.avg': '{value} average',
    'school.caption': 'Heat index. Moments below its calculation range (about 27 °C) are left out of these four.',
    'school.barTitle': 'Time in each level',
    'school.barAria': 'Time in each level, as a bar: {list}',
    'school.under1': 'under 1 min',
    'school.window.full': '6:00 AM to 7:15 PM',
    'school.window.now': '6:00 AM to now ({time})',
    'alerts.title': 'Heat alerts',
    'alerts.lead': 'Get a notification on this phone when the classroom gets dangerously hot.',
    'alerts.rule1': 'When the heat index in **{room}** reaches **{threshold}** ({level}).',
    'alerts.rule2': 'If it stays that hot, a reminder comes every **{quiet}**.',
    'alerts.quietHours': '{n} hours',
    'alerts.quietMin': '{n} minutes',
    'alerts.fine': 'No name or email is asked. Only this phone gets the alerts, and you can stop them at any time.',
    'alerts.failed': 'Could not change the alerts on this phone. Please try again.',
    'alerts.start': 'Send me heat alerts',
    'alerts.stop': 'Stop alerts',
    'alerts.on': 'Heat alerts are on for this phone.',
    'alerts.iphone': 'On iPhone, add Init to your Home Screen first, then open it from there.',
    'alerts.step1': 'Tap the Share button (□↑).',
    'alerts.step2': 'Tap **Add to Home Screen**.',
    'alerts.step3': 'Open **Init** from the Home Screen and come back here.',
    'alerts.blocked': 'Notifications are blocked for Init on this phone.',
    'alerts.blockedHelp': "To get alerts, allow notifications for this site in your browser's settings, then come back here.",
    'alerts.unsupported': 'This browser cannot receive heat alerts.',
    'alerts.unsupportedHelp': 'Try Chrome on Android, or on iPhone add Init to the Home Screen.',
  },
  fil: {
    'lang.group': 'Language / Wika',
    'home.room': 'Silid: {room}',
    'home.heatIndex': 'Heat index',
    'home.lastHeatIndex': 'Huling heat index',
    'home.temperature': 'Temperatura',
    'home.humidity': 'Halumigmig',
    'home.more': 'Ano ang ibig sabihin nito?',
    'home.school': 'Buod ng araw sa paaralan',
    'home.alerts': 'Mga babala sa init',
    'home.loadFailed': 'Hindi ma-load ang mga reading. Susubukan muli.',
    'home.updated': 'na-update {age}',
    'home.lastReading': 'huling reading {age}',
    'home.noReadings': 'wala pang reading',
    'home.loading': 'naglo-load…',
    'status.wait': 'Hinihintay ang unang reading',
    'status.offline': 'Offline: walang reading sa loob ng {d}',
    'status.online': 'Online',
    'age.now': 'ngayon lang',
    'age.ago': '{d} na ang nakalipas',
    'age.unknown': 'hindi alam',
    'dur.min': '{n} min',
    'dur.h': '{n} h',
    'dur.day1': '1 araw',
    'dur.days': '{n} araw',
    'level.caution': 'Pag-iingat',
    'level.extreme-caution': 'Matinding pag-iingat',
    'level.danger': 'Panganib',
    'level.extreme-danger': 'Matinding panganib',
    'level.below-range': 'Mababa sa saklaw ng heat index',
    'level.no-reading': 'Walang reading',
    'back': '‹ Mga live na reading',
    'loading': 'Naglo-load…',
    'range': '{a} hanggang {b}',
    'weekdays': 'Lin,Lun,Mar,Miy,Huw,Biy,Sab',
    'months': 'Ene,Peb,Mar,Abr,May,Hun,Hul,Ago,Set,Okt,Nob,Dis',
    'school.title': 'Araw sa paaralan',
    'school.today': 'Ngayon, {day}',
    'school.weekend': 'Walang klase tuwing weekend. Ipinapakita ang huling araw ng klase.',
    'school.choose': 'Pumili ng araw ng klase',
    'school.prev': 'Nakaraan',
    'school.next': 'Susunod',
    'school.noDevice': 'Wala pang reading.',
    'school.failed': 'Hindi ma-load ang araw na ito. Susubukan muli.',
    'school.noHours': 'Walang reading sa oras ng klase sa araw na ito.',
    'school.highest': 'Pinakamataas',
    'school.hottestHour': 'Pinakamainit na oras',
    'school.lowest': 'Pinakamababa',
    'school.average': 'Karaniwan',
    'school.at': 'nang {time}',
    'school.avg': '{value} average',
    'school.caption': 'Heat index. Hindi kasama sa apat na ito ang mga sandaling mababa sa saklaw ng kalkulasyon nito (mga 27 °C).',
    'school.barTitle': 'Oras sa bawat antas',
    'school.barAria': 'Oras sa bawat antas, bilang bar: {list}',
    'school.under1': 'wala pang 1 min',
    'school.window.full': '6:00 AM hanggang 7:15 PM',
    'school.window.now': '6:00 AM hanggang ngayon ({time})',
    'alerts.title': 'Mga babala sa init',
    'alerts.lead': 'Makatanggap ng abiso sa teleponong ito kapag mapanganib na ang init sa silid-aralan.',
    'alerts.rule1': 'Kapag umabot ang heat index sa **{room}** sa **{threshold}** ({level}).',
    'alerts.rule2': 'Kung mananatiling ganoon kainit, may paalala tuwing **{quiet}**.',
    'alerts.quietHours': '{n} oras',
    'alerts.quietMin': '{n} minuto',
    'alerts.fine': 'Walang hinihinging pangalan o email. Ang teleponong ito lang ang makakatanggap ng babala, at maaari mo itong ihinto anumang oras.',
    'alerts.failed': 'Hindi mabago ang mga babala sa teleponong ito. Pakisubukan muli.',
    'alerts.start': 'Padalhan ako ng babala sa init',
    'alerts.stop': 'Ihinto ang mga babala',
    'alerts.on': 'Naka-on ang mga babala sa init sa teleponong ito.',
    'alerts.iphone': 'Sa iPhone, idagdag muna ang Init sa Home Screen, saka buksan mula roon.',
    'alerts.step1': 'Pindutin ang Share button (□↑).',
    'alerts.step2': 'Pindutin ang **Add to Home Screen**.',
    'alerts.step3': 'Buksan ang **Init** mula sa Home Screen at bumalik dito.',
    'alerts.blocked': 'Naka-block ang mga abiso para sa Init sa teleponong ito.',
    'alerts.blockedHelp': 'Para makatanggap ng babala, payagan ang mga abiso para sa site na ito sa settings ng iyong browser, saka bumalik dito.',
    'alerts.unsupported': 'Hindi makatanggap ng babala sa init ang browser na ito.',
    'alerts.unsupportedHelp': 'Subukan ang Chrome sa Android, o sa iPhone ay idagdag ang Init sa Home Screen.',
  },
};

export const normalizeLang = (v) => (LANGS.includes(v) ? v : 'en');

/** The text for `key` in `lang` (English when the language is unknown), with {name} filled from `vars`. A missing key shows itself. */
export function translate(lang, key, vars = {}) {
  const text = STRINGS[normalizeLang(lang)][key] ?? STRINGS.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

/** The level name of a heat-index category ('caution', 'extreme-caution', ..., 'below-range'). */
export const categoryLabel = (cat, lang = 'en') => translate(lang, `level.${cat}`);

/** A list from a comma-separated text (weekday and month names). */
export const listOf = (lang, key) => translate(lang, key).split(',');

/** The remembered language; English when nothing is stored, the value is not one of ours, or the browser blocks storage. */
export function readLang(storage) {
  try { return normalizeLang(storage?.getItem(STORAGE_KEY)); } catch { return 'en'; }
}
export function saveLang(storage, lang) {
  try { storage?.setItem(STORAGE_KEY, normalizeLang(lang)); } catch { /* storage blocked: the choice lasts until the page is closed */ }
}

/** Splits a text with **bold** pieces into [{ text, bold }] so the page can draw <strong> without using raw HTML. */
export function richParts(text) {
  return text.split('**').map((t, i) => ({ text: t, bold: i % 2 === 1 })).filter((p) => p.text !== '');
}
