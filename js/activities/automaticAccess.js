/**
 * "Phonics — Automatic Access."
 *
 * The workbook's definition is precise (CDM p29): to look at a letter and
 * "correctly pronounce the corresponding phoneme (sound) without hesitation."
 * So the child says each sound aloud and the app listens, rather than testing
 * whether they can recite the alphabet in order.
 *
 * The teacher's move when a child stumbles is written down too, and the app
 * copies it exactly:
 *
 *   "When a student mispronounces the sound or hesitates, the teacher says a
 *    word that has the corresponding initial first sound, i.e. 'umbrella'.
 *    The student listens and says the correct sound. Continue onto the next
 *    letter."
 *
 * What the app deliberately does not do is hurry anyone (CDM p29, "It's not a
 * Competition!"). The clock runs and each attempt is recorded, because that is
 * what the workbook does, but nothing urges speed and stars come from accuracy.
 *
 * The microphone is never assumed: it needs a network connection, a permission
 * grant and a browser that supports it, so tapping is always available and the
 * page falls back to it on its own when listening isn't possible.
 */

import { el, shuffle } from '../dom.js';
import { GRAPHEME_WORDS, say, saySound, sfx } from '../audio.js';
import { judge, keyWordFor } from '../phonemeMatch.js';
import { listenOnce, listeningSupported } from '../listen.js';
import { confetti, shake } from '../fx.js';
import { bestTime, recordTime } from '../state.js';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export function mount(page, host, finish) {
  const upper = page.letterCase === 'upper';
  // The workbook scrambles the letters; the child works across the chart
  // rather than reciting a sequence they may simply have memorised.
  const order = shuffle(ALPHABET);

  let index = 0;
  let stumbles = 0;      // letters that needed a prompt before they were right
  let startedAt = null;
  let ticker = null;
  let listening = false;
  let useMic = listeningSupported();
  let session = null;

  const timerEl = el('div.timer', { text: '0.0s' });
  const progress = el('b', { text: `0 / ${order.length}` });
  const previous = bestTime(page.letterCase);

  const statusEl = el('p.instruction', {
    text: previous == null
      ? 'Your time is recorded each go, just like in the workbook.'
      : `Last time you took ${previous.toFixed(1)}s.`,
  });

  const targetEl = el('div.access-target', { 'aria-live': 'polite' });
  const micBtn = el('button.btn.big', { type: 'button', onclick: onMicPress });
  const modeBtn = el('button.btn.ghost', { type: 'button', onclick: toggleMode });

  const grid = el('div.alpha-grid');
  const buttons = new Map();
  for (const letter of order) {
    const shown = upper ? letter.toUpperCase() : letter;
    const btn = el('button.alpha', {
      type: 'button',
      text: shown,
      'aria-label': `letter ${shown}`,
      onclick: () => onLetterTap(letter, btn),
    });
    buttons.set(letter, btn);
    grid.append(btn);
  }

  // -------------------------------------------------------------- the clock

  function startClock() {
    if (startedAt != null) return;
    startedAt = performance.now();
    ticker = setInterval(() => {
      timerEl.textContent = `${((performance.now() - startedAt) / 1000).toFixed(1)}s`;
    }, 100);
  }

  // ------------------------------------------------------------- one letter

  function current() {
    return order[index];
  }

  function render() {
    const letter = current();
    if (!letter) return;
    const shown = upper ? letter.toUpperCase() : letter;
    targetEl.textContent = shown;
    progress.textContent = `${index} / ${order.length}`;
    buttons.forEach((btn, l) => btn.classList.toggle('current', l === letter));
    micBtn.textContent = useMic ? '🎤 Say the sound' : '👆 Tap the letter above';
    micBtn.disabled = !useMic;
    modeBtn.textContent = useMic ? 'No microphone? Tap instead' : 'Use the microphone';
    // Nothing to switch to if the browser can't listen at all.
    modeBtn.hidden = !listeningSupported();
  }

  function advance(clean) {
    if (!clean) stumbles += 1;
    buttons.get(current())?.classList.add('done');
    buttons.get(current())?.classList.remove('current');
    index += 1;
    progress.textContent = `${index} / ${order.length}`;
    if (index >= order.length) finishPage();
    else render();
  }

  /**
   * The manual's own repair move: offer a word that starts with the sound,
   * let the child hear it, then move on rather than drilling the same letter.
   */
  function prompt(letter, message) {
    const word = keyWordFor(letter) || GRAPHEME_WORDS[letter];
    statusEl.textContent = message;
    sfx.wrong();
    shake(targetEl);
    say(word);
    setTimeout(() => saySound(letter), 1000);
  }

  function accept() {
    statusEl.textContent = 'Yes — that’s the sound.';
    sfx.correct();
    advance(true);
  }

  // ------------------------------------------------------------ microphone

  async function onMicPress() {
    if (listening || !useMic) return;
    const letter = current();
    startClock();
    listening = true;
    micBtn.classList.add('listening');
    micBtn.textContent = '🎙️ Listening…';
    statusEl.textContent = 'Say the sound this letter makes.';

    session = listenOnce({
      onInterim: (text) => { if (text) statusEl.textContent = `Heard: ${text}`; },
    });
    const { guesses, error } = await session.done;

    listening = false;
    session = null;
    micBtn.classList.remove('listening');

    if (error === 'not-allowed' || error === 'service-not-allowed' || error === 'unsupported') {
      useMic = false;
      statusEl.textContent = 'No microphone here — tap the letters instead.';
      render();
      return;
    }

    const verdict = judge(letter, guesses);
    if (verdict === 'correct') {
      accept();
    } else if (verdict === 'letter-name') {
      // Naming the letter instead of sounding it is the exact confusion the
      // manual has teachers correct (CDM p12, "Letters or the Alphabet?").
      stumbles += 1;
      prompt(letter, 'That’s the letter’s name. Listen for its sound:');
    } else {
      stumbles += 1;
      prompt(letter, 'Not quite. Listen:');
    }
    render();
  }

  function toggleMode() {
    if (useMic) {
      useMic = false;
      session?.stop();
      statusEl.textContent = 'Say each sound aloud, then tap the letter.';
    } else if (listeningSupported()) {
      useMic = true;
      statusEl.textContent = 'Tap the button and say the sound.';
    }
    render();
  }

  /** Tapping mode: the child says the sound aloud and taps to confirm. */
  function onLetterTap(letter, btn) {
    if (useMic || btn.classList.contains('done')) return;
    startClock();
    if (letter === current()) {
      saySound(letter);
      accept();
    } else {
      btn.classList.add('miss');
      setTimeout(() => btn.classList.remove('miss'), 400);
      sfx.wrong();
      statusEl.textContent = 'Look for the highlighted letter.';
    }
  }

  // ---------------------------------------------------------------- the end

  function finishPage() {
    clearInterval(ticker);
    const seconds = startedAt == null ? 0 : (performance.now() - startedAt) / 1000;
    timerEl.textContent = `${seconds.toFixed(1)}s`;
    buttons.forEach((btn) => btn.classList.remove('current'));
    targetEl.textContent = '✓';
    sfx.win();
    confetti();

    recordTime(page.letterCase, seconds, stumbles === 0);
    statusEl.textContent = stumbles === 0
      ? `${seconds.toFixed(1)}s, every sound right. Lovely and clear.`
      : `${seconds.toFixed(1)}s. Take your time and say each sound clearly.`;

    // Accuracy only. Working slowly and carefully must never score worse.
    setTimeout(() => finish(Math.max(0, 1 - stumbles / order.length)), 900);
  }

  host.addEventListener('activity:teardown', () => {
    clearInterval(ticker);
    session?.stop();
  });

  host.append(
    el('div.stack', {}, [
      el('div.prompt', {}, [
        el('span.big-emoji', { text: '🔤' }),
        el('div', {}, [
          el('h2', { text: `Automatic Access — ${upper ? 'CAPITAL' : 'small'} letters` }),
          el('p.instruction', {
            text: 'Look at the letter and say the sound it makes — not its name.',
          }),
          statusEl,
        ]),
      ]),
      el('div.card.access-stage', {}, [
        targetEl,
        timerEl,
        el('p.muted', { style: { margin: '2px 0 0' } }, ['Done ', progress]),
      ]),
      micBtn,
      el('div.row', { style: { justifyContent: 'center' } }, [modeBtn]),
      grid,
    ]),
  );

  if (!useMic) statusEl.textContent = 'Say each sound aloud, then tap the letter.';
  render();
}
