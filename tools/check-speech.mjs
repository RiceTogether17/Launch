/**
 * Tests for the spoken-sound judge.
 *
 *   node tools/check-speech.mjs
 *
 * Speech recognition can't be driven in a headless browser, so the matching
 * logic lives in a pure module and is checked here against the kinds of
 * transcripts Chrome actually returns for a young child's voice.
 */

import { judge, keyWordFor, normalise } from '../js/phonemeMatch.js';

let failures = 0;
function check(label, actual, expected) {
  if (actual !== expected) {
    failures += 1;
    console.log(`✗ ${label}: got "${actual}", expected "${expected}"`);
  }
}

// --- the sound itself, in the shapes a recogniser tends to return
check('m as "mmm"',        judge('m', ['mmm']), 'correct');
check('m as "em"',         judge('m', ['em']), 'correct');
check('s as "sss"',        judge('s', ['sss']), 'correct');
check('s as "ess"',        judge('s', ['ess']), 'correct');
check('f as "fff"',        judge('f', ['fff']), 'correct');
check('r as "rrr"',        judge('r', ['rrr']), 'correct');
check('r as "are"',        judge('r', ['are']), 'correct');
check('b as "buh"',        judge('b', ['buh']), 'correct');
check('c as "kuh"',        judge('c', ['kuh']), 'correct');
check('x as "ks"',         judge('x', ['ks']), 'correct');
check('z as "zzz"',        judge('z', ['zzz']), 'correct');

// --- the wall chart key word counts, per CDM p12
check('b as "bat"',        judge('b', ['bat']), 'correct');
check('o as "octopus"',    judge('o', ['octopus']), 'correct');
check('ng key word',       keyWordFor('n'), 'noodles');
check('embedded key word', judge('c', ['its a cat']), 'correct');

// --- the letter name, where it can be told apart from the sound
check('b as "bee"',        judge('b', ['bee']), 'letter-name');
check('c as "see"',        judge('c', ['see']), 'letter-name');
check('w as "double u"',   judge('w', ['double u']), 'letter-name');
check('y as "why"',        judge('y', ['why']), 'letter-name');
check('q as "cue"',        judge('q', ['cue']), 'letter-name');

// --- where name and sound are genuinely indistinguishable we accept, rather
//     than mark a child wrong on a distinction the recogniser cannot make
check('s as "ess" accepted',  judge('s', ['ess']), 'correct');
check('l as "el" accepted',   judge('l', ['el']), 'correct');

// --- anything else
check('silence',           judge('m', ['']), 'unclear');
check('unrelated',         judge('m', ['banana']), 'unclear');
check('unknown letter',    judge('!', ['m']), 'unclear');

// --- a right answer anywhere in the alternatives wins
check('later alternative', judge('f', ['thanks', 'eff']), 'correct');
check('correct beats name', judge('b', ['bee', 'buh']), 'correct');

// --- normalisation
check('collapse repeats',  normalise('MMMM!'), 'm');
check('strip punctuation', normalise('  Bat. '), 'bat');

console.log(failures ? `${failures} failing` : '✅ spoken-sound judging behaves');
process.exit(failures ? 1 : 0);
