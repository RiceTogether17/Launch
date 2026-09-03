/**
 * LaunchPad WorkBook 1 — page manifest.
 *
 * One entry per page of the printed workbook (pages 2–52; page 1 is the cover,
 * which becomes the app's home screen). Each entry names the activity engine
 * that renders it and carries everything that engine needs.
 *
 * Pictures are emoji rather than the workbook's clip art: they render on every
 * device, need no assets, and are in colour — which matters, because half these
 * exercises originally asked the child to *colour in* the matching pictures.
 * Where a piece of clip art was ambiguous (a shape that could read as two
 * different words), we substitute a picture whose word is unmistakable. The
 * skill, the target sound and the page order are the workbook's.
 */

// Shorthand: p(word, emoji) — a picture the child has to name.
const p = (word, emoji) => ({ word, emoji });

export const PAGES = [
  // ---------------------------------------------------------------- page 2
  {
    page: 2,
    skill: 'First Sound',
    type: 'soundSort',
    position: 'first',
    sound: 'f',
    target: p('fish', '🐟'),
    items: [
      p('fox', '🦊'), p('fire', '🔥'), p('fan', '🪭'), p('frog', '🐸'),
      p('flag', '🚩'), p('umbrella', '☂️'), p('jar', '🫙'), p('sun', '☀️'),
    ],
    matches: ['fox', 'fire', 'fan', 'frog', 'flag'],
  },
  // ---------------------------------------------------------------- page 3
  {
    page: 3,
    skill: 'First Sound',
    type: 'soundSort',
    position: 'first',
    sound: 'm',
    target: p('moon', '🌙'),
    items: [
      p('mushroom', '🍄'), p('monkey', '🐒'), p('money', '💰'), p('mask', '🎭'),
      p('mouse', '🐭'), p('tomato', '🍅'), p('car', '🚗'), p('apple', '🍎'),
    ],
    matches: ['mushroom', 'monkey', 'money', 'mask', 'mouse'],
  },
  // ---------------------------------------------------------------- page 4
  {
    page: 4,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['n', 'm'],
  },
  // ---------------------------------------------------------------- page 5
  {
    page: 5,
    skill: 'First Sound',
    type: 'soundSort',
    position: 'first',
    sound: 's',
    target: p('snake', '🐍'),
    items: [
      p('sun', '☀️'), p('snail', '🐌'), p('star', '⭐'), p('sock', '🧦'),
      p('scissors', '✂️'), p('seal', '🦭'), p('key', '🔑'), p('octopus', '🐙'),
    ],
    matches: ['sun', 'snail', 'star', 'sock', 'scissors', 'seal'],
  },
  // ---------------------------------------------------------------- page 6
  {
    page: 6,
    skill: 'First Sound',
    type: 'soundSort',
    position: 'first',
    sound: 'j',
    target: p('jar', '🫙'),
    items: [
      p('jeep', '🚙'), p('jigsaw', '🧩'), p('jacket', '🧥'), p('jellyfish', '🪼'),
      p('juice', '🧃'), p('balloon', '🎈'), p('fish', '🐟'), p('box', '📦'),
    ],
    matches: ['jeep', 'jigsaw', 'jacket', 'jellyfish', 'juice'],
  },
  // ---------------------------------------------------------------- page 7
  {
    page: 7,
    skill: 'First Sound',
    type: 'soundSort',
    position: 'first',
    sound: 'u',
    target: p('umbrella', '☂️'),
    items: [
      p('up', '⬆️'), p('underwear', '🩲'), p('upside down', '🙃'),
      p('alligator', '🐊'), p('backpack', '🎒'), p('rabbit', '🐰'),
      p('ant', '🐜'), p('egg', '🥚'),
    ],
    matches: ['up', 'underwear', 'upside down'],
  },
  // ---------------------------------------------------------------- page 8
  {
    page: 8,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['s', 'z'],
  },
  // ---------------------------------------------------------------- page 9
  {
    page: 9,
    skill: 'First Sound',
    type: 'soundSort',
    position: 'first',
    sound: 'g',
    target: p('goat', '🐐'),
    items: [
      p('goose', '🦢'), p('gorilla', '🦍'), p('girl', '👧'), p('grapes', '🍇'),
      p('ghost', '👻'), p('pig', '🐷'), p('fish', '🐟'), p('cat', '🐱'),
    ],
    matches: ['goose', 'gorilla', 'girl', 'grapes', 'ghost'],
  },
  // --------------------------------------------------------------- page 10
  {
    page: 10,
    skill: 'First Sound',
    type: 'soundSort',
    position: 'first',
    sound: 'w',
    target: p('worm', '🪱'),
    items: [
      p('watermelon', '🍉'), p('witch', '🧙'), p('whale', '🐳'), p('wheel', '🛞'),
      p('watch', '⌚'), p('window', '🪟'), p('queen', '👸'), p('van', '🚐'),
    ],
    matches: ['watermelon', 'witch', 'whale', 'wheel', 'watch', 'window'],
  },
  // --------------------------------------------------------------- page 11
  {
    page: 11,
    skill: 'First Sound',
    type: 'soundSort',
    position: 'first',
    sound: 'p',
    target: p('pig', '🐷'),
    items: [
      p('plane', '✈️'), p('present', '🎁'), p('pie', '🥧'), p('pizza', '🍕'),
      p('pumpkin', '🎃'), p('panda', '🐼'), p('moon', '🌙'), p('elephant', '🐘'),
    ],
    matches: ['plane', 'present', 'pie', 'pizza', 'pumpkin', 'panda'],
  },
  // --------------------------------------------------------------- page 12
  {
    page: 12,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['v', 'f'],
    findLetter: { letter: 'f', row: ['G', 'f', 'd', 'F', 'm', 'R', 's', 'F', 'o'] },
  },
  // --------------------------------------------------------------- page 13
  {
    page: 13,
    skill: 'First Sound',
    type: 'soundSort',
    position: 'first',
    sound: 'y',
    target: p('yacht', '⛵'),
    items: [
      p('yarn', '🧶'), p('yo-yo', '🪀'), p('yawn', '🥱'), p('yin yang', '☯️'),
      p('bird', '🐦'), p('bee', '🐝'), p('van', '🚐'), p('sun', '☀️'),
    ],
    matches: ['yarn', 'yo-yo', 'yawn', 'yin yang'],
  },
  // --------------------------------------------------------------- page 14
  {
    page: 14,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['l', 'r'],
  },
  // --------------------------------------------------------------- page 15
  {
    page: 15,
    skill: 'Phonics',
    type: 'pickLetter',
    position: 'first',
    questions: [
      { pic: p('fan', '🪭'),      options: ['w', 'v', 'f'], answer: 'f' },
      { pic: p('lion', '🦁'),     options: ['c', 'l', 'r'], answer: 'l' },
      { pic: p('snake', '🐍'),    options: ['t', 's', 'g'], answer: 's' },
      { pic: p('moon', '🌙'),     options: ['m', 'n', 'u'], answer: 'm' },
      { pic: p('arrow', '➡️'),    options: ['o', 'e', 'a'], answer: 'a' },
      { pic: p('balloon', '🎈'),  options: ['p', 'b', 'd'], answer: 'b' },
    ],
  },
  // --------------------------------------------------------------- page 16
  {
    page: 16,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['c', 'k'],
  },
  // --------------------------------------------------------------- page 17
  {
    page: 17,
    skill: 'Phonics',
    type: 'matchLetter',
    position: 'first',
    pairs: [
      { pic: p('elephant', '🐘'), letter: 'e' },
      { pic: p('cat', '🐱'),      letter: 'c' },
      { pic: p('sock', '🧦'),     letter: 's' },
      { pic: p('goat', '🐐'),     letter: 'g' },
      { pic: p('ball', '⚽'),     letter: 'b' },
      { pic: p('van', '🚐'),      letter: 'v' },
    ],
  },
  // --------------------------------------------------------------- page 18
  {
    page: 18,
    skill: 'Phonics',
    type: 'matchLetter',
    position: 'first',
    pairs: [
      { pic: p('truck', '🚚'),    letter: 't' },
      { pic: p('dinosaur', '🦕'), letter: 'd' },
      { pic: p('rabbit', '🐰'),   letter: 'r' },
      { pic: p('farmer', '🧑‍🌾'),  letter: 'f' },
      { pic: p('man', '👨'),      letter: 'm' },
      { pic: p('nest', '🪺'),     letter: 'n' },
    ],
  },
  // --------------------------------------------------------------- page 19
  {
    page: 19,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['a', 'e'],
  },
  // --------------------------------------------------------------- page 20
  {
    page: 20,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['t', 'h'],
  },
  // --------------------------------------------------------------- page 21
  {
    page: 21,
    skill: 'Last Sound',
    type: 'soundSort',
    position: 'last',
    sound: 'l',
    target: p('shell', '🐚'),
    items: [
      p('bell', '🔔'), p('ball', '⚽'), p('girl', '👧'), p('snail', '🐌'),
      p('owl', '🦉'), p('whale', '🐳'), p('cat', '🐱'), p('drum', '🥁'),
    ],
    matches: ['bell', 'ball', 'girl', 'snail', 'owl', 'whale'],
  },
  // --------------------------------------------------------------- page 22
  {
    page: 22,
    skill: 'Phonics',
    type: 'pickLetter',
    position: 'first',
    questions: [
      { pic: p('bull', '🐂'),   options: ['d', 'p', 'b', 't'], answer: 'b' },
      { pic: p('apple', '🍎'),  options: ['a', 'd', 'p', 'r'], answer: 'a' },
      { pic: p('ball', '⚽'),   options: ['h', 'b', 'r', 'm'], answer: 'b' },
      { pic: p('fish', '🐟'),   options: ['w', 'v', 'f', 's'], answer: 'f' },
      { pic: p('goat', '🐐'),   options: ['j', 'g', 'y', 'z'], answer: 'g' },
      { pic: p('star', '⭐'),   options: ['s', 'r', 'p', 't'], answer: 's' },
      { pic: p('hippo', '🦛'),  options: ['k', 'h', 't', 'f'], answer: 'h' },
      { pic: p('tiger', '🐯'),  options: ['l', 'n', 'u', 't'], answer: 't' },
    ],
  },
  // --------------------------------------------------------------- page 23
  {
    page: 23,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['q', 'p'],
    findLetter: { letter: 'p', row: ['R', 'm', 'x', 'p', 'q', 'P', 'D', 's'] },
  },
  // --------------------------------------------------------------- page 24
  {
    page: 24,
    skill: 'Last Sound',
    type: 'soundSort',
    position: 'last',
    sound: 'r',
    target: p('star', '⭐'),
    items: [
      p('car', '🚗'), p('bear', '🐻'), p('chair', '🪑'), p('door', '🚪'),
      p('pear', '🍐'), p('tiger', '🐯'), p('saw', '🪚'), p('cake', '🍰'),
    ],
    matches: ['car', 'bear', 'chair', 'door', 'pear', 'tiger'],
  },
  // --------------------------------------------------------------- page 25
  {
    page: 25,
    skill: 'Last Sound',
    type: 'soundSort',
    position: 'last',
    sound: 'm',
    target: p('drum', '🥁'),
    items: [
      p('arm', '💪'), p('lamb', '🐑'), p('broom', '🧹'), p('worm', '🪱'),
      p('ham', '🍖'), p('jam', '🍯'), p('bat', '🦇'), p('computer', '💻'),
    ],
    matches: ['arm', 'lamb', 'broom', 'worm', 'ham', 'jam'],
  },
  // --------------------------------------------------------------- page 26
  {
    page: 26,
    skill: 'Alphabet',
    type: 'automaticAccess',
    letterCase: 'lower',
  },
  // --------------------------------------------------------------- page 27
  {
    page: 27,
    skill: 'Alphabet',
    type: 'automaticAccess',
    letterCase: 'upper',
  },
  // --------------------------------------------------------------- page 28
  {
    page: 28,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['d', 'b'],
  },
  // --------------------------------------------------------------- page 29
  {
    page: 29,
    skill: 'Phonics',
    type: 'matchLetter',
    position: 'first',
    pairs: [
      { pic: p('seal', '🦭'),     letter: 's' },
      { pic: p('egg', '🥚'),      letter: 'e' },
      { pic: p('mouse', '🐭'),    letter: 'm' },
      { pic: p('octopus', '🐙'),  letter: 'o' },
      { pic: p('umbrella', '☂️'), letter: 'u' },
      { pic: p('insect', '🐛'),   letter: 'i' },
      { pic: p('dog', '🐶'),      letter: 'd' },
      { pic: p('tap', '🚰'),      letter: 't' },
    ],
  },
  // --------------------------------------------------------------- page 30
  {
    page: 30,
    skill: 'Phonics',
    type: 'matchLetter',
    position: 'last',
    pairs: [
      { pic: p('pig', '🐷'),   letter: 'g' },
      { pic: p('pan', '🍳'),   letter: 'n' },
      { pic: p('bird', '🐦'),  letter: 'd' },
      { pic: p('drum', '🥁'),  letter: 'm' },
      { pic: p('bus', '🚌'),   letter: 's' },
      { pic: p('cat', '🐱'),   letter: 't' },
      { pic: p('cup', '☕'),   letter: 'p' },
      { pic: p('owl', '🦉'),   letter: 'l' },
    ],
  },
  // --------------------------------------------------------------- page 31
  {
    page: 31,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['g', 'i'],
    findLetter: { letter: 'i', row: ['I', 'y', 'i', 'M', 'L', 'r', 'W', 't'] },
  },
  // --------------------------------------------------------------- page 32
  {
    page: 32,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['o', 'u'],
    findLetter: { letter: 'u', row: ['P', 'O', 'u', 'v', 'r', 'U', 'm', 'f'] },
  },
  // --------------------------------------------------------------- page 33
  {
    page: 33,
    skill: 'Phonics',
    type: 'pickLetter',
    position: 'first',
    questions: [
      { pic: p('bow', '🎀'),    options: ['o', 'f', 'b', 's'], answer: 'b' },
      { pic: p('pie', '🥧'),    options: ['e', 't', 'p', 'n'], answer: 'p' },
      { pic: p('axe', '🪓'),    options: ['a', 'k', 'r', 'm'], answer: 'a' },
      { pic: p('zebra', '🦓'),  options: ['w', 's', 'z', 'v'], answer: 'z' },
      { pic: p('nut', '🥜'),    options: ['m', 'c', 'n', 'z'], answer: 'n' },
      { pic: p('flower', '🌼'), options: ['f', 'r', 'p', 't'], answer: 'f' },
      { pic: p('witch', '🧙'),  options: ['u', 'v', 'w', 'g'], answer: 'w' },
      { pic: p('car', '🚗'),    options: ['a', 'c', 'l', 'n'], answer: 'c' },
    ],
  },
  // --------------------------------------------------------------- page 34
  {
    page: 34,
    skill: 'Phonics',
    type: 'pickLetter',
    position: 'first',
    questions: [
      { pic: p('mouse', '🐭'),  options: ['u', 'm', 'n', 'f'], answer: 'm' },
      { pic: p('hook', '🪝'),   options: ['h', 'd', 'p', 'k'], answer: 'h' },
      { pic: p('jet', '✈️'),    options: ['v', 'j', 'r', 'q'], answer: 'j' },
      { pic: p('ladder', '🪜'), options: ['a', 'r', 'g', 'l'], answer: 'l' },
      { pic: p('hand', '✋'),   options: ['y', 'r', 'h', 'p'], answer: 'h' },
      { pic: p('snake', '🐍'),  options: ['w', 's', 'd', 'o'], answer: 's' },
      { pic: p('lion', '🦁'),   options: ['s', 'k', 'b', 'l'], answer: 'l' },
      { pic: p('dog', '🐶'),    options: ['d', 'f', 'p', 'm'], answer: 'd' },
    ],
  },
  // --------------------------------------------------------------- page 35
  {
    page: 35,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['j', 'y'],
    findLetter: { letter: 'y', row: ['A', 'y', 'R', 'Y', 'u', 'I', 'P', 'C'] },
  },
  // --------------------------------------------------------------- page 36
  {
    page: 36,
    skill: 'Writing Skills',
    type: 'tracing',
    letters: ['w', 'x'],
    findLetter: { letter: 'x', row: ['H', 'o', 'f', 's', 'x', 'n', 'X', 'r', 'l'] },
  },
  // --------------------------------------------------------------- page 37
  {
    page: 37,
    skill: 'Phonics / Segmenting',
    type: 'segment',
    position: 'first',
    words: [
      { word: 'six',    emoji: '6️⃣', blank: 0 },
      { word: 'seven',  emoji: '7️⃣', blank: 0 },
      { word: 'ten',    emoji: '🔟', blank: 0 },
      { word: 'eleven', emoji: '⏸️', blank: 0 },
    ],
  },
  // --------------------------------------------------------------- page 38
  {
    page: 38,
    skill: 'Phonics / Segmenting',
    type: 'segment',
    position: 'first',
    words: [
      { word: 'rat', emoji: '🐀', blank: 0 },
      { word: 'can', emoji: '🥫', blank: 0 },
      { word: 'jug', emoji: '🫗', blank: 0 },
      { word: 'dog', emoji: '🐶', blank: 0 },
      { word: 'box', emoji: '📦', blank: 0 },
    ],
  },
  // --------------------------------------------------------------- page 39
  {
    page: 39,
    skill: 'Phonics',
    type: 'matchLetter',
    position: 'last',
    pairs: [
      { pic: p('box', '📦'),    letter: 'x' },
      { pic: p('tap', '🚰'),    letter: 'p' },
      { pic: p('crab', '🦀'),   letter: 'b' },
      { pic: p('rabbit', '🐰'), letter: 't' },
      { pic: p('pencil', '✏️'), letter: 'l' },
      { pic: p('fan', '🪭'),    letter: 'n' },
    ],
  },
  // --------------------------------------------------------------- page 40
  {
    page: 40,
    skill: 'Phonics / Segmenting',
    type: 'segment',
    position: 'first',
    words: [
      { word: 'fan', emoji: '🪭', blank: 0 },
      { word: 'sun', emoji: '☀️', blank: 0 },
      { word: 'pig', emoji: '🐷', blank: 0 },
      { word: 'tap', emoji: '🚰', blank: 0 },
      { word: 'ant', emoji: '🐜', blank: 0 },
    ],
  },
  // --------------------------------------------------------------- page 41
  {
    page: 41,
    skill: 'Last Sound',
    type: 'soundSort',
    position: 'last',
    sound: 't',
    target: p('hat', '🎩'),
    items: [
      p('cat', '🐱'), p('foot', '🦶'), p('net', '🥅'), p('goat', '🐐'),
      p('boat', '⛵'), p('robot', '🤖'), p('pear', '🍐'), p('car', '🚗'),
    ],
    matches: ['cat', 'foot', 'net', 'goat', 'boat', 'robot'],
  },
  // --------------------------------------------------------------- page 42
  {
    page: 42,
    skill: 'Phonics',
    type: 'hexagon',
    hexLetters: ['s', 'p', 'b', 'f', 'c', 't'],
    words: [
      { word: 'sun', emoji: '☀️', blank: 0 },
      { word: 'tap', emoji: '🚰', blank: 0 },
      { word: 'pan', emoji: '🍳', blank: 0 },
      { word: 'cat', emoji: '🐱', blank: 0 },
      { word: 'fan', emoji: '🪭', blank: 0 },
      { word: 'box', emoji: '📦', blank: 0 },
    ],
  },
  // --------------------------------------------------------------- page 43
  {
    page: 43,
    skill: 'Last Sound',
    type: 'soundSort',
    position: 'last',
    sound: 's',
    target: p('bus', '🚌'),
    items: [
      p('house', '🏠'), p('dress', '👗'), p('horse', '🐴'), p('mouse', '🐭'),
      p('glass', '🥛'), p('juice', '🧃'), p('car', '🚗'), p('hammer', '🔨'),
    ],
    matches: ['house', 'dress', 'horse', 'mouse', 'glass', 'juice'],
  },
  // --------------------------------------------------------------- page 44
  {
    page: 44,
    skill: 'Last Sound',
    type: 'soundSort',
    position: 'last',
    sound: 'd',
    target: p('card', '🃏'),
    items: [
      p('hand', '✋'), p('bird', '🐦'), p('bread', '🍞'), p('cloud', '☁️'),
      p('sword', '🗡️'), p('road', '🛣️'), p('frog', '🐸'), p('turtle', '🐢'),
    ],
    matches: ['hand', 'bird', 'bread', 'cloud', 'sword', 'road'],
  },
  // --------------------------------------------------------------- page 45
  {
    page: 45,
    skill: 'Phonics',
    type: 'pickLetter',
    position: 'last',
    questions: [
      { pic: p('octopus', '🐙'), options: ['m', 'r', 'j', 's'], answer: 's' },
      { pic: p('jug', '🫗'),     options: ['f', 'g', 'e', 'k'], answer: 'g' },
      { pic: p('foot', '🦶'),    options: ['d', 't', 'n', 'k'], answer: 't' },
      { pic: p('worm', '🪱'),    options: ['f', 'm', 'n', 'v'], answer: 'm' },
      { pic: p('shark', '🦈'),   options: ['r', 's', 'b', 'k'], answer: 'k' },
      { pic: p('owl', '🦉'),     options: ['h', 'z', 'a', 'l'], answer: 'l' },
      { pic: p('leaf', '🍃'),    options: ['f', 'v', 'i', 's'], answer: 'f' },
      { pic: p('cup', '☕'),     options: ['b', 'c', 't', 'p'], answer: 'p' },
    ],
  },
  // --------------------------------------------------------------- page 46
  {
    page: 46,
    skill: 'Phonics / Segmenting',
    type: 'segment',
    position: 'last',
    words: [
      { word: 'van',  emoji: '🚐', blank: 2 },
      { word: 'tap',  emoji: '🚰', blank: 2 },
      { word: 'pig',  emoji: '🐷', blank: 2 },
      { word: 'ant',  emoji: '🐜', blank: 2 },
      { word: 'drum', emoji: '🥁', blank: 3 },
    ],
  },
  // --------------------------------------------------------------- page 47
  {
    page: 47,
    skill: 'Last Sound',
    type: 'soundSort',
    position: 'last',
    sound: 'x',
    target: p('axe', '🪓'),
    items: [
      p('box', '📦'), p('ox', '🐂'), p('fox', '🦊'), p('six', '6️⃣'),
      p('giraffe', '🦒'), p('log', '🪵'), p('boy', '👦'), p('egg', '🥚'),
    ],
    matches: ['box', 'ox', 'fox', 'six'],
  },
  // --------------------------------------------------------------- page 48
  {
    page: 48,
    skill: 'Last Sound',
    type: 'soundSort',
    position: 'last',
    sound: 'ch',
    target: p('watch', '⌚'),
    items: [
      p('sandwich', '🥪'), p('witch', '🧙'), p('church', '⛪'), p('beach', '🏖️'),
      p('peach', '🍑'), p('chair', '🪑'), p('arrow', '➡️'), p('cake', '🍰'),
    ],
    matches: ['sandwich', 'witch', 'church', 'beach', 'peach'],
  },
  // --------------------------------------------------------------- page 49
  {
    page: 49,
    skill: 'Phonics',
    type: 'pickLetter',
    position: 'last',
    questions: [
      { pic: p('bed', '🛏️'),    options: ['q', 'd', 'b', 'p'], answer: 'd' },
      { pic: p('rabbit', '🐰'), options: ['i', 't', 'd', 'm'], answer: 't' },
      { pic: p('tent', '⛺'),   options: ['k', 't', 's', 'n'], answer: 't' },
      { pic: p('fan', '🪭'),    options: ['h', 'n', 'm', 's'], answer: 'n' },
      { pic: p('nest', '🪺'),   options: ['n', 's', 't', 'k'], answer: 't' },
      { pic: p('can', '🥫'),    options: ['j', 'n', 'f', 'm'], answer: 'n' },
      { pic: p('map', '🗺️'),    options: ['b', 'p', 'a', 'r'], answer: 'p' },
      { pic: p('arm', '💪'),    options: ['n', 'c', 'm', 'r'], answer: 'm' },
    ],
  },
  // --------------------------------------------------------------- page 50
  {
    page: 50,
    skill: 'Last Sound',
    type: 'soundSort',
    position: 'last',
    sound: 'g',
    target: p('plug', '🔌'),
    items: [
      p('bag', '👜'), p('dog', '🐶'), p('egg', '🥚'), p('jug', '🫗'),
      p('pig', '🐷'), p('frog', '🐸'), p('phone', '☎️'), p('sun', '☀️'),
    ],
    matches: ['bag', 'dog', 'egg', 'jug', 'pig', 'frog'],
  },
  // --------------------------------------------------------------- page 51
  {
    page: 51,
    skill: 'Phonics',
    type: 'hexagon',
    hexLetters: ['s', 'j', 'p', 'b', 'l', 'c'],
    words: [
      { word: 'six', emoji: '6️⃣', blank: 0 },
      { word: 'jug', emoji: '🫗', blank: 0 },
      { word: 'cap', emoji: '🧢', blank: 0 },
      { word: 'bed', emoji: '🛏️', blank: 0 },
      { word: 'log', emoji: '🪵', blank: 0 },
      { word: 'pig', emoji: '🐷', blank: 0 },
    ],
  },
  // --------------------------------------------------------------- page 52
  {
    page: 52,
    skill: 'Phonics / Segmenting',
    type: 'segment',
    position: 'last',
    words: [
      { word: 'drum', emoji: '🥁', blank: 3 },
      { word: 'jump', emoji: '🤸', blank: 3 },
      { word: 'hand', emoji: '✋', blank: 3 },
      { word: 'frog', emoji: '🐸', blank: 3 },
      { word: 'nest', emoji: '🪺', blank: 3 },
    ],
  },
];

/** Human-readable title for a page, used on the map and the activity header. */
export function pageTitle(pg) {
  switch (pg.type) {
    case 'soundSort':
      return `${pg.position === 'first' ? 'First' : 'Last'} sound: ${pg.target.word}`;
    case 'tracing':
      return `Write ${pg.letters.map((l) => `${l}${l.toUpperCase()}`).join(' and ')}`;
    case 'pickLetter':
      return `Circle the ${pg.position} sound`;
    case 'matchLetter':
      return `Match the ${pg.position} sound`;
    case 'segment':
      return `Missing ${pg.position} letter`;
    case 'hexagon':
      return 'Hexagon words';
    case 'automaticAccess':
      return `Automatic Access — ${pg.letterCase === 'lower' ? 'lower' : 'UPPER'} case`;
    default:
      return pg.skill;
  }
}

/** The emoji shown on a page's map token. */
export function pageIcon(pg) {
  switch (pg.type) {
    case 'soundSort':    return pg.target.emoji;
    case 'tracing':      return '✏️';
    case 'pickLetter':   return '⭕';
    case 'matchLetter':  return '🔗';
    case 'segment':      return '🧩';
    case 'hexagon':      return '⬡';
    case 'automaticAccess': return '⏱️';
    default:             return '📘';
  }
}

export const TOTAL_PAGES = PAGES.length;
