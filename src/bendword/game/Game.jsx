import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APP_STORE_URL, CONCEALMENT, LETTER_HINT_COUNT, authoredWordBefore, concealmentFor, currentStreak, dayKey,
  difficultyLabel, display, evaluateGuess, extraClue, finalStepIndex, firstTryCount, formatCountdown,
  formatDuration, isFlawless, isPerfect, longDate, newAttempt, normalize, playableIndices, puzzleNumber,
  secondsUntilNextPuzzle, shareText, statsAfterCompleting, statsAfterStarting, stepInstruction, stepTitle,
  totalMisses,
} from './engine';
import { introSeen, loadDailyPuzzle, loadSave, markIntroSeen, writeSave } from './data';
import { track, trackOpen } from './analytics';
import Keyboard from './Keyboard';
import Mascot from './Mascot';
import { DELETE, ENTER, MAX_GUESS_LENGTH, keyForEvent } from './keys';
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
  const [lastMiss, setLastMiss] = useState(null);
  const [mascotEvent, setMascotEvent] = useState(null);
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

  // Keep a running attempt no more than 15 seconds behind if the browser kills the tab.
  useEffect(() => {
    if (!active || completed) return undefined;
    const checkpoint = window.setInterval(() => {
      if (!latest.current) return;
      const { save: s, attempt: a } = latest.current;
      const running = sessionStart.current == null ? 0 : (Date.now() - sessionStart.current) / 1000;
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
    setMascotEvent({ id: Date.now(), kind: 'cheer', sound: 'pop', duration: 1500 });
    window.setTimeout(() => setJustSolved((s) => (s === index ? null : s)), 450);
    const solvedCount = indices.filter((i) => next.solvedSlots[i] != null).length;
    if (solvedCount === indices.length) {
      if (finalIndex != null) {
        next.solvedSlots = { ...next.solvedSlots, [finalIndex]: puzzle.targetWord };
        next.slotStatuses = { ...next.slotStatuses, [finalIndex]: 'solved' };
      }
      if (!next.completedAt) {
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
      setGuess('');
      setFeedback({ text: `${display(step.answer)} — ${clean ? 'clean bend!' : 'nice bend.'}`, tone: 'success', id: Date.now() });
      setAttempt(solve({ ...attempt, guesses: attempt.guesses + 1 }, index, false));
      return;
    }
    const g = normalize(guess);
    if (lastWrong.current[index] !== g) {
      lastWrong.current[index] = g;
      setAttempt((a) => ({ ...a, guesses: a.guesses + 1, misses: { ...a.misses, [index]: (a.misses[index] ?? 0) + 1 } }));
    }
    setFeedback({ text: outcome.message, tone: 'warning', id: Date.now() });
    setLastMiss({ ...outcome, word: guess, index, misses: (attempt.misses[index] ?? 0) + 1, id: Date.now() });
    const misses = (attempt.misses[index] ?? 0) + 1;
    const close = ['fitsRuleButNotIt', 'fitsRuleButNotLinked'].includes(outcome.kind);
    const facepalm = misses >= 3 && misses % 3 === 0;
    setMascotEvent({ id: Date.now(), kind: facepalm ? 'facepalm' : close ? 'close' : 'toss', variant: misses, sound: facepalm ? 'sad' : close ? 'pop' : 'whoosh', duration: 1900 });
    if (!close && !facepalm) {
      const keep = letterHintLevel(index) >= 1 ? ([...normalize(step.answer)][0]?.toUpperCase() ?? '') : '';
      window.setTimeout(() => setGuess(keep), 700);
    }
    setShake((n) => n + 1);
  }

  function takeHint() {
    if (!canUseHint) return;
    const index = selected;
    markStarted();
    const nextLevel = hintLevel(index) + 1;
    const nextLetterLevel = Math.max(0, nextLevel - concealHints(index));
    setAttempt((a) => ({
      ...a,
      hintLevels: { ...a.hintLevels, [index]: (a.hintLevels[index] ?? 0) + 1 },
      hintsUsed: a.hintsUsed + 1,
      slotStatuses: { ...a.slotStatuses, [index]: 'hinted' },
    }));
    if (nextLetterLevel === 1 && !guess) setGuess([...normalize(puzzle.steps[index].answer)][0]?.toUpperCase() ?? '');
    const kind = nextLetterLevel === 1 ? 'stomp' : nextLetterLevel === 2 ? 'count' : nextLetterLevel >= 3 ? 'clue' : 'tada';
    const message = kind === 'count' ? `${[...normalize(puzzle.steps[index].answer)].length} letters` : kind === 'clue' ? extraClue(puzzle.steps[index]) : kind === 'tada' ? 'Ta-da!' : null;
    setMascotEvent({ id: Date.now(), kind, message, sound: kind === 'clue' || kind === 'tada' ? 'chime' : kind === 'stomp' ? 'land' : 'step', duration: kind === 'clue' ? 3200 : 2100 });
    setFeedback(null);
  }

  function reveal() {
    if (!hasOpenSelection) return;
    const index = selected;
    markStarted();
    setGuess('');
    setFeedback({ text: `Revealed ${display(puzzle.steps[index].answer)}.`, tone: 'info', id: Date.now() });
    setAttempt(solve({ ...attempt, revealsUsed: attempt.revealsUsed + 1 }, index, true));
  }

  function select(index) {
    if (completed || !indices.includes(index) || isSolved(index) || index === selected) return;
    setSelected(index);
    setGuess('');
    setFeedback(null);
  }

  function changeGuess(value) {
    setGuess(value);
    if (feedback?.tone === 'warning') setFeedback(null);
  }

  return {
    puzzle, attempt, stats, indices, finalIndex, completed, elapsed, selected, guess, feedback, shake, justSolved, lastMiss, mascotEvent,
    hasOpenSelection, canUseHint, isSolved, hintLevel, maxHintLevel, letterHintLevel, isRuleHidden, isClueHidden,
    visibleBefore, nextHintLabel, hintChips, submit, takeHint, reveal, select, changeGuess,
    clearMascot: (id) => setMascotEvent((event) => event?.id === id ? null : event),
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

function BendCard({ game, inputRef }) {
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
  const hintedLetter = game.letterHintLevel(selected) >= 1 && !game.guess
    ? [...normalize(step.answer)][0]?.toUpperCase() : null;
  const [pressedKey, setPressedKey] = useState(null);
  const [mascotEnabled, setMascotEnabled] = useState(() => localStorage.getItem('bendword.mascot') !== 'off');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('bendword.sound') !== 'off');
  const releaseTimer = useRef(null);
  // On touch screens the on-screen keys replace the phone's keyboard.
  const [touchFirst] = useState(() => window.matchMedia('(pointer: coarse)').matches);

  const typeLetter = (letter) => {
    if (game.guess.length < MAX_GUESS_LENGTH) game.changeGuess(game.guess + letter);
  };
  const deleteLetter = () => game.changeGuess(game.guess.slice(0, -1));

  // Physical keyboards: show each press on the matching on-screen key, and type even when
  // the guess box isn't focused (tablets with keyboards, or after clicking elsewhere).
  useEffect(() => {
    const onKeyDown = (event) => {
      const key = keyForEvent(event);
      if (!key) return;
      const target = event.target;
      const inGuess = target === inputRef.current;
      const inOtherField = !inGuess && target instanceof HTMLElement
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (inOtherField) return;
      if (key === ENTER && !inGuess && target instanceof HTMLButtonElement) return; // let focused buttons activate

      setPressedKey(key);
      clearTimeout(releaseTimer.current);
      // Key-up normally releases the key; this is a fallback if one never arrives.
      releaseTimer.current = setTimeout(() => setPressedKey(null), 600);

      if (inGuess) return; // the guess box handles its own typing
      event.preventDefault();
      if (key === DELETE) deleteLetter();
      else if (event.repeat) return; // only delete repeats when held
      else if (key === ENTER) game.submit();
      else typeLetter(key);
    };
    const onKeyUp = (event) => {
      const key = keyForEvent(event) ?? (event.key.length === 1 ? event.key.toUpperCase() : null);
      setPressedKey((current) => (current === key ? null : current));
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  });
  useEffect(() => () => clearTimeout(releaseTimer.current), []);

  return (
    <section className="bwg-card" aria-labelledby="bwg-card-title">
      <div className="bwg-card-top">
        <div>
          <p className="bwg-kicker" id="bwg-card-title">Bend {game.indices.indexOf(selected) + 1} from</p>
          <p className="bwg-base">{base ? display(base) : '?'}</p>
        </div>
        <div className="bwg-tools">
          <button type="button" className="bwg-tool" onClick={() => { game.takeHint(); inputRef.current?.focus(); }} disabled={!game.canUseHint}
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
              <button type="button" className="bwg-btn is-quiet" onClick={() => { setConfirming(false); game.takeHint(); inputRef.current?.focus(); }}>
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

      <form className="bwg-form" onSubmit={(e) => { e.preventDefault(); game.submit(); }}>
        <label className="bwg-sr" htmlFor="bwg-guess">Your guess</label>
        <input
          id="bwg-guess" ref={inputRef} className={shake ? `is-shaking-${shake % 2}` : ''}
          value={game.guess} onChange={(e) => game.changeGuess(e.target.value)}
          placeholder="Type the next word" autoComplete="off" autoCorrect="off" autoCapitalize="characters"
          spellCheck={false} maxLength={MAX_GUESS_LENGTH} enterKeyHint="go" aria-describedby="bwg-feedback"
          inputMode={touchFirst ? 'none' : 'text'}
        />
      </form>
      <p id="bwg-feedback" className={`bwg-feedback is-${feedback?.tone ?? 'none'}`} role="status" aria-live="polite">
        {feedback?.text ?? ' '}
      </p>
      <Keyboard
        pressedKey={pressedKey} hintedLetter={hintedLetter} canSubmit={normalize(game.guess).length > 0}
        onLetter={typeLetter} onDelete={deleteLetter} onSubmit={() => game.submit()}
      />
      <Mascot event={game.mascotEvent} enabled={mascotEnabled} sound={soundEnabled} onDone={game.clearMascot} />
      <details className="bwg-bendit-settings">
        <summary>Bendit settings</summary>
        <label><input type="checkbox" checked={mascotEnabled} onChange={(e) => { setMascotEnabled(e.target.checked); localStorage.setItem('bendword.mascot', e.target.checked ? 'on' : 'off'); }} /> Show Bendit</label>
        <label><input type="checkbox" checked={soundEnabled} disabled={!mascotEnabled} onChange={(e) => { setSoundEnabled(e.target.checked); localStorage.setItem('bendword.sound', e.target.checked ? 'on' : 'off'); }} /> Sound effects</label>
      </details>
    </section>
  );
}

function Chain({ game, inputRef, onPick }) {
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
                <span className="bwg-tag">{completed ? '✓ Reached' : 'Target'}</span><strong>{display(puzzle.targetWord)}</strong>
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
                onClick={() => { onPick(); game.select(i); inputRef.current?.focus(); }}
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

function Finale({ game, onFinished }) {
  const word = useMemo(() => [...normalize(game.puzzle.targetWord)].map((c) => c.toUpperCase()), [game.puzzle.targetWord]);
  const [lit, setLit] = useState([]);
  const perfect = isPerfect(game.attempt);
  useEffect(() => {
    const timers = word.map((letter, i) => window.setTimeout(() => setLit((keys) => [...keys, letter]), 420 + i * 300));
    timers.push(window.setTimeout(onFinished, 2500 + word.length * 300));
    return () => timers.forEach(window.clearTimeout);
  }, [onFinished, word]);
  const headline = isFlawless(game.attempt) ? 'Flawless!' : perfect ? 'Perfect Bend!' : 'Solved!';
  return (
    <section className="bwg-finale" aria-label={`${headline} Bendit spells ${display(game.puzzle.targetWord)}`}>
      <Mascot event={{ id: 'finale', kind: perfect ? 'flip' : 'cheer', message: headline, sound: 'chime', duration: 9999 }} />
      <Keyboard litKeys={lit} canSubmit={false} onLetter={() => {}} onDelete={() => {}} onSubmit={() => {}} />
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

function Board({ puzzle }) {
  const [showIntro, setShowIntro] = useState(() => !introSeen());
  const game = useBendword(puzzle, !showIntro);
  const inputRef = useRef(null);
  const closeIntro = () => { markIntroSeen(); setShowIntro(false); };
  const openStreak = currentStreak(game.stats);
  useEffect(() => { trackOpen(openStreak); }, [openStreak]);
  const today = dayKey();
  // A previously completed puzzle opens directly to its result; only a fresh solve gets the show.
  const [finaleFinished, setFinaleFinished] = useState(() => game.completed);

  useEffect(() => {
    if (!showIntro && game.hasOpenSelection && window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus();
  }, [showIntro, game.selected, game.hasOpenSelection]);

  return (
    <div className="bwg">
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
      {game.completed ? (finaleFinished ? <Result game={game} /> : <Finale game={game} onFinished={() => setFinaleFinished(true)} />) : !showIntro && game.hasOpenSelection && <BendCard key={game.selected} game={game} inputRef={inputRef} />}
      <Chain game={game} inputRef={inputRef} onPick={closeIntro} />
      <AppNudge />
      {!showIntro && !game.completed && (
        <button type="button" className="bwg-link-btn" onClick={() => setShowIntro(true)}>How to play</button>
      )}
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
