/// <reference types="@cloudflare/workers-types" />
import { requireAdmin, type AdminEnv } from "../../_admin";
import { errMsg, resolveD1 } from "../../_lib";

export type Env = AdminEnv & Record<string, unknown>;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

type AddBody = { email?: unknown };

/** 超级管理员添加管理员（仅限 super 角色） */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const admin = await requireAdmin(request, env);
  if ("error" in admin) return admin.error;
  if (admin.role !== "super") {
    return json({ ok: false, message: "只有超级管理员可以添加管理员" }, 403);
  }

  let body: AddBody;
  try {
    body = (await request.json()) as AddBody;
  } catch {
    return json({ ok: false, message: "请求体不是合法 JSON" }, 400);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, message: "邮箱格式不正确" }, 400);
  }
  if (email === admin.email.toLowerCase()) {
    return json({ ok: false, message: "该邮箱是你自己的超级管理员账号" }, 400);
  }

  const superEmail = (env.SUPER_ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (superEmail && email === superEmail) {
    return json({ ok: false, message: "该邮箱已是超级管理员" }, 400);
  }

  const db = resolveD1(env);
  if (!db) return json({ ok: false, message: "数据库绑定不可用" }, 500);

  // 以本站 users 表为准：只有登录过本站的用户才可能被设置为管理员
  let authId: string;
  try {
    const user = await db
      .prepare("SELECT auth_id FROM users WHERE lower(email) = ?1")
      .bind(email)
      .first<{ auth_id: string }>();
    if (!user) {
      return json(
        {
          ok: false,
          message: "该邮箱还未登录过本站：请让对方先访问本站并登录一次，之后再来添加",
        },
        404
      );
    }
    authId = user.auth_id;
  } catch (e) {
    console.error("admin add d1 error", e);
    return json({ ok: false, message: `数据库查询失败：${errMsg(e)}` }, 500);
  }

  try {
    const existing = await db
      .prepare("SELECT role FROM admins WHERE auth_id = ?1")
      .bind(authId)
      .first<{ role: string }>();
    if (existing) {
      return json(
        { ok: false, message: `该邮箱已经是管理员（角色：${existing.role === "super" ? "超级管理员" : "管理员"}）` },
        409
      );
    }
    await db
      .prepare("INSERT INTO admins (auth_id, email, role) VALUES (?1, ?2, 'admin')")
      .bind(authId, email)
      .run();
    return json({ ok: true, authId, email });
  } catch (e) {
    console.error("admin add d1 error", e);
    return json({ ok: false, message: `数据库写入失败：${errMsg(e)}` }, 500);
  }
};

/** 超级管理员移除管理员（仅限 super 角色，且不能移除超级管理员） */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const admin = await requireAdmin(request, env);
  if ("error" in admin) return admin.error;
  if (admin.role !== "super") {
    return json({ ok: false, message: "只有超级管理员可以移除管理员" }, 403);
  }

  const url = new URL(request.url);
  const authId = (url.searchParams.get("authId") ?? "").trim();
  if (!authId) return json({ ok: false, message: "缺少 authId 参数" }, 400);

  const db = resolveD1(env);
  if (!db) return json({ ok: false, message: "数据库绑定不可用" }, 500);

  try {
    const row = await db
      .prepare("SELECT role, email FROM admins WHERE auth_id = ?1")
      .bind(authId)
      .first<{ role: string; email: string }>();
    if (!row) return json({ ok: false, message: "该管理员不存在" }, 404);
    if (row.role === "super") {
      return json({ ok: false, message: "不能移除超级管理员" }, 403);
    }
    await db.prepare("DELETE FROM admins WHERE auth_id = ?1").bind(authId).run();
    return json({ ok: true, email: row.email });
  } catch (e) {
    console.error("admin remove d1 error", e);
    return json({ ok: false, message: `数据库操作失败：${errMsg(e)}` }, 500);
  }
};
