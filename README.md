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
| **Alphabet — automatic access** (teacher-timed) | An alphabet race: tap the scrambled letters in order against the clock. Best time is kept, so the child races themselves. |

### Sound

Words and letter sounds are spoken with the Web Speech API — this is a
phonics book, and for half these pages *hearing* the word is the exercise.
Letters are voiced as sounds, not names: `/f/`, not "eff". The chimes are
synthesised with WebAudio, so the app ships no audio files. Sound can be
muted from the header.

### Rewards

- **Stars** — 1–3 per page, from how much you got right *first try*.
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
  activities/               one module per exercise type
  screens/                  home, map, activity host, trophies
tools/check-content.mjs     content consistency check
```

### Adding or editing a page

Edit `js/data/pages.js`, then run:

```sh
node tools/check-content.mjs
```

It checks all 51 pages for the mistakes that are easy to make by hand: an
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

Built on the structure of *LaunchPad WorkBook 1* by LCentral. The workbook's
content and clip art remain © 2017 LCentral Pte Ltd; this repository contains
no artwork from it.
