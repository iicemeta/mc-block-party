/// <reference types="@cloudflare/workers-types" />
import { isAuthError, requireAuth, type AuthEnv } from "../_auth";
import { ensureUsersSchema } from "../_db";
import { resolveD1 } from "../_lib";

export type Env = AuthEnv & {
  TURNSTILE_SECRET?: string;
  TURNSTILE_HOSTNAMES?: string;
  IMG_UPLOAD_URL?: string;
} & Record<string, unknown>;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const bad = (message: string, status = 400) => json({ ok: false, message }, status);

type ShowcaseRow = {
  id: number;
  mc_id: string;
  image_url: string;
  caption: string;
  created_at: string;
  student_id?: string | null;
};

/**
 * 判定当前请求者是否活动管理员（单表主键点查 users.role，只读、无晋升副作用）。
 * 未登录 / 凭证失效 / 普通用户一律返回 false：接口照常返回公开数据，
 * 学号等仅管理员可见的字段不会出现在响应里。
 */
async function isAdminRequest(db: D1Database, request: Request, env: Env): Promise<boolean> {
  const auth = await requireAuth(request, env);
  if (isAuthError(auth)) return false;
  try {
    await ensureUsersSchema(db);
    const row = await db
      .prepare("SELECT role FROM users WHERE auth_id = ?1")
      .bind(auth.authId)
      .first<{ role: string | null }>();
    return row?.role === "admin" || row?.role === "super";
  } catch (e) {
    console.error("showcase admin check error", e);
    return false;
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const db = resolveD1(env);
  if (!db) return bad("数据库绑定不可用", 500);

  const admin = await isAdminRequest(db, request, env);

  try {
    // 图片编号即 showcase.id（行主键）：管理员额外 JOIN 报名表带上学号，便于定位到人
    const result = await db
      .prepare(
        admin
          ? `SELECT s.id, s.mc_id, s.image_url, s.caption, s.created_at, r.student_id
             FROM showcase s JOIN registrations r ON r.id = s.registration_id
             ORDER BY s.id DESC LIMIT 60`
          : `SELECT id, mc_id, image_url, caption, created_at
             FROM showcase ORDER BY id DESC LIMIT 60`
      )
      .all<ShowcaseRow>();
    const entries = (result.results ?? []).map((r) => ({
      imageId: r.id,
      mcId: r.mc_id,
      imageUrl: r.image_url,
      caption: r.caption,
      createdAt: r.created_at,
      ...(admin && r.student_id ? { studentId: r.student_id } : {}),
    }));
    return json({ ok: true, entries });
  } catch (e) {
    console.error("showcase d1 error", e);
    return bad("风采数据查询失败，请稍后重试", 500);
  }
};
