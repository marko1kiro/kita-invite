CREATE TABLE IF NOT EXISTS foundation_metadata (
  environment TEXT NOT NULL CHECK (environment IN ('dev', 'staging')),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (environment, key)
) STRICT;
