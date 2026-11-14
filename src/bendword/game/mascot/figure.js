// Bendit's drawing, ported from StickFigure.swift: one stroked path for the body (limbs, head,
// dot eyes, a mouth that curves with `smile`), and his black hat. Coordinates are relative to his
// hip, in pixels, for a figure `h` tall.
import { PROPORTIONS as P } from './motion';

const f = (n) => Math.round(n * 100) / 100;

/** A point `length` (a fraction of h) from `from`, at `degrees` from straight down. */
function step(from, degrees, length, h) {
  const radians = (degrees * Math.PI) / 180;
  return { x: from.x + Math.sin(radians) * length * h, y: from.y + Math.cos(radians) * length * h };
}

const ellipse = (c, rx, ry) => `M${f(c.x - rx)} ${f(c.y)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0`;

/** The body as an SVG path. `gaze` is {x, y} in -1…1; `blink` 0 (open) to 1 (shut). */
export function bodyPath(pose, h, gaze, blink) {
  const up = 180 - pose.lean;
  const hip = { x: 0, y: 0 };
  const neck = step(hip, up, P.torso, h);
  const shoulders = step(hip, up, P.shoulders, h);
  const radius = P.headRadius * h;
  const head = step(neck, up, P.neckGap + P.headRadius, h);
  let d = `M0 0L${f(neck.x)} ${f(neck.y)}`;
  const limb = (root, upper, lower, upperLength, lowerLength) => {
    const joint = step(root, upper, upperLength, h);
    const end = step(joint, lower, lowerLength, h);
    d += `M${f(root.x)} ${f(root.y)}L${f(joint.x)} ${f(joint.y)}L${f(end.x)} ${f(end.y)}`;
  };
  limb(shoulders, pose.leftUpperArm, pose.leftForearm, P.upperArm, P.forearm);
  limb(shoulders, pose.rightUpperArm, pose.rightForearm, P.upperArm, P.forearm);
  limb(hip, pose.leftThigh, pose.leftShin, P.thigh, P.shin);
  limb(hip, pose.rightThigh, pose.rightShin, P.thigh, P.shin);
  d += ellipse(head, radius, radius);

  // Eyes: tiny ellipses the stroke turns into dots, shifting toward his gaze and flattening to blink.
  const eyeSize = h * 0.006;
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  const look = { x: clamp(gaze.x) * 0.3 * radius, y: clamp(gaze.y) * 0.22 * radius };
  const shut = Math.max(0, Math.min(1, blink));
  for (const side of [-0.38, 0.38]) {
    const eye = { x: head.x + side * radius + look.x, y: head.y - 0.15 * radius + look.y };
    d += ellipse(eye, eyeSize * (1 + 1.6 * shut), Math.max(0.01, eyeSize * (1 - shut)));
  }
  const mouthY = head.y + 0.35 * radius;
  d += `M${f(head.x - 0.42 * radius)} ${f(mouthY)}Q${f(head.x)} ${f(mouthY + pose.smile * 0.45 * radius)} ${f(head.x + 0.42 * radius)} ${f(mouthY)}`;
  return d;
}

/** The hat's pivot, as a fraction of head radius above the head's center. */
const PIVOT_HEIGHT = 0.9;

/** Where the hat's pivot sits relative to his hip, for a figure `h` tall in `pose`. */
export function hatPivot(pose, h) {
  const lean = (pose.lean * Math.PI) / 180;
  const distance = (P.torso + P.neckGap + P.headRadius + P.headRadius * PIVOT_HEIGHT) * h;
  return { x: Math.sin(lean) * distance, y: -Math.cos(lean) * distance };
}

/**
 * His black cowboy hat: a creased crown on a brim that curls up at the tips, drawn in the head's
 * own frame so it leans with him. `offset` and `spin` (degrees clockwise about its pivot) move it
 * off its seat. Returns { hat, band } paths.
 */
export function hatPaths(pose, h, offset = { x: 0, y: 0 }, spin = 0) {
  const lean = (pose.lean * Math.PI) / 180;
  const up = { x: Math.sin(lean), y: -Math.cos(lean) };
  const right = { x: Math.cos(lean), y: Math.sin(lean) };
  const toHead = (P.torso + P.neckGap + P.headRadius) * h;
  const head = { x: up.x * toHead, y: up.y * toHead };
  const r = P.headRadius * h;
  const pivot = { x: head.x + up.x * PIVOT_HEIGHT * r, y: head.y + up.y * PIVOT_HEIGHT * r };
  const turn = (spin * Math.PI) / 180;
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  // A point x head-radii across and y head-radii up from the head's center, after spin and offset.
  const p = (x, y) => {
    const sx = head.x + (right.x * x + up.x * y) * r - pivot.x;
    const sy = head.y + (right.y * x + up.y * y) * r - pivot.y;
    return `${f(pivot.x + sx * cos - sy * sin + offset.x)} ${f(pivot.y + sx * sin + sy * cos + offset.y)}`;
  };
  // Crown, pinched in the middle like a cattleman crease; then the brim, a thin crescent.
  const hat = `M${p(-0.86, 0.6)}L${p(-0.74, 1.5)}Q${p(-0.42, 1.78)} ${p(0, 1.46)}Q${p(0.42, 1.78)} ${p(0.74, 1.5)}`
    + `L${p(0.86, 0.6)}Z M${p(-1.55, 0.95)}Q${p(0, 0.42)} ${p(1.55, 0.95)}Q${p(0, 0.14)} ${p(-1.55, 0.95)}Z`;
  const band = `M${p(-0.78, 0.86)}Q${p(0, 0.78)} ${p(0.78, 0.86)}`;
  return { hat, band };
}
