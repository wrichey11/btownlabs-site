# Bendword analytics

Anonymous gameplay counts for the web game and the iOS app, stored in Cloudflare D1 and
shown on a private dashboard. No user IDs, IP addresses, or device identifiers are stored.

## How it works

| Piece | Path |
| --- | --- |
| Event collector | `functions/api/e.js` → `POST /api/e` |
| Stats API (needs `STATS_KEY`) | `functions/api/stats.js` → `GET /api/stats?days=30` |
| Dashboard | `public/stats/bendword.html` → `/stats/bendword` |
| Database schema | `migrations/0001_events.sql` |
| Web game events | `src/bendword/game/analytics.js` |
| App events | `Bendword/Services/AnalyticsService.swift` (app repo) |

`public/_routes.json` limits Functions to `/api/*`, so every other page stays a free static request.

Events: `open` (first open of each puzzle day per device), `start`, `solve`, and `share`.
Retention is measured without IDs: each `open` carries `since_first`, the days since that
device first played. Day 7 retention = opens with `since_first = 7` ÷ new players 7 days earlier.

## One-time Cloudflare setup

1. **Create the database.** Cloudflare dashboard → Storage & Databases → D1 → Create.
   Name it `bendword-analytics`.
2. **Create the table.** Open the database → Console. Paste the contents of
   `migrations/0001_events.sql` and run it.
3. **Connect it to the site.** Workers & Pages → your btownlabs.com Pages project → Settings →
   Bindings → Add → D1 database. Variable name `DB`, database `bendword-analytics`.
   Add it for Production (and Preview if you use previews).
4. **Set the dashboard key.** Same project → Settings → Variables and Secrets → Add →
   type Secret, name `STATS_KEY`, value: a long random password. Save it in your password manager.
5. **Deploy.** Push to `main` (bindings take effect on the next deployment).
6. **Check it.** Play today's puzzle at btownlabs.com/bendword, then open
   btownlabs.com/stats/bendword and enter the key.

Optional: Pages project → Metrics → enable Web Analytics for free cookieless page-view counts.

## Limits (Workers Free plan)

100,000 requests/day, 100,000 D1 rows written/day, and a burst limit of 1,000 requests/minute.
At 3 or 4 events per player per day that's roughly 25,000 daily players. Before a big launch
spike, or once you pass ~20,000 daily players, switch to Workers Paid ($5/month).

## Local testing

```
npx wrangler d1 migrations apply bendword-analytics --local
npx wrangler pages dev   # with a temporary wrangler.toml that binds DB and sets STATS_KEY
```

The web game doesn't send events from localhost unless `window.bendwordAnalyticsForce = true`.
The app doesn't send from Debug builds unless the scheme sets `BENDWORD_ANALYTICS=1`.
