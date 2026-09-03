/**
 * Sound.
 *
 * Two separate jobs. Speech reads words and letter sounds aloud — this is a
 * phonics book, so hearing the word *is* the exercise for half these pages.
 * The chimes are synthesised with WebAudio so the app ships no audio files.
 */

import { GRAPHEME_WORDS, PHONEME_FOR_GRAPHEME } from './graphemes.js';
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
 * Letter sounds, not letter names.
 *
 * This used to hand the browser's speech synthesiser respellings like "fff"
 * and "mmm". That was a mistake: a synthesiser given an unpronounceable
 * cluster falls back on spelling it out, so the app said "eff eff eff" —
 * letter *names*, the very thing the curriculum manual works to prevent
 * (CDM p12, p20). No respelling avoids this; the engine is built to read
 * words, and a phoneme is not a word.
 *
 * So the sounds are no longer synthesised at run time. Each one is a short
 * pre-rendered clip in audio/phonemes/, generated from explicit phoneme codes
 * by tools/build-phonemes.py. Words are still spoken by the browser, which
 * does them well and naturally.
 *
 * The clips are plain 22 kHz mono WAVs named after the sound they carry, so
 * anyone who would rather have a real teacher's voice than a synthesised one
 * can record over them without touching this code.
 */


export { GRAPHEME_WORDS };

const CLIPS = new URL('../audio/phonemes/', import.meta.url);
const decoded = new Map();   // phoneme id -> AudioBuffer
const loading = new Map();   // phoneme id -> Promise
const missing = new Set();   // ids whose clip could not be loaded

function loadPhoneme(id) {
  if (decoded.has(id)) return Promise.resolve(decoded.get(id));
  if (loading.has(id)) return loading.get(id);

  const ac = audioCtx();
  if (!ac) return Promise.resolve(null);

  const job = fetch(new URL(`${id}.wav`, CLIPS))
    .then((res) => {
      if (!res.ok) throw new Error(`${res.status}`);
      return res.arrayBuffer();
    })
    .then((bytes) => ac.decodeAudioData(bytes))
    .then((buffer) => {
      decoded.set(id, buffer);
      return buffer;
    })
    .catch(() => {
      // A missing clip must not silence the app; the caller says the key word.
      missing.add(id);
      return null;
    })
    .finally(() => loading.delete(id));

  loading.set(id, job);
  return job;
}

/** Warm the cache for the graphemes a page is about to use. */
export function preloadSounds(letters) {
  if (!enabled()) return;
  for (const letter of letters) {
    const id = PHONEME_FOR_GRAPHEME[String(letter).toLowerCase()];
    if (id && !decoded.has(id) && !missing.has(id)) loadPhoneme(id);
  }
}

let playing = null;

/** Play a letter's sound: the real phoneme, never a letter name. */
export function saySound(letter) {
  if (!enabled()) return;
  const key = String(letter).toLowerCase();
  const id = PHONEME_FOR_GRAPHEME[key];

  if (!id || missing.has(id)) {
    sayKeyWord(key);
    return;
  }

  loadPhoneme(id).then((buffer) => {
    const ac = audioCtx();
    if (!buffer || !ac || !enabled()) {
      sayKeyWord(key);
      return;
    }
    // Stop any sound still ringing, so quick taps don't pile up.
    try { playing?.stop(); } catch { /* already ended */ }
    const source = ac.createBufferSource();
    const gain = ac.createGain();
    gain.gain.value = 0.9;
    source.buffer = buffer;
    source.connect(gain).connect(ac.destination);
    source.start();
    playing = source;
  });
}

/** Last resort when a clip can't be played: the wall chart's word for it. */
function sayKeyWord(key) {
  const word = GRAPHEME_WORDS[key];
  if (word) say(word);
}

/**
 * "fish … /f/" — the word first, then the sound inside it.
 *
 * The order is the manual's: "The correct process is to say the picture word
 * firstly followed by the sound so the students hear the sound as part of the
 * word, not as a sound in isolation." (CDM p12)
 */
export function sayWordThenSound(word, letter) {
  if (!enabled()) return;
  say(word);
  setTimeout(() => saySound(letter), 900);
}
