/**
 * Content check for js/data/pages.js.
 *
 *   node tools/check-content.mjs
 *
 * Every page is authored by hand, so this guards the things that are easy to
 * get wrong across 51 of them: an answer missing from its own options, a
 * hexagon whose letters don't spell its words, a picture filed under the wrong
 * sound. Run it after editing the page data.
 */

import { PAGES } from '../js/data/pages.js';

/**
 * Words whose final (or first) sound is not their final (or first) letter.
 * English spelling is not phonetic and this workbook teaches *sounds*, so
 * these are correct content, not mistakes — they just can't be checked by
 * looking at the spelling.
 *
 * Silent final "e" is handled by rule below rather than listed here, since it
 * covers a whole class of words (whale, house, horse, mouse, juice…).
 */
const SOUND_EXCEPTIONS = {
  lamb: { last: 'm' },   // silent b
  juice: { last: 's' },  // soft c: "-ce" says /s/
};

/** "whale" → "whal", so the last sound checks as /l/ rather than /e/. */
function withoutSilentE(word) {
  return word.length > 2 && word.endsWith('e') ? word.slice(0, -1) : word;
}

const problems = [];
const bad = (pg, msg) => problems.push(`page ${pg.page} (${pg.type}): ${msg}`);
const seen = new Set();

for (const pg of PAGES) {
  if (seen.has(pg.page)) bad(pg, 'duplicate page number');
  seen.add(pg.page);

  switch (pg.type) {
    case 'soundSort': {
      const words = pg.items.map((i) => i.word);
      if (new Set(words).size !== words.length) bad(pg, 'duplicate picture words');
      for (const m of pg.matches) if (!words.includes(m)) bad(pg, `match "${m}" is not among the items`);
      if (!pg.matches.length) bad(pg, 'no matches at all');
      if (pg.matches.length === pg.items.length) bad(pg, 'every item matches — no discrimination');
      for (const it of pg.items) if (!it.emoji) bad(pg, `"${it.word}" has no emoji`);
      if (!pg.target?.emoji) bad(pg, 'target has no emoji');
      // The match set should agree with the stated sound.
      for (const m of pg.matches) {
        const word = m.toLowerCase();
        const exception = SOUND_EXCEPTIONS[word]?.[pg.position];
        if (exception === pg.sound) continue;
        const ok = pg.position === 'first'
          ? word.startsWith(pg.sound)
          : withoutSilentE(word).endsWith(pg.sound);
        if (!ok) bad(pg, `"${m}" does not ${pg.position === 'first' ? 'start' : 'end'} with "${pg.sound}"`);
      }
      break;
    }
    case 'pickLetter':
      for (const q of pg.questions) {
        if (!q.options.includes(q.answer)) bad(pg, `answer "${q.answer}" missing from options for ${q.pic.word}`);
        if (new Set(q.options).size !== q.options.length) bad(pg, `duplicate options for ${q.pic.word}`);
        const ch = pg.position === 'first' ? q.pic.word[0] : q.pic.word.at(-1);
        if (ch.toLowerCase() !== q.answer) bad(pg, `"${q.pic.word}" ${pg.position} letter is "${ch}" but answer is "${q.answer}"`);
      }
      break;
    case 'matchLetter': {
      const ls = pg.pairs.map((p) => p.letter);
      if (new Set(ls).size !== ls.length) bad(pg, 'two pictures share a letter — the pairing is ambiguous');
      for (const p of pg.pairs) {
        const ch = pg.position === 'first' ? p.pic.word[0] : p.pic.word.at(-1);
        if (ch.toLowerCase() !== p.letter) bad(pg, `"${p.pic.word}" ${pg.position} letter is "${ch}" but paired with "${p.letter}"`);
      }
      break;
    }
    case 'segment':
      for (const w of pg.words) {
        if (w.blank < 0 || w.blank >= w.word.length) bad(pg, `blank ${w.blank} out of range for "${w.word}"`);
        const expect = pg.position === 'first' ? 0 : w.word.length - 1;
        if (w.blank !== expect) bad(pg, `"${w.word}" blank at ${w.blank}, expected ${expect} for ${pg.position} sound`);
        if (!w.emoji) bad(pg, `"${w.word}" has no emoji`);
      }
      break;
    case 'hexagon': {
      const needed = pg.words.map((w) => w.word[w.blank]).sort();
      const have = [...pg.hexLetters].sort();
      if (needed.join('') !== have.join('')) {
        bad(pg, `hexagon letters [${have}] do not match the letters the words need [${needed}]`);
      }
      break;
    }
    case 'tracing':
      for (const l of pg.letters) if (!/^[a-z]$/.test(l)) bad(pg, `bad letter "${l}"`);
      if (pg.findLetter) {
        const n = pg.findLetter.row.filter((c) => c.toLowerCase() === pg.findLetter.letter).length;
        if (n < 1) bad(pg, `find-letter row contains no "${pg.findLetter.letter}"`);
      }
      break;
    case 'automaticAccess':
      if (!['lower', 'upper'].includes(pg.letterCase)) bad(pg, 'bad letterCase');
      break;
    default:
      bad(pg, 'unknown type');
  }
}

console.log(`checked ${PAGES.length} pages`);
console.log(problems.length ? problems.join('\n') : '✅ content data is consistent');
