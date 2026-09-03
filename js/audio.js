/**
 * Sound.
 *
 * Two separate jobs. Speech reads words and letter sounds aloud — this is a
 * phonics book, so hearing the word *is* the exercise for half these pages.
 * The chimes are synthesised with WebAudio so the app ships no audio files.
 */

import { getState } from './state.js';

let ctx = null;
function audioCtx() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Play a short shaped tone. */
function tone(freq, start, duration, { type = 'sine', gain = 0.18 } = {}) {
  const ac = audioCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  // A quick attack and an exponential tail — square edges click audibly.
  amp.gain.setValueAtTime(0.0001, ac.currentTime + start);
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.02);
}

function enabled() {
  return getState().sound;
}

export const sfx = {
  tap() {
    if (enabled()) tone(660, 0, 0.08, { gain: 0.08 });
  },
  correct() {
    if (!enabled()) return;
    tone(784, 0, 0.14);      // G5
    tone(1046, 0.09, 0.2);   // C6
  },
  wrong() {
    if (!enabled()) return;
    tone(220, 0, 0.16, { type: 'triangle', gain: 0.12 });
    tone(165, 0.1, 0.22, { type: 'triangle', gain: 0.12 });
  },
  win() {
    if (!enabled()) return;
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.35));
  },
  badge() {
    if (!enabled()) return;
    [880, 1174, 1568].forEach((f, i) => tone(f, i * 0.08, 0.4, { type: 'triangle' }));
  },
};

// ------------------------------------------------------------------ speech

let voice = null;
function pickVoice() {
  if (voice || !('speechSynthesis' in window)) return voice;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer an English voice; the workbook is British English, so lean that way.
  voice =
    voices.find((v) => /en-GB/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0];
  return voice;
}

if ('speechSynthesis' in window) {
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    voice = null;
    pickVoice();
  });
}

/** Speak a word or phrase at a slow, child-friendly pace. */
export function say(text, { rate = 0.85, pitch = 1.1 } = {}) {
  if (!enabled() || !('speechSynthesis' in window) || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) u.voice = v;
  u.rate = rate;
  u.pitch = pitch;
  u.lang = v?.lang || 'en-GB';
  speechSynthesis.speak(u);
}

/**
 * Letter sounds, not letter names: a child sorting by "first sound" needs
 * /f/, not "eff".
 *
 * The curriculum manual is emphatic about *how* those sounds are voiced
 * (CDM p20, "Commonly Mispronounced Sounds"): a "heavy u" after a consonant —
 * /cuh/, /buh/, /muh/, /luh/ — is wrong, and teachers are told to correct it
 * proactively, because the child is then saying two sounds where there is one.
 *
 * That rules out synthesising most consonants in isolation, since a speech
 * engine given "buh" says exactly the thing the programme works to undo, and
 * given "b" says the letter *name*. So sounds are voiced two different ways:
 *
 *   - Continuants and short vowels can genuinely be held on their own, so
 *     they are spoken in isolation.
 *   - Stops cannot. For those the app falls back on the Grapheme Wall Chart's
 *     own method (CDM p12): say the key word and let the child hear the sound
 *     at the front of it.
 */

/** Sounds that can be held in isolation without a vowel creeping in. */
const CONTINUANTS = {
  f: 'fff', l: 'lll', m: 'mmm', n: 'nnn', r: 'rrr',
  s: 'sss', v: 'vvv', z: 'zzz', h: 'hhh',
  sh: 'shhh', th: 'thhh', ng: 'ng',
};

/**
 * Short vowel sounds only. Phonemic awareness activities range across long
 * vowels and diphthongs, but phonics access uses short vowels alone
 * (CDM p33, "Should I be focusing on just short vowel sounds?").
 */
const SHORT_VOWELS = { a: 'ah', e: 'eh', i: 'ih', o: 'oh', u: 'uh' };

/**
 * The LCentral Grapheme Wall Chart's key word for each grapheme. These are
 * the pictures the child meets on the chart at the start of every lesson, so
 * they are the words the app uses to anchor a sound it cannot say alone.
 */
export const GRAPHEME_WORDS = {
  a: 'apple', b: 'bat', c: 'cat', d: 'dog', e: 'eggs', f: 'fish',
  g: 'goat', h: 'horse', i: 'insect', j: 'jet', k: 'kite', l: 'lizard',
  m: 'mouth', n: 'noodles', o: 'octopus', p: 'pig', q: 'queen', r: 'rat',
  s: 'starfish', t: 'tiger', u: 'umbrella', v: 'van', w: 'worm', x: 'axe',
  y: 'yacht', z: 'zebra',
  ch: 'chick', sh: 'shell', th: 'thumb', ng: 'king',
};

/**
 * Voice a letter's sound as faithfully as a speech engine allows: held on its
 * own where that is honest, and otherwise as the wall-chart key word.
 */
export function saySound(letter) {
  const key = String(letter).toLowerCase();
  const isolated = CONTINUANTS[key] || SHORT_VOWELS[key];
  if (isolated) {
    say(isolated, { rate: 0.7 });
  } else if (GRAPHEME_WORDS[key]) {
    say(GRAPHEME_WORDS[key]);
  } else {
    say(key);
  }
}

/** True when the sound can be spoken alone, so callers can word it correctly. */
export function hasIsolatedSound(letter) {
  const key = String(letter).toLowerCase();
  return Boolean(CONTINUANTS[key] || SHORT_VOWELS[key]);
}

/**
 * "fish … /f/" — the word first, then the sound inside it.
 *
 * The order matters and is not ours: "The correct process is to say the
 * picture word firstly followed by the sound so the students hear the sound
 * as part of the word, not as a sound in isolation." (CDM p12)
 */
export function sayWordThenSound(word, letter) {
  if (!enabled() || !('speechSynthesis' in window)) return;
  say(word);
  if (hasIsolatedSound(letter)) setTimeout(() => saySound(letter), 900);
}
