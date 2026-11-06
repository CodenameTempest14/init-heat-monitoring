// Words of the #heat page (F-15 extended): one entry per PAGASA level. A DRAFT: general advice, not official DepEd or PAGASA guidance,
// and a teacher reviews every sentence before it goes live (D-034). Ranges are D-019 (27 / 33 / 42 / 52). The design mocks in
// design/heat-info/ import this same file.
export const LEVELS = [
  { id: 'caution', name: 'Caution', range: 'Heat index 27 to 32 °C',
    body: 'You can get tired if you stay active in the heat for a long time.',
    todo: ['Keep a water bottle with you.', 'If you feel tired, rest in a shady or cooler place.'] },
  { id: 'extreme-caution', name: 'Extreme caution', range: 'Heat index 33 to 41 °C',
    body: 'Heat cramps (painful tight muscles) and heat exhaustion (very tired, dizzy, sweating a lot) can happen. If you keep going without a rest, it can get worse.',
    todo: ['Drink water often, even if you are not thirsty.', 'Wear light-coloured, loose clothes.', 'Open the windows and use a fan if you have one.', 'Take rest breaks in the shade.', 'Do hard activities, like sports, in a cooler place or at a cooler time.'] },
  { id: 'danger', name: 'Danger', range: 'Heat index 42 to 51 °C',
    body: 'Heat cramps and heat exhaustion are likely. Heat stroke can happen if you stay active in this heat.',
    todo: ['Cut down or stop hard activity, most of all between 12:00 and 4:00 in the afternoon.', 'Move class activities to the coolest, shadiest place you have.', 'Drink water often and rest often.', 'Tell a teacher right away if someone feels unwell.', 'Learn the warning signs below.'] },
  { id: 'extreme-danger', name: 'Extreme danger', range: 'Heat index 52 °C and up',
    body: 'Heat stroke is very likely. Heat stroke is an emergency.',
    todo: ['Stay out of the heat. No hard activity.', 'Move everyone to the coolest place.', 'Drink water.', 'If someone shows a warning sign, tell a teacher and get medical help straight away.'] },
];

// The same four levels in Filipino (F-18). A DRAFT written by the assistant: a teacher or fluent speaker must review every sentence
// before it goes live (D-034). Same ids, same number of advice lines, same numbers (tests/web-i18n.test.js).
export const LEVELS_FIL = [
  { id: 'caution', name: 'Pag-iingat', range: 'Heat index 27 hanggang 32 °C',
    body: 'Maaari kang mapagod kung matagal kang aktibo sa init.',
    todo: ['Magdala ng bote ng tubig.', 'Kung pagod ka na, magpahinga sa may lilim o mas malamig na lugar.'] },
  { id: 'extreme-caution', name: 'Matinding pag-iingat', range: 'Heat index 33 hanggang 41 °C',
    body: 'Maaaring mangyari ang heat cramps (masakit at naninigas na kalamnan) at heat exhaustion (sobrang pagod, nahihilo, labis ang pawis). Kung magpapatuloy ka nang walang pahinga, maaari itong lumala.',
    todo: ['Uminom ng tubig nang madalas, kahit hindi ka nauuhaw.', 'Magsuot ng maluwag na damit na mapusyaw ang kulay.', 'Buksan ang mga bintana at gumamit ng bentilador kung mayroon.', 'Magpahinga sa lilim.', 'Gawin ang mabibigat na aktibidad, tulad ng sports, sa mas malamig na lugar o oras.'] },
  { id: 'danger', name: 'Panganib', range: 'Heat index 42 hanggang 51 °C',
    body: 'Malamang mangyari ang heat cramps at heat exhaustion. Maaaring mangyari ang heat stroke kung mananatili kang aktibo sa ganitong init.',
    todo: ['Bawasan o itigil ang mabibigat na aktibidad, lalo na mula 12:00 hanggang 4:00 ng hapon.', 'Ilipat ang mga aktibidad ng klase sa pinakamalamig at pinakamalilim na lugar na mayroon kayo.', 'Uminom ng tubig at magpahinga nang madalas.', 'Sabihin agad sa guro kung may masama ang pakiramdam.', 'Alamin ang mga palatandaan ng panganib sa ibaba.'] },
  { id: 'extreme-danger', name: 'Matinding panganib', range: 'Heat index 52 °C pataas',
    body: 'Napakalamang mangyari ang heat stroke. Ang heat stroke ay emergency.',
    todo: ['Lumayo sa init. Walang mabibigat na aktibidad.', 'Ilipat ang lahat sa pinakamalamig na lugar.', 'Uminom ng tubig.', 'Kung may nagpapakita ng palatandaan, sabihin sa guro at humingi agad ng tulong medikal.'] },
];

/** The level texts in `lang` ('en' is the default and also the fallback). */
export const levelsFor = (lang = 'en') => (lang === 'fil' ? LEVELS_FIL : LEVELS);
