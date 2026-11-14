import { useEffect, useRef, useState } from 'react';
import { DELETE, ENTER } from './keys';

// Bendword's own keyboard, matching the iOS app's: the game owns the keys, their hint highlight,
// and the trapdoor lids Bendit climbs through. Physical key presses show on these keys too.

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

function Key({ name, label, ariaLabel, kind, pressed, open, disabled, repeats, onPress }) {
  const timers = useRef({ delay: null, repeat: null });
  // Tracked by hand: the CSS :active state can stick on touch screens.
  const [touching, setTouching] = useState(false);
  const stop = () => {
    setTouching(false);
    clearTimeout(timers.current.delay);
    clearInterval(timers.current.repeat);
    timers.current = { delay: null, repeat: null };
  };
  useEffect(() => () => {
    clearTimeout(timers.current.delay);
    clearInterval(timers.current.repeat);
  }, []);

  return (
    <button
      type="button"
      data-key={name}
      className={`bwg-key is-${kind} ${pressed || touching ? 'is-pressed' : ''} ${open ? 'is-open' : ''}`}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      // Keyboard and switch users reach the keys too, but taps shouldn't leave focus rings behind.
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        if (disabled || e.button > 0) return;
        setTouching(true);
        if (!repeats) return;
        // Like the system delete key: fire now, then repeat while held.
        onPress();
        clearTimeout(timers.current.delay);
        clearInterval(timers.current.repeat);
        timers.current.delay = setTimeout(() => {
          timers.current.repeat = setInterval(onPress, 90);
        }, 450);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onClick={(e) => {
        // Repeating keys already fired on pointer-down; detail is 0 for keyboard or assistive activation.
        if (!repeats || e.detail === 0) onPress();
      }}
    >
      <span className="bwg-keyface">{label}</span>
    </button>
  );
}

export default function Keyboard({
  keyboardRef, hintedLetter, canSubmit, pressedKey, openKey, litKeys = [], onLetter, onDelete, onSubmit,
}) {
  const letterKey = (letter) => (
    <Key key={letter} name={letter} label={letter} kind={hintedLetter === letter ? 'hinted' : 'letter'}
      ariaLabel={hintedLetter === letter ? `${letter}, hinted first letter` : letter}
      pressed={pressedKey === letter || litKeys.includes(letter)} open={openKey === letter} onPress={() => onLetter(letter)} />
  );
  return (
    <div className="bwg-keyboard">
      <div className="bwg-keys" ref={keyboardRef} role="group" aria-label="Keyboard">
        <div className="bwg-keyrow">{[...ROWS[0]].map(letterKey)}</div>
        <div className="bwg-keyrow">{[...ROWS[1]].map(letterKey)}</div>
        <div className="bwg-keyrow">
          <Key name={ENTER} label="ENTER" ariaLabel="Submit guess" kind="enter"
            pressed={pressedKey === ENTER} open={openKey === ENTER} disabled={!canSubmit} onPress={onSubmit} />
          {[...ROWS[2]].map(letterKey)}
          <Key name={DELETE} label="⌫" ariaLabel="Delete" kind="action"
            pressed={pressedKey === DELETE} open={openKey === DELETE} repeats onPress={onDelete} />
        </div>
      </div>
    </div>
  );
}
