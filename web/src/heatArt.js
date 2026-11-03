// Clip-art pictures for the #heat page (F-15 extended; the design mocks in design/heat-info/ import this same file): friendly flat cartoons with a dark outline, drawn as inline SVG.
// No image files, no copyright, they work offline. Fixed bright colours on a pale "sticker" panel (see heat-info.css), so they look
// the same in light and dark mode. They are decoration: the text says everything, so they are hidden from screen readers.
const OUT = '#243044';
const SKIN = '#e8b48a';
const HAIR = '#3b2a20';
const SUN = '#ffc53d';
const HOT = '#ff7a2f';
const RED = '#e5484d';
const BLUE = '#3b9cf5';
const LBLUE = '#cfeaff';
const GREEN = '#4cc38a';
const AMBER = '#f5a524';
const WHITE = '#ffffff';
const PURPLE = '#8e6bd8';

const stroke = `stroke="${OUT}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"`;
const at = (x, y, s, inner) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;

// Faces (local coordinates, centre 0,0)
const FACES = {
  happy: `<circle cx="-5" cy="-1" r="2" fill="${OUT}"/><circle cx="5" cy="-1" r="2" fill="${OUT}"/><path d="M-5 5Q0 10 5 5" fill="none" ${stroke}/>`,
  hot: `<path d="M-8 -3l5 2M8 -3l-5 2" fill="none" ${stroke}/><circle cx="-5" cy="0" r="2" fill="${OUT}"/><circle cx="5" cy="0" r="2" fill="${OUT}"/><path d="M-5 8Q0 4 5 8" fill="none" ${stroke}/>`,
  sweat: `<path d="M-8 -1q3-3 6 0M2 -1q3-3 6 0" fill="none" ${stroke}/><path d="M-5 7q2.5-3 5 0t5 0" fill="none" ${stroke}/>`,
  tired: `<path d="M-8 0q3 3 6 0M2 0q3 3 6 0" fill="none" ${stroke}/><path d="M-4 7h8" fill="none" ${stroke}/>`,
  dizzy: `<path d="M-8 -3a3 3 0 1 1 3 3a1.5 1.5 0 1 1 1.5-1.5M2 -3a3 3 0 1 1 3 3a1.5 1.5 0 1 1 1.5-1.5" fill="none" ${stroke} stroke-width="1.8"/><path d="M-5 8q2.5-3 5 0t5 0" fill="none" ${stroke}/>`,
};
const drop = (x, y, s, fill = BLUE, shine = true) => at(x, y, s, `<path d="M0-10C0-10-7-1-7 3a7 7 0 0 0 14 0C7-1 0-10 0-10z" fill="${fill}" ${stroke} stroke-width="2"/>${shine ? `<path d="M-3.5 3a3.5 3.5 0 0 0 3 3.5" fill="none" stroke="${WHITE}" stroke-width="1.8" stroke-linecap="round"/>` : ''}`);

// A kid, bust only. Origin = the centre of the head. `arm`: 'down' | 'up' (the right hand is raised to hold something).
const kid = (x, y, s, { shirt, face, arm = 'down' }) => at(x, y, s, `
  <path d="M-16 42q0-14 10-14h12q10 0 10 14v3q0 4-4 4h-24q-4 0-4-4z" fill="${shirt}" ${stroke}/>
  ${arm === 'up' ? `<path d="M12 36q12 0 12-14" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M12 36q12 0 12-14" fill="none" stroke="${shirt}" stroke-width="5.5" stroke-linecap="round"/><circle cx="24" cy="20" r="5" fill="${SKIN}" ${stroke}/>` : ''}
  <rect x="-4.5" y="13" width="9" height="9" fill="${SKIN}"/><path d="M-4.5 14v8M4.5 14v8" fill="none" ${stroke}/>
  <circle cx="0" cy="0" r="15" fill="${SKIN}" ${stroke}/>
  <path d="M-15 -2A15 15 0 0 1 15 -2Q9-10 0-9Q-9-10-15-2z" fill="${HAIR}" ${stroke}/>
  ${FACES[face]}`);

// A soft white blob behind a group, so each picture has a focus.
const blob = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.25}" ry="${r}" fill="#ffffff" opacity=".5"/>`;
const bottle = (x, y, s) => at(x, y, s, `<rect x="-4" y="-17" width="8" height="5" rx="1.5" fill="${OUT}"/><path d="M-6-12h12q3 0 3 3v22q0 5-5 5h-8q-5 0-5-5v-22q0-3 3-3z" fill="${LBLUE}" ${stroke}/><path d="M-8 -1h16v14q0 3-4 3h-8q-4 0-4-3z" fill="${BLUE}"/>`);
const glass = (x, y, s) => at(x, y, s, `<path d="M-10-12h20l-3 26q0 3-3 3h-8q-3 0-3-3z" fill="${LBLUE}" ${stroke}/><path d="M-8.5 -1h17l-2 14q0 2-2 2h-9q-2 0-2-2z" fill="${BLUE}"/>`);

const rays = (r) => [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M${(Math.cos((a * Math.PI) / 180) * (r + 5)).toFixed(1)} ${(Math.sin((a * Math.PI) / 180) * (r + 5)).toFixed(1)}L${(Math.cos((a * Math.PI) / 180) * (r + 13)).toFixed(1)} ${(Math.sin((a * Math.PI) / 180) * (r + 13)).toFixed(1)}" fill="none" ${stroke} stroke-width="3.5"/>`).join('');
const sun = (x, y, r, fill, face) => at(x, y, 1, `${rays(r)}<circle r="${r}" fill="${fill}" ${stroke}/>${at(0, 0, r / 15, FACES[face])}`);

const thermometer = (x, y, s, full) => at(x, y, s, `<rect x="-9" y="-44" width="18" height="70" rx="9" fill="${WHITE}" ${stroke}/><circle cx="0" cy="30" r="14" fill="${RED}" ${stroke}/><rect x="-4" y="${full ? -36 : -14}" width="8" height="${full ? 70 : 48}" rx="4" fill="${RED}"/><path d="M-9 -26h6M-9 -14h6M-9 -2h6" fill="none" ${stroke} stroke-width="2"/>`);
const umbrella = (x, y, s) => at(x, y, s, `<path d="M-46 0a46 38 0 0 1 92 0q-8-8-15.3 0q-7.7-8-15.4 0q-7.6-8-15.3 0q-7.7-8-15.4 0q-7.6-8-15.3 0z" fill="${RED}" ${stroke}/><path d="M0 -38v-6" fill="none" ${stroke}/><path d="M0 0v40q0 7-7 7" fill="none" ${stroke} stroke-width="3.5"/><path d="M-15 -34q-8 14-8 34M15 -34q8 14 8 34" fill="none" stroke="${WHITE}" stroke-width="2" opacity=".6"/>`);
const fan = (x, y, s) => at(x, y, s, `<path d="M-14 38h28M0 12v26" fill="none" ${stroke} stroke-width="3.5"/><g fill="${LBLUE}" ${stroke}><ellipse cx="0" cy="-13" rx="7" ry="13"/><ellipse cx="0" cy="-13" rx="7" ry="13" transform="rotate(120)"/><ellipse cx="0" cy="-13" rx="7" ry="13" transform="rotate(240)"/></g><circle r="5" fill="${AMBER}" ${stroke}/>`);
const cross = (x, y, s) => at(x, y, s, `<circle r="30" fill="${WHITE}" ${stroke}/><path d="M-6-18h12v12h12v12h-12v12h-12v-12h-12v-12h12z" fill="${RED}" ${stroke}/>`);
const clock = (x, y, s) => at(x, y, s, `<circle r="24" fill="${WHITE}" ${stroke}/><path d="M0 0V-15M0 0l13 7.5" fill="none" ${stroke} stroke-width="3.5"/><path d="M0 -19A19 19 0 0 1 16.5 9.5" fill="none" stroke="${HOT}" stroke-width="4" opacity=".8"/>`);
const window_ = (x, y, s) => at(x, y, s, `<rect x="-30" y="-34" width="60" height="68" rx="3" fill="${LBLUE}" ${stroke}/><path d="M0-34v68M-30 0h60" fill="none" ${stroke}/><path d="M-22-22q4-6 10 0M10-20q4-6 10 0" fill="none" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>`);
const plus = (x, y) => `<path d="M${x - 9} ${y}h18M${x} ${y - 9}v18" fill="none" ${stroke} stroke-width="5"/>`;

const SCENES = {
  what: () => `${blob(95, 60, 44)}${blob(245, 60, 44)}${thermometer(95, 60, 1, false)}${plus(170, 60)}${at(245, 60, 1, drop(0, 0, 3.6, BLUE, false) + `<g transform="translate(0 9)">${FACES.happy}</g>`)}`,
  caution: () => `${blob(62, 60, 40)}${blob(215, 60, 46)}${sun(62, 60, 22, SUN, 'happy')}${kid(205, 40, 1.25, { shirt: GREEN, face: 'happy', arm: 'up' })}${bottle(244, 56, 1.3)}`,
  'extreme-caution': () => `${blob(54, 60, 36)}${blob(120, 60, 36)}${blob(222, 60, 46)}${window_(52, 60, 1)}${fan(120, 56, 1)}${kid(222, 40, 1.25, { shirt: AMBER, face: 'sweat' })}${drop(194, 26, 0.9)}${drop(254, 38, 0.9)}${drop(248, 22, 0.7)}${glass(296, 66, 1.1)}`,
  danger: () => `${blob(106, 62, 48)}${umbrella(106, 50, 0.85)}${kid(106, 70, 0.75, { shirt: PURPLE, face: 'tired' })}${clock(206, 62, 0.85)}${blob(272, 60, 34)}${sun(272, 60, 20, HOT, 'hot')}`,
  'extreme-danger': () => `${blob(58, 60, 36)}${blob(170, 60, 46)}${blob(270, 60, 40)}${thermometer(56, 60, 1, true)}${kid(170, 40, 1.25, { shirt: PURPLE, face: 'dizzy' })}${drop(142, 24, 0.9)}${drop(202, 22, 0.8)}${cross(270, 60, 1)}`,
};

// Horizontal shift that centres each scene in the 326-wide frame (measured from the drawing's bounding box, blobs included).
const SHIFT = { what: -7, caution: 21, 'extreme-caution': 5, danger: -17, 'extreme-danger': -3.5 };
export const art = (id) => `<svg class="hl-art hl-art-${id}" viewBox="0 0 326 120" aria-hidden="true"><g class="scene" transform="translate(${SHIFT[id]} 0)">${SCENES[id]()}</g></svg>`;
