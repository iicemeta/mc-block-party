-- =====================================================================
-- MC 联谊活动 数据库模式 v2
-- 关系：users(身份/角色) 1—1 registrations(报名) 1—N showcase(晒图)
-- 约定：时间一律 TEXT 'YYYY-MM-DD HH:MM:SS'（UTC，datetime('now')），字典序即可排序
-- 存量库迁移：见 d1/migrations/0002-users-role-showcase-fk.sql
-- （应用运行时 ensure*Schema 也会自动执行等价迁移，本文件为新库的权威模式）
-- =====================================================================

-- 用户身份表：登录过本站的所有账号。
-- role 兼任活动角色：NULL = 普通用户 / 'admin' = 管理员 / 'super' = 超级管理员
CREATE TABLE IF NOT EXISTS users (
  auth_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT '',
  role TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 按邮箱添加管理员时的大小写不敏感查找（表达式索引）
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));

-- 管理员列表（部分索引：普通用户不入索引，绝大多数行的写入零额外开销）
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role) WHERE role IS NOT NULL;

-- 报名表：一人一条（学号唯一）；auth_id 关联 melody auth 账号（登录凭证），
-- uuid 仅为历史遗留的内部关联字段（v1 showcase 外键），v2 起新写入不再依赖
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

-- 晒图表：每张上传图片一条。
-- registration_id 外键直连报名 INTEGER 主键（join 走 rowid 最快）；
-- mc_id 为报名时快照（风采墙展示免 join）；D1 默认强制外键，报名删除时级联清理
CREATE TABLE IF NOT EXISTS showcase (
  id INTEGER PRIMARY KEY,
  registration_id INTEGER NOT NULL REFERENCES registrations (id) ON DELETE CASCADE,
  mc_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 按作者查图（管理/个人视角）；风采墙按 id（行主键）倒序 LIMIT，无需时间索引
CREATE INDEX IF NOT EXISTS idx_showcase_registration ON showcase (registration_id);
