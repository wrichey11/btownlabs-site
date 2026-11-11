// Bendword game rules, ported from the iOS app (Swift) so the web and the app play identically.
// Sources: StringUtilities, TransformationType, TransformationValidator, GuessEvaluator,
// Puzzle, PuzzleService, StatsService, ShareService, and GameViewModel.

export const SHARE_URL = 'https://btownlabs.com/bendword';
export const APP_STORE_URL = 'https://apps.apple.com/app/bendword/id6827767246';

/** First letter, letter count, extra clue. */
export const LETTER_HINT_COUNT = 3;

// MARK: - Strings

export function normalize(text) {
  return (text ?? '').trim().toLowerCase().replace(/[^\p{L}]/gu, '');
}

export function display(word) {
  return (word ?? '').toUpperCase();
}

function sortedLetters(word) {
  return [...normalize(word)].sort().join('');
}

/** True when `source` contains the letters of `shorter` in order (gaps allowed). */
function containsLettersInOrder(source, shorter) {
  const s = [...normalize(source)];
  let i = 0;
  for (const ch of normalize(shorter)) {
    while (i < s.length && s[i] !== ch) i += 1;
    if (i >= s.length) return false;
    i += 1;
  }
  return true;
}

function containsAllLetters(shorter, longer) {
  const counts = new Map();
  for (const ch of normalize(longer)) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of normalize(shorter)) {
    const n = counts.get(ch) ?? 0;
    if (n <= 0) return false;
    counts.set(ch, n - 1);
  }
  return true;
}

// MARK: - Transformation types

const MECHANICAL = new Set([
  'changeOneLetter', 'addOneLetter', 'removeOneLetter', 'anagram',
  'addOneLetterAndRearrange', 'removeOneLetterAndRearrange',
]);

export function isMechanical(type) {
  return MECHANICAL.has(type);
}

const DISPLAY_NAMES = {
  changeOneLetter: 'Change one letter', addOneLetter: 'Add a letter', removeOneLetter: 'Remove a letter',
  anagram: 'Anagram', synonym: 'Synonym', antonym: 'Antonym', homophone: 'Homophone', hiddenWord: 'Hidden word',
  addOneLetterAndRearrange: 'Add + rearrange', removeOneLetterAndRearrange: 'Remove + rearrange',
  prefix: 'Prefix', suffix: 'Suffix', prefixChange: 'Prefix change', suffixChange: 'Suffix change',
  compound: 'Compound', commonPhrase: 'Common phrase', wordContaining: 'Contains word', split: 'Split',
  splitCompound: 'Split compound', mergeIntoCompound: 'Merge compound', semanticPivot: 'Semantic pivot',
  compoundBridge: 'Compound bridge', phraseBridge: 'Phrase bridge', doubleMeaning: 'Double meaning',
  soundChange: 'Sound change', twoCondition: 'Two-condition', rootRelated: 'Root / related',
  rootFamily: 'Root family', beforeAfterPhrase: 'Before / after',
};

function displayName(type) {
  return DISPLAY_NAMES[type] ?? 'Bend';
}

function defaultInstruction(type) {
  switch (type) {
    case 'changeOneLetter': return 'Change exactly one letter of the previous word.';
    case 'addOneLetter': return 'Add one letter to the previous word, keeping the rest in order.';
    case 'removeOneLetter': return 'Remove one letter from the previous word, keeping the rest in order.';
    case 'anagram': return "Rearrange the previous word's letters into a new word.";
    case 'addOneLetterAndRearrange': return 'Add one letter to the previous word, then rearrange.';
    case 'removeOneLetterAndRearrange': return 'Remove one letter from the previous word, then rearrange.';
    case 'synonym': return 'A word with the same meaning as the previous word.';
    case 'antonym': return 'A word with the opposite meaning of the previous word.';
    case 'homophone': return 'A word that sounds like the previous word but is spelled differently.';
    case 'hiddenWord': return 'A word hiding inside the previous word.';
    case 'prefix': return 'Add a beginning to the previous word.';
    case 'suffix': return 'Add an ending to the previous word.';
    case 'compound': case 'compoundBridge': case 'mergeIntoCompound':
      return 'A word that joins the previous word to make a compound.';
    case 'commonPhrase': case 'phraseBridge': case 'beforeAfterPhrase':
      return 'A word that pairs with the previous word in a familiar phrase.';
    case 'semanticPivot': case 'doubleMeaning': return 'Pivot to another meaning of the previous word.';
    default: return 'Follow the clue from the previous word.';
  }
}

function ruleReminder(type, previous) {
  const word = display(previous);
  switch (type) {
    case 'changeOneLetter': return `Change exactly one letter of ${word}.`;
    case 'addOneLetter': return `Add one letter to ${word} without moving the others.`;
    case 'removeOneLetter': return `Remove one letter from ${word} without moving the others.`;
    case 'anagram': return `Use exactly the letters of ${word}, rearranged.`;
    case 'addOneLetterAndRearrange': return `Use every letter of ${word} plus one more.`;
    case 'removeOneLetterAndRearrange': return `Use the letters of ${word} with one taken away.`;
    default: return `That doesn't follow from ${word}.`;
  }
}

function bendPhrase(type) {
  switch (type) {
    case 'changeOneLetter': return 'changing one letter';
    case 'addOneLetter': return 'adding one letter';
    case 'removeOneLetter': return 'removing one letter';
    case 'anagram': return 'rearranging its letters';
    case 'addOneLetterAndRearrange': return 'adding a letter and rearranging';
    case 'removeOneLetterAndRearrange': return 'removing a letter and rearranging';
    default: return displayName(type).toLowerCase();
  }
}

// MARK: - Steps

export function mechanicalOp(step) {
  return step.mechanicalValidation ?? step.operationType;
}

export function stepTitle(step) {
  return step.operationTitle ?? displayName(step.operationType);
}

export function stepInstruction(step) {
  return step.instruction ?? defaultInstruction(mechanicalOp(step));
}

export function extraClue(step) {
  return step.secondaryClue ?? step.hint ?? step.clue;
}

function acceptedAnswers(step) {
  return [step.answer, ...(step.acceptedAnswers ?? [])].map(normalize);
}

// MARK: - Validation

export function satisfiesRule(type, previousWord, answer) {
  const prev = normalize(previousWord);
  const next = normalize(answer);
  const p = [...prev];
  const n = [...next];
  switch (type) {
    case 'changeOneLetter':
      if (p.length !== n.length) return false;
      return p.filter((ch, i) => ch !== n[i]).length === 1;
    case 'addOneLetter':
      return n.length === p.length + 1 && containsLettersInOrder(next, prev);
    case 'removeOneLetter':
      return p.length === n.length + 1 && containsLettersInOrder(prev, next);
    case 'anagram':
      return p.length === n.length && prev !== next && sortedLetters(prev) === sortedLetters(next);
    case 'addOneLetterAndRearrange':
      return n.length === p.length + 1 && containsAllLetters(prev, next);
    case 'removeOneLetterAndRearrange':
      return p.length === n.length + 1 && containsAllLetters(next, prev);
    default:
      return true;
  }
}

export function isAccepted(guess, step, previousWord) {
  const g = normalize(guess);
  if (!acceptedAnswers(step).includes(g)) return false;
  const op = mechanicalOp(step);
  if (!isMechanical(op)) return true;
  return satisfiesRule(op, previousWord, g);
}

/**
 * Checks a guess. Feedback only ever names words the player can already see, so it never leaks an answer.
 * Returns { kind, message, isMiss }.
 */
export function evaluateGuess({
  guess, step, nextStep, authoredPrevious, visiblePrevious, visibleNext, knownLength,
  incomingRuleHidden = false, outgoingRuleHidden = false, clueHidden = false,
}) {
  const result = (kind, message = '') => ({ kind, message, isMiss: kind !== 'correct' && kind !== 'empty' });
  const g = normalize(guess);
  if (!g) return result('empty');

  if (isAccepted(g, step, authoredPrevious)) return result('correct');

  if (visiblePrevious && normalize(visiblePrevious) === g) {
    return result('sameAsNeighbor', `That's ${display(visiblePrevious)} — the bend has to change it.`);
  }
  if (visibleNext && normalize(visibleNext) === g) {
    return result('sameAsNeighbor', `That's ${display(visibleNext)} — the bend has to change it.`);
  }
  if (knownLength != null && [...g].length !== knownLength) {
    return result('wrongLength', `It needs ${knownLength} letters.`);
  }

  const incoming = mechanicalOp(step);
  let satisfiesIncoming = false;
  if (visiblePrevious && isMechanical(incoming)) {
    if (!satisfiesRule(incoming, visiblePrevious, g)) {
      return result('breaksIncomingRule', incomingRuleHidden
        ? `That doesn't bend from ${display(visiblePrevious)}.`
        : ruleReminder(incoming, visiblePrevious));
    }
    // Confirming a guess fits a hidden rule would give the rule away.
    satisfiesIncoming = !incomingRuleHidden;
  }

  if (visibleNext && nextStep) {
    const outgoing = mechanicalOp(nextStep);
    if (isMechanical(outgoing) && !satisfiesRule(outgoing, g, visibleNext)) {
      return result('breaksOutgoingRule', outgoingRuleHidden
        ? `That can't bend into ${display(visibleNext)}.`
        : `It has to bend into ${display(visibleNext)} by ${bendPhrase(outgoing)}.`);
    }
  }

  if (!satisfiesIncoming) {
    return clueHidden
      ? result('incorrectWithoutClue', 'Not quite. Use the words around it, or tap Hint for the clue.')
      : result('incorrect', 'Not quite. Check the clue.');
  }
  return clueHidden
    ? result('fitsRuleButNotLinked', "That fits the rule — but it doesn't link the chain. Try another.")
    : result('fitsRuleButNotIt', "That fits the rule — but it's not the word the clue wants.");
}

// MARK: - Puzzle helpers

/** The final bend lands on the visible target, so only the steps before it are typed. */
export function playableIndices(puzzle) {
  const n = puzzle.steps.length;
  const count = n <= 1 ? n : n - 1;
  return Array.from({ length: count }, (_, i) => i);
}

export function finalStepIndex(puzzle) {
  return puzzle.steps.length <= 1 ? null : puzzle.steps.length - 1;
}

export function puzzleNumber(puzzle) {
  return puzzle.displayNumber ?? puzzle.id;
}

export function difficultyLabel(puzzle) {
  if (puzzle.difficulty <= 2) return 'Easy';
  if (puzzle.difficulty === 3) return 'Medium';
  return 'Hard';
}

export function authoredWordBefore(puzzle, index) {
  if (index <= 0 || !puzzle.steps[index - 1]) return puzzle.startWord;
  return puzzle.steps[index - 1].answer;
}

/** Hard-day concealment: only typed letter bends hide their rule or clue until the first hint. */
export function concealmentFor(puzzle, index) {
  if (!puzzle.concealment) return null;
  if (!playableIndices(puzzle).includes(index)) return null;
  if (!isMechanical(mechanicalOp(puzzle.steps[index]))) return null;
  return puzzle.concealment;
}

export const CONCEALMENT = {
  rules: { hintLabel: 'Show rule', chip: 'Rule shown' },
  clues: { hintLabel: 'Show clue', chip: 'Clue shown' },
  hiddenRuleTitle: 'Letter bend',
  hiddenRuleInstruction: 'Change, add, remove, or rearrange letters. Work out which.',
  hiddenClueText: 'No clue today. Solve it from the words around it.',
};

// MARK: - Dates (the puzzle day rolls over at midnight Eastern for everyone)

const PUZZLE_TZ = 'America/New_York';
const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: PUZZLE_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
});

/** 'YYYY-MM-DD' for the puzzle day containing `date`. */
export function dayKey(date = new Date()) {
  return dayKeyFormatter.format(date);
}

function dayIndex(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

export function daysBetween(fromKey, toKey) {
  return dayIndex(toKey) - dayIndex(fromKey);
}

export function addDays(key, days) {
  const ms = (dayIndex(key) + days) * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

export function longDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

/** Seconds until the next puzzle (midnight Eastern). */
export function secondsUntilNextPuzzle(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: PUZZLE_TZ, hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
  }).formatToParts(now).map((p) => [p.type, p.value]));
  const elapsed = Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second);
  return Math.max(0, 86400 - elapsed);
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (v) => String(v).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatCountdown(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const pad = (v) => String(v).padStart(2, '0');
  return `${Math.floor(total / 3600)}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

// MARK: - Daily puzzle and encores

const ENCORE_ID_OFFSET = 1_000_000;

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/** `puzzles` sorted by date. Mirrors PuzzleService.dailyPuzzle. */
export function dailyPuzzle(puzzles, key) {
  const exact = puzzles.find((p) => p.date === key);
  if (exact) return exact;
  const first = puzzles[0];
  if (daysBetween(first.date, key) < 0) return first;
  const number = first.id + daysBetween(first.date, key);
  const dayOffset = Math.max(0, daysBetween(first.date, key));
  const released = puzzles.filter((p) => daysBetween(p.date, key) > 0);
  const pool = released.length ? released : puzzles;
  const stride = [7, 5, 3, 11, 13, 1].find((s) => gcd(s, pool.length) === 1) ?? 1;
  const source = pool[(dayOffset * stride) % pool.length];
  return { ...source, id: ENCORE_ID_OFFSET + number, date: key, displayNumber: number, encoreOfID: source.id };
}

// MARK: - Attempts and stats

export function newAttempt(puzzleID, now = new Date()) {
  return {
    puzzleID,
    startedAt: now.toISOString(),
    completedAt: null,
    guesses: 0,
    hintsUsed: 0,
    revealsUsed: 0,
    solvedSlots: {},
    slotStatuses: {},
    hintLevels: {},
    misses: {},
    elapsedActiveTime: 0,
  };
}

export function totalMisses(attempt) {
  return Object.values(attempt.misses ?? {}).reduce((a, b) => a + b, 0);
}

export function isPerfect(attempt) {
  return Boolean(attempt.completedAt) && attempt.hintsUsed === 0 && attempt.revealsUsed === 0;
}

export function isFlawless(attempt) {
  return isPerfect(attempt) && totalMisses(attempt) === 0;
}

export function firstTryCount(attempt, indices) {
  return indices.filter((i) => attempt.slotStatuses[i] === 'solved' && (attempt.misses[i] ?? 0) === 0).length;
}

export function newStats() {
  return {
    gamesPlayed: 0, gamesSolved: 0, currentStreak: 0, longestStreak: 0, perfectBends: 0,
    totalSolveTime: 0, totalHints: 0, lastDailySolvedDay: null, solvedPuzzleIDs: [], playedPuzzleIDs: [],
    bestTime: null, flawlessBends: 0,
  };
}

export function currentStreak(stats, today = dayKey()) {
  const last = stats.lastDailySolvedDay;
  if (!last) return 0;
  const gap = daysBetween(last, today);
  return gap === 0 || gap === 1 ? stats.currentStreak : 0;
}

export function statsAfterStarting(stats, puzzle) {
  if (stats.playedPuzzleIDs.includes(puzzle.id)) return stats;
  return { ...stats, gamesPlayed: stats.gamesPlayed + 1, playedPuzzleIDs: [...stats.playedPuzzleIDs, puzzle.id] };
}

export function statsAfterCompleting(stats, puzzle, attempt, { isDaily, today }) {
  const s = { ...stats, solvedPuzzleIDs: [...stats.solvedPuzzleIDs], playedPuzzleIDs: [...stats.playedPuzzleIDs] };
  if (!s.solvedPuzzleIDs.includes(puzzle.id)) {
    if (!s.playedPuzzleIDs.includes(puzzle.id)) {
      s.playedPuzzleIDs.push(puzzle.id);
      s.gamesPlayed += 1;
    }
    s.gamesSolved += 1;
    s.totalSolveTime += attempt.elapsedActiveTime;
    s.totalHints += attempt.hintsUsed;
    s.solvedPuzzleIDs.push(puzzle.id);
    s.bestTime = Math.min(s.bestTime ?? Infinity, attempt.elapsedActiveTime);
    if (isPerfect(attempt)) {
      s.perfectBends += 1;
      if (isFlawless(attempt)) s.flawlessBends += 1;
    }
  }
  if (!isDaily) return s;
  const last = s.lastDailySolvedDay;
  if (last && daysBetween(last, today) === 0) return s;
  s.currentStreak = last && daysBetween(last, today) === 1 ? s.currentStreak + 1 : 1;
  s.longestStreak = Math.max(s.longestStreak, s.currentStreak);
  s.lastDailySolvedDay = today;
  return s;
}

// MARK: - Share

const SHARE_SYMBOL = { unsolved: '⬜️', solved: '🟩', hinted: '🟨', revealed: '🟥' };

export function shareText(puzzle, attempt, stats, today = dayKey()) {
  const indices = playableIndices(puzzle);
  const symbols = indices.map((i) => SHARE_SYMBOL[attempt.slotStatuses[i] ?? 'unsolved']).join('');
  let title = `Bendword #${puzzleNumber(puzzle)}`;
  if (puzzle.encoreOfID != null) title += ' · Encore';
  title += ` · ${difficultyLabel(puzzle)}`;

  const lines = [
    title,
    symbols,
    `${puzzle.steps.length} bends · ⏱ ${formatDuration(attempt.elapsedActiveTime)} · 🎯 ${firstTryCount(attempt, indices)}/${indices.length}`,
  ];
  const aids = [];
  if (isPerfect(attempt)) aids.push(isFlawless(attempt) ? '✨ Flawless' : '✨ Perfect Bend');
  if (attempt.hintsUsed > 0) aids.push(`💡 ${attempt.hintsUsed} hint${attempt.hintsUsed === 1 ? '' : 's'}`);
  if (attempt.revealsUsed > 0) aids.push(`👁 ${attempt.revealsUsed} reveal${attempt.revealsUsed === 1 ? '' : 's'}`);
  const misses = totalMisses(attempt);
  if (misses > 0) aids.push(`✗ ${misses} miss${misses === 1 ? '' : 'es'}`);
  if (aids.length) lines.push(aids.join(' · '));
  const streak = currentStreak(stats, today);
  if (streak > 1) lines.push(`🔥 ${streak}-day streak`);
  lines.push('Bend one word into another.');
  lines.push('A BtownLabs game');
  lines.push(SHARE_URL);
  return lines.join('\n');
}
