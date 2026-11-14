import { useEffect, useRef, useState } from 'react';
import { DELETE, ENTER } from './keys';

// Bendword's on-screen keyboard, matching the iOS app. Physical key presses show on these keys too.

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

function Key({ label, ariaLabel, className = '', pressed, disabled, repeats, onPress }) {
  const timers = useRef({ delay: null, repeat: null });
  // Tracked by hand: the CSS :active state can stick on touch screens.
  const [touching, setTouching] = useState(false);
  const stop = () => {
    setTouching(false);
    clearTimeout(timers.current.delay);
    clearInterval(timers.current.repeat);
    timers.current = { delay: null, repeat: null };
  };
  useEffect(() => stop, []);

  return (
    <button
      type="button"
      tabIndex={-1}
      className={`bwg-key ${className} ${pressed || touching ? 'is-pressed' : ''}`}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      // Keep focus (and the caret) in the guess box while tapping keys.
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        e.preventDefault();
        if (disabled) return;
        setTouching(true);
        if (!repeats) return;
        // Like the system delete key: fire now, then repeat while held.
        onPress();
        stop();
        timers.current.delay = setTimeout(() => {
          timers.current.repeat = setInterval(onPress, 90);
        }, 450);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onClick={(e) => {
        // Repeating keys already fired on pointer-down; e.detail is 0 for keyboard or assistive activation.
        if (!repeats || e.detail === 0) onPress();
      }}
    >
      {label}
    </button>
  );
}

export default function Keyboard({ pressedKey, hintedLetter, litKeys = [], openKey, canSubmit, onLetter, onDelete, onSubmit }) {
  return (
    <div className="bwg-keys" role="group" aria-label="Keyboard">
      {ROWS.map((row, index) => (
        <div className="bwg-keyrow" key={row}>
          {index === 2 && (
            <Key label="Enter" ariaLabel="Submit guess" className="is-wide is-enter"
              pressed={pressedKey === ENTER} disabled={!canSubmit} onPress={onSubmit} />
          )}
          {[...row].map((letter) => (
            <Key key={letter} label={letter} className={`${hintedLetter === letter ? 'is-hinted' : ''} ${litKeys.includes(letter) ? 'is-lit' : ''} ${openKey === letter ? 'is-open' : ''}`}
              pressed={pressedKey === letter} onPress={() => onLetter(letter)} />
          ))}
          {index === 2 && (
            <Key label="⌫" ariaLabel="Delete" className="is-wide is-action"
              pressed={pressedKey === DELETE} repeats onPress={onDelete} />
          )}
        </div>
      ))}
    </div>
  );
}
