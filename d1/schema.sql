CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  college TEXT NOT NULL,
  qq TEXT NOT NULL,
  mc_id TEXT NOT NULL,
  skills TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
