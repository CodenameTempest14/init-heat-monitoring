// Heat index from air temperature (°C) and relative humidity (%).
// Formula: NWS/WPC Rothfusz regression with its two adjustments
// (https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml). The NWS defines it in °F.

const cToF = (c) => c * 1.8 + 32;
const fToC = (f) => (f - 32) / 1.8;

// DHT22 range is -40..80 °C; anything else is a bad reading, not a weather.
const T_MIN_C = -40;
const T_MAX_C = 80;

function check(name, value, min, max) {
  if (typeof value !== 'number') throw new TypeError(`${name} must be a number`);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} must be between ${min} and ${max}`);
  }
}

/**
 * @param {number} tempC air temperature in °C
 * @param {number} rh relative humidity in %
 * @returns {number|null} heat index in °C, or null when below the NWS range
 */
export function heatIndexC(tempC, rh) {
  check('tempC', tempC, T_MIN_C, T_MAX_C);
  check('rh', rh, 0, 100);

  const t = cToF(tempC);

  // NWS: compute the simple formula first and average it with T.
  // Below 80 °F the full regression is not appropriate, so we say "below range".
  const simple = 0.5 * (t + 61.0 + (t - 68.0) * 1.2 + rh * 0.094);
  if ((simple + t) / 2 < 80) return null;

  let hi =
    -42.379 +
    2.04901523 * t +
    10.14333127 * rh -
    0.22475541 * t * rh -
    0.00683783 * t * t -
    0.05481717 * rh * rh +
    0.00122874 * t * t * rh +
    0.00085282 * t * rh * rh -
    0.00000199 * t * t * rh * rh;

  if (rh < 13 && t >= 80 && t <= 112) {
    hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
  } else if (rh > 85 && t >= 80 && t <= 87) {
    hi += ((rh - 85) / 10) * ((87 - t) / 5);
  }

  return fToC(hi);
}

// PAGASA heat index classification (°C), from PAGASA's own infographic:
// https://pubfiles.pagasa.dost.gov.ph/iaas/heat_index/Heat%20days%20survival_heat%20index_infographics_%2020220302.png
// PAGASA prints whole degrees, so we round before classifying (no gaps between bands).
const BANDS = [
  { min: 52, category: 'extreme-danger' },
  { min: 42, category: 'danger' },
  { min: 33, category: 'extreme-caution' },
  { min: 27, category: 'caution' },
];

/**
 * @param {number|null} hiC heat index in °C, or null (below range)
 * @returns {string|null} 'caution' | 'extreme-caution' | 'danger' | 'extreme-danger', or null below 27 °C
 */
export function heatCategory(hiC) {
  if (hiC === null) return null;
  if (typeof hiC !== 'number') throw new TypeError('hiC must be a number or null');
  if (!Number.isFinite(hiC)) throw new RangeError('hiC must be finite');
  const whole = Math.round(hiC);
  const band = BANDS.find((b) => whole >= b.min);
  return band ? band.category : null;
}
