/**
 * Judging a spoken letter sound.
 *
 * Speech recognisers are built to hear words, not bare phonemes, so a child
 * saying /m/ can come back as "m", "em", "hmm" or "mm" on different tries.
 * This module turns a recogniser's guesses into one of three verdicts, and is
 * kept free of any browser API so it can be tested directly.
 *
 * Two decisions worth stating, because they are the manual's, not ours:
 *
 *  - Saying the Grapheme Wall Chart's key word counts as correct. That is the
 *    chart's own method: "say the picture word firstly followed by the sound
 *    so the students hear the sound as part of the word" (CDM p12).
 *
 *  - Saying the letter's *name* is not correct, and gets its own verdict so
 *    the app can respond the way the manual tells teachers to (CDM p29): offer
 *    a word beginning with that sound and let the child hear it. This is only
 *    possible where the name and the sound are actually distinguishable —
 *    nothing can separate the name "ess" from the sound /s/ — so for the rest
 *    we accept rather than risk marking a correct child wrong.
 */

/**
 * Fold a transcript down to something comparable: lower case, letters only,
 * and runs of a repeated letter squeezed to one, so "mmmm" and "m" match.
 */
export function normalise(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .replace(/(.)\1+/g, '$1')
    .trim();
}

/** letter -> { sounds, name, word } — `name` omitted where it can't be told apart. */
const FORMS = {
  a: { sounds: ['a', 'ah', 'aa'],                 name: ['ay', 'eh'],          word: 'apple' },
  b: { sounds: ['b', 'buh', 'bah', 'ba', 'bu'],   name: ['bee'],               word: 'bat' },
  c: { sounds: ['c', 'k', 'kuh', 'cuh', 'ka'],    name: ['see', 'sea', 'cee'], word: 'cat' },
  d: { sounds: ['d', 'duh', 'dah', 'da', 'du'],   name: ['dee'],               word: 'dog' },
  e: { sounds: ['e', 'eh', 'air'],                name: ['ee'],                word: 'eggs' },
  f: { sounds: ['f', 'ff', 'fuh', 'ef', 'eff'],   name: null,                  word: 'fish' },
  g: { sounds: ['g', 'guh', 'gah', 'ga', 'gu'],   name: ['gee', 'jee'],        word: 'goat' },
  h: { sounds: ['h', 'huh', 'ha', 'hu'],          name: ['aitch', 'haitch'],   word: 'horse' },
  i: { sounds: ['i', 'ih', 'ee'],                 name: null,                  word: 'insect' },
  j: { sounds: ['j', 'juh', 'ja', 'ju'],          name: ['jay'],               word: 'jet' },
  k: { sounds: ['k', 'kuh', 'ka', 'ku', 'c'],     name: ['kay'],               word: 'kite' },
  l: { sounds: ['l', 'luh', 'el', 'ell', 'la'],   name: null,                  word: 'lizard' },
  m: { sounds: ['m', 'em', 'hm', 'um', 'muh'],    name: null,                  word: 'mouth' },
  n: { sounds: ['n', 'en', 'in', 'nuh', 'na'],    name: null,                  word: 'noodles' },
  o: { sounds: ['o', 'oh', 'aw', 'ah'],           name: null,                  word: 'octopus' },
  p: { sounds: ['p', 'puh', 'pa', 'pu'],          name: ['pee', 'pe'],         word: 'pig' },
  q: { sounds: ['q', 'kw', 'kwuh', 'qu', 'kwa'],  name: ['cue', 'queue', 'kyu'], word: 'queen' },
  r: { sounds: ['r', 'ruh', 'er', 'ar', 'are', 'ur'], name: null,              word: 'rat' },
  s: { sounds: ['s', 'es', 'ess', 'suh'],         name: null,                  word: 'starfish' },
  t: { sounds: ['t', 'tuh', 'ta', 'tu'],          name: ['tee', 'te'],         word: 'tiger' },
  u: { sounds: ['u', 'uh', 'ah'],                 name: ['you', 'yu', 'ew'],   word: 'umbrella' },
  v: { sounds: ['v', 'vuh', 'vu'],                name: ['vee', 've'],         word: 'van' },
  w: { sounds: ['w', 'wuh', 'wa', 'wu'],          name: ['double u', 'doubleyou', 'dubya'], word: 'worm' },
  x: { sounds: ['x', 'ks', 'ex', 'eks'],          name: null,                  word: 'axe' },
  y: { sounds: ['y', 'yuh', 'ya', 'yu'],          name: ['why', 'wye'],        word: 'yacht' },
  z: { sounds: ['z', 'zuh', 'zed', 'ze'],         name: null,                  word: 'zebra' },
};

export function keyWordFor(letter) {
  return FORMS[String(letter).toLowerCase()]?.word ?? null;
}

const norm = (list) => new Set(list.map(normalise));

/**
 * @param {string} letter      the grapheme being practised
 * @param {string[]} guesses   the recogniser's alternatives, best first
 * @returns {'correct'|'letter-name'|'unclear'}
 */
export function judge(letter, guesses) {
  const forms = FORMS[String(letter).toLowerCase()];
  if (!forms) return 'unclear';

  const ok = norm([...forms.sounds, forms.word]);
  const names = forms.name ? norm(forms.name) : new Set();

  // Every alternative is considered, and each is also split into words, so
  // "it's a bat" still lands on "bat". A correct reading anywhere wins: for a
  // five-year-old, missing a right answer costs far more than a generous one.
  let sawName = false;
  for (const guess of guesses) {
    const whole = normalise(guess);
    if (!whole) continue;
    const parts = [whole, ...whole.split(' ').filter(Boolean)];
    for (const part of parts) {
      if (ok.has(part)) return 'correct';
      if (names.has(part)) sawName = true;
    }
  }

  return sawName ? 'letter-name' : 'unclear';
}
