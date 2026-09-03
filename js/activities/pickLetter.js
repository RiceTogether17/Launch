/**
 * "Circle the letter which represents the first/last sound of each picture."
 *
 * Every question is answered in place; a wrong tap marks that question as
 * not-first-try but leaves it open so the child still has to find the answer.
 */

import { el } from '../dom.js';
import { preloadSounds, say, saySound, sfx } from '../audio.js';
import { floatFrom, shake } from '../fx.js';

export function mount(page, host, finish) {
  preloadSounds(page.questions.flatMap((q) => q.options));

  const where = page.position === 'first' ? 'first' : 'last';
  const total = page.questions.length;
  let solved = 0;
  let firstTry = 0;

  const rows = page.questions.map((q) => {
    const row = el('div.qcard');
    let clean = true;
    let done = false;

    const pic = el('button.pic', {
      type: 'button',
      'aria-label': `Hear the word ${q.pic.word}`,
      text: q.pic.emoji,
      onclick: () => say(q.pic.word),
    });

    const letters = el('div.letters');
    for (const option of q.options) {
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
      if (option === q.answer) {
        done = true;
        solved += 1;
        if (clean) firstTry += 1;
        btn.classList.add('right');
        row.classList.add('solved');
        letters.querySelectorAll('.letter').forEach((b) => {
          if (b !== btn) b.classList.add('used');
        });
        sfx.correct();
        saySound(option);
        floatFrom(btn, clean ? '+1 ⭐' : '✓', 'good');
        if (solved === total) setTimeout(() => finish(firstTry / total), 500);
      } else {
        clean = false;
        btn.classList.add('wrong');
        btn.disabled = true;
        sfx.wrong();
        shake(row);
      }
    }

    row.append(pic, letters);
    return row;
  });

  host.append(
    el('div.stack', {}, [
      el('div.prompt', {}, [
        el('span.big-emoji', { text: '⭕' }),
        el('div', {}, [
          el('h2', { text: `Circle the ${where} sound` }),
          el('p.instruction', {
            text: `Tap the letter that makes the ${where} sound in each picture. Tap a picture to hear its word.`,
          }),
        ]),
      ]),
      ...rows,
    ]),
  );
}
