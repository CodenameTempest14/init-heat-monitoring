// F-15 extended: the words of the #heat page (web/src/heatText.js) must agree with the app's own level table (web/src/category.js),
// so the page can never say "Danger starts at 42" while the card turns Danger at another number.
import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../web/src/heatText.js';
import { art } from '../web/src/heatArt.js';
import { categoryOf } from '../web/src/category.js';

const numbers = (range) => (range.match(/\d+/g) || []).map(Number);

test('the heat page has the four PAGASA levels, hottest last, with the ids the card links to', () => {
  assert.deepEqual(LEVELS.map((l) => l.id), ['caution', 'extreme-caution', 'danger', 'extreme-danger']);
});

test('each range on the page starts where the app switches to that level', () => {
  for (const l of LEVELS) {
    const [from, to] = numbers(l.range);
    assert.equal(categoryOf(from), l.id, `${l.name} should start at ${from}`);
    assert.notEqual(categoryOf(from - 1), l.id, `${from - 1} should be the level below ${l.name}`);
    if (to !== undefined && l.id !== 'extreme-danger') assert.equal(categoryOf(to), l.id, `${l.name} should still hold at ${to}`);
    if (l.id !== 'extreme-danger') assert.notEqual(categoryOf(to + 1), l.id, `${to + 1} should be above ${l.name}`);
  }
});

test('every level says what it can do and has at least one thing to prepare or do, and no empty text', () => {
  for (const l of LEVELS) {
    assert.ok(l.body.trim().length > 10, `${l.id} body`);
    assert.ok(l.todo.length >= 1 && l.todo.every((t) => t.trim().length > 3), `${l.id} todo`);
  }
});

test('the pictures: one per level and one for the intro, each hidden from screen readers, with no text, links or scripts', () => {
  for (const id of ['what', ...LEVELS.map((l) => l.id)]) {
    const svg = art(id);
    assert.match(svg, /^<svg class="hl-art hl-art-/);
    assert.match(svg, /aria-hidden="true"/);
    assert.doesNotMatch(svg, /<(text|title|a|script|image|foreignObject)\b|href=|on\w+=/i, `${id} has something other than shapes`);
  }
});
