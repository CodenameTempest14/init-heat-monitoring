// Diagrams for the paper, drawn as plain SVG (black and white, prints well). Each entry: { title, w, h, svg }.
// Facts come from the repo: hardware/schematic.html (Rev B), firmware/init, supabase/migrations, web/src.
import { readFileSync } from 'node:fs';
const F = 'font-family="Arial, Helvetica, sans-serif"';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const box = (x, y, w, h, lines, o = {}) => {
  const ls = Array.isArray(lines) ? lines : [lines];
  const fs = o.fs || 13;
  const top = y + h / 2 - ((ls.length - 1) * (fs + 3)) / 2 + fs / 3;
  const t = ls.map((l, i) => `<text x="${x + w / 2}" y="${top + i * (fs + 3)}" text-anchor="middle" font-size="${fs}" ${o.bold && i === 0 ? 'font-weight="700"' : ''} ${F}>${esc(l)}</text>`).join('');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 6}" fill="${o.fill || '#fff'}" stroke="#000" stroke-width="1.6" ${o.dash ? 'stroke-dasharray="6 4"' : ''}/>${t}`;
};
const text = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.fs || 12}" text-anchor="${o.a || 'middle'}" ${o.bold ? 'font-weight="700"' : ''} ${o.fill ? `fill="${o.fill}"` : ''} ${F}>${esc(s)}</text>`;
const line = (pts, o = {}) => {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  return `<path d="${d}" fill="none" stroke="${o.c || '#000'}" stroke-width="${o.w || 1.8}" ${o.dash ? 'stroke-dasharray="6 4"' : ''} ${o.arrow ? 'marker-end="url(#ah)"' : ''}/>`;
};
const defs = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#000"/></marker></defs>';
const wrap = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${defs}<rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>`;
const diamond = (cx, cy, w, h, lines) => {
  const ls = Array.isArray(lines) ? lines : [lines];
  const t = ls.map((l, i) => `<text x="${cx}" y="${cy + 4 + (i - (ls.length - 1) / 2) * 14}" text-anchor="middle" font-size="12" ${F}>${esc(l)}</text>`).join('');
  return `<polygon points="${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}" fill="#fff" stroke="#000" stroke-width="1.6"/>${t}`;
};

// 1. System block diagram
const blocks = (() => {
  const w = 900, h = 400;
  let s = '';
  s += box(20, 40, 190, 150, ['Room monitor (device)', 'ESP32 DevKit', 'DHT22 sensor', 'OLED display'], { bold: true, dash: true });
  s += box(20, 230, 190, 60, ['USB power bank', '5 V, powers the device'], {});
  s += line([[115, 230], [115, 192]], { arrow: true });
  s += box(300, 40, 190, 80, ['Wi-Fi hotspot', '(pocket router or phone)'], {});
  s += box(300, 190, 190, 100, ['Supabase (cloud)', 'Postgres database', 'upload function, rules', 'Singapore region'], { bold: true });
  s += box(590, 40, 190, 80, ['Web app (PWA)', 'Vercel static hosting'], { bold: true });
  s += box(590, 190, 190, 100, ['Phone or computer', 'students, teachers,', 'admin (signed in)'], {});
  s += line([[210, 90], [298, 80]], { arrow: true });
  s += text(254, 70, 'Wi-Fi');
  s += line([[395, 122], [395, 188]], { arrow: true });
  s += text(430, 160, 'HTTPS', { a: 'start' });
  s += text(430, 175, 'upload', { a: 'start' });
  s += line([[490, 240], [588, 240]], { arrow: true });
  s += text(540, 232, 'reads', {});
  s += line([[685, 192], [685, 122]], { arrow: true });
  s += text(700, 160, 'page files', { a: 'start' });
  s += line([[210, 70], [210, 70]]);
  s += text(450, 340, 'The device only sends. The public only reads. Settings are changed only by a signed-in admin.', { fs: 13 });
  return { w, h, svg: wrap(w, h, s) };
})();

// 2. Wiring schematic (Rev B, 38-pin ESP32). Power and ground are drawn as net labels so no wires cross.
const wiring = (() => {
  const w = 900, h = 440;
  let s = '';
  const label = (x, y, t) => text(x, y, t, { fs: 11, bold: true });
  s += box(360, 40, 220, 270, [], {});
  s += text(470, 62, 'ESP32 DevKit (38-pin)', { bold: true, fs: 13 });
  s += text(372, 114, 'GPIO 4', { a: 'start' });
  s += text(372, 194, 'GPIO 21 (SDA)', { a: 'start' });
  s += text(372, 234, 'GPIO 22 (SCL)', { a: 'start' });
  s += text(372, 284, '3V3 and GND pins: the power nets', { a: 'start', fs: 10 });
  s += box(20, 70, 170, 110, ['DHT22 (4-pin)', 'pin 1 VCC, pin 2 DATA', 'pin 3 not used, pin 4 GND'], { bold: true, fs: 12 });
  s += line([[190, 110], [360, 110]]);
  s += text(320, 102, 'DATA', { fs: 11 });
  s += line([[275, 110], [275, 80]]);
  s += box(255, 48, 40, 32, '4.7-10 k', { fs: 9, r: 3 });
  s += line([[275, 48], [275, 34]]);
  s += label(275, 28, '3V3');
  s += label(105, 200, 'VCC to 3V3, GND to GND');
  s += box(20, 220, 170, 130, ['OLED 0.96 in', 'SSD1306 128x64', 'I2C address 0x3C', 'GND, VCC, SCK, SDA'], { bold: true, fs: 12 });
  s += line([[190, 190], [360, 190]]);
  s += text(275, 182, 'SDA', { fs: 11 });
  s += line([[190, 230], [360, 230]]);
  s += text(275, 222, 'SCL (SCK)', { fs: 11 });
  s += label(105, 372, 'VCC to 3V3, GND to GND');
  s += box(680, 230, 190, 100, ['USB power bank', 'ROMOSS Sense 8P+', '30 000 mAh, 5 V out'], { bold: true });
  s += line([[680, 280], [582, 280]], { arrow: true });
  s += text(631, 272, '5 V USB', { fs: 11 });
  s += text(470, 296, '(USB-C port)', { fs: 10 });
  s += box(680, 60, 190, 90, ['Reserved', 'GPIO 33: OLED wake button', '(not built yet)'], { dash: true, fs: 12 });
  s += text(450, 410, 'The OLED is powered from the board (3.3 V). No battery pack, converter, fuse or switch (design Rev B, D-008).', { fs: 12 });
  return { w, h, svg: wrap(w, h, s) };
})();

// 3. Firmware flowchart
const flow = (() => {
  const w = 900, h = 560;
  let s = '';
  s += box(330, 10, 240, 40, 'Power on / restart', { r: 20 });
  s += line([[450, 50], [450, 70]], { arrow: true });
  s += box(330, 70, 240, 44, ['Start OLED, read saved Wi-Fi,', 'record reset reason'], {});
  s += line([[450, 114], [450, 134]], { arrow: true });
  s += diamond(450, 175, 260, 70, ['Joined saved Wi-Fi', 'within 20 s?']);
  s += text(590, 168, 'no', {});
  s += line([[580, 175], [680, 175]], { arrow: true });
  s += box(680, 150, 200, 50, ['Open "Init-Setup" page', '(own Wi-Fi, password)'], {});
  s += line([[880, 175], [895, 175], [895, 30], [572, 30]], { arrow: true });
  s += text(760, 22, 'Wi-Fi saved: restart', { fs: 11 });
  s += text(462, 232, 'yes', { a: 'start' });
  s += line([[450, 210], [450, 250]], { arrow: true });
  s += box(330, 250, 240, 44, ['Read DHT22 every 5 s', '(sensor needs 2 s between reads)'], {});
  s += line([[450, 294], [450, 314]], { arrow: true });
  s += diamond(450, 355, 240, 70, ['Reading valid?']);
  s += text(590, 348, 'no', {});
  s += line([[570, 355], [680, 355]], { arrow: true });
  s += box(680, 335, 200, 40, 'Sensor error screen', {});
  s += line([[450, 390], [450, 410]], { arrow: true });
  s += text(462, 404, 'yes', { a: 'start' });
  s += box(330, 410, 240, 44, ['Show on OLED, add to', 'queue (up to 50, oldest first)'], {});
  s += line([[450, 454], [450, 474]], { arrow: true });
  s += box(330, 474, 240, 56, ['Every 60 s (interval): send queue', 'by HTTPS, check certificate,', 'keep the interval and room in reply'], {});
  s += line([[330, 502], [150, 502], [150, 275], [328, 275]], { arrow: true });
  s += text(150, 520, 'repeat forever (no deep sleep, D-018)', { fs: 11 });
  return { w, h, svg: wrap(w, h, s) };
})();

// 4. Upload sequence
const seq = (() => {
  const w = 900, h = 440;
  let s = '';
  const xs = [100, 330, 570, 800];
  const names = ['Device (ESP32)', 'Supabase function', 'Database', 'Web app'];
  xs.forEach((x, i) => {
    s += box(x - 75, 10, 150, 36, names[i], { bold: true, fs: 12 });
    s += line([[x, 46], [x, 420]], { dash: true, w: 1.2 });
  });
  const msg = (y, x1, x2, t) => line([[xs[x1], y], [xs[x2], y]], { arrow: true }) + text((xs[x1] + xs[x2]) / 2, y - 6, t, { fs: 11 });
  s += msg(80, 0, 1, 'POST readings + device key (HTTPS)');
  s += text(330, 98, 'check key, ranges, rate (rejects whole call if bad)', { fs: 10 });
  s += msg(130, 1, 2, 'add offsets, compute heat index, insert');
  s += msg(180, 2, 1, 'saved');
  s += msg(220, 1, 0, 'reply: interval_s and room name');
  s += msg(280, 3, 2, 'GET latest, history, school_day (public key)');
  s += msg(330, 2, 3, 'rows (read only)');
  s += text(570, 380, 'An admin, signed in, may update only the five settings and the room.', { fs: 11 });
  return { w, h, svg: wrap(w, h, s) };
})();

// 5. Database
const db = (() => {
  const w = 900, h = 420;
  let s = '';
  s += box(20, 30, 250, 150, ['devices', 'id, name, room (default Unassigned)', 'key_hash (SHA-256), created_at', 'last_seen_at'], { bold: true, fs: 12 });
  s += box(330, 30, 250, 190, ['readings', 'device_id, recorded_at, received_at', 'temp_c, rh_pct, heat_index_c', 'temp_offset_c, rh_offset_pct', 'room (copied at upload)'], { bold: true, fs: 12 });
  s += box(640, 30, 240, 150, ['readings_hourly', 'device, hour, room', 'averages, minimums, maximums', 'time of each hourly maximum'], { bold: true, fs: 12 });
  s += box(20, 250, 250, 130, ['settings (one row per device)', 'interval_s 60-3600', 'temp and humidity offsets', 'alert level and quiet time'], { bold: true, fs: 12 });
  s += box(330, 270, 250, 100, ['device_health', 'Wi-Fi signal, reset reason,', 'firmware version; admins list'], { bold: true, fs: 12 });
  s += box(640, 230, 240, 140, ['Public functions', 'history, school_day', 'readings_hourly, readings_span', 'device_status view'], { bold: true, fs: 12 });
  s += line([[270, 90], [328, 90]], { arrow: true });
  s += text(300, 82, '1 to many', { fs: 10 });
  s += line([[580, 100], [638, 100]], { arrow: true });
  s += text(610, 92, 'summed', { fs: 10 });
  s += line([[145, 182], [145, 248]], { arrow: true });
  s += line([[580, 320], [638, 300]], { arrow: true });
  return { w, h, svg: wrap(w, h, s) };
})();

// 6. Web app routes
const routes = (() => {
  const w = 900, h = 380;
  let s = '';
  s += box(330, 20, 240, 60, ['Home (#)', 'temperature, humidity, heat index,', 'PAGASA level, online/offline'], { bold: true, fs: 12 });
  s += box(20, 150, 190, 70, ['History', '24 h and 7 d charts + table'], { fs: 12 });
  s += box(230, 150, 190, 70, ['School day (#school)', 'time in each level'], { fs: 12 });
  s += box(440, 150, 190, 70, ['What does this mean?', '(#heat) levels and advice'], { fs: 12 });
  s += box(650, 150, 230, 70, ['Admin (#admin), signed in', 'room, interval, offsets'], { bold: true, fs: 12 });
  s += box(650, 270, 230, 60, ['Admin guide (#guide)', 'how to change each setting'], { fs: 12 });
  [115, 325, 535].forEach((x) => { s += line([[450, 80], [x, 148]], { arrow: true }); });
  s += line([[560, 80], [765, 148]], { arrow: true, dash: true });
  s += line([[765, 222], [765, 268]], { arrow: true });
  s += box(20, 270, 400, 60, ['Readings table (F-24): from-to calendar,', 'hourly averages, CSV; under the History charts'], { fs: 12 });
  s += box(440, 270, 190, 60, ['Heat alerts (#alerts)', 'turn phone alerts on or off'], { fs: 12 });
  s += line([[520, 80], [640, 112], [640, 245], [560, 268]], { arrow: true }); // through the gap between #heat and #admin
  return { w, h, svg: wrap(w, h, s) };
})();

// 7. Heat alert flow (P05-03, supabase/migrations/20261108120000_push_alerts.sql, supabase/functions/send-alert)
const alertSeq = (() => {
  const w = 900, h = 470;
  let s = '';
  const xs = [90, 270, 460, 650, 820];
  const names = ['Device', 'Database', 'send-alert', 'Push service', 'Phone'];
  xs.forEach((x, i) => {
    s += box(x - 70, 10, 140, 36, names[i], { bold: true, fs: 12 });
    s += line([[x, 46], [x, 450]], { dash: true, w: 1.2 });
  });
  // White halo behind each label so the dashed lifelines never cut through the words.
  const lbl = (x, y, t, fs = 11) => `<text x="${x}" y="${y}" font-size="${fs}" text-anchor="middle" stroke="#fff" stroke-width="5" paint-order="stroke" ${F}>${esc(t)}</text>`;
  const msg = (y, x1, x2, t) => line([[xs[x1], y], [xs[x2], y]], { arrow: true }) + lbl((xs[x1] + xs[x2]) / 2, y - 7, t);
  s += msg(80, 4, 3, '1. subscribe (on a tap)');
  s += msg(120, 4, 1, '2. push_subscribe: push address and keys, no name');
  s += msg(170, 0, 1, '3. readings upload');
  s += lbl(270, 196, '4. trigger: rounded heat index >= alert level (default 42 °C)', 10);
  s += lbl(270, 210, 'and quiet time passed (default 60 min)? then save an alert', 10);
  s += msg(250, 1, 2, '5. alert id + secret');
  s += msg(290, 2, 1, '6. read alert, phones');
  s += msg(330, 2, 3, '7. encrypted, signed');
  s += msg(370, 3, 4, '8. notification');
  s += msg(410, 2, 1, '9. write sent / failed');
  s += lbl(450, 444, 'Example notification: "Heat index 43 °C (Danger) in Room 204." Phones that are gone are removed.', 11);
  return { w, h, svg: wrap(w, h, s) };
})();

// Figure 7: the 24-hour run as line graphs (hourly values from data/hourly.json). Two panels on one shared time axis, never
// two scales on one axis: top = degrees Celsius (heat index and temperature), bottom = relative humidity. Black and white:
// the two lines differ by line style and by a direct label, so it still reads when printed or photocopied.
const hourlyChart = (() => {
  const rows = JSON.parse(readFileSync(new URL('./data/hourly.json', import.meta.url), 'utf8')).filter((r) => r.n >= 30); // the last hour has 4 readings: not drawn
  const w = 640, h = 560, L = 62, R = 24;
  const pw = w - L - R, X = (i) => L + (i * pw) / (rows.length - 1);
  const panel = (top, bot, lo, hi, step, label) => {
    const Y = (v) => bot - ((v - lo) * (bot - top)) / (hi - lo);
    let g = '';
    for (let v = lo; v <= hi + 1e-9; v += step) g += `<line x1="${L}" y1="${Y(v)}" x2="${w - R}" y2="${Y(v)}" stroke="#ccc" stroke-width="0.8"/>` + text(L - 8, Y(v) + 4, v, { a: 'end', fs: 11 });
    g += `<line x1="${L}" y1="${top}" x2="${L}" y2="${bot}" stroke="#000" stroke-width="1.2"/><line x1="${L}" y1="${bot}" x2="${w - R}" y2="${bot}" stroke="#000" stroke-width="1.2"/>`;
    g += `<text transform="translate(16 ${(top + bot) / 2}) rotate(-90)" text-anchor="middle" font-size="12" ${F}>${esc(label)}</text>`;
    return { g, Y };
  };
  // ticks every 3 hours, midnight marked
  const hr = (r) => +r.hour_manila.slice(11, 13);
  const ticks = (bot) => rows.map((r, i) => (hr(r) % 3 === 0 ? `<line x1="${X(i)}" y1="${bot}" x2="${X(i)}" y2="${bot + 5}" stroke="#000" stroke-width="1"/>` + text(X(i), bot + 19, String(hr(r)).padStart(2, '0') + ':00', { fs: 11 }) : '')).join('');
  const mid = rows.findIndex((r) => hr(r) === 0);
  let s = '';
  // top panel: heat index and temperature, degrees Celsius
  const A = panel(70, 290, 26, 46, 4, 'Degrees Celsius (°C)');
  s += A.g;
  for (const [v, t] of [[33, 'Extreme caution starts at 33'], [42, 'Danger starts at 42']]) s += `<line x1="${L}" y1="${A.Y(v)}" x2="${w - R}" y2="${A.Y(v)}" stroke="#555" stroke-width="1.1" stroke-dasharray="2 3"/>` + text(w - R - 4, A.Y(v) - 5, t, { a: 'end', fs: 11, fill: '#333' });
  const hi = rows.map((r, i) => [X(i), A.Y(+r.hi_max)]);
  const tp = rows.map((r, i) => [X(i), A.Y(+r.temp_avg)]);
  s += line(tp, { w: 1.8, dash: true }) + line(hi, { w: 2.4 });
  s += hi.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#000" stroke="#fff" stroke-width="1.5"/>`).join('');
  // direct labels (end of the lines are crowded, so they sit at points with free space)
  const iMax = rows.reduce((m, r, i) => (+r.hi_max > +rows[m].hi_max ? i : m), 0);
  s += text(X(iMax) - 8, A.Y(+rows[iMax].hi_max) - 8, `Highest: ${rows[iMax].hi_max} °C at ${String(hr(rows[iMax])).padStart(2, '0')}:00`, { a: 'end', fs: 11, bold: true });
  // bottom panel: relative humidity, per cent
  const B = panel(350, 480, 50, 80, 10, 'Relative humidity (%)');
  s += B.g + line(rows.map((r, i) => [X(i), B.Y(+r.rh_avg)]), { w: 2 });
  s += text(L + 8, B.Y(80) + 14, 'Relative humidity (hourly mean)', { a: 'start', fs: 11 });
  // midnight marker through both panels
  if (mid > 0) s += `<line x1="${X(mid)}" y1="70" x2="${X(mid)}" y2="480" stroke="#888" stroke-width="1" stroke-dasharray="1 4"/>` + text(X(mid) + 4, 64, '3 November', { a: 'start', fs: 11 }) + text(X(mid) - 4, 64, '2 November', { a: 'end', fs: 11 });
  s += ticks(480) + text(L + pw / 2, 520, 'Hour of the day (Philippine time)', { fs: 12 });
  // legend (two series in the top panel): line sample + words
  s += `<line x1="${L}" y1="26" x2="${L + 34}" y2="26" stroke="#000" stroke-width="2.4"/><circle cx="${L + 17}" cy="26" r="3" fill="#000" stroke="#fff" stroke-width="1.5"/>` + text(L + 42, 30, 'Heat index (highest in the hour)', { a: 'start', fs: 12 });
  s += `<line x1="${L + 250}" y1="26" x2="${L + 284}" y2="26" stroke="#000" stroke-width="1.8" stroke-dasharray="6 4"/>` + text(L + 292, 30, 'Temperature (mean of the hour)', { a: 'start', fs: 12 });
  return { w, h, svg: wrap(w, h, s) };
})();

export const diagrams = {
  blocks: { title: 'System block diagram of Init', ...blocks },
  wiring: { title: 'Wiring schematic of the room monitor (Rev B)', ...wiring },
  flow: { title: 'Firmware flowchart', ...flow },
  seq: { title: 'Upload and read sequence between device, cloud and web app', ...seq },
  db: { title: 'Database tables and functions', ...db },
  routes: { title: 'Pages of the web app', ...routes },
  alerts: { title: 'Heat alert sequence from an upload to a notification on a phone', ...alertSeq },
  hourly: { title: 'Heat index, temperature and relative humidity in the 24-hour run (hourly values, 2 to 3 November 2026)', ...hourlyChart },
};
