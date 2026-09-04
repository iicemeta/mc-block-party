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
};

const SKILL_VALUES = new Set(["build", "redstone", "survival", "pvp"]);
const EXPECTED_ACTION = "register";
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

function isD1(value: unknown): value is D1Database {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { prepare?: unknown }).prepare === "function" &&
    typeof (value as { batch?: unknown }).batch === "function"
  );
}

export function resolveD1(env: Env): D1Database | null {
  const preferred = ["DB", "mc_block_party_db", "MC_BLOCK_PARTY_DB"];
  for (const key of preferred) {
    const candidate = env[key];
    if (isD1(candidate)) return candidate;
  }
  for (const candidate of Object.values(env)) {
    if (isD1(candidate)) return candidate;
  }
  return null;
}

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

  const name = asText(body.name);
  const studentId = asText(body.studentId);
  const college = asText(body.college);
  const qq = asText(body.qq);
  const mcId = asText(body.mcId);
  const skills = Array.isArray(body.skills) ? body.skills.map(asText) : [];

  if (!name || name.length > 40) return bad("姓名不合法");
  if (!/^[A-Za-z0-9-]{4,20}$/.test(studentId)) return bad("学号不合法");
  if (!college || college.length > 60) return bad("学院/班级不合法");
  if (!/^\d{5,15}$/.test(qq)) return bad("QQ 号不合法");
  if (!mcId || mcId.length > 40 || /[\r\n\t]/.test(mcId)) return bad("MC 游戏 ID 不合法");
  if (
    skills.length === 0 ||
    skills.length > 4 ||
    skills.some((s) => !SKILL_VALUES.has(s))
  ) {
    return bad("擅长方向不合法");
  }

  const verifyError = await siteverify(secret, turnstileToken, env.TURNSTILE_HOSTNAMES);
  if (verifyError !== null) return bad(verifyError, 403);

  const db = resolveD1(env);
  if (!db) return bad("数据库绑定不可用", 500);

  try {
    await db.prepare(
      `CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        student_id TEXT NOT NULL UNIQUE,
        college TEXT NOT NULL,
        qq TEXT NOT NULL,
        mc_id TEXT NOT NULL,
        skills TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    ).run();

    const insert = await db
      .prepare(
        `INSERT INTO registrations (name, student_id, college, qq, mc_id, skills)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(student_id) DO UPDATE SET
           name = excluded.name,
           college = excluded.college,
           qq = excluded.qq,
           mc_id = excluded.mc_id,
           skills = excluded.skills,
           updated_at = datetime('now')`
      )
      .bind(name, studentId, college, qq, mcId, JSON.stringify(skills))
      .run();

    return json({ ok: true, id: insert.meta?.last_row_id ?? null });
  } catch (e) {
    console.error("d1 error", e);
    return bad("数据库写入失败，请稍后重试", 500);
  }
};
