-- Bendword analytics: one row per event. No user IDs, no IP addresses, no device identifiers.
CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY,
  ts          INTEGER NOT NULL,          -- server time, Unix seconds
  day         TEXT    NOT NULL,          -- puzzle day (midnight Eastern), YYYY-MM-DD
  platform    TEXT    NOT NULL,          -- web | ios
  event       TEXT    NOT NULL,          -- open | start | solve | share
  mode        TEXT,                      -- daily | archive | practice
  puzzle      INTEGER,                   -- puzzle number
  src         TEXT,                      -- where an "open" came from (?src= or referrer host)
  since_first INTEGER,                   -- days since this device first played (0 = new player)
  days_active INTEGER,                   -- distinct days this device has played
  streak      INTEGER,
  secs        INTEGER,                   -- solve time, seconds
  hints       INTEGER,
  reveals     INTEGER,
  misses      INTEGER,
  perfect     INTEGER,                   -- 1 = no hints or reveals
  country     TEXT,                      -- two-letter country from Cloudflare, nothing finer
  version     TEXT                       -- app version, e.g. 1.9
);
CREATE INDEX IF NOT EXISTS events_day_event ON events (day, event);
