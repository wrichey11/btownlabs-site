import { useEffect, useRef } from 'react';

const SO_CLOSE = ['So close!', 'Almost!', 'Nearly there!'];

function Figure({ pose = 'stand' }) {
  return (
    <svg className={`bwg-bendit-figure is-${pose}`} viewBox="0 0 64 96" aria-hidden="true">
      <g className="bwg-bendit-body" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="21" r="11" />
        <path d="M32 32v27M18 44l14 9 14-9M32 59 20 82M32 59l13 23" />
        <path className="bwg-bendit-smile" d="M27 24q5 5 10 0" />
      </g>
      <g className="bwg-bendit-hat" fill="currentColor">
        <path d="M18 15q14-7 28 0l-3-10q-11-5-22 0Z" />
        <path d="M12 15q20 6 40 0-4 8-40 0Z" />
      </g>
      <circle cx="28" cy="19" r="1.3" /><circle cx="36" cy="19" r="1.3" />
    </svg>
  );
}
/** Bendit, the keyboard mascot. Motion is deliberately CSS-driven so Reduce Motion can disable it. */
export default function Mascot({ event, enabled = true, sound = true, onDone }) {
  const lastPlayed = useRef(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);
  useEffect(() => {
    if (!enabled || !event || lastPlayed.current === event.id) return undefined;
    lastPlayed.current = event.id;
    if (sound && event.sound) {
      const audio = new Audio(`/bendword/sounds/mascot_${event.sound}.wav`);
      audio.volume = 0.32;
      audio.play().catch(() => {});
    }
    const timer = window.setTimeout(() => onDoneRef.current?.(event.id), event.duration ?? 2100);
    return () => window.clearTimeout(timer);
  }, [enabled, event, sound]);

  if (!enabled || !event) return null;
  const message = event.message ?? (event.kind === 'close' ? SO_CLOSE[event.variant % SO_CLOSE.length] : null);
  return (
    <div className={`bwg-bendit is-${event.kind}`} role="status" aria-live="polite">
      {message && <p className="bwg-bendit-bubble">{message}</p>}
      <Figure pose={event.kind} />
      <span className="bwg-sr">Bendit: {message ?? event.label ?? event.kind}</span>
    </div>
  );
}
