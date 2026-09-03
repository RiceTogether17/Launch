/**
 * A small wrapper over the Web Speech API's recogniser.
 *
 * Note for anyone deploying this: in Chrome, speech recognition is not done on
 * the device. Audio is sent to Google's servers for transcription, which means
 * the microphone path needs a network connection and involves a child's voice
 * leaving the machine. That is why it is never switched on by itself — the
 * child taps to start each time, and every page keeps a full tapping fallback
 * so the app works with the microphone declined, blocked, or absent.
 */

function Recogniser() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function listeningSupported() {
  return Recogniser() !== null;
}

/**
 * Listen for one short utterance.
 *
 * @returns {{ stop: () => void, done: Promise<{guesses: string[], error?: string}> }}
 *          `guesses` holds the recogniser's alternatives, best first.
 */
export function listenOnce({ lang = 'en-GB', onStart, onInterim } = {}) {
  const Ctor = Recogniser();
  if (!Ctor) return { stop() {}, done: Promise.resolve({ guesses: [], error: 'unsupported' }) };

  const rec = new Ctor();
  rec.lang = lang;
  rec.continuous = false;
  rec.interimResults = true;
  // Several alternatives materially improves the hit rate on bare phonemes,
  // which sit right at the edge of what these engines are built to hear.
  rec.maxAlternatives = 6;

  let settled = false;
  let resolveDone;
  const done = new Promise((resolve) => { resolveDone = resolve; });
  const finish = (payload) => {
    if (settled) return;
    settled = true;
    try { rec.stop(); } catch { /* already stopped */ }
    resolveDone(payload);
  };

  rec.onstart = () => onStart?.();

  rec.onresult = (event) => {
    const guesses = [];
    let isFinal = false;
    for (const result of event.results) {
      if (result.isFinal) isFinal = true;
      for (let i = 0; i < result.length; i += 1) guesses.push(result[i].transcript);
    }
    if (isFinal) finish({ guesses });
    else onInterim?.(guesses[0] || '');
  };

  rec.onerror = (event) => finish({ guesses: [], error: event.error || 'error' });
  rec.onend = () => finish({ guesses: [], error: 'no-speech' });

  // A child may say nothing at all; don't leave the button spinning forever.
  const timer = setTimeout(() => finish({ guesses: [], error: 'timeout' }), 6000);
  done.then(() => clearTimeout(timer));

  try {
    rec.start();
  } catch (err) {
    finish({ guesses: [], error: 'start-failed' });
  }

  return { stop: () => finish({ guesses: [], error: 'stopped' }), done };
}
