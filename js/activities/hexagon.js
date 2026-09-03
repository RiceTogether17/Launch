/**
 * "Using the pictures as clues, complete the following words with the letters
 * from the hexagon."
 *
 * One shared pool of six letters, six words, each letter used exactly once —
 * so a wrong guess costs a letter another word needs, exactly like the paper
 * version. Letters grey out as they're spent.
 */

import { el } from '../dom.js';
import { preloadSounds, say, saySound, sfx } from '../audio.js';
import { floatFrom, shake } from '../fx.js';

export function mount(page, host, finish) {
  preloadSounds(page.hexLetters);

  const total = page.words.length;
  let solved = 0;
  let mistakes = 0;
  let selected = null; // { letter, button }

  const hexButtons = new Map();
  const hexLetters = el('div.letters');
  for (const letter of page.hexLetters) {
    const btn = el('button.letter', {
      type: 'button',
      text: letter,
      'aria-label': `letter ${letter}`,
      onclick: () => pick(letter, btn),
    });
    hexButtons.set(letter, btn);
    hexLetters.append(btn);
  }
  const hex = el('div.hex', {}, [el('div.hex-inner', {}, [hexLetters])]);

  function pick(letter, btn) {
    if (btn.classList.contains('used')) return;
    if (selected) selected.button.classList.remove('right');
    selected = { letter, button: btn };
    btn.classList.add('right');
    saySound(letter);
    sfx.tap();
  }

  const rows = page.words.map((entry) => {
    const answer = entry.word[entry.blank];
    const row = el('div.word-row');
    let done = false;

    const pic = el('button.pic', {
      type: 'button',
      'aria-label': `Hear the word ${entry.word}`,
      text: entry.emoji,
      onclick: () => say(entry.word),
    });

    const boxes = el('div.word-boxes');
    const blankBox = el('button.box.blank.target', {
      type: 'button',
      'aria-label': `missing letter in ${entry.word}`,
      onclick: drop,
    });
    entry.word.split('').forEach((ch, i) => {
      boxes.append(i === entry.blank ? blankBox : el('span.box.given', { text: ch }));
    });

    function drop() {
      if (done || !selected) return;
      if (selected.letter === answer) {
        done = true;
        solved += 1;
        blankBox.textContent = answer;
        blankBox.classList.add('filled');
        blankBox.classList.remove('target');
        row.classList.add('solved');
        selected.button.classList.remove('right');
        selected.button.classList.add('used');
        selected = null;
        sfx.correct();
        say(entry.word);
        floatFrom(blankBox, '✓', 'good');
        if (solved === total) {
          setTimeout(() => finish(Math.max(0, 1 - mistakes / (total * 1.5))), 600);
        }
      } else {
        mistakes += 1;
        sfx.wrong();
        shake(row);
      }
    }

    row.append(pic, boxes);
    return row;
  });

  host.append(
    el('div.stack', {}, [
      el('div.prompt', {}, [
        el('span.big-emoji', { text: '⬡' }),
        el('div', {}, [
          el('h2', { text: 'Hexagon words' }),
          el('p.instruction', {
            text: 'Tap a letter in the hexagon, then tap the empty box it belongs in. Each letter is used once.',
          }),
        ]),
      ]),
      hex,
      ...rows,
    ]),
  );
}
