// Runs Bendit's appearances, ported from the iOS app's MascotDirector.swift. He lives inside the
// keyboard's keys: a lid flips open, he climbs out, does his bit (sometimes up in the answer box),
// and dives back into a key. Positions are measured from the page and expressed relative to the
// keyboard's top-left corner, so the drawing follows the keyboard if the page scrolls or the card
// above it changes height.
import { Choreographer, SO_CLOSE_LINES } from './motion';
import { mascotSounds } from './sounds';

export const MASCOT_NAME = 'Bendit';
const FIGURE_HEIGHT = 58;
const HOME = 'ENTER';

const IDLE = { performance: null, startedAt: 0, openKey: null, stompedKey: null, revealedSlots: null, litKeys: [] };

function relativeRect(rect, origin) {
  return { x: rect.left - origin.left, y: rect.top - origin.top, width: rect.width, height: rect.height };
}

export class MascotDirector {
  state = IDLE;
  enabled = true;
  keyboardEl = null;
  /** The answer box (unshaken wrapper) and the typed text inside it. */
  guessBoxEl = null;
  guessTextEl = null;

  listeners = new Set();
  timers = [];
  pendingStart = null;
  pendingStartIsHint = false;
  pendingStomp = null;
  pendingGrab = null;
  pendingFinished = null;
  isPlayingHint = false;
  idleTimer = null;
  thoughtShownForWord = false;
  lastVariant = {};
  /** Where things were when the current performance was built, to notice the layout changing. */
  builtLayout = null;

  // MARK: Elements

  attachKeyboard = (el) => {
    if (el) this.keyboardEl = el;
    else if (this.keyboardEl && !this.keyboardEl.isConnected) this.keyboardEl = null;
  };

  attachGuessBox(el) { this.guessBoxEl = el; }

  detachGuessBox(el) { if (this.guessBoxEl === el) this.guessBoxEl = null; }

  attachGuessText = (el) => { this.guessTextEl = el; };

  // MARK: Store (for useSyncExternalStore)

  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = () => this.state;

  setState(changes) {
    this.state = { ...this.state, ...changes };
    for (const listener of this.listeners) listener();
  }

  // MARK: Layout

  get isReady() {
    return this.enabled && Boolean(this.keyboardEl?.isConnected) && this.keyboardEl.getBoundingClientRect().width > 0;
  }

  get isBusy() { return Boolean(this.state.performance || this.pendingStart); }

  get isBusyWithHint() {
    return (this.state.performance && this.isPlayingHint) || (this.pendingStart && this.pendingStartIsHint);
  }

  measure() {
    const origin = this.keyboardEl.getBoundingClientRect();
    const keys = {};
    for (const el of this.keyboardEl.querySelectorAll('[data-key]')) {
      keys[el.dataset.key] = relativeRect(el.getBoundingClientRect(), origin);
    }
    const guessBox = this.guessBoxEl?.isConnected ? relativeRect(this.guessBoxEl.getBoundingClientRect(), origin) : null;
    return { origin, keys, guessBox };
  }

  choreographer(layout = this.measure()) {
    return new Choreographer({ keys: layout.keys, guessBox: layout.guessBox, height: FIGURE_HEIGHT });
  }

  /**
   * Called every frame while he performs. Something moved under him (resize, the answer box
   * jumping): stop rather than float. Horizontal shakes of the answer box don't count.
   */
  checkLayout() {
    const show = this.state.performance;
    if (!show || !this.builtLayout) return;
    if (!this.keyboardEl?.isConnected) { this.finish(); return; }
    const now = this.measure();
    const before = this.builtLayout;
    const close = (a, b, tolerance) => Math.abs(a - b) <= tolerance;
    if (!close(now.origin.width, before.origin.width, 2) || !close(now.origin.height, before.origin.height, 2)) {
      this.finish();
      return;
    }
    if (show.usesGuessBox) {
      const a = before.guessBox;
      const b = now.guessBox;
      if (!a || !b || !close(a.y, b.y, 3) || !close(a.width, b.width, 3) || !close(a.height, b.height, 3)) this.finish();
    }
  }

  // MARK: Hints

  /** First letter: out of ENTER, onto the letter, stomp, and into it. `onStomp` runs as he lands. */
  stompFirstLetter(key, onStomp) {
    const show = this.isReady ? this.choreographer().stomp(key) : null;
    if (!show) { onStomp(); return; }
    this.play(show, { isHint: true, onStomp });
  }

  /** Letter count: he walks the answer box, laying an underline at each letter place. */
  countLetters(count, typed = 0) {
    if (!this.isReady || !this.guessBoxEl) return;
    this.playSoon({ isHint: true, startingSlots: 0 }, () => this.choreographer().countLetters(count, typed));
  }

  showClue(clue) {
    const show = this.isReady ? this.choreographer().showClue(clue) : null;
    if (show) this.play(show, { isHint: true });
  }

  taDa() {
    const show = this.isReady ? this.choreographer().taDa() : null;
    if (show) this.play(show, { isHint: true });
  }

  // MARK: Finale

  /** Spells the target word across the keyboard. Returns false (and won't call back) if he can't. */
  finale(word, headline, backflip, onFinished) {
    clearTimeout(this.idleTimer);
    const show = this.isReady ? this.choreographer().finale(word, headline, backflip) : null;
    if (!show) return false;
    this.play(show, { isHint: true, onFinished });
    return true;
  }

  // MARK: Reactions

  /**
   * A wrong guess. "So close!" for a word that fits the rule; any other miss, he grabs the word out
   * of the answer box and flings it away (`takeWord` clears it). Every third miss, a facepalm.
   */
  reactToMiss(kind, missesOnWord, word, letterCount, takeWord) {
    if (!this.isReady || this.isBusyWithHint) return;
    let show = null;
    if (missesOnWord >= 3 && missesOnWord % 3 === 0) {
      show = this.choreographer().facepalm(this.variant('facepalm', 2));
    } else if (kind === 'fitsRuleButNotIt' || kind === 'fitsRuleButNotLinked') {
      show = this.choreographer().soClose(this.variant('soClose', SO_CLOSE_LINES.length));
    } else if (kind === 'correct' || kind === 'empty') {
      return;
    } else {
      const textWidth = this.guessTextEl?.isConnected ? this.guessTextEl.getBoundingClientRect().width : null;
      const toss = this.variant('toss', 2);
      this.playSoon({ isHint: false, onGrab: takeWord }, () => {
        const c = this.choreographer();
        return c.toss(word, { textWidth, letterCount, variant: toss }) ?? c.wagFinger(this.variant('wag', 2));
      });
      return;
    }
    if (show) this.play(show, { onGrab: takeWord });
  }

  /** Picks one of `count` variations at random, never the same one twice running. */
  variant(reaction, count) {
    if (count <= 1) return 0;
    let pick = Math.floor(Math.random() * count);
    if (pick === this.lastVariant[reaction]) pick = (pick + 1) % count;
    this.lastVariant[reaction] = pick;
    return pick;
  }

  /** A solved word: he pops out of the enter key and cheers. */
  cheer() {
    if (!this.isReady || this.isBusy) return;
    const show = this.choreographer().cheer(HOME, this.variant('cheer', 4));
    if (show) this.play(show);
  }

  ponder() {
    if (!this.isReady || this.isBusy) return;
    const show = this.choreographer().ponder('T');
    if (show) this.play(show);
  }

  // MARK: Idle

  /** Call on typing or word changes; after a long quiet stretch he comes up to think, once per word. */
  noteActivity(newWord = false) {
    if (newWord) this.thoughtShownForWord = false;
    clearTimeout(this.idleTimer);
    if (!this.enabled || this.thoughtShownForWord) return;
    this.idleTimer = setTimeout(() => {
      this.thoughtShownForWord = true;
      // Not while the page is in the background.
      if (document.visibilityState === 'visible') this.ponder();
    }, 25000);
  }

  stop() {
    clearTimeout(this.idleTimer);
    this.idleTimer = null;
    this.cancelPendingStart();
    this.finish();
  }

  /** The open word changed: anything he was doing in the answer box no longer applies. */
  wordChanged() {
    if (this.state.performance?.usesGuessBox || this.pendingStart) {
      this.cancelPendingStart();
      this.finish();
    }
  }

  // MARK: Playback

  /** Starts a performance after a moment, built from where things are once they've settled. */
  playSoon({ isHint, startingSlots = null, onGrab = null }, build) {
    this.cancelPendingStart();
    this.finish();
    this.setState({ revealedSlots: startingSlots });
    this.pendingStartIsHint = isHint;
    this.pendingStart = setTimeout(() => {
      this.pendingStart = null;
      this.pendingStartIsHint = false;
      const show = this.isReady ? build() : null;
      if (!show) { this.setState({ revealedSlots: null }); return; }
      this.play(show, { isHint, onGrab });
      if (startingSlots != null) this.setState({ revealedSlots: startingSlots });
    }, 450);
  }

  cancelPendingStart() {
    clearTimeout(this.pendingStart);
    this.pendingStart = null;
    this.pendingStartIsHint = false;
  }

  play(show, { isHint = false, onStomp = null, onGrab = null, onFinished = null } = {}) {
    this.cancelPendingStart();
    this.finish();
    this.pendingFinished = onFinished;
    this.isPlayingHint = isHint;
    this.pendingStomp = onStomp;
    this.pendingGrab = onGrab;
    this.builtLayout = this.measure();
    this.setState({ performance: show, startedAt: performance.now() });
    for (const { time, event } of show.events) {
      this.timers.push(setTimeout(() => this.handle(event), time * 1000));
    }
    this.timers.push(setTimeout(() => this.finish(), show.duration * 1000));
  }

  handle(event) {
    switch (event.type) {
      case 'openLid': this.setState({ openKey: event.key }); break;
      case 'closeLid': this.setState({ openKey: null }); break;
      case 'stomp': {
        this.setState({ stompedKey: event.key });
        const stomp = this.pendingStomp;
        this.pendingStomp = null;
        stomp?.();
        break;
      }
      case 'unstomp': this.setState({ stompedKey: null }); break;
      case 'revealSlots': this.setState({ revealedSlots: event.count }); break;
      case 'grabWord': {
        const grab = this.pendingGrab;
        this.pendingGrab = null;
        // If the player already changed their guess, leave it alone and bow out.
        if (grab?.() === false) this.finish();
        break;
      }
      case 'sound': mascotSounds.play(event.name); break;
      case 'light':
        if (!this.state.litKeys.includes(event.key)) this.setState({ litKeys: [...this.state.litKeys, event.key] });
        break;
      default: break;
    }
  }

  /** Ends the current performance. A stomp that never happened still takes effect. */
  finish() {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers = [];
    const stomp = this.pendingStomp;
    this.pendingStomp = null;
    this.pendingGrab = null;
    this.isPlayingHint = false;
    this.builtLayout = null;
    if (this.state !== IDLE && (this.state.performance || this.state.openKey || this.state.stompedKey
      || this.state.revealedSlots != null || this.state.litKeys.length)) {
      this.setState(IDLE);
    }
    stomp?.();
    const finished = this.pendingFinished;
    this.pendingFinished = null;
    finished?.();
  }
}
