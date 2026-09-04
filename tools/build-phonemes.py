#!/usr/bin/env python3
"""
Generate one short audio clip per phoneme, into audio/phonemes/.

    apt-get install espeak-ng && python3 tools/build-phonemes.py

Why this exists
---------------
The app used to hand spellings like "fff" and "mmm" to the browser's speech
synthesiser. A synthesiser given an unpronounceable cluster falls back on
spelling it out, so the app said "eff eff eff" — letter *names*, the exact
thing the curriculum manual works to prevent (CDM p12, p20). No amount of
respelling fixes that: the engine is built to read words.

So the sounds are synthesised ahead of time from explicit phoneme codes.
espeak-ng is a formant synthesiser that takes phonemes directly, which means
it is never given a letter to read and cannot produce a letter name.

The awkward part: voiced stops
------------------------------
/b/, /d/, /g/ and /j/ produce complete silence when asked for in isolation,
and correctly so — a stop is a release of air, and with no following vowel
there is nothing to release into. Real phonics recordings have the same
problem and solve it the same way this script does: say the consonant with a
vowel, then cut just after the burst. The few tens of milliseconds kept are
the formant transition, which is precisely what tells /b/ from /d/ from /g/ —
so it has to stay. What must not stay is a full "buh", and it doesn't.
"""

import os
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'audio', 'phonemes')

RATE = 22050
SPEED = 100          # espeak words-per-minute; slower gives a longer, clearer sound
VOWEL_TAIL_MS = 40   # how much of the following vowel a stop keeps
GLIDE_TAIL_MS = 110  # a glide needs longer: its movement *is* the sound
TARGET_RMS = 0.13    # loudness match across clips, in full-scale units
FADE_OUT_MS = 30
FADE_IN_MS = 6
PEAK = 0.82          # normalisation target, leaving a little headroom
MAX_MS = 420         # continuants are held, but not indefinitely
MIN_HELD_MS = 260    # a continuant shorter than this is stretched to it

VOWEL = 'a'          # the vowel stops are released into, before being cut

# id -> (espeak phoneme, kind, example word)
#
# kind decides how the clip is made, and the distinction is phonetic, not
# cosmetic:
#   vowel, continuant  hold still, so they can be said alone and stretched
#   stop               silent alone; synthesised with a vowel and cut
#   glide              also cannot be held, but for the opposite reason to a
#                      stop: a glide *is* a movement. Freezing /w/ leaves a
#                      steady "oo" and /y/ a steady "ee", so these keep a
#                      longer run into the vowel and are never looped.
#   cluster            two sounds in sequence (/ks/ is /k/ then /s/), so it
#                      travels by nature and must not be stretched either.
PHONEMES = {
    # --- consonants -------------------------------------------------------
    'b':  ('b',   'stop',       'bat'),
    'k':  ('k',   'stop',       'cat'),      # c and k share this sound
    'd':  ('d',   'stop',       'dog'),
    'f':  ('f',   'continuant', 'fish'),
    'g':  ('g',   'stop',       'goat'),
    'h':  ('h',   'stop',       'horse'),    # breathy; needs a vowel to shape it
    'j':  ('dZ',  'stop',       'jet'),
    'l':  ('l',   'continuant', 'lizard'),
    'm':  ('m',   'continuant', 'mouth'),
    'n':  ('n',   'continuant', 'noodles'),
    'p':  ('p',   'stop',       'pig'),
    'kw': ('kw',  'stop',       'queen'),
    'r':  ('r',   'continuant', 'rat'),
    's':  ('s',   'continuant', 'starfish'),
    't':  ('t',   'stop',       'tiger'),
    'v':  ('v',   'continuant', 'van'),
    'w':  ('w',   'glide',      'worm'),
    'ks': ('ks',  'cluster',    'axe'),
    'y':  ('j',   'glide',      'yacht'),    # espeak's j is the /y/ glide
    'z':  ('z',   'continuant', 'zebra'),
    # --- digraphs ---------------------------------------------------------
    'ch': ('tS',  'stop',       'chick'),
    'sh': ('S',   'continuant', 'shell'),
    'th': ('T',   'continuant', 'thumb'),
    'th_voiced': ('D', 'continuant', 'the'),
    'ng': ('N',   'continuant', 'king'),
    # --- short vowels -----------------------------------------------------
    'a': ('a',  'vowel', 'apple'),
    'e': ('E',  'vowel', 'eggs'),
    'i': ('I',  'vowel', 'insect'),
    'o': ('0',  'vowel', 'octopus'),
    'u': ('V',  'vowel', 'umbrella'),
    'oo_short': ('U', 'vowel', 'book'),
    # --- long vowels ------------------------------------------------------
    'a_long':  ('eI',  'vowel', 'ape'),
    'e_long':  ('i:',  'vowel', 'key'),
    'i_long':  ('aI',  'vowel', 'ice'),
    'o_long':  ('oU',  'vowel', 'bow'),
    'u_long':  ('ju:', 'vowel', 'tube'),
    'oo_long': ('u:',  'vowel', 'moon'),
    # --- diphthongs -------------------------------------------------------
    'ar':  ('A@', 'vowel', 'car'),
    'air': ('e@', 'vowel', 'chair'),
    'er':  ('3:', 'vowel', 'fern'),
    'or':  ('O@', 'vowel', 'fork'),
    'ow':  ('aU', 'vowel', 'owl'),
    'oy':  ('OI', 'vowel', 'boy'),
    'ear': ('i@', 'vowel', 'deer'),
}


def espeak(phon):
    """Synthesise a phoneme string and return it as float samples."""
    tmp = os.path.join(OUT, '.tmp.wav')
    subprocess.run(
        ['espeak-ng', '-v', 'en-gb', '-s', str(SPEED), '-w', tmp, f'[[{phon}]]'],
        check=True, capture_output=True,
    )
    with wave.open(tmp) as w:
        assert w.getframerate() == RATE, f'unexpected rate {w.getframerate()}'
        samples = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float64)
    os.remove(tmp)
    return samples


def energy(a, frame_ms=5):
    n = max(1, int(RATE * frame_ms / 1000))
    frames = np.concatenate([a, np.zeros((-len(a)) % n)]).reshape(-1, n)
    return np.sqrt((frames ** 2).mean(axis=1)), n


def trim(a, floor=0.04):
    """Drop the silence espeak pads around the sound."""
    e, n = energy(a)
    if e.max() == 0:
        return a
    loud = np.where(e > e.max() * floor)[0]
    if not len(loud):
        return a
    return a[loud[0] * n: min(len(a), (loud[-1] + 1) * n)]


def cut_stop(a, tail_ms=VOWEL_TAIL_MS):
    """Keep the burst plus just enough vowel to carry the place of articulation."""
    e, n = energy(a)
    peak = e.max()
    if peak == 0:
        return a
    onset = np.where(e > peak * 0.06)[0]
    vowel = np.where(e > peak * 0.5)[0]
    if not len(onset) or not len(vowel):
        return a
    start = max(0, onset[0] * n - int(RATE * 0.008))
    end = min(len(a), vowel[0] * n + int(RATE * tail_ms / 1000))
    return a[start:end]


def detect_period(x):
    """Pitch period in samples, by autocorrelation over a plausible voice range."""
    lo, hi = int(RATE / 400), int(RATE / 70)
    x = x - x.mean()
    if len(x) <= lo * 2:
        return 0
    ac = np.correlate(x, x, 'full')[len(x) - 1:]
    hi = min(hi, len(ac) - 1)
    if hi <= lo:
        return 0
    return int(lo + np.argmax(ac[lo:hi]))


def sustain(a, target_ms):
    """
    Hold a continuant for longer.

    espeak gives nasals about 30ms in isolation, which is a blip rather than a
    sound a child can hear and copy. A nasal is a steady hum, so its middle can
    simply be repeated: looping a whole number of pitch periods joins without a
    click, and the onset and release are left untouched at either end.
    """
    target = int(RATE * target_ms / 1000)
    if len(a) >= target or len(a) < 128:
        return a, []

    head, tail = a[: len(a) // 5], a[len(a) * 4 // 5:]
    middle = a[len(a) // 5: len(a) * 4 // 5]
    period = detect_period(middle)
    if period <= 0 or len(middle) < period * 2:
        # Unvoiced or too short to find a period: repeating noise is still noise.
        loop = middle if len(middle) else a
    else:
        loop = middle[: (len(middle) // period) * period]
    if not len(loop):
        return a, []

    need = max(0, target - len(head) - len(tail))
    body = np.tile(loop, int(np.ceil(need / len(loop))) or 1)[:need]
    joins = [len(head) + k * len(loop) for k in range(1, need // len(loop) + 1)]
    joins.append(len(head) + need)
    return np.concatenate([head, body, tail]), joins


def shape(a):
    """Cap the length, fade the edges, and normalise so every sound is equally loud."""
    a = a[: int(RATE * MAX_MS / 1000)]

    # Match on loudness rather than peak. A stop's peak is one brief burst, so
    # normalising to it leaves the clip far quieter to the ear than a vowel
    # given the same treatment — which is why the consonants sounded weak.
    rms = np.sqrt((a ** 2).mean()) if len(a) else 0
    if rms > 0:
        gain = (TARGET_RMS * 32767) / rms
        peak = np.abs(a).max() * gain
        limit = PEAK * 32767
        if peak > limit:
            gain *= limit / peak
        a = a * gain

    fade_in = min(int(RATE * FADE_IN_MS / 1000), len(a) // 4)
    fade_out = min(int(RATE * FADE_OUT_MS / 1000), len(a) // 2)
    if fade_in:
        a[:fade_in] *= np.linspace(0, 1, fade_in)
    if fade_out:
        a[-fade_out:] *= np.linspace(1, 0, fade_out)
    return np.clip(a, -32768, 32767).astype('<i2')


def click_at_joins(a, joins):
    """Worst join discontinuity, as a multiple of the local typical step."""
    if len(a) < 3 or not joins:
        return 0.0
    diffs = np.abs(np.diff(a.astype(np.float64)))
    worst = 0.0
    for j in joins:
        if j <= 1 or j >= len(diffs) - 1:
            continue
        lo, hi = max(0, j - 400), min(len(diffs), j + 400)
        local = np.median(diffs[lo:hi])
        if local > 0:
            worst = max(worst, diffs[j] / local)
    return worst


def centroid(a):
    """Spectral centroid in Hz — a rough 'brightness'."""
    if not len(a):
        return 0.0
    spec = np.abs(np.fft.rfft(a * np.hanning(len(a))))
    freqs = np.fft.rfftfreq(len(a), 1 / RATE)
    total = spec.sum()
    return float((spec * freqs).sum() / total) if total else 0.0


def movement(a):
    """
    How far the sound travels in timbre from start to finish, in Hz.

    This is what separates a glide from a vowel. /w/ starts with rounded lips
    and opens up; /y/ starts high and palatal and falls. If either comes out
    flat it has been frozen into a plain vowel, which is the bug that made an
    earlier version of these clips say "oo" and "ee".
    """
    k = int(RATE * 0.04)
    if len(a) < k * 3:
        return 0.0
    return abs(centroid(a[-k:]) - centroid(a[:k]))


def build():
    os.makedirs(OUT, exist_ok=True)
    problems = []
    rows = []

    for pid, (phon, kind, example) in PHONEMES.items():
        if kind in ('stop', 'glide'):
            tail = GLIDE_TAIL_MS if kind == 'glide' else VOWEL_TAIL_MS
            raw, joins = cut_stop(espeak(phon + VOWEL), tail), []
        elif kind == 'cluster':
            raw, joins = trim(espeak(phon)), []
        else:
            raw, joins = sustain(trim(espeak(phon)), MIN_HELD_MS)

        out = shape(raw)
        rms = float(np.sqrt((out.astype(np.float64) ** 2).mean())) if len(out) else 0.0
        ms = len(out) / RATE * 1000

        path = os.path.join(OUT, f'{pid}.wav')
        with wave.open(path, 'w') as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(RATE)
            w.writeframes(out.tobytes())

        # A silent or near-silent clip means the child hears nothing at all,
        # which is worse than the bug we set out to fix.
        if rms < 500:
            problems.append(f'{pid}: too quiet (rms {rms:.0f})')
        if ms < 40:
            problems.append(f'{pid}: too short ({ms:.0f}ms)')

        # A glide must move and a held sound must not; see movement().
        moved = movement(out.astype(np.float64))
        if kind == 'glide' and moved < 300:
            problems.append(f'{pid}: glide is not moving ({moved:.0f}Hz) — frozen into a vowel')
        if kind in ('vowel', 'continuant') and moved > 900:
            problems.append(f'{pid}: held sound drifts too much ({moved:.0f}Hz)')

        # A click is a discontinuity that stands out against the signal's own
        # texture, so joins are judged locally. Comparing against a fixed
        # threshold instead would just flag every fricative, which is noise and
        # jumps around by nature.
        jump = click_at_joins(out, joins)
        if jump > 6:
            problems.append(f'{pid}: click at a loop join ({jump:.1f}x local)')
        rows.append((pid, kind, example, ms, rms, centroid(out.astype(np.float64)), jump))

    width = max(len(r[0]) for r in rows)
    print(f'{"id".ljust(width)}  kind        example     length     rms   centroid   maxjump')
    for pid, kind, example, ms, rms, cen, jump in rows:
        print(f'{pid.ljust(width)}  {kind:11} {example:10} {ms:6.0f}ms {rms:7.0f} {cen:8.0f}Hz {jump:9.0f}')

    # /b/, /d/ and /g/ are told apart almost entirely by burst frequency, so
    # if those collapse together the three become one indistinct thud.
    bursts = {}
    for pid in ('b', 'd', 'g'):
        path = os.path.join(OUT, f'{pid}.wav')
        with wave.open(path) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float64)
        bursts[pid] = centroid(a[: int(RATE * 0.04)])
    spread = max(bursts.values()) - min(bursts.values())
    if spread < 800:
        problems.append(f'b/d/g bursts are too alike ({spread:.0f}Hz apart) to tell apart')

    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT) if f.endswith('.wav'))
    print(f'\n{len(rows)} phonemes, {total/1024:.0f} KB total')

    if problems:
        print('\nPROBLEMS:')
        for p in problems:
            print(' -', p)
        return 1
    print('all clips audible')
    return 0


if __name__ == '__main__':
    sys.exit(build())
