// Key names shared by the on-screen keyboard, physical keyboards, and Bendit.

export const ENTER = 'ENTER';
export const DELETE = 'DELETE';
export const MAX_GUESS_LENGTH = 12;

/** The on-screen key a physical key press matches, if any. */
export function keyForEvent(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  if (event.key === 'Enter') return ENTER;
  if (event.key === 'Backspace') return DELETE;
  if (event.key.length === 1 && /^[a-z]$/i.test(event.key)) return event.key.toUpperCase();
  return null;
}
