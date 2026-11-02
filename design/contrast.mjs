// WCAG 2.x contrast check for design/tokens.json.
// Run: node design/contrast.mjs   (exit 1 if anything fails)
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

function rgb(hex) {
  if (typeof hex !== 'string' || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
    throw new TypeError(`bad colour: ${hex}`);
  }
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = 4.5; // normal text
const NON_TEXT = 3; // borders, icons

/** Returns a list of failure messages (empty = all pass). */
export function checkTokens(tokens) {
  const failures = [];
  const need = (label, fg, bg, min) => {
    const r = contrastRatio(fg, bg);
    if (r < min) failures.push(`${label}: ${r.toFixed(2)}:1, needs ${min}:1 (${fg} on ${bg})`);
  };
  for (const [name, th] of Object.entries(tokens.themes)) {
    need(`theme ${name} text on bg`, th.text, th.bg, TEXT);
  }
  for (const [cat, h] of Object.entries(tokens.heat)) {
    need(`heat ${cat} text on fill`, h.text, h.fill, TEXT);
    for (const [name, th] of Object.entries(tokens.themes)) {
      if (h.border?.[name]) need(`heat ${cat} border on ${name} bg`, h.border[name], th.bg, NON_TEXT);
    }
  }
  for (const [name, colours] of Object.entries(tokens.status ?? {})) {
    for (const [theme, hex] of Object.entries(colours)) {
      need(`status ${name} on ${theme} bg`, hex, tokens.themes[theme].bg, TEXT);
    }
  }
  return failures;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tokens = JSON.parse(await readFile(new URL('./tokens.json', import.meta.url), 'utf8'));
  const failures = checkTokens(tokens);
  if (failures.length) {
    console.log(failures.join('\n'));
    process.exit(1);
  }
  console.log('All token contrast checks pass.');
}
