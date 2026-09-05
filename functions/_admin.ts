/// <reference types="@cloudflare/workers-types" />
import { isAuthError, requireAuth, type AuthEnv } from "./_auth";
import { ensureAdminsSchema } from "./_db";
import { resolveD1 } from "./_lib";

export type AdminEnv = AuthEnv & {
  SUPER_ADMIN_EMAIL?: string;
};

export type AdminRole = "super" | "admin";

export type AdminRow = {
  auth_id: string;
  email: string;
  role: AdminRole;
  created_at: string;
};

export type AdminResult =
  | { error: Response }
  | { authId: string; email: string; role: AdminRole };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const forbidden = (message = "没有权限执行此操作") =>
  json({ ok: false, code: "forbidden", message }, 403);

type UserInfo = { authId: string; email: string | null; firstName: string | null };

/** 用用户 access token 调 melody auth userinfo，获取服务端可信的邮箱与昵称 */
export async function fetchUserInfo(env: AdminEnv, accessToken: string): Promise<UserInfo | null> {
  const serverUri = (env.MCAUTH_SERVER_URI ?? "").replace(/\/+$/, "");
  try {
    const res = await fetch(`${serverUri}/oauth2/v1/userinfo`, {
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      authId?: string;
      email?: string | null;
      firstName?: string | null;
    };
    if (!data?.authId) return null;
    return {
      authId: data.authId,
      email: data.email ?? null,
      firstName: data.firstName ?? null,
    };
  } catch {
    return null;
  }
}

/** 依据 admins 表 + SUPER_ADMIN_EMAIL 环境变量判定角色（含超管自动晋升） */
export async function determineRole(
  db: D1Database,
  env: AdminEnv,
  authId: string,
  email: string
): Promise<AdminRole | null> {
  const superEmail = (env.SUPER_ADMIN_EMAIL ?? "").trim().toLowerCase();

  const row = await db
    .prepare("SELECT auth_id, email, role, created_at FROM admins WHERE auth_id = ?1")
    .bind(authId)
    .first<AdminRow>();

  if (row?.role === "super") return "super";

  if (superEmail && email.toLowerCase() === superEmail) {
    if (!row) {
      await db
        .prepare("INSERT INTO admins (auth_id, email, role) VALUES (?1, ?2, 'super')")
        .bind(authId, email)
        .run();
    } else {
      await db.prepare("UPDATE admins SET role = 'super' WHERE auth_id = ?1").bind(authId).run();
    }
    return "super";
  }

  if (row?.role === "admin") return "admin";
  return null;
}

/**
 * 管理身份判定：JWT 验签 → userinfo 取邮箱 → 判定角色（非管理员 role 为 null）。
 * 超级管理员由 SUPER_ADMIN_EMAIL 环境变量引导，首次访问自动写入 admins 表。
 */
export async function resolveAdminRole(
  request: Request,
  env: AdminEnv
): Promise<
  { error: Response } | { authId: string; email: string; role: AdminRole | null }
> {
  const auth = await requireAuth(request, env);
  if (isAuthError(auth)) return auth;

  const db = resolveD1(env);
  if (!db) return { error: json({ ok: false, message: "数据库绑定不可用" }, 500) };

  await ensureAdminsSchema(db);

  const info = await fetchUserInfo(env, auth.token);
  if (!info || info.authId !== auth.authId) {
    return { error: json({ ok: false, message: "无法确认登录身份，请重新登录后再试" }, 401) };
  }
  const email = (info.email ?? "").trim();
  if (!email) {
    return { error: json({ ok: false, message: "当前账号没有绑定邮箱，无法使用管理功能" }, 403) };
  }

  const role = await determineRole(db, env, auth.authId, email);
  return { authId: auth.authId, email, role };
}

/** 管理接口统一鉴权：非管理员一律 403 */
export async function requireAdmin(
  request: Request,
  env: AdminEnv
): Promise<AdminResult> {
  const result = await resolveAdminRole(request, env);
  if ("error" in result) return result;
  if (!result.role) return { error: forbidden("此功能仅限活动管理员使用") };
  return { authId: result.authId, email: result.email, role: result.role };
}

export const adminForbidden = forbidden;

/** CSV 单元格转义：包含特殊字符时加引号；公式注入防护 */
export function csvCell(value: string): string {
  const v = value ?? "";
  const guarded = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  if (/[",\n\r]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }
  return guarded;
}
