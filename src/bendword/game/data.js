import { addDays, dailyPuzzle, dayKey, newStats } from './engine';

const BASE = '/bendword/puzzles/';

async function fetchJSON(path) {
  const response = await fetch(BASE + path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Could not load ${path} (${response.status})`);
  return response.json();
}

/** Loads today's puzzle. Only the current month is fetched unless an encore is needed. */
export async function loadDailyPuzzle(today = dayKey()) {
  const month = today.slice(0, 7);
  const { months } = await fetchJSON('manifest.json');
  if (months.includes(month)) {
    const puzzles = await fetchJSON(`${month}.json`);
    const exact = puzzles.find((p) => p.date === today);
    if (exact) return exact;
  }
  // No authored puzzle today: build the same encore the app would, from every released puzzle.
  const released = months.filter((m) => m <= month);
  const all = (await Promise.all((released.length ? released : months.slice(0, 1)).map((m) => fetchJSON(`${m}.json`))))
    .flat()
    .sort((a, b) => a.date.localeCompare(b.date));
  return dailyPuzzle(all, today);
}

// MARK: - Saves (this browser only)

const KEY = 'bendword.web.v1';

export function loadSave() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return { attempts: parsed?.attempts ?? {}, stats: { ...newStats(), ...(parsed?.stats ?? {}) } };
  } catch {
    return { attempts: {}, stats: newStats() };
  }
}

export function writeSave(save) {
  try {
    // Keep the file small: drop attempts older than 60 days.
    const cutoff = addDays(dayKey(), -60);
    const attempts = Object.fromEntries(
      Object.entries(save.attempts).filter(([, a]) => !a.day || a.day >= cutoff),
    );
    window.localStorage.setItem(KEY, JSON.stringify({ attempts, stats: save.stats }));
  } catch {
    // Private browsing or full storage: play still works, it just won't be remembered.
  }
}

const INTRO_KEY = 'bendword.web.introSeen';

export function introSeen() {
  try { return window.localStorage.getItem(INTRO_KEY) === '1'; } catch { return false; }
}

export function markIntroSeen() {
  try { window.localStorage.setItem(INTRO_KEY, '1'); } catch { /* ignore */ }
}
