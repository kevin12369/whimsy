CREATE TABLE IF NOT EXISTS game_history (
  id            TEXT PRIMARY KEY,
  prompt        TEXT NOT NULL,
  genre         TEXT NOT NULL,
  llm_model     TEXT NOT NULL,
  attempts      INTEGER NOT NULL DEFAULT 1,
  final_status  TEXT NOT NULL,
  r2_key        TEXT,
  error         TEXT,
  byte_size     INTEGER,
  created_at    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_game_history_created ON game_history(created_at DESC);
