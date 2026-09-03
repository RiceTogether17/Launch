/**
 * The graphemes the workbook teaches, and what each one sounds like.
 *
 * Kept apart from audio.js so it can be read without a browser — the content
 * checks import it to confirm every sound the app can ask for has a clip.
 */

/** Grapheme as it appears in the workbook -> the phoneme clip it sounds like. */
export const PHONEME_FOR_GRAPHEME = {
  a: 'a', b: 'b', c: 'k', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', i: 'i',
  j: 'j', k: 'k', l: 'l', m: 'm', n: 'n', o: 'o', p: 'p', q: 'kw', r: 'r',
  s: 's', t: 't', u: 'u', v: 'v', w: 'w', x: 'ks', y: 'y', z: 'z',
  ch: 'ch', sh: 'sh', th: 'th', ng: 'ng',
};

/**
 * The LCentral Grapheme Wall Chart's key word for each grapheme. The chart is
 * what the child meets at the start of every lesson, so these are the words
 * the app uses when it needs to anchor a sound in one (CDM p12), and what it
 * falls back on if a clip can't be played.
 */
export const GRAPHEME_WORDS = {
  a: 'apple', b: 'bat', c: 'cat', d: 'dog', e: 'eggs', f: 'fish',
  g: 'goat', h: 'horse', i: 'insect', j: 'jet', k: 'kite', l: 'lizard',
  m: 'mouth', n: 'noodles', o: 'octopus', p: 'pig', q: 'queen', r: 'rat',
  s: 'starfish', t: 'tiger', u: 'umbrella', v: 'van', w: 'worm', x: 'axe',
  y: 'yacht', z: 'zebra',
  ch: 'chick', sh: 'shell', th: 'thumb', ng: 'king',
};

export function phonemeFor(letter) {
  return PHONEME_FOR_GRAPHEME[String(letter).toLowerCase()] ?? null;
}
