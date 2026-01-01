-- Persist full landing page form submissions (separate from CallEvent dashboard rows)
-- Keeps "all submission details" on disk while CallEvent stays a lightweight dashboard feed.

CREATE TABLE IF NOT EXISTS LandingSubmission (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  createdAt TEXT NOT NULL,

  -- Link back to the dashboard row created for this submission (best-effort)
  callEventId INTEGER,

  -- Normalized contact info / key fields for quick filtering
  phone TEXT NOT NULL,
  firstName TEXT,
  cityOrZip TEXT,
  issue TEXT,
  timeframe TEXT,

  -- Operational metadata (helps with spam triage / debugging)
  ip TEXT,
  userAgent TEXT,

  -- Full JSON payload (stringified)
  payloadJson TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_LandingSubmission_createdAt
  ON LandingSubmission (createdAt DESC);

CREATE INDEX IF NOT EXISTS idx_LandingSubmission_phone
  ON LandingSubmission (phone);





