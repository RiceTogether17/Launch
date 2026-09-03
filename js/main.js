/**
 * Router and HUD.
 *
 * Routes are hash-based so the app runs on any static host — GitHub Pages
 * included — with no server-side rewrites and no build step:
 *
 *   #/            home
 *   #/map         the journey map
 *   #/page/:n     one workbook page
 *   #/trophies    the trophy cabinet
 */

import { clear } from './dom.js';
import { PAGES, pageTitle } from './data/pages.js';
import { getState, levelFromXp, setSound, subscribe, totalStars } from './state.js';

import * as home from './screens/home.js';
import * as map from './screens/map.js';
import * as activity from './screens/activity.js';
import * as trophies from './screens/trophies.js';

const app = document.getElementById('app');
const hud = document.getElementById('hud');
const hudTitle = document.getElementById('hud-title');
const hudBack = document.getElementById('hud-back');
const hudSound = document.getElementById('hud-sound');

/** Navigate. `replay` forces a re-render even when the hash hasn't changed. */
function go(hash, replay = false) {
  if (location.hash === hash && replay) route();
  else location.hash = hash;
}

function route() {
  const hash = location.hash || '#/';
  clear(app);
  window.scrollTo({ top: 0 });

  const pageMatch = hash.match(/^#\/page\/(\d+)$/);

  if (pageMatch) {
    const number = Number(pageMatch[1]);
    const page = PAGES.find((p) => p.page === number);
    setHud(true, page ? `Page ${page.page} · ${pageTitle(page)}` : 'Page');
    activity.render(app, go, number);
  } else if (hash === '#/map') {
    setHud(true, 'Map');
    map.render(app, go);
  } else if (hash === '#/trophies') {
    setHud(true, 'Trophies');
    trophies.render(app, go);
  } else {
    setHud(false, '');
    home.render(app, go);
  }

  refreshHud();
}

function setHud(show, title) {
  hud.hidden = !show;
  hudTitle.textContent = title;
}

function refreshHud() {
  const s = getState();
  document.querySelector('#hud-streak b').textContent = s.streak.count;
  document.querySelector('#hud-stars b').textContent = totalStars();
  document.querySelector('#hud-level b').textContent = levelFromXp(s.xp).level;
  hudSound.textContent = s.sound ? '🔊' : '🔇';
  hudSound.setAttribute('aria-pressed', String(s.sound));
  hudSound.setAttribute('aria-label', s.sound ? 'Turn sound off' : 'Turn sound on');
}

hudBack.addEventListener('click', () => {
  // Inside a page, "back" means the map; from the map, home.
  go(location.hash.startsWith('#/page/') ? '#/map' : '#/');
});

hudSound.addEventListener('click', () => {
  const on = !getState().sound;
  setSound(on);
  if (!on && 'speechSynthesis' in window) speechSynthesis.cancel();
});

subscribe(refreshHud);
window.addEventListener('hashchange', route);
route();
