// Reads the frame-buffer dump that firmware/init/include/screen_test.h prints (OLED-GATE on the real board, P03-04).
// SSD1306 memory is in pages of 8 rows: byte = x + (y >> 3) * 128, bit = y & 7 (bit 0 = top row of the page).
import { Screen, W, H } from './render.mjs';

const BYTES = (W * H) / 8;

export function bufferFromScreen(screen) {
  const buf = new Uint8Array(BYTES);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (screen.px[y * W + x]) buf[x + (y >> 3) * W] |= 1 << (y & 7);
  return buf;
}

export function screenFromHex(hex) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length !== BYTES * 2) throw new Error(`a dump is ${BYTES * 2} hex digits, got ${hex.length}`);
  const screen = new Screen();
  for (let i = 0; i < BYTES; i++) {
    const b = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    const x = i % W;
    const page = Math.floor(i / W);
    for (let bit = 0; bit < 8; bit++) screen.px[(page * 8 + bit) * W + x] = (b >> bit) & 1;
  }
  return screen;
}

/** Map id -> hex of the LAST complete "SCREEN <id> <hex>" line in a serial capture. Cut-off lines are dropped. */
export function parseDumps(text) {
  const dumps = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^SCREEN (\S+) ([0-9a-f]+)$/i);
    if (m && m[2].length === BYTES * 2) dumps.set(m[1], m[2].toLowerCase());
  }
  return dumps;
}
