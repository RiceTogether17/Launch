/**
 * "Phonics — Automatic Access."
 *
 * On paper the teacher times the child reading a scrambled alphabet aloud and
 * writes the seconds in the margin, lesson after lesson. The app keeps the
 * scramble and the timer, and makes the marking automatic.
 *
 * What it deliberately does NOT do is make a game of speed. The curriculum
 * manual is blunt about this (CDM p29, "It's not a Competition!"):
 *
 *   "Do not turn the Automatic Access activity into a competition or race
 *    among or with other students. Mispronunciation of sounds will occur
 *    when students rush the activity."
 *
 * and, on the ~30 second target it sets for LiftOff readiness: "it is more
 * important that these are pronounced clearly and correctly."
 *
 * So the clock runs and each attempt is recorded — that is what the workbook
 * itself does — but nothing here urges the child to hurry, stars come from
 * accuracy alone, and no time is ever framed as beating anything.
 */

import { el, shuffle } from '../dom.js';
import { say, sfx } from '../audio.js';
import { confetti, shake } from '../fx.js';
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
    text: best == null
      ? 'Your time is recorded each go, just like in the workbook.'
      : `Last time you took ${best.toFixed(1)}s.`,
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

    recordTime(page.letterCase, seconds, misses === 0);
    bestEl.textContent = misses === 0
      ? `${seconds.toFixed(1)}s, every letter right. Lovely and clear.`
      : `${seconds.toFixed(1)}s. Take your time and say each sound clearly.`;

    // Stars come from accuracy alone. A child who works slowly and carefully
    // should earn three; hurrying must never be the way to score well.
    const accuracy = Math.max(0, 1 - misses / 8);
    setTimeout(() => finish(accuracy), 900);
  }

  host.addEventListener('activity:teardown', () => clearInterval(ticker));

  host.append(
    el('div.stack', {}, [
      el('div.prompt', {}, [
        el('span.big-emoji', { text: '⏱️' }),
        el('div', {}, [
          el('h2', { text: `Automatic Access — ${upper ? 'CAPITAL' : 'small'} letters` }),
          el('p.instruction', {
            text: 'Say each letter\u2019s sound out loud, then tap it. Work through them in order, a to z.',
          }),
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
