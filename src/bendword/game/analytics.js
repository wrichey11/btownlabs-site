// Anonymous gameplay events for btownlabs.com/api/e (Cloudflare Pages Function + D1).
// Sends no IDs: only the event, the puzzle number, and simple counts kept on this device.
import { dayKey, daysBetween } from './engine';

const KEY = 'bendword.web.activity';
const ENDPOINT = '/api/e';

function readActivity() {
  try { return JSON.parse(window.localStorage.getItem(KEY)) ?? null; } catch { return null; }
}

function writeActivity(activity) {
  try { window.localStorage.setItem(KEY, JSON.stringify(activity)); } catch { /* ignore */ }
}

function send(payload) {
  const local = /^(localhost|127\.|192\.168\.)/.test(window.location.hostname);
  if (local && !window.bendwordAnalyticsForce) {
    if (window.bendwordAnalyticsDebug) window.bendwordAnalyticsDebug.push(payload);
    return;
  }
  const body = JSON.stringify({ p: 'web', ...payload });
  try {
    if (navigator.sendBeacon?.(ENDPOINT, body)) return;
    fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {});
  } catch { /* analytics must never break the game */ }
}

/** Where this visit came from: ?src=, else the referring site, else "direct". */
function source() {
  const param = new URLSearchParams(window.location.search).get('src');
  if (param) return param;
  try {
    const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
    if (host && host !== window.location.hostname) return host;
  } catch { /* ignore */ }
  return 'direct';
}

/** Records the first open of each puzzle day on this device. */
export function trackOpen(streak) {
  const today = dayKey();
  const activity = readActivity() ?? { firstDay: today, lastDay: null, daysActive: 0 };
  if (activity.lastDay === today) return;
  activity.daysActive += 1;
  activity.lastDay = today;
  writeActivity(activity);
  send({
    e: 'open',
    src: source(),
    since_first: Math.max(0, daysBetween(activity.firstDay, today)),
    days_active: activity.daysActive,
    streak,
  });
}

export function track(event, props = {}) {
  send({ e: event, mode: 'daily', ...props });
}
