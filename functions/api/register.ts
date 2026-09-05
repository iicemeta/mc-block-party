/// <reference types="@cloudflare/workers-types" />
import { isAuthError, requireAuth, type AuthEnv } from "../_auth";
import { errMsg, resolveD1 } from "../_lib";

export type Env = AuthEnv & {
  IMG_UPLOAD_URL?: string;
};

type RegisterBody = {
  name?: unknown;
  studentId?: unknown;
  college?: unknown;
  qq?: unknown;
  mcId?: unknown;
  skills?: unknown;
};

const SKILL_VALUES = new Set(["build", "redstone", "survival", "pvp"]);
const MAX_BODY_BYTES = 10_000;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const bad = (message: string, status = 400) => json({ ok: false, message }, status);

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

type ParsedFields = {
  name: string;
  studentId: string;
  college: string;
  qq: string;
  mcId: string;
  skills: string[];
};

function parseFields(body: RegisterBody): { fields?: ParsedFields; error?: string } {
  const name = asText(body.name);
  const studentId = asText(body.studentId);
  const college = asText(body.college);
  const qq = asText(body.qq);
  const mcId = asText(body.mcId);
  const skills = Array.isArray(body.skills) ? body.skills.map(asText) : [];

  if (!name || name.length > 40) return { error: "姓名不合法" };
  if (!/^\d{10}$/.test(studentId)) return { error: "学号不合法（应为 10 位数字，如 2026212700）" };
  if (!college || college.length > 60) return { error: "学院/班级不合法" };
  if (!/^\d{5,15}$/.test(qq)) return { error: "QQ 号不合法" };
  if (!mcId || mcId.length > 40 || /[\r\n\t]/.test(mcId)) return { error: "MC 游戏 ID 不合法" };
  if (skills.length === 0 || skills.length > 4 || skills.some((s) => !SKILL_VALUES.has(s))) {
    return { error: "擅长方向不合法" };
  }
  return {
    fields: { name, studentId, college, qq, mcId, skills },
  };
}

const CREATE_DDL = `CREATE TABLE IF NOT EXISTS registrations (
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

const AUTH_ID_INDEX_DDL =
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_auth_id ON registrations (auth_id)";

/** 已建表的存量库自动补 auth_id 列（列已存在时报错，忽略即可） */
const ADD_AUTH_ID_DDL = "ALTER TABLE registrations ADD COLUMN auth_id TEXT";

async function ensureSchema(db: D1Database): Promise<void> {
  await db.prepare(CREATE_DDL).run();
  try {
    await db.prepare(ADD_AUTH_ID_DDL).run();
  } catch {
    /* duplicate column name：列已存在，忽略 */
  }
  await db.prepare(AUTH_ID_INDEX_DDL).run();
}

type ExistingRow = {
  uuid: string;
  auth_id: string | null;
  student_id: string;
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAuth(request, env);
  if (isAuthError(auth)) return auth.error;
  const { authId } = auth;

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) return bad("请求体过大");

  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return bad("请求体不是合法 JSON");
  }

  const parsed = parseFields(body);
  if (!parsed.fields) return bad(parsed.error ?? "字段不合法");
  const { name, studentId, college, qq, mcId, skills } = parsed.fields;

  const db = resolveD1(env);
  if (!db) return bad("数据库绑定不可用", 500);

  try {
    await ensureSchema(db);

    const mine = await db
      .prepare("SELECT uuid, auth_id, student_id FROM registrations WHERE auth_id = ?1")
      .bind(authId)
      .first<ExistingRow>();

    if (mine) {
      // 本人已有报名：更新（学号锁定，以库内为准）
      await db
        .prepare(
          `UPDATE registrations
           SET name = ?1, college = ?2, qq = ?3, mc_id = ?4, skills = ?5, updated_at = datetime('now')
           WHERE auth_id = ?6`
        )
        .bind(name, college, qq, mcId, JSON.stringify(skills), authId)
        .run();
      return json({ ok: true, created: false, claimed: false });
    }

    const existing = await db
      .prepare("SELECT uuid, auth_id, student_id FROM registrations WHERE student_id = ?1")
      .bind(studentId)
      .first<ExistingRow>();

    if (!existing) {
      const uuid = crypto.randomUUID();
      await db
        .prepare(
          `INSERT INTO registrations (uuid, auth_id, name, student_id, college, qq, mc_id, skills)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
        )
        .bind(uuid, authId, name, studentId, college, qq, mcId, JSON.stringify(skills))
        .run();
      return json({ ok: true, created: true, claimed: false });
    }

    if (existing.auth_id) {
      return json(
        {
          ok: false,
          code: "already_bound",
          message:
            "该学号已绑定另一个账号，无法重复报名。如确为你本人的报名，请联系活动负责人处理。",
        },
        409
      );
    }

    // 学号已报名但从未绑定账号（存量数据）：当前登录用户自动认领
    await db
      .prepare(
        `UPDATE registrations
         SET auth_id = ?1, name = ?2, college = ?3, qq = ?4, mc_id = ?5, skills = ?6, updated_at = datetime('now')
         WHERE uuid = ?7`
      )
      .bind(authId, name, college, qq, mcId, JSON.stringify(skills), existing.uuid)
      .run();
    return json({ ok: true, created: false, claimed: true });
  } catch (e) {
    console.error("d1 error", e);
    return bad(`数据库写入失败：${errMsg(e)}`, 500);
  }
};
