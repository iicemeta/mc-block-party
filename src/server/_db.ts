/**
 * isolate 生命周期内的 schema 结果缓存：同一 D1 绑定只执行一次建表 / 补列 / 迁移，
 * 避免每个请求都多出 2-3 次 D1 往返。失败时清除缓存，下次请求可重试。
 */
const schemaReady = new WeakMap<D1Database, Map<string, Promise<void>>>();

function ensureOnce(db: D1Database, key: string, run: () => Promise<void>): Promise<void> {
  let cache = schemaReady.get(db);
  if (!cache) {
    cache = new Map();
    schemaReady.set(db, cache);
  }
  let pending = cache.get(key);
  if (!pending) {
    pending = run().catch((e) => {
      cache!.delete(key);
      throw e;
    });
    cache.set(key, pending);
  }
  return pending;
}

const REGISTRATIONS_CREATE_DDL = `CREATE TABLE IF NOT EXISTS registrations (
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
)`;

/** 已建表的存量库自动补 auth_id 列（列已存在时报错，忽略即可） */
const ADD_AUTH_ID_DDL = "ALTER TABLE registrations ADD COLUMN auth_id TEXT";

const AUTH_ID_INDEX_DDL =
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_auth_id ON registrations (auth_id)";

/** 幂等确保 registrations 表结构可用（新库建表 / 存量库补列与索引），结果按绑定缓存 */
export function ensureRegistrationsSchema(db: D1Database): Promise<void> {
  return ensureOnce(db, "registrations", async () => {
    await db.prepare(REGISTRATIONS_CREATE_DDL).run();
    try {
      await db.prepare(ADD_AUTH_ID_DDL).run();
    } catch {
      /* duplicate column name：列已存在，忽略 */
    }
    await db.prepare(AUTH_ID_INDEX_DDL).run();
  });
}

const USERS_CREATE_DDL = `CREATE TABLE IF NOT EXISTS users (
  auth_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT '',
  role TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

/** v1 的 users 表没有 role 列，存量库补列（列已存在时报错，忽略即可） */
const ADD_USERS_ROLE_DDL = "ALTER TABLE users ADD COLUMN role TEXT";

/** 按邮箱添加管理员时的大小写不敏感查找 */
const USERS_EMAIL_INDEX_DDL =
  "CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email))";

/** 管理员列表（部分索引：普通用户不入索引） */
const USERS_ROLE_INDEX_DDL =
  "CREATE INDEX IF NOT EXISTS idx_users_role ON users (role) WHERE role IS NOT NULL";

/**
 * 幂等确保 users 表结构可用（新库建表 / 存量库补 role 列），
 * 并把 v1 遗留的 admins 表并入 users.role 后退役，结果按绑定缓存。
 */
export function ensureUsersSchema(db: D1Database): Promise<void> {
  return ensureOnce(db, "users", async () => {
    await db.prepare(USERS_CREATE_DDL).run();
    try {
      await db.prepare(ADD_USERS_ROLE_DDL).run();
    } catch {
      /* duplicate column name：列已存在，忽略 */
    }
    await db.prepare(USERS_EMAIL_INDEX_DDL).run();
    await db.prepare(USERS_ROLE_INDEX_DDL).run();
    await mergeLegacyAdmins(db);
  });
}

/** v1 的 admins 表并入 users.role（admins 优先），完成后删表；无遗留表时零成本跳过 */
async function mergeLegacyAdmins(db: D1Database): Promise<void> {
  const legacy = await db
    .prepare("SELECT 1 AS x FROM sqlite_schema WHERE type = 'table' AND name = 'admins'")
    .first<{ x: number }>();
  if (!legacy) return;
  await db.batch([
    db.prepare(
      `UPDATE users
       SET role = (SELECT role FROM admins WHERE admins.auth_id = users.auth_id)
       WHERE auth_id IN (SELECT auth_id FROM admins)`
    ),
    db.prepare(
      `INSERT INTO users (auth_id, email, nickname, role, created_at, last_seen_at)
       SELECT auth_id, email, '', role, created_at, datetime('now')
       FROM admins WHERE auth_id NOT IN (SELECT auth_id FROM users)`
    ),
    db.prepare("DROP TABLE admins"),
  ]);
}

const SHOWCASE_CREATE_DDL = `CREATE TABLE IF NOT EXISTS showcase (
  id INTEGER PRIMARY KEY,
  registration_id INTEGER NOT NULL REFERENCES registrations (id) ON DELETE CASCADE,
  mc_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

/** 按作者查图；风采墙按 id（行主键）倒序 LIMIT，无需时间索引 */
const SHOWCASE_INDEX_DDL =
  "CREATE INDEX IF NOT EXISTS idx_showcase_registration ON showcase (registration_id)";

/**
 * v1 showcase（registration_uuid TEXT，无外键）→ v2（registration_id INTEGER 外键）。
 * INNER JOIN 迁移：对不上报名的孤儿行会被丢弃（v1 流程保证先报名后晒图，理论上不存在）。
 * 返回是否执行了重建。
 */
async function rebuildLegacyShowcase(db: D1Database): Promise<boolean> {
  const row = await db
    .prepare("SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'showcase'")
    .first<{ sql: string | null }>();
  const ddl = row?.sql ?? "";
  if (!ddl) return false; // 表不存在：新库
  if (!ddl.includes("registration_uuid")) return false; // 已是 v2
  await db.batch([
    db.prepare(`CREATE TABLE showcase_v2 (
      id INTEGER PRIMARY KEY,
      registration_id INTEGER NOT NULL REFERENCES registrations (id) ON DELETE CASCADE,
      mc_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(
      `INSERT INTO showcase_v2 (id, registration_id, mc_id, image_url, caption, created_at)
       SELECT s.id, r.id, s.mc_id, s.image_url, s.caption, s.created_at
       FROM showcase s JOIN registrations r ON r.uuid = s.registration_uuid`
    ),
    db.prepare("DROP TABLE showcase"),
    db.prepare("ALTER TABLE showcase_v2 RENAME TO showcase"),
  ]);
  return true;
}

/** 幂等确保 showcase 表结构可用（新库建 v2 / 存量库自动重建），结果按绑定缓存 */
export function ensureShowcaseSchema(db: D1Database): Promise<void> {
  return ensureOnce(db, "showcase", async () => {
    const rebuilt = await rebuildLegacyShowcase(db);
    if (!rebuilt) {
      const exists = await db
        .prepare("SELECT 1 AS x FROM sqlite_schema WHERE type = 'table' AND name = 'showcase'")
        .first<{ x: number }>();
      if (!exists) await db.prepare(SHOWCASE_CREATE_DDL).run();
    }
    await db.prepare(SHOWCASE_INDEX_DDL).run();
  });
}

export type UserUpsert = {
  authId: string;
  email: string;
  nickname: string;
};

/** 登录用户档案落库（存在则刷新邮箱/昵称/最近在线时间，角色不动） */
export async function upsertUser(db: D1Database, user: UserUpsert): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (auth_id, email, nickname) VALUES (?1, ?2, ?3)
       ON CONFLICT(auth_id) DO UPDATE SET
         email = ?2,
         nickname = ?3,
         last_seen_at = datetime('now')`
    )
    .bind(user.authId, user.email, user.nickname)
    .run();
}
