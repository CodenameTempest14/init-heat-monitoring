// A 128x64 one-bit screen that draws like Adafruit_GFX, so the firmware can repeat each call 1:1.
// text(): classic 5x7 font scaled by `size`; a character cell is 6*size wide and 8*size tall.
// The degree sign is the single character '°' and is drawn as glyph 248 (needs setCP437(true) on the device).
import { deflateSync } from 'node:zlib';
import { FONT_5X7 } from './font5x7.mjs';

export const W = 128;
export const H = 64;

export class Screen {
  constructor() {
    this.px = new Uint8Array(W * H);
  }

  set(x, y, c) {
    if (x >= 0 && x < W && y >= 0 && y < H) this.px[y * W + x] = c;
  }

  fillRect(x, y, w, h, c = 1) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }

  hLine(x, y, w, c = 1) {
    this.fillRect(x, y, w, 1, c);
  }

  /** fg on transparent background, or fg on `bg` (the whole cell, like setTextColor(fg, bg)). */
  text(x, y, size, str, fg = 1, bg = null) {
    let cx = x;
    for (const ch of str) {
      const code = ch === '°' ? 248 : ch.charCodeAt(0);
      if (code > 255) throw new Error(`no glyph for ${ch}`);
      for (let i = 0; i < 6; i++) {
        const col = i < 5 ? FONT_5X7[code * 5 + i] : 0;
        for (let j = 0; j < 8; j++) {
          const on = (col >> j) & 1;
          if (on) this.fillRect(cx + i * size, y + j * size, size, size, fg);
          else if (bg !== null) this.fillRect(cx + i * size, y + j * size, size, size, bg);
        }
      }
      cx += 6 * size;
    }
  }

  /** Width in pixels of a string at a size (no trailing gap counted). */
  static width(size, str) {
    return [...str].length * 6 * size - size;
  }
}

function crc32(buf) {
  let c;
  let crc = 0xffffffff;
  for (const b of buf) {
    c = (crc ^ b) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/**
 * PNG of the screen, scaled by `scale` (1 = the 1:1 reference). `on`/`off` are [r,g,b].
 * The reference uses white on black; previews use the module's blue.
 */
export function toPng(screen, scale = 1, on = [255, 255, 255], off = [0, 0, 0]) {
  const w = W * scale;
  const h = H * scale;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    const row = y * (w * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < w; x++) {
      const c = screen.px[Math.floor(y / scale) * W + Math.floor(x / scale)] ? on : off;
      raw.set(c, row + 1 + x * 3);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.set([8, 2, 0, 0, 0], 8); // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
