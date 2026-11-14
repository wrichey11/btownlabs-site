// Bendit's keyframe engine and choreography, ported from the iOS app (MascotMotion.swift and
// StickFigure.swift). Every channel (position, pose, squash, tilt, clipping, the hat) has its own
// timeline of eased segments, sampled every display frame. Keep the two versions in step.

// MARK: - Poses

/** One pose. Limb angles are degrees from straight down, absolute; positive swings screen-right. */
const BASE_POSE = {
  lean: 0, leftUpperArm: -20, leftForearm: -10, rightUpperArm: 20, rightForearm: 10,
  leftThigh: -9, leftShin: -6, rightThigh: 9, rightShin: 6, smile: 0.7,
};
const POSE_PARTS = Object.keys(BASE_POSE);
const pose = (parts = {}) => Object.freeze({ ...BASE_POSE, ...parts });

export const POSES = {
  standing: pose(),
  crouch: pose({ leftUpperArm: -45, leftForearm: -25, rightUpperArm: 45, rightForearm: 25,
    leftThigh: -50, leftShin: 12, rightThigh: 50, rightShin: -12 }),
  tuck: pose({ leftUpperArm: -125, leftForearm: -150, rightUpperArm: 125, rightForearm: 150,
    leftThigh: -75, leftShin: -15, rightThigh: 75, rightShin: 15, smile: 1 }),
  land: pose({ leftUpperArm: -85, leftForearm: -100, rightUpperArm: 85, rightForearm: 100,
    leftThigh: -35, leftShin: 0, rightThigh: 35, rightShin: 0, smile: 1 }),
  cheer: pose({ leftUpperArm: -120, leftForearm: -145, rightUpperArm: 120, rightForearm: 145,
    leftThigh: -14, leftShin: -10, rightThigh: 14, rightShin: 10, smile: 1 }),
  slump: pose({ lean: 6, leftUpperArm: -50, leftForearm: -115, rightUpperArm: 50, rightForearm: 115,
    leftThigh: -6, leftShin: -4, rightThigh: 6, rightShin: 4, smile: -0.8 }),
  strideRightLeg: pose({ lean: 4, leftUpperArm: 25, leftForearm: 45, rightUpperArm: -25, rightForearm: -15,
    leftThigh: -20, leftShin: -40, rightThigh: 25, rightShin: 15, smile: 0.8 }),
  strideLeftLeg: pose({ lean: 4, leftUpperArm: -25, leftForearm: -15, rightUpperArm: 25, rightForearm: 45,
    leftThigh: 25, leftShin: 15, rightThigh: -20, rightShin: -40, smile: 0.8 }),
  passing: pose({ lean: 3, leftUpperArm: -10, leftForearm: 0, rightUpperArm: 10, rightForearm: 0,
    leftThigh: -4, leftShin: 8, rightThigh: 4, rightShin: 4, smile: 0.8 }),
  reachLeft: pose({ lean: -10, leftUpperArm: -70, leftForearm: -80, rightUpperArm: -50, rightForearm: -70,
    leftThigh: -25, leftShin: 5, rightThigh: 20, rightShin: -5, smile: 0.3 }),
  windUp: pose({ lean: -8, leftUpperArm: -130, leftForearm: -150, rightUpperArm: 130, rightForearm: 150,
    leftThigh: -15, leftShin: -8, rightThigh: 18, rightShin: 10, smile: 0.6 }),
  throwThrough: pose({ lean: 12, leftUpperArm: 70, leftForearm: 90, rightUpperArm: 80, rightForearm: 100,
    leftThigh: -25, leftShin: -40, rightThigh: 20, rightShin: 10, smile: 1 }),
  wagLeft: pose({ leftUpperArm: -40, leftForearm: 30, rightUpperArm: 60, rightForearm: 150, smile: -0.3 }),
  wagRight: pose({ leftUpperArm: -40, leftForearm: 30, rightUpperArm: 60, rightForearm: 190, smile: -0.3 }),
  facepalm: pose({ lean: 8, leftUpperArm: -10, leftForearm: -5, rightUpperArm: 150, rightForearm: -110, smile: -0.6 }),
  almost: pose({ leftUpperArm: -60, leftForearm: 60, rightUpperArm: 60, rightForearm: -60,
    leftThigh: -12, leftShin: -6, rightThigh: 12, rightShin: 6, smile: 0.5 }),
  fistPumpUp: pose({ leftUpperArm: -35, leftForearm: 20, rightUpperArm: 125, rightForearm: 178,
    leftThigh: -12, leftShin: -8, rightThigh: 12, rightShin: 8, smile: 1 }),
  fistPumpDown: pose({ leftUpperArm: -35, leftForearm: 20, rightUpperArm: 70, rightForearm: 160,
    leftThigh: -18, leftShin: 0, rightThigh: 18, rightShin: 0, smile: 1 }),
  tipReach: pose({ rightUpperArm: 150, rightForearm: 165, smile: 0.9 }),
  tipLift: pose({ rightUpperArm: 152, rightForearm: 158, smile: 1 }),
  armsCrossed: pose({ leftUpperArm: -30, leftForearm: 75, rightUpperArm: 30, rightForearm: -75, smile: -0.4 }),
  think: pose({ lean: -4, leftUpperArm: -30, leftForearm: 40, rightUpperArm: 125, rightForearm: -160, smile: -0.1 }),
};

/** Body proportions as fractions of the figure's height. */
export const PROPORTIONS = {
  hip: 0.6, torso: 0.27, shoulders: 0.22, headRadius: 0.12, neckGap: 0.015,
  upperArm: 0.15, forearm: 0.14, thigh: 0.18, shin: 0.18, standingLegs: 0.355,
};
PROPORTIONS.aboveHip = PROPORTIONS.torso + PROPORTIONS.neckGap + PROPORTIONS.headRadius * 2;

// MARK: - Values (numbers or poses)

function lerp(from, to, p) {
  if (typeof from === 'number') return from + (to - from) * p;
  const out = {};
  for (const part of POSE_PARTS) out[part] = from[part] + (to[part] - from[part]) * p;
  return out;
}

function weightedSum(samples) {
  if (typeof samples[0][0] === 'number') return samples.reduce((sum, [v, w]) => sum + v * w, 0);
  const out = {};
  for (const part of POSE_PARTS) out[part] = samples.reduce((sum, [v, w]) => sum + v[part] * w, 0);
  return out;
}

// MARK: - Curves and tracks

export const spring = (bounce) => ({ spring: bounce });

function progress(curve, p, duration) {
  switch (curve) {
    case 'step': return 1;
    case 'linear': return p;
    case 'easeIn': return p * p;
    case 'easeOut': return 1 - (1 - p) * (1 - p);
    case 'easeInOut': return p * p * (3 - 2 * p);
    default: {
      // Settles on the target with some overshoot; bounce 0 is critically damped.
      if (p >= 1) return 1;
      const damping = 1 - curve.spring;
      const omega = (2 * Math.PI) / (duration * 0.6);
      const damped = omega * Math.sqrt(Math.max(1e-6, 1 - damping * damping));
      const t = p * duration;
      return 1 - Math.exp(-damping * omega * t)
        * (Math.cos(damped * t) + ((damping * omega) / damped) * Math.sin(damped * t));
    }
  }
}

/** A segment easing to `target` over `duration` seconds. */
export const to = (target, duration, curve = 'linear') => ({ target, duration, curve });
/** Jump straight to `target`. */
export const set = (target) => ({ target, duration: 0, curve: 'step' });

export class Track {
  segments = [];

  get last() { return this.segments.length ? this.segments[this.segments.length - 1].target : undefined; }
  get duration() { return this.segments.reduce((sum, s) => sum + s.duration, 0); }
  append(more) { this.segments.push(...more); }

  value(time) {
    if (!this.segments.length) return 0;
    let value = this.segments[0].target;
    let start = 0;
    for (const segment of this.segments) {
      if (segment.duration <= 0) { value = segment.target; continue; }
      if (time < start + segment.duration) {
        return lerp(value, segment.target, progress(segment.curve, (time - start) / segment.duration, segment.duration));
      }
      value = segment.target;
      start += segment.duration;
    }
    return value;
  }

  /**
   * The value with its corners rounded off: a short weighted average over `window` seconds either
   * side, so one segment's motion blends into the next. Never averages across a `set` jump.
   */
  smoothed(time, window) {
    if (window <= 0 || this.segments.length < 2) return this.value(time);
    let lower = -Infinity;
    let upper = Infinity;
    let start = 0;
    for (let i = 0; i < this.segments.length; i += 1) {
      const segment = this.segments[i];
      if (segment.duration <= 0 && i > 0) {
        if (start <= time) lower = start;
        else { upper = Math.min(upper, start); break; }
      }
      start += segment.duration;
    }
    const taps = [[-1, 1], [-0.5, 4], [0, 6], [0.5, 4], [1, 1]];
    return weightedSum(taps.map(([offset, weight]) => [
      this.value(Math.min(Math.max(time + offset * window, lower), upper - 1e-6)), weight / 16,
    ]));
  }
}

// MARK: - Performances

export const NO_CLIP = 100000;
const CHANNELS = {
  x: 0, y: 0, pose: POSES.standing, squash: 1, tilt: 0, clip: NO_CLIP, thought: 0,
  wordX: 0, wordY: 0, wordTilt: 0, wordOpacity: 0, gazeX: 0, gazeY: 0,
  hatFree: 0, hatX: 0, hatY: 0, hatSpin: 0,
};
const SMOOTHING = { x: 0.035, pose: 0.07, tilt: 0.06, gaze: 0.08 };

/** One complete appearance: a track per channel, plus timed events. */
export class Performance {
  tracks = Object.fromEntries(Object.keys(CHANNELS).map((name) => [name, new Track()]));
  events = [];
  duration = 0;
  heldWord = '';
  thoughtText = '?';
  thoughtOnLeft = false;
  usesGuessBox = false;

  /** Adds a beat of `length` seconds. Channels left out hold their last value. */
  beat(length, channels = {}, events = []) {
    for (const [name, fallback] of Object.entries(CHANNELS)) {
      const track = this.tracks[name];
      const segments = channels[name] ?? [to(track.last ?? fallback, length)];
      if (import.meta.env?.DEV) {
        const total = segments.reduce((sum, s) => sum + s.duration, 0);
        if (Math.abs(total - length) > 0.001) throw new Error(`beat channel ${name} must fill the beat`);
      }
      track.append(segments);
    }
    this.events.push(...events.map(([time, event]) => ({ time: this.duration + time, event })));
    this.duration += length;
  }

  get currentY() { return this.tracks.y.last ?? 0; }

  frame(time) {
    const t = this.tracks;
    // The hat rocks against his sideways acceleration, sampled a moment late like follow-through.
    const dt = 0.05;
    const lagged = time - 0.05;
    const x = (at) => t.x.smoothed(at, SMOOTHING.x);
    const acceleration = (x(lagged + dt) - 2 * x(lagged) + x(lagged - dt)) / (dt * dt);
    return {
      hipX: x(time),
      hipY: t.y.value(time),
      pose: t.pose.smoothed(time, SMOOTHING.pose),
      squash: t.squash.value(time),
      tilt: t.tilt.smoothed(time, SMOOTHING.tilt),
      clipBottom: t.clip.value(time),
      thought: t.thought.value(time),
      wordX: t.wordX.value(time),
      wordY: t.wordY.value(time),
      wordTilt: t.wordTilt.value(time),
      wordOpacity: t.wordOpacity.value(time),
      gazeX: t.gazeX.smoothed(time, SMOOTHING.gaze),
      gazeY: t.gazeY.smoothed(time, SMOOTHING.gaze),
      hatFree: Math.max(0, Math.min(1, t.hatFree.value(time))),
      hatX: t.hatX.value(time),
      hatY: t.hatY.value(time),
      hatSpin: t.hatSpin.value(time),
      hatSway: Math.max(-14, Math.min(14, -acceleration * 0.0035)),
    };
  }
}

// MARK: - Letter places

/** Where the letter places sit in the answer box once the letter count is known. */
export class SlotLayout {
  static baseWidth = 24;
  static baseSpacing = 6;
  static inset = 12;
  static underlineOffset = 14;
  static minimumWidth = 12;

  constructor(count, boxWidth, scale = 1) {
    const s = Math.max(1, scale);
    this.spacing = SlotLayout.baseSpacing * Math.min(s, 1.5);
    const gaps = Math.max(count - 1, 0) * this.spacing;
    const fitting = count > 0 ? (boxWidth - 2 * SlotLayout.inset - gaps) / count : SlotLayout.baseWidth;
    this.width = Math.max(SlotLayout.minimumWidth, Math.min(SlotLayout.baseWidth * s, fitting));
  }

  centerX(index, box) { return box.x + SlotLayout.inset + index * (this.width + this.spacing) + this.width / 2; }
  span(count) { return count > 0 ? count * this.width + (count - 1) * this.spacing : 0; }
  static underlineY(box) { return box.y + box.height / 2 + SlotLayout.underlineOffset; }
}

// MARK: - Choreography

const HOME = 'ENTER';
const DELETE = 'DELETE';
export const SO_CLOSE_LINES = ['So close!', 'Almost!', 'Nearly there!'];

const midX = (r) => r.x + r.width / 2;
const midY = (r) => r.y + r.height / 2;
const maxY = (r) => r.y + r.height;

/** Builds his appearances from reusable beats, in the stage's coordinates. Rects are {x, y, width, height}. */
export class Choreographer {
  constructor({ keys, guessBox = null, height = 58, slotScale = 1 }) {
    this.keys = keys;
    this.guessBox = guessBox;
    this.height = height;
    this.slotScale = slotScale;
  }

  get legs() { return PROPORTIONS.standingLegs * this.height; }
  standingY(surface) { return surface.y - this.legs; }
  hiddenY(key) { return maxY(key) + PROPORTIONS.aboveHip * this.height + 2; }
  spot(x, y) { return { x: x - 1, y, width: 2, height: 0 }; }

  // Appearances

  /** First letter: out of ENTER, across onto the letter, stomp, and into it. */
  stomp(target) {
    const door = this.keys[HOME];
    const key = this.keys[target];
    if (!door || !key) return null;
    const show = new Performance();
    this.emerge(show, door, HOME);
    this.jump(show, door, key, [{ type: 'stomp', key: target }], [{ type: 'unstomp' }]);
    this.celebrate(show);
    this.dive(show, key, target);
    return show;
  }

  /** Letter count: a walk along the answer box, laying an underline at each letter place. */
  countLetters(count, typed = 0) {
    const door = this.keys[HOME];
    const box = this.guessBox;
    if (count <= 0 || !door || !box) return null;
    const slots = new SlotLayout(Math.max(count, typed), box.width, this.slotScale);
    const floor = SlotLayout.underlineY(box);
    const places = Array.from({ length: count }, (_, i) => this.spot(slots.centerX(i, box), floor));
    const show = new Performance();
    show.usesGuessBox = true;
    this.emerge(show, door, HOME);
    this.jump(show, door, places[0], [{ type: 'revealSlots', count: 1 }]);
    for (let i = 1; i < places.length; i += 1) {
      this.walk(show, places[i], i % 2 === 0 ? POSES.strideLeftLeg : POSES.strideRightLeg,
        [{ type: 'revealSlots', count: i + 1 }]);
    }
    const y = show.currentY;
    show.beat(0.6, {
      y: [to(y + 2, 0.15, 'easeOut'), to(y, 0.45, spring(0.4))],
      pose: [to(POSES.land, 0.3, spring(0.45)), to(POSES.land, 0.3)],
      tilt: [to(0, 0.2, 'easeOut'), to(0, 0.4)],
      gazeX: [to(0, 0.2, 'easeOut'), to(0, 0.4)],
      gazeY: [to(0, 0.2, 'easeOut'), to(0, 0.4)],
    });
    this.jump(show, places[count - 1], door);
    this.dive(show, door, HOME);
    return show;
  }

  /** Extra clue: out of ENTER with the clue in a thought bubble. */
  showClue(clue) {
    const door = this.keys[HOME];
    if (!door) return null;
    const show = new Performance();
    show.thoughtText = clue;
    this.emerge(show, door, HOME);
    show.beat(3.0, {
      pose: [to(POSES.think, 0.45, spring(0.3)), to(POSES.think, 2.55)],
      tilt: [to(-3, 0.8, 'easeInOut'), to(2, 1.0, 'easeInOut'), to(0, 1.2, 'easeInOut')],
      thought: [to(0, 0.2), to(1, 0.3, spring(0.3)), to(1, 2.25), to(0, 0.25, 'easeIn')],
      gazeX: [to(0.7, 0.4, 'easeInOut'), to(0.7, 2.6)],
      gazeY: [to(-0.8, 0.4, 'easeInOut'), to(-0.8, 2.6)],
    });
    this.dive(show, door, HOME);
    return show;
  }

  /** Hard-day reveal: a "Ta-da!" as the hidden rule or clue appears. */
  taDa() {
    const door = this.keys[HOME];
    if (!door) return null;
    const show = new Performance();
    show.thoughtText = 'Ta-da!';
    this.emerge(show, door, HOME);
    const y = show.currentY;
    show.beat(1.1, {
      y: [to(y - 8, 0.14, 'easeOut'), to(y, 0.14, 'easeIn'), to(y, 0.82)],
      pose: [to(POSES.cheer, 0.3, spring(0.5)), to(POSES.cheer, 0.8)],
      squash: [to(1.06, 0.14, 'easeOut'), to(0.9, 0.14, 'easeIn'), to(1, 0.82, spring(0.5))],
      thought: [to(1, 0.25, spring(0.4)), to(1, 0.65), to(0, 0.2, 'easeIn')],
    }, [[0.05, { type: 'sound', name: 'chime' }]]);
    this.dive(show, door, HOME);
    return show;
  }

  /**
   * The puzzle is solved: a hop onto each letter of the target word (each stays lit), a backflip
   * for a Perfect Bend or a cheer otherwise, a bubble with `headline`, and a dive into the last letter.
   */
  finale(word, headline, backflip) {
    const letters = [...word.toUpperCase()];
    const door = this.keys[HOME];
    const lastLetter = letters[letters.length - 1];
    if (!door || !lastLetter || !letters.every((l) => this.keys[l])) return null;
    const show = new Performance();
    show.thoughtText = headline;
    this.emerge(show, door, HOME);
    let current = door;
    for (const letter of letters) {
      const key = this.keys[letter];
      this.hop(show, current, key, letter);
      current = key;
    }
    const rects = Object.values(this.keys);
    const left = Math.min(...rects.map((r) => r.x));
    const right = Math.max(...rects.map((r) => r.x + r.width));
    show.thoughtOnLeft = midX(current) > (left + right) / 2;
    if (backflip) this.flip(show);
    else this.celebrate(show);
    show.beat(1.7, {
      pose: [to(POSES.cheer, 0.3, spring(0.45)), to(POSES.cheer, 1.4)],
      tilt: [to(-2, 0.6, 'easeInOut'), to(2, 0.6, 'easeInOut'), to(0, 0.5, 'easeInOut')],
      thought: [to(1, 0.3, spring(0.3)), to(1, 1.15), to(0, 0.25, 'easeIn')],
      gazeX: [to(0, 0.3, 'easeOut'), to(0, 1.4)],
      gazeY: [to(0, 0.3, 'easeOut'), to(0, 1.4)],
    }, [[0.05, { type: 'sound', name: 'chime' }]]);
    this.dive(show, current, lastLetter);
    return show;
  }

  /** A quick bounce from key to key, landing hard enough to light the key. */
  hop(show, start, end, name) {
    const distance = Math.hypot(midX(end) - midX(start), end.y - start.y);
    const direction = midX(end) >= midX(start) ? 1 : -1;
    const crouch = 0.07;
    const air = 0.26 + distance / 2200;
    const settle = 0.14;
    const fromY = this.standingY(start);
    const toY = this.standingY(end);
    const apex = Math.min(fromY, toY) - (16 + distance * 0.12);
    show.beat(crouch + air + settle, {
      x: [to(midX(start), crouch), to(midX(end), air), to(midX(end), settle)],
      y: [to(fromY + 3, crouch, 'easeOut'), to(apex, air / 2, 'easeOut'), to(toY + 3, air / 2, 'easeIn'),
        to(toY, settle, spring(0.3))],
      pose: [to(POSES.crouch, crouch, 'easeOut'), to(POSES.tuck, air / 2, 'easeOut'), to(POSES.land, air / 2, 'easeInOut'),
        to(POSES.land, settle)],
      squash: [to(0.9, crouch, 'easeOut'), to(1.08, air * 0.3, 'easeOut'), to(1, air * 0.7, 'easeIn'),
        to(0.86, 0.05, 'easeOut'), to(1, settle - 0.05, spring(0.5))],
      tilt: [to(0, crouch), to(6 * direction, air / 2, 'easeOut'), to(-3 * direction, air / 2, 'easeInOut'),
        to(0, settle, spring(0.4))],
      gazeX: [to(distance < 1 ? 0 : direction, crouch, 'easeOut'), to(0, air, 'easeInOut'), to(0, settle)],
      gazeY: [to(0.5, crouch, 'easeOut'), to(0.8, air), to(0.2, settle, 'easeOut')],
    }, [[crouch + air + 0.01, { type: 'light', key: name }], [crouch + air + 0.01, { type: 'sound', name: 'land' }]]);
  }

  /** A big jump with a full backflip under his hat, which drops back on his head after he lands. */
  flip(show) {
    const y = show.currentY;
    const h = this.height;
    show.beat(1.15, {
      y: [to(y + 5, 0.14, 'easeOut'), to(y - h * 0.95, 0.32, 'easeOut'), to(y + 4, 0.32, 'easeIn'), to(y, 0.37, spring(0.3))],
      pose: [to(POSES.crouch, 0.14, 'easeOut'), to(POSES.tuck, 0.2, 'easeOut'), to(POSES.tuck, 0.26),
        to(POSES.land, 0.18, 'easeOut'), to(POSES.cheer, 0.37, spring(0.45))],
      squash: [to(0.85, 0.14, 'easeOut'), to(1.1, 0.1, 'easeOut'), to(1, 0.54), to(0.82, 0.05, 'easeOut'),
        to(1, 0.32, spring(0.5))],
      // A full turn, then the same angle restated as zero so later beats don't unwind it.
      tilt: [to(0, 0.14), to(-360, 0.64, 'easeInOut'), set(0), to(0, 0.37)],
      gazeX: [to(0, 0.14), to(0, 1.01)],
      gazeY: [to(-0.6, 0.14, 'easeOut'), to(0, 1.01, 'easeInOut')],
      hatFree: [to(0, 0.14), to(1, 0.06, 'easeOut'), to(1, 0.66), to(0, 0.08, 'easeIn'), to(0, 0.21)],
      hatX: [to(0, 0.14), to(h * 0.12, 0.4, 'easeOut'), to(0, 0.4, 'easeInOut'), to(0, 0.21)],
      hatY: [to(0, 0.14), to(-h * 0.55, 0.36, 'easeOut'), to(0, 0.44, 'easeIn'), to(0, 0.21)],
      hatSpin: [to(0, 0.14), to(-360, 0.8, 'easeInOut'), set(0), to(0, 0.21)],
    }, [[0.14, { type: 'sound', name: 'boing' }], [0.78, { type: 'sound', name: 'land' }], [0.94, { type: 'sound', name: 'step' }]]);
  }

  // Wrong guesses

  /**
   * A plain wrong guess: up into the answer box, grab the word (`grabWord` clears it), wind up, and
   * fling it away. Variant 0 flings it off the top; variant 1 dunks it into the delete key.
   */
  toss(word, { textWidth = null, letterCount = null, variant = 0 } = {}) {
    const box = this.guessBox;
    if (!word || !box) return null;
    const h = this.height;
    const wordWidth = letterCount != null
      ? new SlotLayout(Math.max(letterCount, word.length), box.width, this.slotScale).span(word.length)
      : textWidth ?? word.length * 13.5;
    const textStart = box.x + SlotLayout.inset;
    const center = { x: textStart + wordWidth / 2, y: midY(box) };
    const standX = Math.min(textStart + wordWidth + 22, box.x + box.width - 20);
    const place = this.spot(standX, SlotLayout.underlineY(box));
    // Come up through the top-row key nearest the end of the word.
    const topRow = [...'QWERTYUIOP'].filter((k) => this.keys[k]);
    if (!topRow.length) return null;
    const doorName = topRow.reduce((best, k) => (
      Math.abs(midX(this.keys[k]) - standX) < Math.abs(midX(this.keys[best]) - standX) ? k : best));
    const door = this.keys[doorName];

    const show = new Performance();
    show.heldWord = word.toUpperCase();
    show.usesGuessBox = true;
    this.emerge(show, door, doorName);
    this.jump(show, door, place);

    const y = show.currentY;
    const hands = { x: standX - 0.28 * h, y: y - 0.15 * h - 6 };
    show.beat(0.45, {
      y: [to(y + 4, 0.2, 'easeOut'), to(y + 2, 0.25)],
      pose: [to(POSES.reachLeft, 0.2, 'easeOut'), to(POSES.reachLeft, 0.25)],
      tilt: [to(-6, 0.2, 'easeOut'), to(-6, 0.25)],
      wordX: [set(center.x), to(center.x, 0.2), to(hands.x, 0.25, 'easeOut')],
      wordY: [set(center.y), to(center.y, 0.2), to(hands.y, 0.25, 'easeOut')],
      wordTilt: [set(0), to(0, 0.2), to(-8, 0.25, 'easeOut')],
      wordOpacity: [set(0), to(0, 0.2), set(1), to(1, 0.25)],
      gazeX: [to(-1, 0.15, 'easeOut'), to(-1, 0.3)],
      gazeY: [to(0.5, 0.15, 'easeOut'), to(0.3, 0.3)],
    }, [[0.2, { type: 'grabWord' }]]);

    const overhead = { x: standX - 6, y: y - 0.62 * h };
    show.beat(0.35, {
      y: [to(y, 0.35, 'easeInOut')],
      pose: [to(POSES.windUp, 0.35, 'easeOut')],
      squash: [to(1.04, 0.35, 'easeOut')],
      tilt: [to(-10, 0.35, 'easeOut')],
      wordX: [to(overhead.x, 0.35, 'easeOut')],
      wordY: [to(overhead.y, 0.35, 'easeOut')],
      wordTilt: [to(-14, 0.35, 'easeOut')],
      gazeX: [to(-0.2, 0.35, 'easeOut')],
      gazeY: [to(-1, 0.35, 'easeOut')],
    });

    const throwPose = [to(POSES.throwThrough, 0.12, 'easeOut'), to(POSES.throwThrough, 0.26)];
    const bin = this.keys[DELETE];
    if (variant === 1 && bin) {
      // A dunk: the word arcs down into the delete key, whose lid pops open to catch it.
      const apex = Math.min(overhead.y, midY(bin)) - 90;
      show.beat(0.8, {
        pose: [...throwPose, to(POSES.standing, 0.42, spring(0.4))],
        squash: [to(0.95, 0.12, 'easeOut'), to(1, 0.68, spring(0.4))],
        tilt: [to(10, 0.12, 'easeOut'), to(10, 0.26), to(0, 0.42, spring(0.4))],
        wordX: [to(midX(bin), 0.8)],
        wordY: [to(apex, 0.4, 'easeOut'), to(midY(bin), 0.4, 'easeIn')],
        wordTilt: [to(360, 0.8)],
        wordOpacity: [to(1, 0.68), to(0, 0.12)],
        gazeX: [to(1, 0.2, 'easeOut'), to(1, 0.6)],
        gazeY: [to(-0.8, 0.3, 'easeOut'), to(0.8, 0.5, 'easeInOut')],
      }, [[0.05, { type: 'sound', name: 'whoosh' }], [0.45, { type: 'openLid', key: DELETE }],
        [0.8, { type: 'sound', name: 'pop' }], [0.95, { type: 'closeLid' }]]);
    } else {
      show.beat(0.7, {
        pose: [...throwPose, to(POSES.standing, 0.32, spring(0.4))],
        squash: [to(0.95, 0.12, 'easeOut'), to(1, 0.58, spring(0.4))],
        tilt: [to(10, 0.12, 'easeOut'), to(10, 0.26), to(0, 0.32, spring(0.4))],
        wordX: [to(overhead.x + 360, 0.7)],
        wordY: [to(overhead.y - 360, 0.7, 'easeOut')],
        wordTilt: [to(600, 0.7)],
        wordOpacity: [to(1, 0.5), to(0, 0.2)],
        gazeX: [to(1, 0.2, 'easeOut'), to(1, 0.5)],
        gazeY: [to(-1, 0.2, 'easeOut'), to(-1, 0.5)],
      }, [[0.05, { type: 'sound', name: 'whoosh' }]]);
    }
    this.jump(show, place, door);
    this.dive(show, door, doorName);
    return show;
  }

  /** The guess breaks the rule. Variant 0 wags a finger; variant 1 crosses his arms. */
  wagFinger(variant = 0) {
    const door = this.keys[DELETE];
    if (!door) return null;
    const show = new Performance();
    this.emerge(show, door, DELETE);
    const wag = variant === 1 ? 0.12 : 0.16;
    const settle = 1.3 - 0.3 - wag * 4;
    const shake = [to(-3, 0.3, 'easeOut'), to(5, wag, 'easeInOut'), to(-5, wag, 'easeInOut'),
      to(5, wag, 'easeInOut'), to(-5, wag, 'easeInOut'), to(0, settle, spring(0.3))];
    const poses = variant === 1
      ? [to(POSES.armsCrossed, 0.3, spring(0.3)), to(POSES.armsCrossed, 1.0)]
      : [to(POSES.wagLeft, 0.3, spring(0.3)), to(POSES.wagRight, wag, 'easeInOut'), to(POSES.wagLeft, wag, 'easeInOut'),
        to(POSES.wagRight, wag, 'easeInOut'), to(POSES.wagLeft, wag, 'easeInOut'), to(POSES.wagLeft, settle)];
    show.beat(1.3, { pose: poses, tilt: shake });
    this.dive(show, door, DELETE);
    return show;
  }

  /** Third miss on the same word. Variant 0 is a facepalm; variant 1 a long slump. */
  facepalm(variant = 0) {
    const door = this.keys[DELETE];
    if (!door) return null;
    const show = new Performance();
    this.emerge(show, door, DELETE);
    const y = show.currentY;
    const p = variant === 1 ? POSES.slump : POSES.facepalm;
    show.beat(1.2, {
      y: [to(y + 3, 0.35, 'easeOut'), to(y + 3, 0.85)],
      pose: [to(p, 0.35, spring(0.2)), to(p, 0.85)],
      squash: [to(0.94, 0.35, 'easeOut'), to(0.97, 0.85, 'easeInOut')],
      tilt: [to(4, 0.5, 'easeOut'), to(2, 0.7, 'easeInOut')],
      gazeX: [to(variant === 1 ? 0.3 : 0, 0.35, 'easeOut'), to(0, 0.85)],
      gazeY: [to(1, 0.35, 'easeOut'), to(1, 0.85)],
    }, [[0.15, { type: 'sound', name: 'sad' }]]);
    this.dive(show, door, DELETE);
    return show;
  }

  /** Fits the rule but isn't the word: an encouraging bubble. */
  soClose(variant = 0) {
    const door = this.keys[HOME];
    if (!door) return null;
    const show = new Performance();
    show.thoughtText = SO_CLOSE_LINES[variant % SO_CLOSE_LINES.length];
    this.emerge(show, door, HOME);
    const y = show.currentY;
    show.beat(1.4, {
      y: [to(y - 6, 0.15, 'easeOut'), to(y, 0.15, 'easeIn'), to(y, 1.1)],
      pose: [to(POSES.almost, 0.3, spring(0.4)), to(POSES.almost, 1.1)],
      thought: [to(1, 0.3, spring(0.3)), to(1, 0.85), to(0, 0.25, 'easeIn')],
      gazeX: [to(0.6, 0.3, 'easeOut'), to(0.6, 0.5), to(0, 0.6, 'easeInOut')],
      gazeY: [to(-0.6, 0.3, 'easeOut'), to(-0.6, 0.5), to(0, 0.6, 'easeInOut')],
    });
    this.dive(show, door, HOME);
    return show;
  }

  /** A solved word. Variant 0 hops, 1 pumps a fist, 2 double hops, 3 tips his hat. */
  cheer(doorName, variant = 0) {
    const key = this.keys[doorName];
    if (!key) return null;
    const show = new Performance();
    this.emerge(show, key, doorName);
    const y = show.currentY;
    const h = this.height;
    if (variant === 1) {
      show.beat(0.9, {
        y: [to(y + 2, 0.2), to(y + 4, 0.15, 'easeIn'), to(y + 1, 0.15, 'easeOut'), to(y + 4, 0.15, 'easeIn'),
          to(y, 0.25, spring(0.3))],
        pose: [to(POSES.fistPumpUp, 0.2, spring(0.4)), to(POSES.fistPumpDown, 0.15, 'easeIn'),
          to(POSES.fistPumpUp, 0.15, 'easeOut'), to(POSES.fistPumpDown, 0.15, 'easeIn'), to(POSES.fistPumpUp, 0.25, spring(0.4))],
        squash: [to(1.02, 0.2), to(0.95, 0.15, 'easeIn'), to(1.02, 0.15, 'easeOut'), to(0.95, 0.15, 'easeIn'),
          to(1, 0.25, spring(0.4))],
      });
    } else if (variant === 2) {
      show.beat(0.8, {
        y: [to(y - 9, 0.13, 'easeOut'), to(y, 0.13, 'easeIn'), to(y - 12, 0.15, 'easeOut'), to(y, 0.15, 'easeIn'), to(y, 0.24)],
        pose: [to(POSES.cheer, 0.2, spring(0.45)), to(POSES.cheer, 0.6)],
        squash: [to(1.04, 0.13, 'easeOut'), to(0.92, 0.13, 'easeIn'), to(1.05, 0.15, 'easeOut'), to(0.9, 0.15, 'easeIn'),
          to(1, 0.24, spring(0.5))],
        tilt: [to(-6, 0.26, 'easeInOut'), to(6, 0.3, 'easeInOut'), to(0, 0.24, spring(0.4))],
      });
    } else if (variant === 3) {
      // Hand to the brim, lift and tip it with a little nod, set it back.
      show.beat(1.2, {
        pose: [to(POSES.tipReach, 0.25, 'easeInOut'), to(POSES.tipLift, 0.15, 'easeOut'), to(POSES.tipLift, 0.35),
          to(POSES.tipReach, 0.15, 'easeIn'), to(POSES.standing, 0.3, spring(0.3))],
        tilt: [to(0, 0.25), to(5, 0.15, 'easeOut'), to(5, 0.35), to(0, 0.45, 'easeInOut')],
        gazeX: [to(0, 0.25, 'easeOut'), to(0, 0.95)],
        gazeY: [to(0, 0.25, 'easeOut'), to(0, 0.95)],
        hatY: [to(0, 0.25), to(-h * 0.025, 0.15, 'easeOut'), to(-h * 0.025, 0.35), to(0, 0.15, 'easeIn'), to(0, 0.3)],
        hatSpin: [to(0, 0.25), to(20, 0.15, 'easeOut'), to(20, 0.35), to(0, 0.15, 'easeIn'), to(0, 0.3)],
      });
    } else {
      this.celebrate(show);
    }
    this.dive(show, key, doorName);
    return show;
  }

  /** The player has been stuck a while: he comes up and scratches his head. */
  ponder(doorName) {
    const key = this.keys[doorName];
    if (!key) return null;
    const show = new Performance();
    this.emerge(show, key, doorName);
    show.beat(1.9, {
      pose: [to(POSES.think, 0.45, spring(0.3)), to(POSES.think, 1.45)],
      tilt: [to(-3, 0.6, 'easeInOut'), to(2, 0.6, 'easeInOut'), to(0, 0.7, 'easeInOut')],
      thought: [to(0, 0.35), to(1, 0.2, 'easeOut'), to(1, 1.15), to(0, 0.2, 'easeIn')],
      gazeX: [to(0.6, 0.5, 'easeInOut'), to(-0.3, 0.7, 'easeInOut'), to(0.4, 0.7, 'easeInOut')],
      gazeY: [to(-0.8, 0.5, 'easeInOut'), to(-0.8, 1.4)],
    });
    this.dive(show, key, doorName);
    return show;
  }

  // Beats

  /** The lid flips open and he springs up out of the key, his hat bobbing off his head. */
  emerge(show, key, name) {
    const hidden = this.hiddenY(key);
    const edge = maxY(key) - 1;
    const h = this.height;
    show.beat(0.6, {
      x: [set(midX(key)), to(midX(key), 0.6)],
      y: [set(hidden), to(hidden, 0.06), to(this.standingY(key), 0.54, spring(0.35))],
      pose: [set(POSES.tuck), to(POSES.tuck, 0.22), to(POSES.standing, 0.38, spring(0.3))],
      squash: [set(1.15), to(1.12, 0.3), to(1, 0.3, spring(0.5))],
      tilt: [set(0), to(0, 0.6)],
      clip: [set(edge), to(edge, 0.42), set(NO_CLIP), to(NO_CLIP, 0.18)],
      thought: [set(0), to(0, 0.6)],
      gazeX: [set(0), to(0, 0.6)],
      gazeY: [set(0), to(0, 0.6)],
      hatFree: [set(0), to(0, 0.6)],
      hatX: [set(0), to(0, 0.6)],
      hatY: [set(0), to(0, 0.28), to(-h * 0.1, 0.12, 'easeOut'), to(0, 0.2, spring(0.4))],
      hatSpin: [set(0), to(0, 0.28), to(-8, 0.12, 'easeOut'), to(0, 0.2, spring(0.4))],
    }, [[0, { type: 'openLid', key: name }], [0, { type: 'sound', name: 'pop' }], [0.38, { type: 'closeLid' }]]);
  }

  /** Crouch, a true parabolic arc (longer jumps fly higher), squash on landing. */
  jump(show, start, end, landing = [], afterLanding = []) {
    const distance = Math.hypot(midX(end) - midX(start), end.y - start.y);
    const direction = midX(end) >= midX(start) ? 1 : -1;
    const air = 0.38 + distance / 1500;
    const half = air / 2;
    const fromY = this.standingY(start);
    const toY = this.standingY(end);
    const apex = Math.min(fromY, toY) - (this.height * 0.45 + distance * 0.1);
    const crouch = 0.16;
    const settle = 0.34;
    const landed = crouch + air + 0.01;
    // He eyes the landing spot first: up if it's higher, down if lower.
    const lookUp = end.y < start.y - 4 ? -0.8 : end.y > start.y + 4 ? 0.6 : 0.1;
    show.beat(crouch + air + settle, {
      x: [to(midX(start), crouch), to(midX(end), air), to(midX(end), settle)],
      y: [to(fromY + 5, crouch, 'easeOut'), to(apex, half, 'easeOut'), to(toY + 5, half, 'easeIn'), to(toY, settle, spring(0.3))],
      pose: [to(POSES.crouch, crouch, 'easeOut'), to(POSES.tuck, air * 0.4, 'easeOut'), to(POSES.land, air * 0.6, 'easeInOut'),
        to(POSES.standing, settle, spring(0.4))],
      squash: [to(0.86, crouch, 'easeOut'), to(1.12, 0.08, 'easeOut'), to(1, half - 0.08, 'easeInOut'), to(1.06, half, 'easeIn'),
        to(0.8, 0.08, 'easeOut'), to(1, settle - 0.08, spring(0.5))],
      tilt: [to(-3 * direction, crouch, 'easeOut'), to(8 * direction, half, 'easeOut'), to(-4 * direction, half, 'easeInOut'),
        to(0, settle, spring(0.4))],
      gazeX: [to(direction, crouch, 'easeOut'), to(direction * 0.8, air), to(0, settle, 'easeInOut')],
      gazeY: [to(lookUp, crouch, 'easeOut'), to(0.7, air, 'easeIn'), to(0, settle, 'easeInOut')],
    }, [[landed, { type: 'sound', name: 'land' }], ...landing.map((e) => [landed, e]),
      ...afterLanding.map((e) => [landed + 0.19, e])]);
  }

  /** One step to the right: up through the passing pose, down onto the leading foot. */
  walk(show, place, leading, arriving) {
    const step = 0.3;
    const y = this.standingY(place);
    show.beat(step, {
      x: [to(midX(place), step)],
      y: [to(y - 3, step / 2, 'easeOut'), to(y, step / 2, 'easeIn')],
      pose: [to(POSES.passing, step / 2, 'easeInOut'), to(leading, step / 2, 'easeInOut')],
      squash: [to(1.02, step / 2, 'easeOut'), to(0.97, step / 2, 'easeIn')],
      tilt: [to(2, step)],
      gazeX: [to(0.7, step / 2, 'easeOut'), to(0.7, step / 2)],
      gazeY: [to(0.6, step / 2, 'easeOut'), to(0.6, step / 2)],
    }, [[step, { type: 'sound', name: 'step' }], ...arriving.map((e) => [step, e])]);
  }

  /** Arms up and a little hop. */
  celebrate(show) {
    const y = show.currentY;
    show.beat(0.7, {
      y: [to(y - 10, 0.15, 'easeOut'), to(y, 0.15, 'easeIn'), to(y, 0.4)],
      pose: [to(POSES.cheer, 0.25, spring(0.45)), to(POSES.cheer, 0.45)],
      squash: [to(1.05, 0.15, 'easeOut'), to(0.9, 0.15, 'easeIn'), to(1, 0.4, spring(0.5))],
      gazeX: [to(0, 0.2, 'easeOut'), to(0, 0.5)],
      gazeY: [to(0, 0.2, 'easeOut'), to(0, 0.5)],
    });
  }

  /** A little hop, then he dives into the key; his hat hangs a moment and follows him in. */
  dive(show, key, name) {
    const y = show.currentY;
    const hidden = this.hiddenY(key);
    const edge = maxY(key) - 1;
    show.beat(0.55, {
      y: [to(y - 10, 0.16, 'easeOut'), to(hidden, 0.3, 'easeIn'), to(hidden, 0.09)],
      pose: [to(POSES.tuck, 0.16, 'easeOut'), to(POSES.tuck, 0.39)],
      squash: [to(1.08, 0.16, 'easeOut'), to(1.15, 0.3, 'easeIn'), to(1.15, 0.09)],
      tilt: [to(0, 0.16, 'easeOut'), to(0, 0.39)],
      clip: [set(edge), to(edge, 0.55)],
      gazeX: [to(0, 0.16, 'easeOut'), to(0, 0.39)],
      gazeY: [to(0.6, 0.16, 'easeOut'), to(0.6, 0.39)],
      hatY: [to(0, 0.16), to(-(hidden - y + 10) * 0.3, 0.14, 'easeOut'), to(0, 0.16, 'easeIn'), to(0, 0.09)],
      hatSpin: [to(0, 0.16), to(10, 0.14, 'easeOut'), to(0, 0.16, 'easeIn'), to(0, 0.09)],
    }, [[0, { type: 'openLid', key: name }], [0, { type: 'sound', name: 'pop' }], [0.55, { type: 'closeLid' }]]);
  }
}
