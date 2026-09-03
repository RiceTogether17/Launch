/**
 * "First Sound" / "Last Sound" pages.
 *
 * The workbook asks the child to colour in every picture sharing a sound with
 * the target. Here the pictures start greyed out and gain their colour when
 * tapped — so "colouring in" is literally what the interaction does. The child
 * taps every match, then checks.
 */

import { el, shuffle } from '../dom.js';
import { preloadSounds, say, saySound, sayWordThenSound, sfx } from '../audio.js';
import { shake } from '../fx.js';

export function mount(page, host, finish) {
  preloadSounds([page.sound]);

  const picked = new Set();
  const matches = new Set(page.matches);
  const order = shuffle(page.items);
  const where = page.position === 'first' ? 'first' : 'last';

  let checked = false;

  const prompt = el('div.prompt', {}, [
    el('span.big-emoji', { text: page.target.emoji }),
    el('div', {}, [
      el('h2', { text: `${where === 'first' ? 'First' : 'Last'} sound: ${page.target.word}` }),
      el('p.instruction', {
        text: `Tap every picture whose ${where} sound is the same as ${page.target.word}.`,
      }),
      el('p.instruction', { text: 'Not sure what a picture is? Tap it to hear its name.' }),
    ]),
    el('button.say', {
      type: 'button',
      title: `Hear ${page.target.word}`,
      'aria-label': `Hear the word ${page.target.word}`,
      text: '🔊',
      onclick: () => sayWordThenSound(page.target.word, page.sound),
    }),
  ]);

  const grid = el('div.tile-grid');
  const tiles = new Map();

  for (const item of order) {
    const tile = el('button.tile', {
      type: 'button',
      'aria-pressed': 'false',
      'aria-label': item.word,
      onclick: () => toggle(item, tile),
    }, [
      el('span.art', { text: item.emoji }),
      el('span.mark'),
    ]);
    tiles.set(item.word, tile);
    grid.append(tile);
  }

  function toggle(item, tile) {
    if (checked) return;
    if (picked.has(item.word)) {
      picked.delete(item.word);
      tile.classList.remove('picked');
      tile.setAttribute('aria-pressed', 'false');
    } else {
      picked.add(item.word);
      tile.classList.add('picked');
      tile.setAttribute('aria-pressed', 'true');
      sfx.tap();
    }
    say(item.word);
    checkBtn.disabled = picked.size === 0;
  }

  const checkBtn = el('button.btn.big', {
    type: 'button',
    text: 'Check my answers',
    disabled: true,
    onclick: check,
  });

  function check() {
    checked = true;
    checkBtn.disabled = true;
    let right = 0;

    // Every tile counts: a match you found, and a non-match you left alone.
    for (const item of order) {
      const tile = tiles.get(item.word);
      const shouldPick = matches.has(item.word);
      const didPick = picked.has(item.word);
      tile.classList.add('settled');

      if (shouldPick === didPick) {
        right += 1;
        if (didPick) {
          tile.classList.add('right');
          tile.querySelector('.mark').textContent = '✅';
        }
      } else {
        tile.classList.add(didPick ? 'wrong' : 'right');
        tile.querySelector('.mark').textContent = didPick ? '❌' : '👉';
        if (!didPick) tile.classList.add('picked'); // reveal the one they missed
      }
    }

    const accuracy = right / order.length;
    accuracy === 1 ? sfx.correct() : sfx.wrong();
    if (accuracy < 1) shake(grid);
    finish(accuracy);
  }

  const listenBtn = el('button.btn.ghost', {
    type: 'button',
    text: `🔉 Hear the ${where} sound`,
    onclick: () => saySound(page.sound),
  });

  host.append(
    el('div.stack', {}, [
      prompt,
      grid,
      el('div.row', { style: { justifyContent: 'center' } }, [listenBtn]),
      checkBtn,
    ]),
  );

  // Say the target once on arrival so the child hears what they're matching.
  setTimeout(() => sayWordThenSound(page.target.word, page.sound), 400);
}
