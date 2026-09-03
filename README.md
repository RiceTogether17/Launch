# LaunchPad Quest

**LCentral *LaunchPad* WorkBook 1, turned into a game.** Every page of the
printed workbook — all 51 activity pages — is playable in the browser, with
stars, XP, levels, day streaks and trophies layered on top.

No build step, no dependencies, no accounts. It's static HTML, CSS and ES
modules, and progress is saved in `localStorage`.

## Running it

ES modules need to be served over HTTP (`file://` won't work), so point any
static server at the repository root:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Deploying is a matter of copying the repository to any static host —
GitHub Pages, Netlify, an S3 bucket. Routes are hash-based, so no rewrite
rules are needed.

## What's in it

| Workbook exercise | In the app |
| --- | --- |
| **First / Last Sound** — *"colour all the pictures with the same first sound"* | Pictures start greyed out and gain their colour when tapped, so colouring in *is* the interaction. Tap every match, then check. |
| **Writing Skills** — trace the letter, say its sound | Draw on the letter with a finger or mouse. Scored on how much of the letter you covered **and** how much of your line stayed on it. |
| **Writing Skills** — *"draw a circle around the letter 'f'"* | A bonus round on the same page: find every `f` and `F` in the row. |
| **Phonics** — *"circle the letter which represents the first sound"* | Tap the right letter. A wrong tap costs the first-try bonus but leaves the question open. |
| **Phonics** — *"draw a line from each picture to the letter"* | Tap a picture, tap a letter, and a line is drawn between them. |
| **Phonics / Segmenting** — write the missing letter | The word is laid out one letter per box with one empty; tap the letter that fills it. |
| **Phonics** — hexagon word completion | Six letters, six words, each letter used exactly once — spend one on the wrong word and another word goes short, just like on paper. |
| **Phonics — Automatic Access** (teacher-timed) | The child says each letter's sound aloud and the app listens, which is what the manual actually defines the skill as. Naming the letter instead of sounding it gets the teacher's own correction. Falls back to tapping wherever the microphone can't be used. |

### Sound

Words and letter sounds are spoken with the Web Speech API — this is a
phonics book, and for half these pages *hearing* the word is the exercise.
The chimes are synthesised with WebAudio, so the app ships no audio files.
Sound can be muted from the header.

Letters are voiced as sounds, not names, and *how* they are voiced follows the
curriculum manual closely — see below.

## Curriculum alignment

The app is built against LCentral's *LaunchPad* Curriculum Delivery Manual, and
several decisions that look arbitrary are taken straight from it:

- **No "-uh" on consonants.** The manual (p20) calls out `/buh/`, `/cuh/`,
  `/muh/`, `/luh/` as errors teachers must correct on the spot, because the
  child is saying two sounds where there is one. A speech engine given `"buh"`
  produces exactly that, and given `"b"` says the letter *name*. So continuants
  and short vowels are spoken in isolation, where that is honest, and stops are
  voiced as their Grapheme Wall Chart key word instead — the chart's own method.
- **The word comes before the sound.** "The correct process is to say the
  picture word firstly followed by the sound so the students hear the sound as
  part of the word, not as a sound in isolation." (p12)
- **No words printed on the picture pages.** "Words have purposely been omitted
  from the phonemic awareness pages as the objective is for students to focus on
  identifying sounds they hear... students may focus on spelling or phonics."
  (p32) Pictures carry no captions; tap one to hear its name, which is how the
  teacher supports a child with limited vocabulary (p34). Names remain in
  `aria-label` for screen readers.
- **Automatic Access means saying the sound.** The manual defines it as being
  able to "look at a letter and correctly pronounce the corresponding phoneme
  (sound) without hesitation" (p29), so the child speaks and the app listens
  rather than testing alphabetical order. When a sound is missed, the app does
  what the manual tells the teacher to do: offer a word beginning with that
  sound, let the child hear it, and move on. Saying the letter's *name* is
  treated as the specific confusion the manual asks teachers to correct (p12).
- **Automatic Access is not a race.** "Do not turn the Automatic Access activity
  into a competition or race... Mispronunciation of sounds will occur when
  students rush." (p29) The clock runs and each attempt is logged, because the
  workbook itself records seconds every lesson, but no wording urges speed,
  stars come from accuracy alone, and the trophy is earned by a clean run rather
  than a fast one.
- **Short vowels only for phonics access** (p33), while phonemic awareness
  ranges wider.
- **`/ng/` and `/x/` never appear as first sounds**, as the manual notes they
  do not occur word-initially in English (p12).

### Rewards

- **Stars** — 1–3 per page, from how much you got right *first try*. These are
  the child-facing reward; the record below is the one that means something.
- **Skill levels 1–4** — the programme's own scale, from the LaunchPad
  Outcomes Record (p7): Introduced, Emerging, Demonstrates occasionally,
  Demonstrates consistently. Level 4 needs two clean runs, not one, because the
  manual defines it as demonstrating "correctly each time without hesitation".
  Level 4 across every page is the criterion for promotion to LiftOff, and the
  home screen shows how many pages sit at each level.
- **XP and levels** — levels get progressively longer; replaying a page pays
  a quarter of the XP, so grinding one easy page isn't a shortcut.
- **Streaks** — consecutive days played.
- **Trophies** — ten of them, including one for neat handwriting and one for
  a fast alphabet race.
- **Pages unlock in order**, but any finished page can be replayed to raise
  its star count.

## The artwork

The workbook's pictures are black-and-white clip art, © 2017 LCentral Pte Ltd.
This app uses **emoji** instead: they render on every device, need no assets,
and are in colour — which matters, because half these exercises originally
asked the child to colour the matching pictures in.

Where a piece of clip art was ambiguous — a shape that could reasonably be
read as two different words, which would make the phonics wrong — a picture
with an unmistakable name is substituted. The skill being practised, the
target sound, the letter options and the page order are all the workbook's.

### About the microphone

Speech recognition in Chrome is not done on the device: audio is sent to
Google's servers for transcription. So the microphone needs a network
connection, and a child's voice leaves the machine. It is never switched on by
itself — the child taps to speak each time — and every page keeps a full
tapping fallback, used automatically when the microphone is declined, blocked
or unsupported (Firefox and Safari among them). If that trade-off isn't one you
want, the tapping mode alone is a complete way to work through these pages.

Recognisers are also built to hear words, not bare phonemes, so the judging is
deliberately generous: several alternatives are considered, the Grapheme Wall
Chart's key word counts as correct, and where a letter's name genuinely cannot
be told apart from its sound (`/s/` versus "ess") the answer is accepted rather
than risk marking a correct child wrong.

## Layout

```
index.html                  shell + HUD
css/style.css               one stylesheet; light and dark palettes
js/
  main.js                   hash router and HUD
  state.js                  XP, stars, streaks, trophies, localStorage
  audio.js                  speech + synthesised chimes
  fx.js                     confetti, floating XP, toasts
  dom.js                    small element helper
  data/pages.js             all 51 pages of content
  phonemeMatch.js           judging a spoken letter sound (pure, tested)
  listen.js                 Web Speech API recogniser wrapper
  activities/               one module per exercise type
  screens/                  home, map, activity host, trophies
tools/check-content.mjs     content consistency check
tools/check-speech.mjs      tests for the spoken-sound judge
```

### Adding or editing a page

Edit `js/data/pages.js`, then run:

```sh
node tools/check-content.mjs
```

There is a second check for the speech matching, which can't be driven in a
headless browser:

```sh
node tools/check-speech.mjs
```

The content check covers all 51 pages for the mistakes that are easy to make by hand: an
answer missing from its own options, a hexagon whose letters don't spell its
words, a picture filed under the wrong sound, a segmenting blank in the wrong
position. English spelling isn't phonetic, so words whose sound and spelling
disagree (silent `e`, the `b` in *lamb*, the soft `c` in *juice*) are handled
by rule or listed as documented exceptions.

## Accessibility

Large touch targets, visible focus rings for keyboard users, `aria-label`s on
every picture and letter, and full support for `prefers-reduced-motion` and
`prefers-color-scheme`.

---

Built on the structure of *LaunchPad WorkBook 1* and its Curriculum Delivery
Manual by LCentral. The workbook's content and clip art remain
© 2008–2017 LCentral Pte Ltd; this repository contains no artwork from it.
