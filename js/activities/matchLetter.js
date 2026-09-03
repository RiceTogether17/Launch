/**
 * "Draw a line from each picture to the letter which represents the
 * first/last sound of the picture."
 *
 * Tap a picture, then tap a letter — a line is drawn between them. Correct
 * pairs stay joined; wrong ones snap back. The lines are real SVG lines
 * anchored to the two elements, redrawn on resize.
 */

import { el, shuffle } from '../dom.js';
import { preloadSounds, say, saySound, sfx } from '../audio.js';
import { floatFrom, shake } from '../fx.js';

export function mount(page, host, finish) {
  preloadSounds(page.pairs.map((x) => x.letter));

  const where = page.position === 'first' ? 'first' : 'last';
  const total = page.pairs.length;
  let joined = 0;
  let mistakes = 0;

  const pics = shuffle(page.pairs);
  const glyphs = shuffle(page.pairs.map((x) => x.letter));

  const board = el('div.match');
  const wires = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  wires.setAttribute('class', 'wires');

  const left = el('div.col');
  const mid = el('div.col.mid');
  const right = el('div.col');

  // Pictures alternate down the two outer columns, as they do on the page.
  const picNodes = new Map();
  pics.forEach((pair, i) => {
    const node = el('button.match-item', {
      type: 'button',
      'aria-label': pair.pic.word,
      onclick: () => selectPic(pair, node),
    }, [el('span.art', { text: pair.pic.emoji })]);
    picNodes.set(pair.pic.word, node);
    (i % 2 === 0 ? left : right).append(node);
  });

  const glyphNodes = new Map();
  for (const letter of glyphs) {
    const node = el('button.match-item', {
      type: 'button',
      'aria-label': `letter ${letter}`,
      onclick: () => selectLetter(letter, node),
    }, [el('span.glyph', { text: letter })]);
    glyphNodes.set(letter, node);
    mid.append(node);
  }

  let active = null;      // the picture waiting for a letter
  const links = [];       // [pictureNode, letterNode] pairs already joined

  function selectPic(pair, node) {
    if (node.classList.contains('linked')) return;
    if (active) active.node.classList.remove('active');
    active = { pair, node };
    node.classList.add('active');
    say(pair.pic.word);
    sfx.tap();
  }

  function selectLetter(letter, node) {
    if (!active) {
      saySound(letter);
      return;
    }
    if (active.pair.letter === letter) {
      active.node.classList.remove('active');
      active.node.classList.add('linked');
      node.classList.add('linked');
      links.push([active.node, node]);
      joined += 1;
      sfx.correct();
      saySound(letter);
      floatFrom(node, '✓', 'good');
      active = null;
      drawWires();
      if (joined === total) {
        // Six pictures with one slip is still strong work, so scale gently.
        setTimeout(() => finish(Math.max(0, 1 - mistakes / (total * 1.5))), 500);
      }
    } else {
      mistakes += 1;
      sfx.wrong();
      shake(node);
    }
  }

  function drawWires() {
    const box = board.getBoundingClientRect();
    wires.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    wires.innerHTML = '';
    for (const [a, b] of links) {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', ra.left + ra.width / 2 - box.left);
      line.setAttribute('y1', ra.top + ra.height / 2 - box.top);
      line.setAttribute('x2', rb.left + rb.width / 2 - box.left);
      line.setAttribute('y2', rb.top + rb.height / 2 - box.top);
      wires.append(line);
    }
  }

  const onResize = () => drawWires();
  window.addEventListener('resize', onResize);
  // The host clears its container between pages; drop the listener with it.
  host.addEventListener('activity:teardown', () => window.removeEventListener('resize', onResize));

  board.append(wires, left, mid, right);

  host.append(
    el('div.stack', {}, [
      el('div.prompt', {}, [
        el('span.big-emoji', { text: '🔗' }),
        el('div', {}, [
          el('h2', { text: `Match the ${where} sound` }),
          el('p.instruction', {
            text: `Tap a picture to hear its word, then tap the letter that makes its ${where} sound.`,
          }),
        ]),
      ]),
      board,
    ]),
  );
}
