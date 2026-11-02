// Writes web/src/tokens.css from design/tokens.json, so the approved colours stay the single source. Run: npm run tokens
import { readFileSync, writeFileSync } from 'node:fs';

const t = JSON.parse(readFileSync(new URL('../design/tokens.json', import.meta.url), 'utf8'));
const vars = (theme) => {
  const lines = [`  --init-bg: ${t.themes[theme].bg};`, `  --init-text: ${t.themes[theme].text};`];
  for (const [name, h] of Object.entries(t.heat)) lines.push(`  --heat-${name}-border: ${h.border[theme]};`);
  for (const [name, c] of Object.entries(t.status)) lines.push(`  --status-${name}: ${c[theme]};`);
  return lines.join('\n');
};
const fixed = Object.entries(t.heat).map(([n, h]) => `  --heat-${n}-fill: ${h.fill};\n  --heat-${n}-text: ${h.text};`).join('\n');
const css = `/* Made by web/build-tokens.mjs from design/tokens.json. Do not edit by hand. */
:root {\n${fixed}\n${vars('light')}\n}
@media (prefers-color-scheme: dark) {\n  :root {\n${vars('dark').replace(/^/gm, '  ')}\n  }\n}
`;
writeFileSync(new URL('./src/tokens.css', import.meta.url), css);
console.log('web/src/tokens.css written');
