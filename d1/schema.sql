-- 报名表：一人一条（学号唯一）；auth_id 关联 melody auth 账号（登录凭证），
-- uuid 仅为内部关联字段（showcase 外键），不再作为用户凭证
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY,
  uuid TEXT NOT NULL UNIQUE,
  auth_id TEXT UNIQUE,
  name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  college TEXT NOT NULL,
  qq TEXT NOT NULL,
  mc_id TEXT NOT NULL,
  skills TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 风采展示表：每张上传的图片一条，关联报名 UUID 并快照 MC 游戏 ID
CREATE TABLE IF NOT EXISTS showcase (
  id INTEGER PRIMARY KEY,
  registration_uuid TEXT NOT NULL,
  mc_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_showcase_created ON showcase (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_showcase_uuid ON showcase (registration_uuid);
