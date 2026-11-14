// Shared by the on-screen keyboard and the physical-key handling in Game.jsx.

export const ENTER = 'ENTER';
export const DELETE = 'DELETE';
export const MAX_GUESS_LENGTH = 12;

/** The on-screen key a physical key event matches, or null. */
export function keyForEvent(event) {
  if (event.metaKey || event.ctrlKey || event.altKey) return null;
  if (event.key === 'Enter') return ENTER;
  if (event.key === 'Backspace') return DELETE;
  if (/^[a-z]$/i.test(event.key)) return event.key.toUpperCase();
  return null;
}
