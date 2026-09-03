/**
 * The activity host: picks the right engine for a page, runs it, then shows
 * the reward screen once the engine reports a score.
 */

import { el, starString } from '../dom.js';
import { PAGES, pageTitle } from '../data/pages.js';
import { completePage, badgeById, isUnlocked, nextPage } from '../state.js';
import { confetti, toast } from '../fx.js';
import { sfx } from '../audio.js';

import * as soundSort from '../activities/soundSort.js';
import * as tracing from '../activities/tracing.js';
import * as pickLetter from '../activities/pickLetter.js';
import * as matchLetter from '../activities/matchLetter.js';
import * as segment from '../activities/segment.js';
import * as hexagon from '../activities/hexagon.js';
import * as alphabetRace from '../activities/alphabetRace.js';

const ENGINES = {
  soundSort, tracing, pickLetter, matchLetter, segment, hexagon, alphabetRace,
};

/** XP is weighted by how much work a page actually is. */
const XP = {
  soundSort: 25, tracing: 30, pickLetter: 25, matchLetter: 25,
  segment: 25, hexagon: 30, alphabetRace: 35,
};

export function render(host, go, pageNumber) {
  const page = PAGES.find((p) => p.page === pageNumber);
  if (!page) {
    go('#/map');
    return;
  }
  if (!isUnlocked(page.page)) {
    toast('That page is still locked.', { icon: '🔒' });
    go('#/map');
    return;
  }

  const engine = ENGINES[page.type];
  if (!engine) {
    host.append(el('p', { text: `No activity for "${page.type}".` }));
    return;
  }

  const stage = el('div');
  host.append(stage);

  let settled = false;
  engine.mount(page, stage, (accuracy) => {
    // Engines shouldn't be able to double-report; the reward is once per run.
    if (settled) return;
    settled = true;
    showReward(host, stage, go, page, accuracy);
  });
}

function showReward(host, stage, go, page, accuracy) {
  const clamped = Math.max(0, Math.min(1, accuracy));
  const { stars, xp, newBadges, levelUp } = completePage(page.page, clamped, XP[page.type] ?? 20);

  stage.dispatchEvent(new CustomEvent('activity:teardown'));
  host.innerHTML = '';

  sfx.win();
  if (stars === 3) confetti({ count: 130 });
  else if (stars === 2) confetti({ count: 70 });

  const upcoming = nextPage();
  const nextPg = PAGES.find((p) => p.page === upcoming);
  const isLast = upcoming === page.page;

  const praise = stars === 3 ? 'Perfect!' : stars === 2 ? 'Well done!' : 'Good try!';

  host.append(
    el('div.stack', {}, [
      el('section.card.finish', {}, [
        el('div.big-stars', {},
          starString(stars).split('').map((ch) => el('i', { text: ch === '★' ? '⭐' : '☆' }))),
        el('h1', { text: praise }),
        el('p.muted', { text: `Page ${page.page} — ${pageTitle(page)}` }),
        el('div.stat-grid', { style: { marginTop: '14px' } }, [
          el('div.stat', {}, [el('b', { text: `+${xp}` }), el('span', { text: 'XP' })]),
          el('div.stat', {}, [el('b', { text: `${Math.round(clamped * 100)}%` }), el('span', { text: 'correct' })]),
          el('div.stat', {}, [el('b', { text: `${stars}` }), el('span', { text: 'stars' })]),
        ]),
      ]),

      isLast
        ? el('button.btn.big', { type: 'button', text: '🏆 See your trophies', onclick: () => go('#/trophies') })
        : el('button.btn.big', {
            type: 'button',
            text: `Next — page ${upcoming}: ${pageTitle(nextPg)}`,
            onclick: () => go(`#/page/${upcoming}`),
          }),

      el('div.row', {}, [
        el('button.btn.ghost', { type: 'button', text: '↺ Play again', onclick: () => go(`#/page/${page.page}`, true), style: { flex: '1' } }),
        el('button.btn.ghost', { type: 'button', text: '🗺️ Map', onclick: () => go('#/map'), style: { flex: '1' } }),
      ]),
    ]),
  );

  if (levelUp) toast('Level up!', { icon: '🎉' });
  // Stagger badge toasts so several unlocking at once don't overwrite each other.
  newBadges.forEach((id, i) => {
    const badge = badgeById(id);
    setTimeout(() => {
      sfx.badge();
      toast(`Trophy unlocked: ${badge.name}`, { icon: badge.icon });
    }, (levelUp ? 1200 : 300) + i * 2000);
  });
}
