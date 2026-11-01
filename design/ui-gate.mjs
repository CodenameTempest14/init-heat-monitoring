// UI-GATE helpers (P04-D5, D-016): screenshot a page with Playwright and compare it with an approved image.
import { decodePngRaw } from './oled/compare.mjs';

/** Screenshot `url` at `size` as a decoded image { w, h, bpp, data }. `prepare(page)` runs before the shot (tests use it to mutate the page). */
export async function shoot(browser, url, size, prepare) {
  const ctx = await browser.newContext({ viewport: size, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  try {
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.addStyleTag({ content: '*{animation:none!important;transition:none!important;caret-color:transparent!important}' });
    if (prepare) await prepare(page);
    return decodePngRaw(await page.screenshot({ fullPage: true }));
  } finally {
    await ctx.close();
  }
}

/** Decode a PNG file's bytes so it can be passed to diffImages as the approved image. */
export const loadApproved = (buf) => decodePngRaw(buf);

/**
 * Compare two decoded images. A pixel differs when any colour channel is more than `tolerance` apart
 * (default 8 of 255: ignores anti-aliasing noise, not a changed colour or letter).
 * Different sizes always fail (sameSize false).
 */
export function diffImages(a, b, { tolerance = 8 } = {}) {
  if (a.w !== b.w || a.h !== b.h) return { sameSize: false, differing: Infinity, total: 0, ratio: 1 };
  let differing = 0;
  for (let i = 0; i < a.w * a.h; i++) {
    for (let c = 0; c < Math.min(a.bpp, 3); c++) {
      if (Math.abs(a.data[i * a.bpp + c] - b.data[i * b.bpp + c]) > tolerance) { differing++; break; }
    }
  }
  const total = a.w * a.h;
  return { sameSize: true, differing, total, ratio: differing / total };
}
