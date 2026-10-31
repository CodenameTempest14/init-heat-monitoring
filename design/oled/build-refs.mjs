// Draws every screen in screens.mjs to ref/<id>.png (1:1, 128x64, white on black)
// and preview/<id>@4x.png (blue on black, for looking at). Usage: node design/oled/build-refs.mjs
import { writeFileSync } from 'node:fs';
import { SCREENS, drawScreen } from './screens.mjs';
import { toPng } from './render.mjs';

const here = new URL('.', import.meta.url);
for (const spec of SCREENS) {
  const s = drawScreen(spec);
  writeFileSync(new URL(`ref/${spec.id}.png`, here), toPng(s, 1));
  writeFileSync(new URL(`preview/${spec.id}@4x.png`, here), toPng(s, 4, [90, 190, 255]));
  console.log(spec.id.padEnd(26), spec.name);
}
