// Diagrams for the paper, drawn as plain SVG (black and white, prints well). Each entry: { title, w, h, svg }.
// Facts come from the repo: hardware/schematic.html (Rev B), firmware/init, supabase/migrations, web/src.
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
  return { w, h, svg: wrap(w, h, s) };
})();

export const diagrams = {
  blocks: { title: 'System block diagram of Init', ...blocks },
  wiring: { title: 'Wiring schematic of the room monitor (Rev B)', ...wiring },
  flow: { title: 'Firmware flowchart', ...flow },
  seq: { title: 'Upload and read sequence between device, cloud and web app', ...seq },
  db: { title: 'Database tables and functions', ...db },
  routes: { title: 'Pages of the web app', ...routes },
};
