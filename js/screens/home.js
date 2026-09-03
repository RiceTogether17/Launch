/** Home: who you are, how far you've come, and one big button to continue. */

import { el } from '../dom.js';
import { PAGES, TOTAL_PAGES, pageTitle } from '../data/pages.js';
import {
  completedCount, getState, levelFromXp, maxStars, nextPage, setName, totalStars,
} from '../state.js';

export function render(host, go) {
  const s = getState();
  const done = completedCount();
  const { level, into, need } = levelFromXp(s.xp);
  const next = nextPage();
  const nextPg = PAGES.find((p) => p.page === next);
  const finished = done === TOTAL_PAGES;

  const nameInput = el('input', {
    type: 'text',
    value: s.name,
    placeholder: 'Your name',
    maxLength: 20,
    'aria-label': 'Your name',
    style: {
      font: 'inherit', fontWeight: '700', padding: '10px 14px', borderRadius: '14px',
      border: '2px solid var(--line)', background: 'var(--bg-2)', color: 'var(--ink)',
      width: '100%', maxWidth: '260px',
    },
    oninput: (ev) => setName(ev.target.value),
  });

  host.append(
    el('div.stack', {}, [
      el('section.hero', {}, [
        el('span.rocket', { text: '🚀' }),
        el('h1', { text: 'LaunchPad Quest' }),
        el('p', { text: s.name ? `Welcome back, ${s.name}!` : 'WorkBook 1 — sounds, letters and writing' }),
      ]),

      el('section.card.stack', {}, [
        el('div.progress-ring', {}, [
          el('div.progress-bar', {}, [el('i', { style: { width: `${(done / TOTAL_PAGES) * 100}%` } })]),
          el('b', { text: `${done}/${TOTAL_PAGES}` }),
        ]),
        el('div.stat-grid', {}, [
          el('div.stat', {}, [el('b', { text: `Lv ${level}` }), el('span', { text: `${into}/${need} XP` })]),
          el('div.stat', {}, [el('b', { text: `⭐ ${totalStars()}` }), el('span', { text: `of ${maxStars()}` })]),
          el('div.stat', {}, [el('b', { text: `🔥 ${s.streak.count}` }), el('span', { text: 'day streak' })]),
          el('div.stat', {}, [el('b', { text: `🏅 ${s.badges.length}` }), el('span', { text: 'trophies' })]),
        ]),
      ]),

      finished
        ? el('section.card.finish', {}, [
            el('div.big-stars', {}, [el('i', { text: '🏆' })]),
            el('h2', { text: 'WorkBook 1 complete!' }),
            el('p.muted', { text: `You earned ${totalStars()} of ${maxStars()} stars. Replay any page to raise your score.` }),
            el('button.btn.big', { type: 'button', text: 'Open the map', onclick: () => go('#/map') }),
          ])
        : el('button.btn.big', {
            type: 'button',
            onclick: () => go(`#/page/${next}`),
          }, [`${done ? 'Continue' : 'Start'} — page ${next}: ${pageTitle(nextPg)}`]),

      el('div.row', {}, [
        el('button.btn.ghost', { type: 'button', text: '🗺️ Map', onclick: () => go('#/map'), style: { flex: '1' } }),
        el('button.btn.ghost', { type: 'button', text: '🏅 Trophies', onclick: () => go('#/trophies'), style: { flex: '1' } }),
      ]),

      el('section.card', {}, [
        el('h2', { text: 'Who is playing?' }),
        nameInput,
        el('p.muted', { style: { marginTop: '12px', fontSize: '13px' } }, [
          `Progress is saved on this device. Last page finished: ${
            lastDate(s) || 'not yet'
          }.`,
        ]),
      ]),
    ]),
  );
}

function lastDate(s) {
  const dates = Object.values(s.results).map((r) => r.date).filter(Boolean).sort();
  return dates.at(-1) || '';
}
