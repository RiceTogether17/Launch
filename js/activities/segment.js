/**
 * "Phonics / Segmenting" pages.
 *
 * The word is laid out one letter per box with one box empty. The child hears
 * the word, works out the missing first (or last) sound, and taps that letter.
 * Distractor letters are drawn from the other words on the page plus a couple
 * of nearby letters, so the choice is a real one.
 */

import { el, shuffle } from '../dom.js';
import { say, saySound, sfx } from '../audio.js';
import { floatFrom, shake } from '../fx.js';

const FILLERS = 'bcdfghjklmnprstvwz'.split('');

/**
 * Four options: the answer plus three distinct distractors. Letters used by
 * the other words on the page come first — they're the plausible confusions —
 * with the rest of the alphabet as backup.
 */
function optionsFor(answer, page) {
  const nearby = shuffle([...new Set(page.words.map((w) => w.word[w.blank]))]);
  const seen = new Set([answer]);
  const extras = [];
  for (const letter of [...nearby, ...shuffle(FILLERS)]) {
    if (seen.has(letter)) continue;
    seen.add(letter);
    extras.push(letter);
    if (extras.length === 3) break;
  }
  return shuffle([answer, ...extras]);
}

export function mount(page, host, finish) {
  const where = page.position === 'first' ? 'first' : 'last';
  const total = page.words.length;
  let solved = 0;
  let firstTry = 0;

  const rows = page.words.map((entry) => {
    const answer = entry.word[entry.blank];
    const row = el('div.word-row');
    let clean = true;
    let done = false;

    const pic = el('button.pic', {
      type: 'button',
      'aria-label': `Hear the word ${entry.word}`,
      text: entry.emoji,
      onclick: () => say(entry.word),
    });

    const boxes = el('div.word-boxes');
    const blankBox = el('span.box.blank.target', { 'aria-label': 'missing letter' });
    entry.word.split('').forEach((ch, i) => {
      boxes.append(i === entry.blank ? blankBox : el('span.box.given', { text: ch }));
    });

    const letters = el('div.letters');
    for (const option of optionsFor(answer, page)) {
      const btn = el('button.letter', {
        type: 'button',
        text: option,
        'aria-label': `letter ${option}`,
        onclick: () => choose(option, btn),
      });
      letters.append(btn);
    }

    function choose(option, btn) {
      if (done) return;
      if (option === answer) {
        done = true;
        solved += 1;
        if (clean) firstTry += 1;
        blankBox.textContent = answer;
        blankBox.classList.add('filled');
        blankBox.classList.remove('target');
        row.classList.add('solved');
        letters.querySelectorAll('.letter').forEach((b) => b.classList.add('used'));
        btn.classList.add('right');
        sfx.correct();
        say(entry.word);
        floatFrom(btn, clean ? '+1 ⭐' : '✓', 'good');
        if (solved === total) setTimeout(() => finish(firstTry / total), 600);
      } else {
        clean = false;
        btn.classList.add('wrong');
        btn.disabled = true;
        sfx.wrong();
        shake(row);
      }
    }

    row.append(pic, boxes, letters);
    return row;
  });

  host.append(
    el('div.stack', {}, [
      el('div.prompt', {}, [
        el('span.big-emoji', { text: '🧩' }),
        el('div', {}, [
          el('h2', { text: `Missing ${where} letter` }),
          el('p.instruction', {
            text: `Say the word, listen to the ${where} sound, then tap the letter that fills the empty box.`,
          }),
        ]),
        el('button.say', {
          type: 'button',
          text: '🔊',
          'aria-label': `Hear the ${where} sounds`,
          onclick: () => saySound(page.words[0].word[page.words[0].blank]),
        }),
      ]),
      ...rows,
    ]),
  );
}
