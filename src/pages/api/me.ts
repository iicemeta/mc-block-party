import type { APIContext } from "astro";
import { env } from "cloudflare:workers";
import { isAuthError, requireAuth } from "../../server/_auth";
import { ensureRegistrationsSchema } from "../../server/_db";
import { resolveD1 } from "../../server/_lib";

export const prerender = false;

const SKILL_VALUES = new Set(["build", "redstone", "survival", "pvp"]);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const bad = (message: string, status = 400) => json({ ok: false, message }, status);

type RegistrationRow = {
  name: string;
  student_id: string;
  college: string;
  qq: string;
  mc_id: string;
  skills: string;
};

export async function GET(context: APIContext): Promise<Response> {
  const request = context.request;
  const auth = await requireAuth(request, env);
  if (isAuthError(auth)) return auth.error;
  const { authId } = auth;

  const db = resolveD1(env);
  if (!db) return bad("数据库绑定不可用", 500);

  try {
    await ensureRegistrationsSchema(db);

    const row = await db
      .prepare(
        "SELECT name, student_id, college, qq, mc_id, skills FROM registrations WHERE auth_id = ?1"
      )
      .bind(authId)
      .first<RegistrationRow>();

    if (!row) return json({ ok: true, registration: null });

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
    return bad("数据库查询失败，请稍后重试", 500);
  }
}
