import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { PROPORTIONS } from './motion';
import { bodyPath, hatPaths, hatPivot } from './figure';

const HEIGHT = 58;

/** A quick blink every few seconds, and now and then a double blink. */
function blinkAt(time) {
  const cycle = 3.1;
  const shifted = time + 1.3;
  const phase = shifted % cycle;
  const length = 0.14;
  if (phase < length) return Math.sin((Math.PI * phase) / length);
  const isDouble = Math.floor(shifted / cycle) % 3 === 2;
  if (isDouble && phase > 0.22 && phase < 0.22 + length) return Math.sin((Math.PI * (phase - 0.22)) / length);
  return 0;
}

/** Loose arms that drift a little, so he's never frozen in a pose. */
function livelyPose(pose, time) {
  const left = Math.sin(time * 4.4);
  const right = Math.sin(time * 4.4 + 0.8);
  return {
    ...pose,
    leftUpperArm: pose.leftUpperArm + 3 * left,
    leftForearm: pose.leftForearm + 4 * left,
    rightUpperArm: pose.rightUpperArm + 3 * right,
    rightForearm: pose.rightForearm + 4 * right,
  };
}

/**
 * Where the hat goes, in his own frame (before his tilt). Seated, it takes the performance's nudges
 * plus its sway; free, it's placed in screen space, undoing his tilt and lean to stay put.
 */
function hatPlacement(frame, pose) {
  const free = frame.hatFree;
  const seat = hatPivot(pose, HEIGHT);
  const upright = hatPivot({ lean: 0 }, HEIGHT);
  const target = { x: upright.x + frame.hatX, y: upright.y + frame.hatY };
  const undo = (-frame.tilt * Math.PI) / 180;
  const local = {
    x: target.x * Math.cos(undo) - target.y * Math.sin(undo),
    y: target.x * Math.sin(undo) + target.y * Math.cos(undo),
  };
  return {
    offset: {
      x: (1 - free) * frame.hatX + free * (local.x - seat.x),
      y: (1 - free) * frame.hatY + free * (local.y - seat.y),
    },
    spin: frame.hatSpin + (1 - free) * frame.hatSway - free * (frame.tilt + pose.lean),
  };
}

/** Draws Bendit over the page, every display frame, positioned from the keyboard. Never takes clicks. */
export default function MascotLayer({ director }) {
  const { performance: show, startedAt } = useSyncExternalStore(director.subscribe, director.getState);
  const [draw, setDraw] = useState(null);

  useEffect(() => {
    if (!show) return undefined;
    let raf;
    const tick = () => {
      director.checkLayout();
      if (director.getState().performance !== show || !director.keyboardEl) return;
      const origin = director.keyboardEl.getBoundingClientRect();
      const time = (window.performance.now() - startedAt) / 1000;
      setDraw({ show, origin: { x: origin.left, y: origin.top }, time, frame: show.frame(time) });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [director, show, startedAt]);

  if (!show || draw?.show !== show) return null;
  const { origin, time, frame } = draw;
  const pose = livelyPose(frame.pose, time);
  const breath = Math.sin(time * 5.2) * 0.6;
  const hipY = frame.hipY + breath;
  const line = Math.max(1.5, HEIGHT / 26);
  const hat = hatPlacement(frame, pose);
  const { hat: hatPath, band } = hatPaths(pose, HEIGHT, hat.offset, hat.spin);
  const squash = frame.squash;
  const feet = PROPORTIONS.standingLegs * HEIGHT;
  const transform = `translate(${frame.hipX} ${hipY}) rotate(${frame.tilt}) translate(0 ${feet}) `
    + `scale(${1 / Math.sqrt(Math.max(0.5, squash))} ${squash}) translate(0 ${-feet})`;
  const clipTop = -5000;
  const clipHeight = Math.max(0, Math.min(frame.clipBottom, 20000) - clipTop);
  const thoughtOnLeft = show.thoughtOnLeft;
  const thought = frame.thought;

  return createPortal(
    <div className="bwg-mascot-layer" aria-hidden="true">
      <div className="bwg-mascot-stage" style={{ transform: `translate(${origin.x}px, ${origin.y}px)` }}>
        <svg className="bwg-mascot-svg" width="1" height="1" overflow="visible">
          <defs>
            <clipPath id="bwg-mascot-clip" clipPathUnits="userSpaceOnUse">
              <rect x={-5000} y={clipTop} width={10000} height={clipHeight} />
            </clipPath>
          </defs>
          <g clipPath="url(#bwg-mascot-clip)">
            <g transform={transform}>
              <path d={bodyPath(pose, HEIGHT, { x: frame.gazeX, y: frame.gazeY }, blinkAt(time))}
                fill="none" stroke="var(--bwg-ink)" strokeWidth={line} strokeLinecap="round" strokeLinejoin="round" />
              <path d={hatPath} fill="var(--bwg-ink)" stroke="var(--bwg-ink)" strokeWidth={line * 0.5} strokeLinejoin="round" />
              <path d={band} fill="none" stroke="var(--bwg-paper)" strokeWidth={Math.max(1, line * 0.45)} strokeLinecap="round" />
            </g>
          </g>
        </svg>
        {frame.wordOpacity > 0.001 && (
          <span className="bwg-mascot-word"
            style={{ left: frame.wordX, top: frame.wordY, opacity: Math.min(1, frame.wordOpacity), transform: `translate(-50%, -50%) rotate(${frame.wordTilt}deg)` }}>
            {show.heldWord}
          </span>
        )}
        {thought > 0.001 && (
          <div className={`bwg-mascot-thought ${show.thoughtText === '?' ? 'is-mark' : ''} ${thoughtOnLeft ? 'is-left' : ''}`}
            style={{
              left: frame.hipX + HEIGHT * (thoughtOnLeft ? -0.22 : 0.22),
              top: hipY - HEIGHT * 0.5,
              opacity: Math.min(1, thought),
              transform: `translate(${thoughtOnLeft ? '-100%' : '0'}, -100%) scale(${0.5 + 0.5 * thought})`,
            }}>
            {show.thoughtText}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
