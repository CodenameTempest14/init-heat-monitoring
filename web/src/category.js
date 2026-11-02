// PAGASA heat index bands. A copy of src/heat-index.js (D-019), because the web package cannot import from outside web/
// on Vercel; tests/web-category.test.js keeps the two equal. The heat index is rounded to whole °C before classifying.
const BANDS = [
  { min: 52, category: 'extreme-danger' },
  { min: 42, category: 'danger' },
  { min: 33, category: 'extreme-caution' },
  { min: 27, category: 'caution' },
];

export const CATEGORY_LABEL = {
  'caution': 'Caution',
  'extreme-caution': 'Extreme caution',
  'danger': 'Danger',
  'extreme-danger': 'Extreme danger',
  'below-range': 'Below heat-index range',
};

// Returns one of the keys above, or null when there is no usable number (so the page never shows a made-up "cool").
export function categoryOf(heatIndexC) {
  if (heatIndexC === null) return 'below-range';
  const n = Number(heatIndexC);
  if (heatIndexC === undefined || heatIndexC === '' || !Number.isFinite(n)) return null;
  const whole = Math.round(n);
  return BANDS.find((b) => whole >= b.min)?.category ?? 'below-range';
}
