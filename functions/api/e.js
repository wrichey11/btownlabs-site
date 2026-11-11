// POST /api/e — records one anonymous gameplay event from the web game or the iOS app.
// Stores no IP address, user ID, or device identifier. See migrations/0001_events.sql.
import { puzzleDay } from '../../lib/analytics-shared.js';

const EVENTS = new Set(['open', 'start', 'solve', 'share']);
const PLATFORMS = new Set(['web', 'ios']);
const MODES = new Set(['daily', 'archive', 'practice']);

const int = (v, max = 100000) => (Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : null);
const word = (v, max = 40) => (typeof v === 'string' && v ? v.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, max) || null : null);

export async function onRequestPost({ request, env }) {
  if (!env.DB) return new Response(null, { status: 503 });
  let body;
  try {
    const text = await request.text();
    if (text.length > 2000) return new Response(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!body || !EVENTS.has(body.e) || !PLATFORMS.has(body.p)) return new Response(null, { status: 400 });

  const now = new Date();
  await env.DB.prepare(
    `INSERT INTO events (ts, day, platform, event, mode, puzzle, src, since_first, days_active, streak,
       secs, hints, reveals, misses, perfect, country, version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    Math.floor(now.getTime() / 1000),
    puzzleDay(now),
    body.p,
    body.e,
    MODES.has(body.mode) ? body.mode : null,
    int(body.puzzle, 1e7),
    body.e === 'open' ? word(body.src) ?? 'direct' : null,
    int(body.since_first, 10000),
    int(body.days_active, 10000),
    int(body.streak, 10000),
    int(body.secs, 86400),
    int(body.hints, 100),
    int(body.reveals, 100),
    int(body.misses, 1000),
    body.perfect == null ? null : body.perfect ? 1 : 0,
    word(request.cf?.country, 2),
    word(body.v, 16),
  ).run();

  return new Response(null, { status: 204 });
}

export function onRequest() {
  return new Response(null, { status: 405, headers: { allow: 'POST' } });
}
