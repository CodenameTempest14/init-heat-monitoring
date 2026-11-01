// Heat index on the device (P03-04). A line-for-line port of src/heat-index.js (D-015): the NWS/WPC Rothfusz
// regression with its two adjustments, and the PAGASA bands on the rounded value (D-019).
// The server computes its own copy for storage (D-023); this one is only for the OLED.
// No Arduino code in here, so the PC test in tests/ can run it.
#pragma once
#include <cmath>

// Sets `out` (°C) and returns true. Returns false, leaving `out` alone, when the heat index is below the NWS
// range (D-020) or the input is not a believable DHT22 reading (-40 to 80 °C, 0 to 100 %).
inline bool heatIndexC(double tempC, double rh, double& out) {
  if (!std::isfinite(tempC) || !std::isfinite(rh)) return false;
  if (tempC < -40 || tempC > 80 || rh < 0 || rh > 100) return false;

  const double t = tempC * 1.8 + 32;  // the NWS formula works in °F

  // NWS: the simple formula first, averaged with T; below 80 °F the regression is not appropriate.
  const double simple = 0.5 * (t + 61.0 + (t - 68.0) * 1.2 + rh * 0.094);
  if ((simple + t) / 2 < 80) return false;

  double hi = -42.379 +
              2.04901523 * t +
              10.14333127 * rh -
              0.22475541 * t * rh -
              0.00683783 * t * t -
              0.05481717 * rh * rh +
              0.00122874 * t * t * rh +
              0.00085282 * t * rh * rh -
              0.00000199 * t * t * rh * rh;

  if (rh < 13 && t >= 80 && t <= 112) {
    hi -= ((13 - rh) / 4) * std::sqrt((17 - std::fabs(t - 95)) / 17);
  } else if (rh > 85 && t >= 80 && t <= 87) {
    hi += ((rh - 85) / 10) * ((87 - t) / 5);
  }

  out = (hi - 32) / 1.8;
  return true;
}

// Whole-degree heat index as shown on the screen and used for the bands. Half rounds up, like JavaScript's Math.round.
inline int roundedHeatIndex(double hiC) { return (int)std::floor(hiC + 0.5); }

// Band name (same words as src/heat-index.js), or "" below 27 °C.
inline const char* heatCategoryName(double hiC) {
  const int whole = roundedHeatIndex(hiC);
  if (whole >= 52) return "extreme-danger";
  if (whole >= 42) return "danger";
  if (whole >= 33) return "extreme-caution";
  if (whole >= 27) return "caution";
  return "";
}
