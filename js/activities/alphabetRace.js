/**
 * "Alphabet — automatic access."
 *
 * On paper a teacher times the child reading a scrambled alphabet aloud and
 * writes the seconds in the margin. The app keeps the scramble and the timer
 * but makes it self-marking: tap the letters in alphabetical order, as fast as
 * you can. Best time is kept, so the child races themselves.
 */

import { el, shuffle } from '../dom.js';
import { say, sfx } from '../audio.js';
import { confetti, floatFrom, shake } from '../fx.js';
import { bestTime, recordTime } from '../state.js';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export function mount(page, host, finish) {
  const upper = page.letterCase === 'upper';
  const sequence = upper ? ALPHABET.map((l) => l.toUpperCase()) : ALPHABET;

  const progress = el('b', { text: '0 / 26' });
  let position = 0;
  let misses = 0;
  let startedAt = null;
  let ticker = null;

  const timerEl = el('div.timer', { text: '0.0s' });
  const best = bestTime(page.letterCase);
  const bestEl = el('p.instruction', {
    text: best == null ? 'No best time yet — set one!' : `Your best: ${best.toFixed(1)}s`,
  });

  const grid = el('div.alpha-grid');
  const buttons = new Map();
  for (const letter of shuffle(sequence)) {
    const btn = el('button.alpha', {
      type: 'button',
      text: letter,
      'aria-label': `letter ${letter}`,
      onclick: () => tap(letter, btn),
    });
    buttons.set(letter, btn);
    grid.append(btn);
  }

  function tap(letter, btn) {
    if (btn.classList.contains('done')) return;
    if (startedAt == null) start();

    if (letter === sequence[position]) {
      btn.classList.add('done');
      say(letter, { rate: 1.1 });
      sfx.tap();
      position += 1;
      progress.textContent = `${position} / 26`;
      if (position === sequence.length) done();
    } else {
      misses += 1;
      btn.classList.add('miss');
      setTimeout(() => btn.classList.remove('miss'), 400);
      sfx.wrong();
      shake(grid);
    }
  }

  function start() {
    startedAt = performance.now();
    ticker = setInterval(() => {
      timerEl.textContent = `${((performance.now() - startedAt) / 1000).toFixed(1)}s`;
    }, 100);
  }

  function done() {
    clearInterval(ticker);
    const seconds = (performance.now() - startedAt) / 1000;
    timerEl.textContent = `${seconds.toFixed(1)}s`;
    sfx.win();
    confetti();

    if (recordTime(page.letterCase, seconds)) {
      bestEl.textContent = `🏅 New best time: ${seconds.toFixed(1)}s`;
      floatFrom(timerEl, 'New best!', 'good');
    }

    // Stars come from accuracy, not speed — a child who taps carefully and
    // slowly should still earn three. Speed is its own reward on the clock.
    const accuracy = Math.max(0, 1 - misses / 8);
    setTimeout(() => finish(accuracy), 900);
  }

  host.addEventListener('activity:teardown', () => clearInterval(ticker));

  host.append(
    el('div.stack', {}, [
      el('div.prompt', {}, [
        el('span.big-emoji', { text: '⏱️' }),
        el('div', {}, [
          el('h2', { text: `Alphabet race — ${upper ? 'CAPITAL' : 'small'} letters` }),
          el('p.instruction', { text: 'Tap the letters in alphabetical order. The clock starts on your first tap.' }),
          bestEl,
        ]),
      ]),
      el('div.card', { style: { textAlign: 'center' } }, [
        timerEl,
        el('p.muted', { style: { margin: '4px 0 0' } }, ['Found ', progress]),
      ]),
      grid,
    ]),
  );
}
