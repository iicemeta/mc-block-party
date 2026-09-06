import type { APIContext } from "astro";
import { env } from "cloudflare:workers";
import { requireAdmin, type AdminRow } from "../../../server/_admin";
import { ensureRegistrationsSchema } from "../../../server/_db";
import { errMsg, resolveD1 } from "../../../server/_lib";

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export async function GET(context: APIContext): Promise<Response> {
  const request = context.request;
  const admin = await requireAdmin(request, env);
  if ("error" in admin) return admin.error;
  const { email, role } = admin;

  const db = resolveD1(env);
  if (!db) return json({ ok: false, message: "数据库绑定不可用" }, 500);

  try {
    await ensureRegistrationsSchema(db);
    const countRow = await db
      .prepare("SELECT COUNT(*) AS c FROM registrations")
      .first<{ c: number }>();
    // 角色统一存于 users.role；部分索引 idx_users_role 使该查询只扫管理员行
    const admins = await db
      .prepare(
        `SELECT auth_id, email, role, created_at FROM users
         WHERE role IS NOT NULL ORDER BY created_at ASC`
      )
      .all<AdminRow>();

    return json({
      ok: true,
      email,
      role,
      totalRegistrations: countRow?.c ?? 0,
      admins: (admins.results ?? []).map((r) => ({
        authId: r.auth_id,
        email: r.email,
        role: r.role,
        createdAt: r.created_at,
      })),
    });
  } catch (e) {
    console.error("admin overview d1 error", e);
    return json({ ok: false, message: `数据库查询失败：${errMsg(e)}` }, 500);
  }
}
