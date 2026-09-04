/// <reference types="@cloudflare/workers-types" />

export type Env = {
  TURNSTILE_SECRET?: string;
  TURNSTILE_HOSTNAMES?: string;
} & Record<string, unknown>;

type RegisterBody = {
  name?: unknown;
  studentId?: unknown;
  college?: unknown;
  qq?: unknown;
  mcId?: unknown;
  skills?: unknown;
  turnstileToken?: unknown;
  uuid?: unknown;
};

const SKILL_VALUES = new Set(["build", "redstone", "survival", "pvp"]);
const EXPECTED_ACTION = "register";
const MAX_BODY_BYTES = 10_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const bad = (message: string, status = 400) => json({ ok: false, message }, status);

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isD1(value: unknown): value is D1Database {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { prepare?: unknown }).prepare === "function" &&
    typeof (value as { batch?: unknown }).batch === "function"
  );
}

export function resolveD1(env: Env): D1Database | null {
  const preferred = ["DB", "mc_block_party_db", "MC_BLOCK_PARTY_DB", "mc-block-party-db"];
  for (const key of preferred) {
    const candidate = (env as Record<string, unknown>)[key];
    if (isD1(candidate)) return candidate;
  }
  for (const candidate of Object.values(env)) {
    if (isD1(candidate)) return candidate;
  }
  return null;
}

const errMsg = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

async function siteverify(
  secret: string,
  token: string,
  allowlistCsv?: string
): Promise<string | null> {
  const allowlist = (allowlistCsv ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ secret, response: token }),
    });
    if (!res.ok) return "验证服务不可用，请稍后重试";
    const result = (await res.json()) as {
      success: boolean;
      action?: string;
      hostname?: string;
    };
    if (!result.success) return "人机验证未通过，请重新验证后再提交";
    if (result.action !== EXPECTED_ACTION) return "验证类型不符";
    if (allowlist.length > 0 && (!result.hostname || !allowlist.includes(result.hostname))) {
      return "验证来源域名不符";
    }
    return null;
  } catch {
    return "验证服务连接失败，请稍后重试";
  }
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
  if (!/^[A-Za-z0-9-]{4,20}$/.test(studentId)) return { error: "学号不合法" };
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
  name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  college TEXT NOT NULL,
  qq TEXT NOT NULL,
  mc_id TEXT NOT NULL,
  skills TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

type ExistingRow = { uuid: string };

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) return bad("服务端未配置 TURNSTILE_SECRET", 500);

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) return bad("请求体过大");

  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return bad("请求体不是合法 JSON");
  }

  const turnstileToken = asText(body.turnstileToken);
  if (!turnstileToken || turnstileToken.length > 2048) {
    return bad("缺少人机验证凭证，请先完成验证");
  }

  const parsed = parseFields(body);
  if (!parsed.fields) return bad(parsed.error ?? "字段不合法");
  const { name, studentId, college, qq, mcId, skills } = parsed.fields;

  const clientUuid = asText(body.uuid);
  if (clientUuid && !UUID_RE.test(clientUuid)) return bad("UUID 格式不正确");

  const verifyError = await siteverify(secret, turnstileToken, env.TURNSTILE_HOSTNAMES);
  if (verifyError !== null) return bad(verifyError, 403);

  const db = resolveD1(env);
  if (!db) return bad("数据库绑定不可用", 500);

  try {
    await db.prepare(CREATE_DDL).run();

    const existing = await db
      .prepare("SELECT uuid FROM registrations WHERE student_id = ?1")
      .bind(studentId)
      .first<ExistingRow>();

    if (!existing) {
      const uuid = crypto.randomUUID();
      await db
        .prepare(
          `INSERT INTO registrations (uuid, name, student_id, college, qq, mc_id, skills)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
        )
        .bind(uuid, name, studentId, college, qq, mcId, JSON.stringify(skills))
        .run();
      return json({ ok: true, uuid, created: true });
    }

    if (!clientUuid) {
      return json(
        {
          ok: false,
          code: "already_registered",
          message:
            "该学号的同学已经报名。如需修改报名信息，请输入报名时获得的 UUID；如你从未报名但学号被占用，请联系活动负责人处理。",
        },
        409
      );
    }

    if (clientUuid.toLowerCase() !== existing.uuid.toLowerCase()) {
      return json(
        {
          ok: false,
          code: "uuid_mismatch",
          message: "UUID 与该学号的报名记录不匹配，无法修改。如确为你本人的报名，请联系活动负责人处理。",
        },
        403
      );
    }

    await db
      .prepare(
        `UPDATE registrations
         SET name = ?1, college = ?2, qq = ?3, mc_id = ?4, skills = ?5, updated_at = datetime('now')
         WHERE student_id = ?6`
      )
      .bind(name, college, qq, mcId, JSON.stringify(skills), studentId)
      .run();
    return json({ ok: true, uuid: existing.uuid, updated: true });
  } catch (e) {
    console.error("d1 error", e);
    return bad(`数据库写入失败：${errMsg(e)}`, 500);
  }
};

type RegistrationRow = {
  name: string;
  student_id: string;
  college: string;
  qq: string;
  mc_id: string;
  skills: string;
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const uuid = (url.searchParams.get("uuid") ?? "").trim();
  if (!UUID_RE.test(uuid)) return bad("UUID 格式不正确");

  const db = resolveD1(env);
  if (!db) return bad("数据库绑定不可用", 500);

  try {
    const row = await db
      .prepare(
        "SELECT name, student_id, college, qq, mc_id, skills FROM registrations WHERE uuid = ?1"
      )
      .bind(uuid)
      .first<RegistrationRow>();
    if (!row) return json({ ok: false, message: "未找到该 UUID 对应的报名记录" }, 404);
    let skills: string[] = [];
    try {
      const parsed = JSON.parse(row.skills);
      if (Array.isArray(parsed)) skills = parsed.filter((s) => SKILL_VALUES.has(s));
    } catch {
      /* 容忍脏数据，返回空数组 */
    }
    return json({
      ok: true,
      registration: {
        name: row.name,
        studentId: row.student_id,
        college: row.college,
        qq: row.qq,
        mcId: row.mc_id,
        skills,
      },
    });
  } catch (e) {
    console.error("d1 error", e);
    return bad(`数据库查询失败：${errMsg(e)}`, 500);
  }
};
