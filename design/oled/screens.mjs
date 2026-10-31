// The OLED screens as drawing code (P03-D2). Same calls as Adafruit_GFX, so the firmware repeats them 1:1.
// Inputs are made up. Heat index and category come from src/ so the numbers are always consistent.
import { Screen } from './render.mjs';
import { heatIndexC, heatCategory } from '../../src/heat-index.js';

const WORDS = {
  caution: 'CAUTION',
  'extreme-caution': 'EXTREME CAUTION',
  danger: 'DANGER',
  'extreme-danger': 'EXTREME DANGER',
};

const D = '°';

function strip(s, left, right) {
  s.text(2, 1, 1, left);
  if (right) s.text(126 - Screen.width(1, right), 1, 1, right);
  s.hLine(0, 9, 128);
}

/** Main reading layout (OLED-01, 02, 04). hi = whole-degree heat index text, or '--'. */
function reading(s, { room, link, temp, rh, hiText, bar, queued }) {
  strip(s, room, link);
  s.text(2, 12, 4, hiText); // 24 x 32 per character
  s.text(54, 12, 2, `${D}C`);
  s.text(54, 29, 1, 'HEAT INDEX');
  if (queued !== undefined) s.text(54, 37, 1, `${queued} to send`);
  if (bar.inverted) {
    s.fillRect(0, 46, 128, 10, 1);
    s.text(2, 47, 1, bar.text, 0, 1);
  } else {
    s.text(2, 47, 1, bar.text);
  }
  s.text(2, 57, 1, `T ${temp.toFixed(1)}${D}C  RH ${rh}%`);
}

function fromSensor(temp, rh) {
  const hi = heatIndexC(temp, rh);
  const category = heatCategory(hi);
  return { hi, category, hiText: hi === null ? '--' : String(Math.round(hi)) };
}

export const SCREENS = [
  ...[
    ['caution', 30, 55],
    ['extreme-caution', 33, 60],
    ['danger', 38, 50],
    ['extreme-danger', 40, 60],
  ].map(([cat, temp, rh]) => ({
    id: `OLED-01-${cat}`,
    name: `Reading, ${cat}`,
    inputs: { temp, rh },
    expectCategory: cat,
    draw(s) {
      const r = fromSensor(temp, rh);
      if (r.category !== cat) throw new Error(`${temp}/${rh} gives ${r.category}, wanted ${cat}`);
      reading(s, { room: 'Room 204', link: 'Wi-Fi OK', temp, rh, hiText: r.hiText, bar: { text: WORDS[cat], inverted: true } });
    },
  })),
  {
    id: 'OLED-02',
    name: 'Reading, heat index below range',
    inputs: { temp: 24.0, rh: 50 },
    draw(s) {
      const r = fromSensor(24.0, 50);
      if (r.hi !== null) throw new Error('24/50 should be below the NWS range');
      reading(s, { room: 'Room 204', link: 'Wi-Fi OK', temp: 24.0, rh: 50, hiText: r.hiText, bar: { text: `NO RATING BELOW 27${D}C`, inverted: false } });
    },
  },
  {
    id: 'OLED-03',
    name: 'Starting / connecting',
    draw(s) {
      s.text(46 - 18, 12, 3, 'INIT'); // 4 chars x 18 px = 72 wide, centred
      s.text(10, 44, 1, 'Connecting Wi-Fi...');
    },
  },
  {
    id: 'OLED-04',
    name: 'Offline, readings waiting',
    inputs: { temp: 33, rh: 60 },
    draw(s) {
      const r = fromSensor(33, 60);
      reading(s, { room: 'Room 204', link: 'NO WI-FI', temp: 33, rh: 60, hiText: r.hiText, bar: { text: WORDS[r.category], inverted: true }, queued: 12 });
    },
  },
  {
    id: 'OLED-05',
    name: 'Setup mode',
    draw(s) {
      strip(s, 'SETUP MODE');
      s.text(4, 14, 1, '1. Join this Wi-Fi:');
      s.text(4, 24, 2, 'Init-Setup');
      s.text(4, 44, 1, '2. Open in browser:');
      s.text(4, 54, 1, '192.168.4.1');
    },
  },
  {
    id: 'OLED-06',
    name: 'Sensor error',
    draw(s) {
      strip(s, 'Room 204', 'Wi-Fi OK');
      s.text(Math.floor((128 - Screen.width(2, 'SENSOR')) / 2), 16, 2, 'SENSOR');
      s.text(Math.floor((128 - Screen.width(2, 'ERROR')) / 2), 34, 2, 'ERROR');
      s.text(Math.floor((128 - Screen.width(1, 'Check DHT22 wiring')) / 2), 54, 1, 'Check DHT22 wiring');
    },
  },
];

export function drawScreen(spec) {
  const s = new Screen();
  spec.draw(s);
  return s;
}
