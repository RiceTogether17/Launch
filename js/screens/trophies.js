/** The trophy cabinet — earned badges in colour, unearned ones greyed out. */

import { el } from '../dom.js';
import { BADGES, bestTime, getState } from '../state.js';

export function render(host) {
  const s = getState();
  const grid = el('div.badge-grid');

  for (const badge of BADGES) {
    const earned = s.badges.includes(badge.id);
    grid.append(
      el(`div.badge${earned ? '' : '.locked'}`, {}, [
        el('div.badge-icon', { text: earned ? badge.icon : '🔒' }),
        el('b', { text: badge.name }),
        el('span', { text: badge.hint }),
      ]),
    );
  }

  const lower = bestTime('lower');
  const upper = bestTime('upper');

  host.append(
    el('div.stack', {}, [
      el('div.prompt', {}, [
        el('span.big-emoji', { text: '🏅' }),
        el('div', {}, [
          el('h2', { text: `Trophies — ${s.badges.length} of ${BADGES.length}` }),
          el('p.instruction', { text: 'Keep going to unlock the rest.' }),
        ]),
      ]),
      grid,
      el('section.card', {}, [
        el('h2', { text: 'Alphabet best times' }),
        el('div.stat-grid', {}, [
          el('div.stat', {}, [
            el('b', { text: lower == null ? '—' : `${lower.toFixed(1)}s` }),
            el('span', { text: 'small letters' }),
          ]),
          el('div.stat', {}, [
            el('b', { text: upper == null ? '—' : `${upper.toFixed(1)}s` }),
            el('span', { text: 'CAPITAL letters' }),
          ]),
        ]),
      ]),
    ]),
  );
}
