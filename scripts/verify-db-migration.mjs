/**
 * 数据库模式 v2 迁移验证（Node 22+ 内置 node:sqlite，无需任何依赖）。
 *
 * 在内存 SQLite 中分别模拟两条路径并断言结果：
 *   A. 存量库路径：v1 建表 + 种子数据 → 执行 d1/migrations/0002-*.sql → 断言合并/重建/外键/索引
 *   B. 新库路径：直接执行 d1/schema.sql → 断言结构可写
 * 并用 EXPLAIN QUERY PLAN 确认关键查询都命中索引。
 *
 * 运行：node scripts/verify-db-migration.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const migrationSql = readFileSync(join(root, "d1/migrations/0002-users-role-showcase-fk.sql"), "utf8");
const schemaSql = readFileSync(join(root, "d1/schema.sql"), "utf8");

let failed = 0;
const assert = (cond, msg) => {
  if (cond) {
    console.log("PASS:", msg);
  } else {
    failed++;
    console.error("FAIL:", msg);
  }
};

/** v1 模式 + 种子数据：2 名普通用户、超管+管理员、2 条报名、3 张图（1 张孤儿图） */
function createLegacyDb() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (
      auth_id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      nickname TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE admins (
      auth_id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE registrations (
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
    CREATE TABLE showcase (
      id INTEGER PRIMARY KEY,
      registration_uuid TEXT NOT NULL,
      mc_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_showcase_created ON showcase (created_at DESC);
    CREATE INDEX idx_showcase_uuid ON showcase (registration_uuid);

    INSERT INTO users (auth_id, email, nickname) VALUES
      ('u-alice', 'alice@x.com', 'Alice'),
      ('u-bob',   'bob@x.com',   'Bob');
    INSERT INTO admins (auth_id, email, role) VALUES
      ('u-super', 'super@x.com', 'super'),   -- 同时在 users（模拟先 sync 后晋升）
      ('u-carol', 'carol@x.com', 'admin');   -- 不在 users（模拟只在 admins）
    INSERT INTO registrations (uuid, auth_id, name, student_id, college, qq, mc_id, skills) VALUES
      ('uuid-a', 'u-alice', 'Alice', '2026000001', 'A 学院', '10001', 'AliceMC', '["build"]'),
      ('uuid-b', 'u-bob',   'Bob',   '2026000002', 'B 学院', '10002', 'BobMC',   '["pvp"]');
    INSERT INTO showcase (registration_uuid, mc_id, image_url, caption) VALUES
      ('uuid-a', 'AliceMC', 'https://img/a1.png', '一图'),
      ('uuid-a', 'AliceMC', 'https://img/a2.png', '二图'),
      ('uuid-b', 'BobMC',   'https://img/b1.png', '一图'),
      ('uuid-gone', 'Ghost', 'https://img/g.png', '孤儿图（报名已不存在）');
  `);
  return db;
}

const tableNames = (db) =>
  db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name").all().map((r) => r.name);
const indexNames = (db) =>
  db.prepare("SELECT name FROM sqlite_schema WHERE type = 'index' AND name IS NOT NULL").all().map((r) => r.name);
const plan = (db, sql, params = []) =>
  db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all(...params).map((r) => r.detail);

// ---------------- 路径 A：存量库迁移 ----------------
{
  const db = createLegacyDb();
  db.exec("BEGIN");
  try {
    db.exec(migrationSql);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }

  assert(
    JSON.stringify(tableNames(db).sort()) === JSON.stringify(["registrations", "showcase", "users"]),
    "迁移后只剩 users / registrations / showcase 三张表"
  );

  const superRow = db.prepare("SELECT role, nickname, created_at FROM users WHERE auth_id = 'u-super'").get();
  assert(superRow?.role === "super", "已在 users 的超管角色被正确合并");
  const carol = db.prepare("SELECT role, email, created_at FROM users WHERE auth_id = 'u-carol'").get();
  assert(carol?.role === "admin" && carol.email === "carol@x.com", "只在 admins 中的管理员被并入 users");
  const alice = db.prepare("SELECT role FROM users WHERE auth_id = 'u-alice'").get();
  assert(alice?.role === null, "普通用户 role 保持 NULL");
  assert(db.prepare("SELECT COUNT(*) AS c FROM users").get().c === 4, "users 共 4 行（2 普通 + 超管 + 管理员）");

  const shots = db.prepare("SELECT registration_id, mc_id FROM showcase ORDER BY id").all();
  assert(shots.length === 3, `孤儿晒图被丢弃、有效图保留（${shots.length} 行）`);
  const aliceId = db.prepare("SELECT id FROM registrations WHERE uuid = 'uuid-a'").get().id;
  assert(shots.filter((s) => s.mc_id === "AliceMC").every((s) => s.registration_id === aliceId), "registration_id 正确映射到报名 INTEGER 主键");

  // 管理员视角联查（showcase 接口的 admin 查询：图片编号 + 学号）
  const adminRows = db
    .prepare(
      `SELECT s.id, s.mc_id, s.image_url, s.caption, s.created_at, r.student_id
       FROM showcase s JOIN registrations r ON r.id = s.registration_id
       ORDER BY s.id DESC LIMIT 60`
    )
    .all();
  assert(adminRows.length === 3 && adminRows.every((r) => typeof r.id === "number" && r.student_id), "管理员联查返回图片编号与学号");
  // 普通访客查询（不含学号列）
  const publicRows = db
    .prepare("SELECT id, mc_id, image_url, caption, created_at FROM showcase ORDER BY id DESC LIMIT 60")
    .all();
  assert(publicRows.length === 3 && publicRows.every((r) => !("student_id" in r)), "普通访客查询不返回学号");

  // 外键级联：删除报名应清掉其晒图
  db.prepare("DELETE FROM registrations WHERE uuid = 'uuid-a'").run();
  assert(db.prepare("SELECT COUNT(*) AS c FROM showcase WHERE mc_id = 'AliceMC'").get().c === 0, "ON DELETE CASCADE 级联清理晒图");
  // 外键完整性：孤儿 registration_id 不允许写入
  let fkRejected = false;
  try {
    db.prepare("INSERT INTO showcase (registration_id, mc_id, image_url) VALUES (99999, 'X', 'https://x')").run();
  } catch {
    fkRejected = true;
  }
  assert(fkRejected, "向不存在的 registration_id 插入被外键拒绝");

  const idx = indexNames(db);
  assert(idx.includes("idx_users_email_lower") && idx.includes("idx_users_role"), "users 两个索引已建立");
  assert(idx.includes("idx_showcase_registration") && !idx.includes("idx_showcase_created") && !idx.includes("idx_showcase_uuid"), "showcase 索引已对齐查询（无废弃时间索引）");

  // 新代码写入路径
  const r = db
    .prepare("INSERT INTO showcase (registration_id, mc_id, image_url, caption) VALUES (?1, ?2, ?3, ?4)")
    .run(db.prepare("SELECT id FROM registrations WHERE uuid = 'uuid-b'").get().id, "BobMC", "https://img/b2.png", "新图");
  assert(Number(r.changes) === 1, "v2 写入路径可用");

  // 查询计划：点查走索引
  assert(plan(db, "SELECT auth_id FROM users WHERE lower(email) = ?1", ["a@x.com"]).join(" ").includes("idx_users_email_lower"), "lower(email) 点查命中表达式索引");
  assert(plan(db, "SELECT auth_id FROM users WHERE role IS NOT NULL").join(" ").includes("idx_users_role"), "管理员列表命中部分索引");
  assert(plan(db, "SELECT mc_id FROM showcase WHERE registration_id = ?1", [1]).join(" ").includes("idx_showcase_registration"), "按作者查图命中索引");
  assert(!plan(db, "SELECT mc_id FROM showcase ORDER BY id DESC LIMIT 60").join(" ").includes("TEMP B-TREE"), "风采墙按行主键倒序无需排序");

  db.close();
}

// ---------------- 路径 B：新库直接建 v2 ----------------
{
  const db = new DatabaseSync(":memory:");
  db.exec(schemaSql);
  assert(JSON.stringify(tableNames(db).sort()) === JSON.stringify(["registrations", "showcase", "users"]), "新库模式为三表结构");

  db.prepare("INSERT INTO users (auth_id, email, nickname, role) VALUES ('u1', 'a@x.com', 'A', 'admin')").run();
  db.prepare(
    "INSERT INTO registrations (uuid, auth_id, name, student_id, college, qq, mc_id, skills) VALUES ('uuid-1', 'u1', 'A', '2026000009', 'C', '10009', 'AMC', '[\"build\"]')"
  ).run();
  const regId = db.prepare("SELECT id FROM registrations WHERE auth_id = 'u1'").get().id;
  db.prepare("INSERT INTO showcase (registration_id, mc_id, image_url) VALUES (?1, 'AMC', 'https://img/x.png')").run(regId);
  assert(db.prepare("SELECT COUNT(*) AS c FROM showcase").get().c === 1, "新库可正常写入三表数据");

  const admins = db.prepare("SELECT auth_id FROM users WHERE role IS NOT NULL").all();
  assert(admins.length === 1, "管理员列表查询可用");
  db.close();
}

if (failed > 0) {
  console.error(`\n${failed} 项验证失败`);
  process.exit(1);
}
console.log("\n数据库迁移验证全部通过");
