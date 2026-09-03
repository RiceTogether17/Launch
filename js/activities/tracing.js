/**
 * "Writing Skills" pages — trace the letter, say its sound.
 *
 * Rather than hand-authoring 52 letter outlines, the guide glyph is drawn with
 * the browser's own font and its pixels are sampled into a coarse grid of
 * "ink" cells. The child's stroke marks the cells it passes through, and the
 * score compares the two:
 *
 *   coverage  — how much of the letter got traced   (did they draw it all?)
 *   precision — how much of their stroke landed on it (or near it)
 *
 * Precision is what stops a scribble from scoring: filling the box reaches
 * 100% coverage but almost no precision. Cells within a small tolerance of the
 * glyph count as neither credit nor penalty, so a slightly wobbly five-year-old
 * hand isn't punished for being five.
 */

import { el } from '../dom.js';
import { saySound, sfx } from '../audio.js';
import { confetti, shake } from '../fx.js';

const CELL = 7;            // grid resolution in CSS pixels
const BRUSH = 13;          // stroke radius in CSS pixels
const TOLERANCE = 2;       // cells of slack around the glyph
const PASS_COVERAGE = 0.7;
const PASS_PRECISION = 0.45;

const GUIDE_FONT = '"Comic Sans MS", "Chalkboard SE", ui-rounded, "Segoe UI", system-ui, sans-serif';

export function mount(page, host, finish) {
  // Each letter is practised in both cases, in the workbook's order.
  const steps = page.letters.flatMap((l) => [l, l.toUpperCase()]);
  const scores = [];
  let index = 0;

  const stage = el('div.trace-stage');
  const midline = el('div.midline');
  const canvas = el('canvas');
  stage.append(canvas, midline);

  const meterFill = el('i');
  const meter = el('div.trace-meter', {}, [meterFill]);

  const title = el('h2');
  const instruction = el('p.instruction');
  const sayBtn = el('button.say', {
    type: 'button',
    text: '🔊',
    'aria-label': 'Hear the letter sound',
    onclick: () => saySound(steps[index]),
  });

  const clearBtn = el('button.btn.ghost', { type: 'button', text: '↺ Start again', onclick: reset });
  const doneBtn = el('button.btn', { type: 'button', text: 'Done ✓', onclick: grade });

  host.append(
    el('div.stack', {}, [
      el('div.prompt', {}, [
        el('span.big-emoji', { text: '✏️' }),
        el('div', {}, [title, instruction]),
        sayBtn,
      ]),
      el('div.trace-wrap', {}, [stage, meter]),
      el('div.row', { style: { justifyContent: 'center' } }, [clearBtn, doneBtn]),
    ]),
  );

  // ------------------------------------------------------------ the canvas

  const ctx = canvas.getContext('2d');
  let dpr = 1;
  let W = 0;      // CSS pixel size of the stage
  let H = 0;
  let cols = 0;
  let rows = 0;
  let ink = null;   // Uint8Array: 1 where the glyph has pixels
  let near = null;  // Uint8Array: 1 where the glyph is, or is close by
  let marked = null;
  let inkTotal = 0;
  let guide = null; // offscreen copy of the faint letter, for redraws

  function layout() {
    const box = stage.getBoundingClientRect();
    if (!box.width) return false;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = box.width;
    H = box.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / CELL);
    rows = Math.ceil(H / CELL);
    return true;
  }

  /** Font metrics chosen so the glyph sits on the stage's ruled lines. */
  function glyphFont() {
    return `${Math.round(H * 0.55)}px ${GUIDE_FONT}`;
  }
  const baselineY = () => H * 0.72;

  /** Rasterise the letter and turn its pixels into the ink / near grids. */
  function buildMasks(letter) {
    const off = document.createElement('canvas');
    off.width = Math.round(W * dpr);
    off.height = Math.round(H * dpr);
    const octx = off.getContext('2d', { willReadFrequently: true });
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    octx.font = glyphFont();
    octx.textAlign = 'center';
    octx.textBaseline = 'alphabetic';
    octx.fillStyle = '#000';
    octx.fillText(letter, W / 2, baselineY());

    const pixels = octx.getImageData(0, 0, off.width, off.height).data;
    ink = new Uint8Array(cols * rows);
    inkTotal = 0;

    // Any opaque pixel inside a cell makes the whole cell "ink".
    for (let py = 0; py < off.height; py += 1) {
      const y = Math.floor(py / dpr / CELL);
      if (y >= rows) continue;
      for (let px = 0; px < off.width; px += 1) {
        if (pixels[(py * off.width + px) * 4 + 3] < 40) continue;
        const x = Math.floor(px / dpr / CELL);
        if (x >= cols) continue;
        const i = y * cols + x;
        if (!ink[i]) { ink[i] = 1; inkTotal += 1; }
      }
    }

    near = dilate(ink, TOLERANCE);
    marked = new Uint8Array(cols * rows);

    // Keep a faint copy to redraw beneath the child's strokes.
    guide = document.createElement('canvas');
    guide.width = off.width;
    guide.height = off.height;
    const gctx = guide.getContext('2d');
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gctx.font = glyphFont();
    gctx.textAlign = 'center';
    gctx.textBaseline = 'alphabetic';
    gctx.fillStyle = 'rgba(128,110,190,0.22)';
    gctx.fillText(letter, W / 2, baselineY());
    gctx.lineWidth = 2;
    gctx.strokeStyle = 'rgba(128,110,190,0.55)';
    gctx.setLineDash([7, 7]);
    gctx.strokeText(letter, W / 2, baselineY());
  }

  /** Grow a mask outwards by `r` cells (Chebyshev distance). */
  function dilate(mask, r) {
    const out = new Uint8Array(mask.length);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (!mask[y * cols + x]) continue;
        for (let dy = -r; dy <= r; dy += 1) {
          const ny = y + dy;
          if (ny < 0 || ny >= rows) continue;
          for (let dx = -r; dx <= r; dx += 1) {
            const nx = x + dx;
            if (nx < 0 || nx >= cols) continue;
            out[ny * cols + nx] = 1;
          }
        }
      }
    }
    return out;
  }

  function redraw() {
    ctx.clearRect(0, 0, W, H);
    if (guide) ctx.drawImage(guide, 0, 0, W, H);
    drawStrokes();
  }

  const strokes = [];  // array of arrays of {x, y}

  function drawStrokes() {
    ctx.lineWidth = BRUSH * 1.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--brand').trim() || '#6d28d9';
    for (const stroke of strokes) {
      if (stroke.length < 2) {
        if (stroke.length === 1) {
          ctx.beginPath();
          ctx.arc(stroke[0].x, stroke[0].y, BRUSH * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fill();
        }
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i += 1) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  }

  /** Mark every grid cell within the brush of (x, y). */
  function markAt(x, y) {
    const r = Math.ceil(BRUSH / CELL);
    const cx = Math.floor(x / CELL);
    const cy = Math.floor(y / CELL);
    for (let dy = -r; dy <= r; dy += 1) {
      const ny = cy + dy;
      if (ny < 0 || ny >= rows) continue;
      for (let dx = -r; dx <= r; dx += 1) {
        const nx = cx + dx;
        if (nx < 0 || nx >= cols) continue;
        if (dx * dx + dy * dy > r * r) continue;
        marked[ny * cols + nx] = 1;
      }
    }
  }

  function score() {
    let hit = 0;
    let total = 0;
    let stray = 0;
    for (let i = 0; i < marked.length; i += 1) {
      if (!marked[i]) continue;
      total += 1;
      if (ink[i]) hit += 1;
      else if (!near[i]) stray += 1;   // cells in the tolerance band are free
    }
    const coverage = inkTotal ? hit / inkTotal : 0;
    const precision = total ? 1 - stray / total : 0;
    return { coverage, precision };
  }

  // ---------------------------------------------------------------- input

  let drawing = false;
  let last = null;

  function pointFromEvent(ev) {
    const box = canvas.getBoundingClientRect();
    return { x: ev.clientX - box.left, y: ev.clientY - box.top };
  }

  stage.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    stage.setPointerCapture(ev.pointerId);
    drawing = true;
    const pt = pointFromEvent(ev);
    strokes.push([pt]);
    markAt(pt.x, pt.y);
    last = pt;
    redraw();
    updateMeter();
  });

  stage.addEventListener('pointermove', (ev) => {
    if (!drawing) return;
    const pt = pointFromEvent(ev);
    strokes[strokes.length - 1].push(pt);

    // Sample along the segment so fast drags don't leave gaps in the mask.
    const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
    const steps2 = Math.max(1, Math.ceil(dist / (CELL / 2)));
    for (let i = 1; i <= steps2; i += 1) {
      markAt(last.x + ((pt.x - last.x) * i) / steps2, last.y + ((pt.y - last.y) * i) / steps2);
    }
    last = pt;
    redraw();
    updateMeter();
  });

  const stop = () => { drawing = false; };
  stage.addEventListener('pointerup', stop);
  stage.addEventListener('pointercancel', stop);
  stage.addEventListener('pointerleave', stop);

  function updateMeter() {
    const { coverage } = score();
    meterFill.style.width = `${Math.min(100, coverage * 100)}%`;
  }

  // ------------------------------------------------------------- sequence

  function loadStep() {
    const letter = steps[index];
    title.textContent = `Trace the letter ${letter}`;
    instruction.textContent =
      `Draw over the dotted ${letter === letter.toLowerCase() ? 'small' : 'capital'} letter, then say its sound. Letter ${index + 1} of ${steps.length}.`;
    strokes.length = 0;
    if (!layout()) {
      // The stage has no size yet (still laying out) — try again next frame.
      requestAnimationFrame(loadStep);
      return;
    }
    buildMasks(letter);
    meterFill.style.width = '0%';
    redraw();
    saySound(letter);
  }

  function reset() {
    strokes.length = 0;
    marked.fill(0);
    meterFill.style.width = '0%';
    redraw();
  }

  function grade() {
    if (!marked) return;
    const { coverage, precision } = score();

    if (coverage < PASS_COVERAGE || precision < PASS_PRECISION) {
      sfx.wrong();
      shake(stage);
      instruction.textContent =
        coverage < PASS_COVERAGE
          ? 'Almost — try to cover the whole letter.'
          : 'Keep your line on the dotted letter.';
      return;
    }

    // Both measures matter, but covering the letter matters more.
    scores.push(Math.min(1, coverage * 0.65 + precision * 0.35));
    sfx.correct();
    saySound(steps[index]);
    index += 1;

    if (index < steps.length) {
      setTimeout(loadStep, 500);
    } else if (page.findLetter) {
      setTimeout(showFindLetter, 500);
    } else {
      setTimeout(() => finish(average(scores)), 500);
    }
  }

  const onResize = () => {
    // Re-rasterising on resize would throw away the child's work, so only
    // rebuild when the stage is genuinely a different size.
    const box = stage.getBoundingClientRect();
    if (Math.abs(box.width - W) > 4) loadStep();
  };
  window.addEventListener('resize', onResize);
  host.addEventListener('activity:teardown', () => window.removeEventListener('resize', onResize));

  // ------------------------------------------------ the find-the-letter row

  function showFindLetter() {
    const { letter, row } = page.findLetter;
    const wanted = row.filter((ch) => ch.toLowerCase() === letter.toLowerCase()).length;
    let found = 0;
    let wrong = 0;

    host.innerHTML = '';
    const letters = el('div.letters');
    row.forEach((ch) => {
      const btn = el('button.letter', {
        type: 'button',
        text: ch,
        'aria-label': `letter ${ch}`,
        onclick: () => {
          if (btn.classList.contains('right') || btn.classList.contains('wrong')) return;
          if (ch.toLowerCase() === letter.toLowerCase()) {
            btn.classList.add('right');
            found += 1;
            sfx.correct();
            if (found === wanted) {
              confetti({ count: 50 });
              // The row is a bonus; blend it into the tracing score.
              const bonus = Math.max(0, 1 - wrong / row.length);
              setTimeout(() => finish(average([...scores, bonus])), 700);
            }
          } else {
            btn.classList.add('wrong');
            wrong += 1;
            sfx.wrong();
          }
        },
      });
      letters.append(btn);
    });

    host.append(
      el('div.stack', {}, [
        el('div.prompt', {}, [
          el('span.big-emoji', { text: '🔍' }),
          el('div', {}, [
            el('h2', { text: `Find every letter "${letter}"` }),
            el('p.instruction', {
              text: `There ${wanted === 1 ? 'is 1' : `are ${wanted}`} to find — capitals count too.`,
            }),
          ]),
        ]),
        letters,
      ]),
    );
  }

  function average(list) {
    return list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0;
  }

  requestAnimationFrame(loadStep);
}
