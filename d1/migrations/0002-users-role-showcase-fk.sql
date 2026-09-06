-- =====================================================================
-- v1 → v2 存量库迁移：admins 并入 users.role；showcase 外键改 INTEGER
-- =====================================================================
-- 执行（远程库）：
--   npx wrangler d1 execute <DB_NAME> --remote --file=d1/migrations/0002-users-role-showcase-fk.sql
-- 本地库把 --remote 换成 --local。
--
-- 注意：
-- 1. 纯 SQL 无法做条件 DDL，本脚本假定库处于 v1 状态，只应执行一次；
--    已执行过会因重复加列/建表报错，不会破坏数据。
-- 2. 不执行本脚本也可：新代码的 ensure*Schema 会在首次请求时自动完成等价迁移。
-- 3. showcase 重建采用 INNER JOIN：v1 中 registration_uuid 对不上任何报名的
--    孤儿行（理论上不应存在）会被丢弃。

-- 1) users 补 role 列（v1 的 users 表没有该列）
ALTER TABLE users ADD COLUMN role TEXT;

-- 2) admins 并入 users.role，然后退役该表
UPDATE users
   SET role = (SELECT role FROM admins WHERE admins.auth_id = users.auth_id)
 WHERE auth_id IN (SELECT auth_id FROM admins);

INSERT INTO users (auth_id, email, nickname, role, created_at, last_seen_at)
SELECT auth_id, email, '', role, created_at, datetime('now')
  FROM admins
 WHERE auth_id NOT IN (SELECT auth_id FROM users);

DROP TABLE admins;

-- 3) users 索引
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role) WHERE role IS NOT NULL;

-- 4) showcase 重建：registration_uuid(TEXT) → registration_id(INTEGER 外键)
CREATE TABLE showcase_v2 (
  id INTEGER PRIMARY KEY,
  registration_id INTEGER NOT NULL REFERENCES registrations (id) ON DELETE CASCADE,
  mc_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO showcase_v2 (id, registration_id, mc_id, image_url, caption, created_at)
SELECT s.id, r.id, s.mc_id, s.image_url, s.caption, s.created_at
  FROM showcase s
  JOIN registrations r ON r.uuid = s.registration_uuid;

DROP TABLE showcase;
ALTER TABLE showcase_v2 RENAME TO showcase;

-- v1 的 idx_showcase_created / idx_showcase_uuid 随 DROP TABLE 一并移除
CREATE INDEX IF NOT EXISTS idx_showcase_registration ON showcase (registration_id);
