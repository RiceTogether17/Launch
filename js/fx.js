/** Visual rewards: confetti bursts, floating XP, toasts. */

const COLOURS = ['#ff5f6d', '#ffc371', '#4ade80', '#38bdf8', '#a78bfa', '#fb7185'];

/**
 * Confetti, drawn on a throwaway full-screen canvas that removes itself once
 * every piece has fallen off the bottom.
 */
export function confetti({ count = 90, origin = { x: 0.5, y: 0.35 } } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const pieces = Array.from({ length: count }, () => ({
    x: origin.x * innerWidth + (Math.random() - 0.5) * 120,
    y: origin.y * innerHeight,
    vx: (Math.random() - 0.5) * 9,
    vy: Math.random() * -11 - 4,
    w: 6 + Math.random() * 7,
    h: 8 + Math.random() * 9,
    spin: (Math.random() - 0.5) * 0.3,
    angle: Math.random() * Math.PI,
    colour: COLOURS[(Math.random() * COLOURS.length) | 0],
  }));

  let frame = 0;
  (function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = false;

    for (const pc of pieces) {
      pc.vy += 0.32;          // gravity
      pc.vx *= 0.995;         // a little drag so pieces fan out then settle
      pc.x += pc.vx;
      pc.y += pc.vy;
      pc.angle += pc.spin;
      if (pc.y < innerHeight + 40) alive = true;

      ctx.save();
      ctx.translate(pc.x, pc.y);
      ctx.rotate(pc.angle);
      ctx.fillStyle = pc.colour;
      ctx.fillRect(-pc.w / 2, -pc.h / 2, pc.w, pc.h);
      ctx.restore();
    }

    frame += 1;
    if (alive && frame < 400) requestAnimationFrame(tick);
    else canvas.remove();
  })();
}

/** A small "+12 XP" that drifts up from a point on screen. */
export function floatText(text, x, y, className = '') {
  const el = document.createElement('div');
  el.className = `fx-float ${className}`;
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/** Float text from the centre of an element. */
export function floatFrom(el, text, className) {
  const r = el.getBoundingClientRect();
  floatText(text, r.left + r.width / 2, r.top, className);
}

let toastTimer = null;
export function toast(message, { icon = '', duration = 2600 } = {}) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.innerHTML = `${icon ? `<span class="toast-icon">${icon}</span>` : ''}<span>${message}</span>`;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/** Shake an element to signal "not quite". */
export function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth; // restart the animation
  el.classList.add('shake');
}
