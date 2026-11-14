import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  APP_STORE_URL, CONCEALMENT, LETTER_HINT_COUNT, authoredWordBefore, concealmentFor, currentStreak, dayKey,
  difficultyLabel, display, evaluateGuess, extraClue, finalStepIndex, firstTryCount, formatCountdown,
  formatDuration, isFlawless, isPerfect, longDate, newAttempt, normalize, playableIndices, puzzleNumber,
  isMechanical, mechanicalOp, secondsUntilNextPuzzle, shareText, statsAfterCompleting, statsAfterStarting,
  stepInstruction, stepTitle, totalMisses,
} from './engine';
import { introSeen, loadDailyPuzzle, loadSave, markIntroSeen, writeSave } from './data';
import { track, trackOpen } from './analytics';
import Keyboard from './Keyboard';
import { DELETE, ENTER, MAX_GUESS_LENGTH, keyForEvent } from './keys';
import MascotLayer from './mascot/MascotLayer';
import { MASCOT_NAME, MascotDirector } from './mascot/director';
import { SlotLayout } from './mascot/motion';
import { mascotSounds } from './mascot/sounds';
import './game.css';

const STATUS_LABEL = { solved: 'solved', hinted: 'solved with a hint', revealed: 'revealed' };

function firstOpenSlot(puzzle, attempt, after) {
  const indices = playableIndices(puzzle);
  if (!indices.length) return null;
  const start = after == null ? indices[0] : after + 1;
  const ordered = [...indices.filter((i) => i >= start), ...indices.filter((i) => i < start)];
  return ordered.find((i) => attempt.solvedSlots[i] == null) ?? null;
}

// MARK: - Game state (mirrors the app's GameViewModel)

function useBendword(puzzle, active) {
  const [save, setSave] = useState(() => loadSave());
  const [attempt, setAttempt] = useState(() => save.attempts[puzzle.id] ?? { ...newAttempt(puzzle.id), day: puzzle.date });
  const [selected, setSelected] = useState(() => firstOpenSlot(puzzle, attempt, null) ?? 0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [shake, setShake] = useState(0);
  const [justSolved, setJustSolved] = useState(null);
  /** Why the most recent wrong guess was wrong, for Bendit's reaction. */
  const [lastMiss, setLastMiss] = useState(null);
  /** Incremented when a word is solved (not revealed) with more words to go, for Bendit's cheer. */
  const [cheers, setCheers] = useState(0);
  /** The puzzle is finished and Bendit's finale is playing; the result comes after. */
  const [awaitingFinale, setAwaitingFinale] = useState(false);
  /** When set, finishing waits for the finale (`finishFinale`) before showing the result. */
  const playsFinale = useRef(false);
  const guessRef = useRef('');
  const updateGuess = (value) => {
    guessRef.current = value;
    setGuess(value);
  };
  const lastWrong = useRef({});
  const sessionStart = useRef(null);
  const [live, setLive] = useState(0);

  const stats = save.stats;
  const indices = useMemo(() => playableIndices(puzzle), [puzzle]);
  const finalIndex = finalStepIndex(puzzle);
  const completed = Boolean(attempt.completedAt);

  // Save whenever the attempt or stats change.
  const latest = useRef(null);
  useEffect(() => {
    latest.current = { save, attempt };
    writeSave({ attempts: { ...save.attempts, [puzzle.id]: attempt }, stats: save.stats });
  }, [attempt, save, puzzle.id]);

  // Active-time clock: runs only while the tab is visible and the puzzle is open.
  const pause = useCallback(() => {
    if (sessionStart.current == null) return;
    const delta = (Date.now() - sessionStart.current) / 1000;
    sessionStart.current = null;
    setLive(0);
    setAttempt((a) => ({ ...a, elapsedActiveTime: a.elapsedActiveTime + delta }));
    // The page may be closing, so save now rather than after the next render.
    if (latest.current) {
      const { save: s, attempt: a } = latest.current;
      const paused = { ...a, elapsedActiveTime: a.elapsedActiveTime + delta };
      latest.current = { save: s, attempt: paused };
      writeSave({ attempts: { ...s.attempts, [paused.puzzleID]: paused }, stats: s.stats });
    }
  }, []);
  const resume = useCallback(() => {
    if (active && sessionStart.current == null && !completed && document.visibilityState === 'visible') {
      sessionStart.current = Date.now();
    }
  }, [active, completed]);
  useEffect(() => {
    if (active) resume();
    const onVisibility = () => (document.visibilityState === 'visible' ? resume() : pause());
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', pause);
    const timer = window.setInterval(() => {
      setLive(sessionStart.current != null ? (Date.now() - sessionStart.current) / 1000 : 0);
    }, 1000);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', pause);
      window.clearInterval(timer);
    };
  }, [active, pause, resume]);

  // Saves the running clock now and then, so a closed tab or crash costs seconds of play time
  // rather than the whole session.
  useEffect(() => {
    if (!active || completed) return undefined;
    const checkpoint = window.setInterval(() => {
      if (!latest.current || sessionStart.current == null) return;
      const { save: s, attempt: a } = latest.current;
      const running = (Date.now() - sessionStart.current) / 1000;
      writeSave({ attempts: { ...s.attempts, [puzzle.id]: { ...a, elapsedActiveTime: a.elapsedActiveTime + running } }, stats: s.stats });
    }, 15000);
    return () => window.clearInterval(checkpoint);
  }, [active, completed, puzzle.id]);

  const elapsed = attempt.elapsedActiveTime + (completed ? 0 : live);

  const isSolved = (i) => attempt.solvedSlots[i] != null;
  const hintLevel = (i) => attempt.hintLevels[i] ?? 0;
  const concealment = (i) => concealmentFor(puzzle, i);
  const concealHints = (i) => (concealment(i) ? 1 : 0);
  const maxHintLevel = (i) => LETTER_HINT_COUNT + concealHints(i);
  const letterHintLevel = (i) => Math.max(0, hintLevel(i) - concealHints(i));
  const isRuleHidden = (i) => concealment(i) === 'rules' && hintLevel(i) === 0 && !isSolved(i);
  const isClueHidden = (i) => concealment(i) === 'clues' && hintLevel(i) === 0 && !isSolved(i);
  const hasOpenSelection = !completed && indices.includes(selected) && !isSolved(selected);
  const canUseHint = hasOpenSelection && hintLevel(selected) < maxHintLevel(selected);

  const visibleBefore = (i) => (i === 0 ? puzzle.startWord : attempt.solvedSlots[i - 1] ?? null);
  const visibleAfter = (i) => {
    if (i + 1 === finalIndex) return puzzle.targetWord;
    return attempt.solvedSlots[i + 1] ?? null;
  };

  function nextHintLabel() {
    if (!hasOpenSelection) return null;
    const c = concealment(selected);
    if (c && hintLevel(selected) === 0) return CONCEALMENT[c].hintLabel;
    return ['First letter', 'Letter count', 'Extra clue'][letterHintLevel(selected)] ?? null;
  }

  function hintChips(i) {
    const step = puzzle.steps[i];
    const chips = [];
    const c = concealment(i);
    if (c && hintLevel(i) >= 1) chips.push(CONCEALMENT[c].chip);
    if (letterHintLevel(i) >= 1) chips.push(`Starts with ${display(step.answer).slice(0, 1)}`);
    if (letterHintLevel(i) >= 2) chips.push(`${[...normalize(step.answer)].length} letters`);
    return chips;
  }

  function withStarted(currentStats) {
    return statsAfterStarting(currentStats, puzzle);
  }

  const startSent = useRef(false);
  function markStarted() {
    if (!startSent.current && !stats.playedPuzzleIDs.includes(puzzle.id)) {
      startSent.current = true;
      track('start', { puzzle: puzzleNumber(puzzle) });
    }
    setSave((s) => ({ ...s, stats: withStarted(s.stats) }));
  }

  function solve(a, index, revealed) {
    const existing = a.slotStatuses[index] ?? 'unsolved';
    let next = {
      ...a,
      solvedSlots: { ...a.solvedSlots, [index]: puzzle.steps[index].answer },
      slotStatuses: { ...a.slotStatuses, [index]: revealed ? 'revealed' : existing === 'hinted' ? 'hinted' : 'solved' },
    };
    setJustSolved(index);
    window.setTimeout(() => setJustSolved((s) => (s === index ? null : s)), 450);
    const solvedCount = indices.filter((i) => next.solvedSlots[i] != null).length;
    if (solvedCount === indices.length) {
      if (finalIndex != null) {
        next.solvedSlots = { ...next.solvedSlots, [finalIndex]: puzzle.targetWord };
        next.slotStatuses = { ...next.slotStatuses, [finalIndex]: 'solved' };
      }
      if (!next.completedAt) {
        if (playsFinale.current) setAwaitingFinale(true);
        const running = sessionStart.current != null ? (Date.now() - sessionStart.current) / 1000 : 0;
        sessionStart.current = null;
        setLive(0);
        const now = new Date();
        next = {
          ...next,
          elapsedActiveTime: next.elapsedActiveTime + running,
          completedAt: now.toISOString(),
        };
        const today = dayKey(now);
        // Finishing yesterday's daily after midnight doesn't count toward today's streak.
        const isDaily = puzzle.date === today;
        const nextStats = statsAfterCompleting(withStarted(save.stats), puzzle, next, { isDaily, today });
        setSave((s) => ({ ...s, stats: nextStats }));
        track('solve', {
          puzzle: puzzleNumber(puzzle),
          secs: next.elapsedActiveTime,
          hints: next.hintsUsed,
          reveals: next.revealsUsed,
          misses: totalMisses(next),
          perfect: isPerfect(next),
          streak: currentStreak(nextStats, today),
        });
      }
    } else {
      if (!revealed) setCheers((n) => n + 1);
      const open = firstOpenSlot(puzzle, next, index);
      if (open != null) setSelected(open);
    }
    return next;
  }

  function submit() {
    if (!hasOpenSelection) return;
    const index = selected;
    const step = puzzle.steps[index];
    const outcome = evaluateGuess({
      guess,
      step,
      nextStep: puzzle.steps[index + 1],
      authoredPrevious: authoredWordBefore(puzzle, index),
      visiblePrevious: visibleBefore(index),
      visibleNext: visibleAfter(index),
      knownLength: letterHintLevel(index) >= 2 ? [...normalize(step.answer)].length : null,
      incomingRuleHidden: isRuleHidden(index),
      outgoingRuleHidden: isRuleHidden(index + 1),
      clueHidden: isClueHidden(index),
    });
    if (outcome.kind === 'empty') return;
    markStarted();

    if (outcome.kind === 'correct') {
      const clean = (attempt.slotStatuses[index] ?? 'unsolved') === 'unsolved' && (attempt.misses[index] ?? 0) === 0;
      updateGuess('');
      setFeedback({ text: `${display(step.answer)} — ${clean ? 'clean bend!' : 'nice bend.'}`, tone: 'success', id: Date.now() });
      setAttempt(solve({ ...attempt, guesses: attempt.guesses + 1 }, index, false));
      return;
    }
    const g = normalize(guess);
    const counted = lastWrong.current[index] !== g;
    if (counted) {
      lastWrong.current[index] = g;
      setAttempt((a) => ({ ...a, guesses: a.guesses + 1, misses: { ...a.misses, [index]: (a.misses[index] ?? 0) + 1 } }));
    }
    setFeedback({ text: outcome.message, tone: 'warning', id: Date.now() });
    setLastMiss({ kind: outcome.kind, word: guess, misses: (attempt.misses[index] ?? 0) + (counted ? 1 : 0), id: Date.now() });
    setShake((n) => n + 1);
  }

  function takeHint() {
    if (!canUseHint) return;
    const index = selected;
    markStarted();
    setAttempt((a) => ({
      ...a,
      hintLevels: { ...a.hintLevels, [index]: (a.hintLevels[index] ?? 0) + 1 },
      hintsUsed: a.hintsUsed + 1,
      slotStatuses: { ...a.slotStatuses, [index]: 'hinted' },
    }));
    setFeedback(null);
  }

  function reveal() {
    if (!hasOpenSelection) return;
    const index = selected;
    markStarted();
    updateGuess('');
    setFeedback({ text: `Revealed ${display(puzzle.steps[index].answer)}.`, tone: 'info', id: Date.now() });
    setAttempt(solve({ ...attempt, revealsUsed: attempt.revealsUsed + 1 }, index, true));
  }

  function select(index) {
    if (completed || !indices.includes(index) || isSolved(index) || index === selected) return;
    setSelected(index);
    updateGuess('');
    setFeedback(null);
  }

  function changeGuess(value) {
    updateGuess(value);
    if (feedback?.tone === 'warning') setFeedback(null);
  }

  /** The first letter of the open word's answer, once that hint is unlocked. */
  const hintedFirstLetter = hasOpenSelection && letterHintLevel(selected) >= 1
    ? ([...normalize(puzzle.steps[selected].answer)][0]?.toUpperCase() ?? null) : null;

  /** Keyboard input: adds one letter to the guess. */
  function typeLetter(letter) {
    if (!hasOpenSelection || !/^[a-z]$/i.test(letter) || guessRef.current.length >= MAX_GUESS_LENGTH) return;
    guessRef.current += letter.toUpperCase();
    changeGuess(guessRef.current);
  }

  /** Keyboard input: removes the last letter of the guess. */
  function deleteLetter() {
    if (!hasOpenSelection || !guessRef.current) return;
    guessRef.current = guessRef.current.slice(0, -1);
    changeGuess(guessRef.current);
  }

  /**
   * Clears the guess if it's still `word` (Bendit is taking it away). An unlocked first-letter hint
   * stays typed. Returns false when the player has already changed it.
   */
  function clearGuess(word) {
    if (guessRef.current !== word) return false;
    guessRef.current = hintedFirstLetter ?? '';
    updateGuess(guessRef.current);
    return true;
  }

  /** The finale is over (or was skipped): show the result. */
  const finishFinale = useCallback(() => setAwaitingFinale(false), []);

  return {
    puzzle, attempt, stats, indices, finalIndex, completed, elapsed, selected, guess, feedback, shake, justSolved,
    hasOpenSelection, canUseHint, isSolved, hintLevel, maxHintLevel, letterHintLevel, isRuleHidden, isClueHidden,
    visibleBefore, nextHintLabel, hintChips, submit, takeHint, reveal, select, changeGuess,
    lastMiss, cheers, awaitingFinale, playsFinale, finishFinale, hintedFirstLetter, typeLetter, deleteLetter, clearGuess,
    guessRef,
  };
}

// MARK: - Views

function Progress({ game }) {
  const { indices, attempt } = game;
  const solved = indices.filter((i) => attempt.solvedSlots[i] != null).length;
  return (
    <div className="bwg-progress" role="img" aria-label={`${solved} of ${indices.length} words solved`}>
      {indices.map((i) => (
        <span key={i} className={`bwg-seg is-${attempt.solvedSlots[i] != null ? attempt.slotStatuses[i] : 'unsolved'}`} />
      ))}
      <small aria-hidden="true">{solved}/{indices.length}</small>
    </div>
  );
}

/** Letter-based rules edit the base word, so the box reminds the player what to start from. */
function guessPlaceholder(step, base, index) {
  if (isMechanical(mechanicalOp(step)) && base) return `Bend ${display(base)}…`;
  return `Type word ${index + 1}`;
}

/**
 * The guess as typed on the Bendword keyboard. Once the letter-count hint is unlocked it shows one
 * underlined place per letter, laid out like the app's (and where Bendit walks).
 */
function GuessDisplay({ guess, placeholder, letterCount, underlinesShown, shake, tone, label, director }) {
  const letters = [...guess.toUpperCase()];
  const total = letterCount == null ? 0 : Math.max(letterCount, letters.length);
  const shown = letterCount == null ? 0 : Math.min(letterCount, underlinesShown ?? letterCount);
  const boxRef = useRef(null);
  const textRef = useCallback((el) => director.attachGuessText(el), [director]);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const box = boxRef.current;
    director.attachGuessBox(box);
    if (!box) return undefined;
    const observer = new ResizeObserver(() => setWidth(box.clientWidth));
    observer.observe(box);
    return () => {
      observer.disconnect();
      director.detachGuessBox(box);
    };
  }, [director]);
  const slots = new SlotLayout(total, width || 300);

  return (
    <div className="bwg-guess-wrap" ref={boxRef}>
      <div className={`bwg-guess is-${tone ?? 'none'} ${shake ? `is-shaking-${shake % 2}` : ''}`}
        role="status" aria-live="off" aria-label={`${label}: ${guess ? letters.join(' ') : 'empty'}${letterCount ? `, ${letterCount} letters` : ''}`}>
        {letterCount != null ? (
          <div className="bwg-places" style={{ gap: slots.spacing }}>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className="bwg-place" style={{ width: slots.width }}>
                {letters[i] ?? ''}
                <i className={`${i === letters.length ? 'is-next' : ''} ${i < shown ? 'is-shown' : ''}`} />
              </span>
            ))}
          </div>
        ) : guess ? (
          <><span className="bwg-typed" ref={textRef}>{letters.join('')}</span><span className="bwg-caret" /></>
        ) : (
          <><span className="bwg-caret" /><span className="bwg-placeholder">{placeholder}</span></>
        )}
      </div>
    </div>
  );
}

function BendCard({ game, director, revealedSlots }) {
  const { puzzle, selected, feedback, shake } = game;
  const [confirming, setConfirming] = useState(false);
  const step = puzzle.steps[selected];
  const base = game.visibleBefore(selected);
  const clueHidden = game.isClueHidden(selected);
  const ruleHidden = game.isRuleHidden(selected);
  const chips = game.hintChips(selected);
  const extra = game.letterHintLevel(selected) >= 3 ? extraClue(step) : null;
  const hintsLeft = game.maxHintLevel(selected) - game.hintLevel(selected);
  const label = game.nextHintLabel();

  return (
    <section className="bwg-card" aria-labelledby="bwg-card-title">
      <div className="bwg-card-top">
        <div>
          <p className="bwg-kicker" id="bwg-card-title">Bend {game.indices.indexOf(selected) + 1} from</p>
          <p className="bwg-base">{base ? display(base) : '?'}</p>
        </div>
        <div className="bwg-tools">
          <button type="button" className="bwg-tool" onClick={() => game.takeHint()} disabled={!game.canUseHint}
            aria-label={label ? `Hint: ${label}. ${hintsLeft} left` : 'No hints left'}>
            <span aria-hidden="true">💡</span> {label ? `Hint: ${label}` : 'No hints left'} <small>{hintsLeft}</small>
          </button>
          <button type="button" className="bwg-tool is-reveal" onClick={() => setConfirming(true)} aria-label="Reveal this word">
            <span aria-hidden="true">👁</span> Reveal
          </button>
        </div>
      </div>

      {confirming && (
        <div className="bwg-confirm" role="alertdialog" aria-label="Reveal this word?">
          <p><strong>Reveal this word?</strong> It shows red in your result and ends a Perfect Bend.</p>
          <div>
            <button type="button" className="bwg-btn is-danger" onClick={() => { setConfirming(false); game.reveal(); }}>Reveal word</button>
            {game.canUseHint && label && (
              <button type="button" className="bwg-btn is-quiet" onClick={() => { setConfirming(false); game.takeHint(); }}>
                Use a hint instead ({label})
              </button>
            )}
            <button type="button" className="bwg-btn is-quiet" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="bwg-clue">
        <p className="bwg-kicker">Clue</p>
        <p className={clueHidden ? 'is-hidden' : ''}>{clueHidden ? CONCEALMENT.hiddenClueText : step.clue}</p>
        {extra && <p className="bwg-extra">{extra}</p>}
      </div>
      <p className="bwg-rule">
        <strong>Rule · {ruleHidden ? CONCEALMENT.hiddenRuleTitle : stepTitle(step)}</strong>
        <span>{ruleHidden ? CONCEALMENT.hiddenRuleInstruction : stepInstruction(step)}</span>
      </p>
      {chips.length > 0 && (
        <ul className="bwg-chips" aria-label="Hints used">{chips.map((c) => <li key={c}>{c}</li>)}</ul>
      )}

      <GuessDisplay
        guess={game.guess} placeholder={guessPlaceholder(step, base, selected)}
        letterCount={game.letterHintLevel(selected) >= 2 ? [...normalize(step.answer)].length : null}
        underlinesShown={revealedSlots} shake={shake} tone={feedback?.tone} label={`Guess for word ${selected + 1}`}
        director={director}
      />
      <p id="bwg-feedback" className={`bwg-feedback is-${feedback?.tone ?? 'none'}`} role="status" aria-live="polite">
        {feedback?.text ?? ' '}
      </p>
    </section>
  );
}

function Chain({ game, onPick }) {
  const { puzzle, attempt, selected, completed, finalIndex, justSolved } = game;
  const showDetail = completed;
  return (
    <ol className="bwg-chain" aria-label="Word chain">
      <li className="bwg-word is-fixed"><span className="bwg-tag">Start</span><strong>{display(puzzle.startWord)}</strong></li>
      {puzzle.steps.map((step, i) => {
        const isFinal = i === finalIndex;
        const ruleHidden = !isFinal && game.isRuleHidden(i);
        const word = attempt.solvedSlots[i];
        const status = attempt.slotStatuses[i] ?? 'unsolved';
        return (
          <li key={i} className="bwg-link">
            <p className="bwg-connector">
              <span aria-hidden="true">↓</span> {ruleHidden ? CONCEALMENT.hiddenRuleTitle : stepTitle(step)}
              {isFinal && <em> · {step.clue}</em>}
            </p>
            {isFinal ? (
              <div className={`bwg-word is-fixed is-target ${completed ? 'is-reached' : ''}`}>
                <span className="bwg-tag">Target</span>
                <strong>{display(puzzle.targetWord)}{completed && <span className="bwg-reached"><span aria-hidden="true">✓ </span>Reached</span>}</strong>
                {showDetail && <p className="bwg-why">{step.explanation}</p>}
              </div>
            ) : word ? (
              <div className={`bwg-word is-${status} ${justSolved === i ? 'is-pop' : ''}`}>
                <span className="bwg-tag">{i + 1}</span><strong>{display(word)}</strong>
                <span className="bwg-sr">{STATUS_LABEL[status]}</span>
                {showDetail && <p className="bwg-why">{step.explanation}</p>}
              </div>
            ) : (
              <button type="button" className={`bwg-word is-open ${i === selected ? 'is-selected' : ''}`}
                onClick={() => { onPick(); game.select(i); }}
                aria-label={`Word ${i + 1}, unsolved${i === selected ? ', selected' : ''}`} aria-current={i === selected ? 'step' : undefined}>
                <span className="bwg-tag">{i + 1}</span>
                <strong className="bwg-blank">{game.hintChips(i).length ? game.hintChips(i).join(' · ') : 'Tap to solve'}</strong>
              </button>
            )}
          </li>
        );
      })}
      {finalIndex == null && (
        <li className="bwg-word is-fixed is-target"><span className="bwg-tag">Target</span><strong>{display(puzzle.targetWord)}</strong></li>
      )}
    </ol>
  );
}

function Result({ game }) {
  const { puzzle, attempt, stats, indices } = game;
  const [copied, setCopied] = useState('');
  const [left, setLeft] = useState(() => secondsUntilNextPuzzle());
  useEffect(() => {
    const t = window.setInterval(() => setLeft(secondsUntilNextPuzzle()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const text = shareText(puzzle, attempt, stats);
  const streak = currentStreak(stats);
  const grid = text.split('\n')[1];
  const firstTry = firstTryCount(attempt, indices);

  async function share() {
    track('share', { puzzle: puzzleNumber(puzzle) });
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied('Copied. Paste it into a group chat.');
    } catch (error) {
      if (error?.name !== 'AbortError') setCopied('Copy failed. Select the text below instead.');
    }
  }

  const badge = isFlawless(attempt) ? 'Flawless' : isPerfect(attempt) ? 'Perfect Bend' : null;
  return (
    <section className="bwg-result" aria-labelledby="bwg-result-title">
      <p className="bwg-kicker">Bendword #{puzzleNumber(puzzle)} · {difficultyLabel(puzzle)}</p>
      <h2 id="bwg-result-title">{badge ? `${badge}!` : 'Solved!'}</h2>
      <p className="bwg-grid" aria-label="Result grid">{grid}</p>
      <dl className="bwg-facts">
        <div><dt>Time</dt><dd>{formatDuration(attempt.elapsedActiveTime)}</dd></div>
        <div><dt>First try</dt><dd>{firstTry}/{indices.length}</dd></div>
        <div><dt>Hints</dt><dd>{attempt.hintsUsed}</dd></div>
        <div><dt>Streak</dt><dd>{streak}</dd></div>
      </dl>
      <button type="button" className="bwg-btn is-wide" onClick={share}>Share result</button>
      <p className="bwg-copied" role="status">{copied}</p>
      {copied.startsWith('Copy failed') && <textarea className="bwg-sharetext" readOnly value={text} rows={8} />}
      <p className="bwg-next">Next puzzle in <strong>{formatCountdown(left)}</strong></p>
      <p className="bwg-final">{puzzle.finalExplanation}</p>
      {totalMisses(attempt) > 0 && <p className="bwg-small">{totalMisses(attempt)} wrong {totalMisses(attempt) === 1 ? 'guess' : 'guesses'} along the way.</p>}
    </section>
  );
}

function Intro({ onClose }) {
  return (
    <section className="bwg-intro" aria-labelledby="bwg-intro-title">
      <h2 id="bwg-intro-title">How to play</h2>
      <ol>
        <li>Get from the <strong>start</strong> word to the <strong>target</strong> one bend at a time.</li>
        <li>Each bend has a <strong>clue</strong> and a <strong>rule</strong>, like “change one letter” or “synonym.”</li>
        <li>Your answer becomes the next base word. Stuck? Take a hint or reveal the word.</li>
      </ol>
      <button type="button" className="bwg-btn" onClick={onClose}>Start playing</button>
    </section>
  );
}

function AppNudge() {
  return (
    <aside className="bwg-app">
      <img src="/images/bendword/icon.png" alt="" width="44" height="44" />
      <p><strong>Get Bendword for iPhone and iPad.</strong> The full archive, daily reminders, and stats. Free.</p>
      <a className="bwg-btn is-quiet" href={APP_STORE_URL}>App Store <span aria-hidden="true">↗</span></a>
    </aside>
  );
}

// MARK: - Bendit settings (this browser only)

const MASCOT_KEY = 'bendword.web.mascot';
const SOUND_KEY = 'bendword.web.sound';
const readSetting = (key) => { try { return window.localStorage.getItem(key) !== 'off'; } catch { return true; } };
const writeSetting = (key, on) => { try { window.localStorage.setItem(key, on ? 'on' : 'off'); } catch { /* ignore */ } };

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function BenditPrefs({ mascotOn, soundOn, reduced, onMascot, onSound }) {
  return (
    <div className="bwg-prefs" role="group" aria-label={`${MASCOT_NAME} settings`}>
      <span>{MASCOT_NAME}</span>
      <button type="button" aria-pressed={mascotOn} onClick={() => onMascot(!mascotOn)} disabled={reduced}>
        {mascotOn ? 'On' : 'Off'}
      </button>
      <span>Sound</span>
      <button type="button" aria-pressed={soundOn} onClick={() => onSound(!soundOn)} disabled={reduced || !mascotOn}>
        {soundOn ? 'On' : 'Off'}
      </button>
      {reduced && <small>{MASCOT_NAME} sits out while your device reduces motion.</small>}
    </div>
  );
}

function Board({ puzzle }) {
  const [showIntro, setShowIntro] = useState(() => !introSeen());
  const game = useBendword(puzzle, !showIntro);
  const closeIntro = () => { markIntroSeen(); setShowIntro(false); };
  const openStreak = currentStreak(game.stats);
  useEffect(() => { trackOpen(openStreak); }, [openStreak]);
  const today = dayKey();

  // Bendit, who lives in the keyboard.
  const [director] = useState(() => new MascotDirector());
  const mascot = useSyncExternalStore(director.subscribe, director.getState);
  const [mascotOn, setMascotOn] = useState(() => readSetting(MASCOT_KEY));
  const [soundOn, setSoundOn] = useState(() => readSetting(SOUND_KEY));
  const reduced = useReducedMotion();
  const showsMascot = mascotOn && !reduced;
  useEffect(() => {
    director.enabled = showsMascot;
    game.playsFinale.current = showsMascot;
    mascotSounds.enabled = showsMascot && soundOn;
    if (!showsMascot) director.stop();
  }, [director, game.playsFinale, showsMascot, soundOn]);
  useEffect(() => () => director.stop(), [director]);
  // Browsers only play sound after the player interacts with the page.
  useEffect(() => {
    const unlock = () => mascotSounds.unlock();
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    return () => {
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
    };
  }, []);
  // He steps away while the page is hidden, or the intro covers the puzzle.
  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState !== 'visible') director.stop(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [director]);
  useEffect(() => { if (showIntro) director.stop(); }, [director, showIntro]);

  // A new word: anything he was doing in the answer box no longer applies.
  useEffect(() => {
    director.wordChanged();
    director.noteActivity(true);
  }, [director, game.selected]);
  useEffect(() => { director.noteActivity(); }, [director, game.guess]);

  // Each hint gets its own moment.
  const hintProgress = { slot: game.selected, level: game.hintLevel(game.selected), letterLevel: game.letterHintLevel(game.selected) };
  const lastHint = useRef(hintProgress);
  useEffect(() => {
    const old = lastHint.current;
    lastHint.current = hintProgress;
    if (old.slot !== hintProgress.slot || hintProgress.level <= old.level) return;
    const step = puzzle.steps[hintProgress.slot];
    if (hintProgress.letterLevel <= old.letterLevel) {
      // A hard day's hidden rule or clue just came back.
      director.taDa();
    } else if (hintProgress.letterLevel === 1) {
      // He stomps the first letter, which types it into an empty guess.
      const letter = [...normalize(step.answer)][0]?.toUpperCase();
      if (letter) director.stompFirstLetter(letter, () => { if (!game.guessRef?.current) game.typeLetter(letter); });
    } else if (hintProgress.letterLevel === 2) {
      director.countLetters([...normalize(step.answer)].length, [...game.guess].length);
    } else {
      director.showClue(extraClue(step));
    }
  });

  // A wrong guess.
  useEffect(() => {
    const miss = game.lastMiss;
    if (!miss) return;
    const knownLength = game.hasOpenSelection && game.letterHintLevel(game.selected) >= 2
      ? [...normalize(puzzle.steps[game.selected].answer)].length : null;
    director.reactToMiss(miss.kind, miss.misses, miss.word, knownLength, () => game.clearGuess(miss.word));
    // Only when a new miss arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [director, game.lastMiss]);

  // A solved word.
  useEffect(() => { if (game.cheers > 0) director.cheer(); }, [director, game.cheers]);

  // The puzzle is solved: he spells the target word across the keyboard, then the result shows.
  useEffect(() => {
    if (!game.awaitingFinale) return;
    const { attempt } = game;
    let headline = isFlawless(attempt) ? 'Flawless!' : isPerfect(attempt) ? 'Perfect Bend!' : 'Solved!';
    const streak = currentStreak(game.stats);
    if (puzzle.date === dayKey() && streak >= 2) headline += `\n🔥 ${streak}-day streak`;
    const started = director.finale(normalize(puzzle.targetWord).toUpperCase(), headline, isPerfect(attempt), game.finishFinale);
    if (!started) game.finishFinale();
    // Once, when the finale starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [director, game.awaitingFinale]);

  // Physical keyboards type into the guess and show each press on the matching on-screen key.
  const [physicalKey, setPhysicalKey] = useState(null);
  const releaseTimer = useRef(null);
  const keyboardUp = game.hasOpenSelection || game.awaitingFinale;
  const latestGame = useRef(game);
  useEffect(() => { latestGame.current = game; });
  useEffect(() => {
    if (!keyboardUp || showIntro) return undefined;
    const onKeyDown = (event) => {
      const key = keyForEvent(event);
      if (!key) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      // Let a focused button or link activate with Enter.
      if (key === ENTER && target instanceof HTMLElement && target.closest('button, a') && !target.closest('.bwg-keys')) return;
      event.preventDefault();
      const current = latestGame.current;
      // Any key skips the finale straight to the result.
      if (current.awaitingFinale) {
        if (!event.repeat) director.stop();
        return;
      }
      setPhysicalKey(key);
      clearTimeout(releaseTimer.current);
      // Key-up normally releases the key; this is a fallback if one never arrives.
      releaseTimer.current = setTimeout(() => setPhysicalKey(null), 600);
      if (key === DELETE) current.deleteLetter();
      else if (event.repeat) return; // only delete repeats when held
      else if (key === ENTER) current.submit();
      else current.typeLetter(key);
    };
    const onKeyUp = (event) => {
      const key = keyForEvent(event) ?? (event.key.length === 1 ? event.key.toUpperCase() : null);
      setPhysicalKey((current) => (current === key ? null : current));
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      clearTimeout(releaseTimer.current);
    };
  }, [director, keyboardUp, showIntro]);

  const onKey = (action) => () => {
    if (game.awaitingFinale) director.stop();
    else action();
  };
  const showResult = game.completed && !game.awaitingFinale;

  return (
    // Clicking a button with the mouse doesn't keep keyboard focus on it, so Enter submits the
    // guess instead of pressing the button again. Tabbing to a button still lets Enter press it.
    <div className="bwg" onMouseDown={(e) => { if (e.target instanceof Element && e.target.closest('button')) e.preventDefault(); }}>
      <header className="bwg-head">
        <p className="bwg-meta">
          <strong>#{puzzleNumber(puzzle)}</strong> · {longDate(puzzle.date)}
          {puzzle.encoreOfID != null && <span className="bwg-pill">Encore</span>}
          {puzzle.date !== today && (
            <button type="button" className="bwg-pill is-new" onClick={() => window.location.reload()}>New puzzle ↻</button>
          )}
          <span className="bwg-spacer" />
          {!game.completed && <span className="bwg-timer" aria-label="Elapsed time">{formatDuration(game.elapsed)}</span>}
          <span className="bwg-pill is-level">{difficultyLabel(puzzle)}</span>
        </p>
        <div className="bwg-goal">
          <h1 className="bwg-goalwords" aria-label={`Bend ${puzzle.startWord} into ${puzzle.targetWord}`}>
            {display(puzzle.startWord)} <span aria-hidden="true">→</span> {display(puzzle.targetWord)}
          </h1>
          <Progress game={game} />
        </div>
      </header>

      {showIntro && !game.completed && <Intro onClose={closeIntro} />}
      {showResult && <Result game={game} />}
      {!showIntro && game.hasOpenSelection && (
        <BendCard key={game.selected} game={game} director={director} revealedSlots={mascot.revealedSlots} />
      )}
      {!showIntro && keyboardUp && (
        <Keyboard
          keyboardRef={director.attachKeyboard}
          hintedLetter={game.guess ? null : game.hintedFirstLetter}
          canSubmit={normalize(game.guess).length > 0 || game.awaitingFinale}
          pressedKey={physicalKey ?? mascot.stompedKey}
          openKey={mascot.openKey}
          litKeys={mascot.litKeys}
          onLetter={(letter) => onKey(() => game.typeLetter(letter))()}
          onDelete={onKey(game.deleteLetter)}
          onSubmit={onKey(game.submit)}
        />
      )}
      {game.awaitingFinale && (
        <button type="button" className="bwg-link-btn" onClick={() => director.stop()}>Skip to result</button>
      )}
      <Chain game={game} onPick={closeIntro} />
      <AppNudge />
      {!showIntro && !game.completed && (
        <button type="button" className="bwg-link-btn" onClick={() => setShowIntro(true)}>How to play</button>
      )}
      <BenditPrefs
        mascotOn={mascotOn} soundOn={soundOn} reduced={reduced}
        onMascot={(on) => { setMascotOn(on); writeSetting(MASCOT_KEY, on); }}
        onSound={(on) => { setSoundOn(on); writeSetting(SOUND_KEY, on); if (on) mascotSounds.unlock(); }}
      />
      <MascotLayer director={director} />
    </div>
  );
}

export default function Game() {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    loadDailyPuzzle()
      .then((puzzle) => alive && setState({ status: 'ready', puzzle }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => { alive = false; };
  }, []);

  if (state.status === 'loading') return <div className="bwg bwg-loading" aria-busy="true">Loading today’s puzzle…</div>;
  if (state.status === 'error') {
    return (
      <div className="bwg bwg-loading">
        <p>Today’s puzzle didn’t load. Check your connection and reload.</p>
        <a className="bwg-btn" href={APP_STORE_URL}>Play in the app</a>
      </div>
    );
  }
  return <Board puzzle={state.puzzle} />;
}
