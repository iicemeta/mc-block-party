/// <reference types="@cloudflare/workers-types" />

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

/** 幂等确保 registrations 表结构可用（新库建表 / 存量库补列与索引） */
export async function ensureRegistrationsSchema(db: D1Database): Promise<void> {
  await db.prepare(REGISTRATIONS_CREATE_DDL).run();
  try {
    await db.prepare(ADD_AUTH_ID_DDL).run();
  } catch {
    /* duplicate column name：列已存在，忽略 */
  }
  await db.prepare(AUTH_ID_INDEX_DDL).run();
}

const ADMINS_CREATE_DDL = `CREATE TABLE IF NOT EXISTS admins (
  auth_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

/** 幂等确保 admins 表结构可用 */
export async function ensureAdminsSchema(db: D1Database): Promise<void> {
  await db.prepare(ADMINS_CREATE_DDL).run();
}
