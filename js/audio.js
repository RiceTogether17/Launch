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
 * /f/, not "eff". Speech engines say a bare letter by name, so we spell the
 * sound phonetically and lean on the vowel-free ones sounding close enough.
 */
const PHONEMES = {
  a: 'ah', b: 'buh', c: 'kuh', d: 'duh', e: 'eh', f: 'fff', g: 'guh',
  h: 'huh', i: 'ih', j: 'juh', k: 'kuh', l: 'lll', m: 'mmm', n: 'nnn',
  o: 'oh', p: 'puh', q: 'kwuh', r: 'rrr', s: 'sss', t: 'tuh', u: 'uh',
  v: 'vvv', w: 'wuh', x: 'ks', y: 'yuh', z: 'zzz', ch: 'ch',
};

export function saySound(letter) {
  const key = String(letter).toLowerCase();
  say(PHONEMES[key] || key, { rate: 0.7 });
}

/** "f … fish" — the sound, then the word that carries it. */
export function saySoundAndWord(letter, word) {
  if (!enabled() || !('speechSynthesis' in window)) return;
  saySound(letter);
  setTimeout(() => say(word), 700);
}
