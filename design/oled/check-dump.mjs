// OLED-GATE on the real board (P03-04): compares a serial capture of the `esp32dev_screens` build with design/oled/ref/.
// Usage: node design/oled/check-dump.mjs <capture.txt>      exits 1 if a screen is missing or any pixel differs
import { readFileSync } from 'node:fs';
import { SCREENS } from './screens.mjs';
import { diffAgainstPng } from './compare.mjs';
import { parseDumps, screenFromHex } from './dump.mjs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node design/oled/check-dump.mjs <serial-capture.txt>');
  process.exit(2);
}
const dumps = parseDumps(readFileSync(file, 'utf8'));
let bad = 0;
for (const spec of SCREENS) {
  const hex = dumps.get(spec.id);
  if (!hex) { console.log(`MISSING ${spec.id}`); bad++; continue; }
  const diff = diffAgainstPng(screenFromHex(hex), readFileSync(new URL(`./ref/${spec.id}.png`, import.meta.url)));
  console.log(`${diff.length === 0 ? 'ok     ' : 'DIFFERS'} ${spec.id}${diff.length ? `: ${diff.length} pixels, first at ${JSON.stringify(diff[0])}` : ''}`);
  if (diff.length) bad++;
}
console.log(bad ? `${bad} of ${SCREENS.length} screens failed` : `all ${SCREENS.length} screens on the board equal the approved images`);
process.exit(bad ? 1 : 0);
