// PC test for include/heat_index.h (P03-04, D-015). It does not know the right answers itself:
// tests/firmware-heat-index.test.js builds this file, feeds it lines "tC rh expected category" made by
// src/heat-index.js (the grid and the points of tests/heat-index-reference.json), and reads our verdict.
// expected is "null" (below the NWS range) or the heat index in °C; category is "-" or the PAGASA band name.
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <limits>
#include "../include/heat_index.h"

static int failures = 0;
#define CHECK(cond) do { if (!(cond)) { std::printf("FAIL line %d: %s\n", __LINE__, #cond); failures++; } } while (0)

int main() {
  // Bad input is never a number: the sensor code shows the error screen, but the maths must not invent a value.
  const double nan = std::numeric_limits<double>::quiet_NaN();
  double hi = 123;
  CHECK(!heatIndexC(nan, 50, hi));
  CHECK(!heatIndexC(30, nan, hi));
  CHECK(!heatIndexC(81, 50, hi));
  CHECK(!heatIndexC(-41, 50, hi));
  CHECK(!heatIndexC(30, 101, hi));
  CHECK(!heatIndexC(30, -1, hi));
  CHECK(hi == 123);  // untouched when there is no result

  // Category edges are on the ROUNDED value (D-019), half rounds up like Math.round.
  CHECK(std::strcmp(heatCategoryName(26.4), "") == 0);
  CHECK(std::strcmp(heatCategoryName(26.5), "caution") == 0);
  CHECK(std::strcmp(heatCategoryName(32.4), "caution") == 0);
  CHECK(std::strcmp(heatCategoryName(32.5), "extreme-caution") == 0);
  CHECK(std::strcmp(heatCategoryName(41.5), "danger") == 0);
  CHECK(std::strcmp(heatCategoryName(51.5), "extreme-danger") == 0);

  char tc[32], rh[32], exp[64], cat[32];
  long n = 0;
  while (std::scanf("%31s %31s %63s %31s", tc, rh, exp, cat) == 4) {
    n++;
    double t = std::atof(tc), h = std::atof(rh);
    bool wantNumber = std::strcmp(exp, "null") != 0;
    bool got = heatIndexC(t, h, hi);
    if (got != wantNumber) { std::printf("FAIL %s %s: number=%d, wanted %d\n", tc, rh, got, wantNumber); failures++; continue; }
    if (got && std::fabs(hi - std::atof(exp)) > 1e-9) { std::printf("FAIL %s %s: %.12f, wanted %s\n", tc, rh, hi, exp); failures++; }
    const char* name = got ? heatCategoryName(hi) : "";
    if (std::strcmp(name[0] ? name : "-", cat) != 0) { std::printf("FAIL %s %s: category %s, wanted %s\n", tc, rh, name, cat); failures++; }
    if (failures > 20) break;
  }
  CHECK(n > 0);  // a run with no input must not pass
  if (failures) { std::printf("%d failures\n", failures); return 1; }
  std::printf("all passed (%ld points)\n", n);
  return 0;
}
