// The icon and logo SVGs of the PWA, drawn from the owner-approved brand files (D-029). Used by the mocks (build-mocks.mjs)
// and by web/build-icons.mjs, so the app ships exactly what was approved.
// "any": the rounded icon as it is (transparent corners); "maskable": full-bleed square, glyph scaled to 85 % so the phone's
// mask (circle, squircle) never cuts it (safe zone = circle of 40 % of the width); "apple": full-bleed square, iOS rounds it.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const brand = join(dirname(fileURLToPath(import.meta.url)), '..', 'brand');
export const brandSvg = (f) => readFileSync(join(brand, f), 'utf8').trim();

const iconSvg = brandSvg('init-icon-light.svg');
const glyph = iconSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/<rect width="96"[^>]*\/>/, '');
export const ICONS = {
  any: iconSvg,
  maskable: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#1b2430"/><g transform="translate(48 48) scale(0.85) translate(-48 -48)">${glyph}</g></svg>`,
  apple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#1b2430"/>${glyph}</svg>`,
};
export const LOGOS = { light: brandSvg('init-logo-light.svg'), dark: brandSvg('init-logo-dark.svg') };
