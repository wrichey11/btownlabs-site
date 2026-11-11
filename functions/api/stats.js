// GET /api/stats?days=30 — aggregate numbers for the private dashboard.
// Requires the STATS_KEY secret as a Bearer token.
import { addDays, json, puzzleDay } from '../../lib/analytics-shared.js';

function authorized(request, env) {
  const key = env.STATS_KEY;
  const header = request.headers.get('authorization') ?? '';
  return Boolean(key) && header === `Bearer ${key}`;
}

export async function onRequestGet({ request, env }) {
  if (!authorized(request, env)) return json({ error: 'unauthorized' }, 401);
  if (!env.DB) return json({ error: 'The DB binding is missing.' }, 503);

  const days = Math.max(7, Math.min(180, Number(new URL(request.url).searchParams.get('days')) || 30));
  const today = puzzleDay();
  const from = addDays(today, -(days - 1));
  // Retention cohorts need players who started up to 30 days before the window.
  const cohortFrom = addDays(from, -30);
  const q = (sql, ...args) => env.DB.prepare(sql).bind(...args).all().then((r) => r.results);

  const [daily, newPlayers, returns, sources, puzzles, countries] = await Promise.all([
    q(`SELECT day, platform, event, COUNT(*) AS n FROM events WHERE day >= ? GROUP BY day, platform, event`, from),
    q(`SELECT day, platform, COUNT(*) AS n FROM events WHERE event = 'open' AND since_first = 0 AND day >= ?
       GROUP BY day, platform`, cohortFrom),
    q(`SELECT day, since_first, COUNT(*) AS n FROM events WHERE event = 'open' AND since_first IN (1, 7, 30) AND day >= ?
       GROUP BY day, since_first`, cohortFrom),
    q(`SELECT src, COUNT(*) AS n FROM events WHERE event = 'open' AND since_first = 0 AND day >= ?
       GROUP BY src ORDER BY n DESC LIMIT 15`, from),
    q(`SELECT puzzle, MIN(day) AS day,
         SUM(event = 'start') AS starts, SUM(event = 'solve') AS solves, SUM(event = 'share') AS shares,
         ROUND(AVG(CASE WHEN event = 'solve' THEN secs END)) AS avg_secs,
         ROUND(AVG(CASE WHEN event = 'solve' THEN hints END), 2) AS avg_hints,
         ROUND(AVG(CASE WHEN event = 'solve' THEN reveals END), 2) AS avg_reveals
       FROM events WHERE mode = 'daily' AND day >= ? AND puzzle IS NOT NULL
       GROUP BY puzzle ORDER BY puzzle DESC LIMIT 60`, from),
    q(`SELECT country, COUNT(*) AS n FROM events WHERE event = 'open' AND day >= ? AND country IS NOT NULL
       GROUP BY country ORDER BY n DESC LIMIT 10`, from),
  ]);

  return json({ today, from, days, daily, newPlayers, returns, sources, puzzles, countries });
}
