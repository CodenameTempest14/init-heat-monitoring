// OLED-GATE on the real board (P03-04): the frame-buffer dump the firmware prints must be read back correctly
// and compared with the approved images.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCREENS, drawScreen } from '../design/oled/screens.mjs';
import { diffAgainstPng } from '../design/oled/compare.mjs';
import { bufferFromScreen, screenFromHex, parseDumps } from '../design/oled/dump.mjs';

const refPng = (id) => readFileSync(new URL(`../design/oled/ref/${id}.png`, import.meta.url));
const hex = (buf) => Buffer.from(buf).toString('hex');

test('SSD1306 page layout: byte = x + (y / 8) * 128, bit = y % 8', () => {
  const screen = drawScreen({ draw: () => {} });
  screen.set(0, 0, 1);    // first byte, bit 0
  screen.set(3, 9, 1);    // second page, bit 1
  screen.set(127, 63, 1); // last byte, bit 7
  const buf = bufferFromScreen(screen);
  assert.equal(buf.length, 1024);
  assert.equal(buf[0], 0x01);
  assert.equal(buf[128 + 3], 0x02);
  assert.equal(buf[1023], 0x80);
  assert.equal(buf.filter((b) => b).length, 3);
});

test('a screen survives buffer -> hex -> screen unchanged, for all 9 approved screens', () => {
  for (const spec of SCREENS) {
    const back = screenFromHex(hex(bufferFromScreen(drawScreen(spec))));
    assert.equal(diffAgainstPng(back, refPng(spec.id)).length, 0, spec.id);
  }
});

test('a dump with one flipped pixel is caught', () => {
  const spec = SCREENS[0];
  const buf = bufferFromScreen(drawScreen(spec));
  buf[500] ^= 0x04;
  assert.equal(diffAgainstPng(screenFromHex(hex(buf)), refPng(spec.id)).length, 1);
});

test('parseDumps keeps the last dump of each id and ignores other serial lines', () => {
  const a = hex(new Uint8Array(1024));
  const b = hex(new Uint8Array(1024).fill(1));
  const text = `rst:0x1 boot\nSCREEN OLED-03 ${a}\nnoise\r\nSCREEN OLED-03 ${b}\r\nSCREEN OLED-05 ${a.slice(0, 20)}\n`;
  const dumps = parseDumps(text);
  assert.deepEqual([...dumps.keys()], ['OLED-03']); // OLED-05 is cut short, so it is dropped
  assert.equal(dumps.get('OLED-03'), b);
});
