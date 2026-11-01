// OLED-GATE helper (P03-D3): compare a drawn Screen with an approved PNG, pixel for pixel.
// Reads 8-bit grey or RGB(A) PNGs (any filter); a pixel is "on" when its first channel is above 127.
import { inflateSync } from 'node:zlib';
import { W, H } from './render.mjs';

/** Decode an 8-bit, non-interlaced grey/RGB/RGBA PNG to { w, h, bpp, data } (data = raw channels, bpp per pixel). */
export function decodePngRaw(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let pos = 8;
  let w, h, colorType;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('latin1', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      colorType = data[9];
      if (data[8] !== 8 || data[12] !== 0) throw new Error('only 8-bit, non-interlaced PNGs');
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const bpp = { 0: 1, 2: 3, 6: 4 }[colorType];
  if (!bpp) throw new Error(`unsupported PNG colour type ${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const out = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    for (let i = 0; i < stride; i++) {
      const x = raw[y * (stride + 1) + 1 + i];
      const a = i >= bpp ? out[y * stride + i - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + i] : 0;
      const c = i >= bpp && y > 0 ? out[(y - 1) * stride + i - bpp] : 0;
      let v;
      if (f === 0) v = x;
      else if (f === 1) v = x + a;
      else if (f === 2) v = x + b;
      else if (f === 3) v = x + ((a + b) >> 1);
      else {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      out[y * stride + i] = v & 255;
    }
  }
  return { w, h, bpp, data: out };
}

export function decodePng(buf) {
  const { w, h, bpp, data } = decodePngRaw(buf);
  const px = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) px[i] = data[i * bpp] > 127 ? 1 : 0;
  return { w, h, px };
}

/** List of {x, y, drawn, approved} where the drawn screen and the approved PNG differ. Empty = identical. */
export function diffAgainstPng(screen, png) {
  const ref = decodePng(png);
  if (ref.w !== W || ref.h !== H) throw new Error(`reference is ${ref.w}x${ref.h}, expected ${W}x${H}`);
  const diff = [];
  for (let i = 0; i < W * H; i++) {
    if (screen.px[i] !== ref.px[i]) diff.push({ x: i % W, y: Math.floor(i / W), drawn: screen.px[i], approved: ref.px[i] });
  }
  return diff;
}
