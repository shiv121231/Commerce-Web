CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  year TEXT NOT NULL,
  stress_freq INTEGER NOT NULL CHECK (stress_freq BETWEEN 1 AND 5),
  stress_impact INTEGER NOT NULL CHECK (stress_impact BETWEEN 1 AND 5),
  coping TEXT NOT NULL,
  coping_other TEXT NOT NULL DEFAULT '',
  calm_stationery TEXT NOT NULL,
  want_pen TEXT NOT NULL,
  fav_pen TEXT NOT NULL,
  custom_pens TEXT NOT NULL,
  annoyed TEXT NOT NULL,
  used_toy TEXT NOT NULL,
  toy_helps TEXT NOT NULL,
  quotes_inspire TEXT NOT NULL,
  quotes_help TEXT NOT NULL,
  grip_focus TEXT NOT NULL,
  quote_pen_calm TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_responses_created ON responses (created_at);
