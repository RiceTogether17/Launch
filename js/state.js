/**
 * Progress, rewards and persistence.
 *
 * Everything a child earns lives in one localStorage blob so the app works
 * offline and needs no account. The workbook's "Date completed / Teacher's
 * initials" box becomes a real completion record here.
 */

import { PAGES, TOTAL_PAGES } from './data/pages.js';

const KEY = 'launchpad.wb1.v1';

const BLANK = {
  name: '',
  xp: 0,
  /** pageNumber -> { stars, best, done, date, attempts } */
  results: {},
  badges: [],
  streak: { count: 0, lastDay: '' },
  /** Most recent Automatic Access times in seconds, by case. */
  bestTimes: {},
  /** Set once Automatic Access has been completed with no wrong taps. */
  cleanAccess: false,
  sound: true,
};

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(BLANK);
    return { ...structuredClone(BLANK), ...JSON.parse(raw) };
  } catch {
    return structuredClone(BLANK);
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* private mode, quota — the session still works, it just won't persist */
  }
}

const listeners = new Set();
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit() {
  listeners.forEach((fn) => fn(data));
}

export function getState() {
  return data;
}

export function setName(name) {
  data.name = name.slice(0, 20);
  save();
  emit();
}

export function setSound(on) {
  data.sound = !!on;
  save();
  emit();
}

// ---------------------------------------------------------------- levels

/**
 * Levels get progressively longer: level n starts at 50 * n * (n-1) / 2 XP.
 * That keeps early levels quick (a page or two) without letting level numbers
 * run away later on.
 */
export function levelFromXp(xp) {
  let level = 1;
  let need = 50;
  let spent = 0;
  while (xp - spent >= need) {
    spent += need;
    level += 1;
    need += 50;
  }
  return { level, into: xp - spent, need };
}

// ------------------------------------------------------------- page state

export function resultFor(page) {
  return data.results[page] || null;
}

/** A page is unlocked once the page before it has been completed. */
export function isUnlocked(page) {
  const idx = PAGES.findIndex((p) => p.page === page);
  if (idx <= 0) return true;
  const prev = PAGES[idx - 1].page;
  return !!data.results[prev]?.done;
}

export function nextPage() {
  const done = PAGES.find((p) => !data.results[p.page]?.done);
  return done ? done.page : PAGES[PAGES.length - 1].page;
}

export function completedCount() {
  return PAGES.filter((p) => data.results[p.page]?.done).length;
}

export function totalStars() {
  return PAGES.reduce((sum, p) => sum + (data.results[p.page]?.stars || 0), 0);
}

export function maxStars() {
  return TOTAL_PAGES * 3;
}

/**
 * Record a finished page.
 *
 * @param {number} page      workbook page number
 * @param {number} accuracy  0..1, share of questions right first try
 * @param {number} baseXp    XP for finishing at all
 * @returns {{stars:number, xp:number, newBadges:string[], levelUp:boolean}}
 */
export function completePage(page, accuracy, baseXp = 20) {
  const stars = accuracy >= 0.95 ? 3 : accuracy >= 0.75 ? 2 : 1;
  const prev = data.results[page];
  const before = levelFromXp(data.xp).level;

  // Replaying a page can raise your star count but only pays XP once, so
  // grinding one easy page isn't a shortcut.
  const xp = prev?.done ? Math.round(baseXp * 0.25) : baseXp + (stars - 1) * 10;
  data.xp += xp;

  data.results[page] = {
    done: true,
    stars: Math.max(stars, prev?.stars || 0),
    best: Math.max(accuracy, prev?.best || 0),
    date: new Date().toISOString().slice(0, 10),
    attempts: (prev?.attempts || 0) + 1,
    // Level 4 means "demonstrates consistently", so clean runs are counted
    // rather than just remembering the single best one. See skillLevel().
    clean: (prev?.clean || 0) + (accuracy >= 0.95 ? 1 : 0),
  };

  touchStreak();
  const newBadges = awardBadges();
  save();
  emit();

  return {
    stars,
    xp,
    newBadges,
    levelUp: levelFromXp(data.xp).level > before,
  };
}

/**
 * Record an Automatic Access attempt.
 *
 * The workbook records the seconds taken every lesson, so the app does too —
 * but as a log of the latest attempt, not a high score to beat. `clean` says
 * whether every letter was right, which is what actually earns the trophy.
 */
export function recordTime(letterCase, seconds, clean = false) {
  data.bestTimes[`alphabet-${letterCase}`] = seconds;
  if (clean) data.cleanAccess = true;
  save();
  emit();
}

export function bestTime(letterCase) {
  return data.bestTimes[`alphabet-${letterCase}`] ?? null;
}

// ------------------------------------------------------------ skill levels

/**
 * The programme's own progress scale, from the LaunchPad Outcomes Record
 * (CDM p7). These are the levels a teacher circles on the record sheet, and
 * Level 4 across all outcomes is the criterion for promotion to LiftOff.
 */
export const SKILL_LEVELS = [
  { level: 1, name: 'Introduced',                hint: 'Has had a first go at this page.' },
  { level: 2, name: 'Emerging',                  hint: 'Getting there, with some help.' },
  { level: 3, name: 'Demonstrates occasionally', hint: 'Mostly right, and needing less help.' },
  { level: 4, name: 'Demonstrates consistently', hint: 'Right every time, without hesitation.' },
];

/**
 * Where a page sits on that scale, or 0 if it hasn't been attempted.
 *
 * The manual's wording drives the thresholds. Level 4 is "demonstrates skill
 * correctly each time without hesitation", so one lucky perfect run is not
 * enough — it takes two, which also matches the manual's note that progress
 * between levels is not expected every lesson.
 */
export function skillLevel(page) {
  const r = data.results[page];
  if (!r?.done) return 0;
  if ((r.clean || 0) >= 2) return 4;
  if (r.best >= 0.8) return 3;
  if (r.best >= 0.5) return 2;
  return 1;
}

export function skillLevelName(level) {
  return SKILL_LEVELS.find((s) => s.level === level)?.name ?? 'Not started';
}

/** How many pages sit at each level — [notStarted, l1, l2, l3, l4]. */
export function skillSpread() {
  const counts = [0, 0, 0, 0, 0];
  for (const pg of PAGES) counts[skillLevel(pg.page)] += 1;
  return counts;
}

/** True when every page is at Level 4 — the manual's promotion criterion. */
export function readyForLiftOff() {
  return PAGES.every((pg) => skillLevel(pg.page) === 4);
}

// ------------------------------------------------------------------ streak

function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (data.streak.lastDay === today) return;

  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  data.streak.count = data.streak.lastDay === yesterday ? data.streak.count + 1 : 1;
  data.streak.lastDay = today;
}

// ------------------------------------------------------------------ badges

export const BADGES = [
  { id: 'first-page',  icon: '🌱', name: 'First Step',     hint: 'Finish your first page.' },
  { id: 'five-pages',  icon: '🚀', name: 'Lift Off',       hint: 'Finish 5 pages.' },
  { id: 'half-way',    icon: '🏔️', name: 'Half Way',       hint: 'Finish half the workbook.' },
  { id: 'finisher',    icon: '🏆', name: 'Book Finisher',  hint: 'Finish every page.' },
  { id: 'perfect',     icon: '💯', name: 'Perfect Page',   hint: 'Get 3 stars on a page.' },
  { id: 'ten-perfect', icon: '✨', name: 'Star Collector', hint: 'Get 3 stars on 10 pages.' },
  { id: 'streak-3',    icon: '🔥', name: 'Three in a Row', hint: 'Play 3 days in a row.' },
  { id: 'streak-7',    icon: '☄️', name: 'Week Warrior',   hint: 'Play 7 days in a row.' },
  { id: 'no-hesitation', icon: '⚡', name: 'No Hesitation', hint: 'Finish Automatic Access with every letter right.' },
  { id: 'scribe',      icon: '🖋️', name: 'Neat Writer',    hint: 'Get 3 stars on a writing page.' },
];

function awardBadges() {
  const done = completedCount();
  const threeStar = PAGES.filter((p) => data.results[p.page]?.stars === 3);
  const earned = [];

  const give = (id, when) => {
    if (when && !data.badges.includes(id)) {
      data.badges.push(id);
      earned.push(id);
    }
  };

  give('first-page', done >= 1);
  give('five-pages', done >= 5);
  give('half-way', done >= Math.ceil(TOTAL_PAGES / 2));
  give('finisher', done >= TOTAL_PAGES);
  give('perfect', threeStar.length >= 1);
  give('ten-perfect', threeStar.length >= 10);
  give('streak-3', data.streak.count >= 3);
  give('streak-7', data.streak.count >= 7);
  // The manual's marker of automatic access is answering "without hesitation",
  // and it is explicit that correctness beats speed — so this is earned by a
  // clean run, not a fast one (CDM p29).
  give('no-hesitation', data.cleanAccess === true);
  give(
    'scribe',
    threeStar.some((p) => p.type === 'tracing'),
  );

  return earned;
}

export function badgeById(id) {
  return BADGES.find((b) => b.id === id);
}

export function resetAll() {
  data = structuredClone(BLANK);
  save();
  emit();
}
