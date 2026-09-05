/// <reference types="@cloudflare/workers-types" />
import { isAuthError, requireAuth, type AuthEnv } from "./_auth";
import { ensureAdminsSchema } from "./_db";
import { resolveD1 } from "./_lib";

export type AdminEnv = AuthEnv & {
  SUPER_ADMIN_EMAIL?: string;
  MCAUTH_S2S_CLIENT_ID?: string;
  MCAUTH_S2S_CLIENT_SECRET?: string;
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

type UserInfo = { authId: string; email: string | null };

/** 用用户 access token 调 melody auth userinfo，获取服务端可信的邮箱 */
async function fetchUserInfo(env: AdminEnv, accessToken: string): Promise<UserInfo | null> {
  const serverUri = (env.MCAUTH_SERVER_URI ?? "").replace(/\/+$/, "");
  try {
    const res = await fetch(`${serverUri}/oauth2/v1/userinfo`, {
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { authId?: string; email?: string | null };
    if (!data?.authId) return null;
    return { authId: data.authId, email: data.email ?? null };
  } catch {
    return null;
  }
}

// S2S access token 在 isolate 生命周期内缓存（提前 60s 视为过期）
let s2sToken: { value: string; expiresOn: number } | null = null;

async function getS2SToken(env: AdminEnv): Promise<string | null> {
  const clientId = (env.MCAUTH_S2S_CLIENT_ID ?? "").trim();
  const clientSecret = (env.MCAUTH_S2S_CLIENT_SECRET ?? "").trim();
  const serverUri = (env.MCAUTH_SERVER_URI ?? "").replace(/\/+$/, "");
  if (!clientId || !clientSecret || !serverUri) return null;

  if (s2sToken && s2sToken.expiresOn > Date.now() / 1000 + 60) {
    return s2sToken.value;
  }

  try {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: "read_user",
    });
    const basic = btoa(`${clientId}:${clientSecret}`);
    const res = await fetch(`${serverUri}/oauth2/v1/token`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: `basic ${basic}`,
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; expires_on?: number };
    if (!data?.access_token) return null;
    s2sToken = {
      value: data.access_token,
      expiresOn: data.expires_on ?? Date.now() / 1000 + 3600,
    };
    return s2sToken.value;
  } catch {
    return null;
  }
}

/** 通过 S2S API 把邮箱解析为 melody auth 用户 authId（要求该邮箱已在 auth 服务注册） */
export async function lookupAuthIdByEmail(
  env: AdminEnv,
  email: string
): Promise<{ authId: string } | { error: string }> {
  const token = await getS2SToken(env);
  if (!token) {
    return { error: "服务端未配置 S2S 凭据（MCAUTH_S2S_CLIENT_ID / MCAUTH_S2S_CLIENT_SECRET）" };
  }
  const serverUri = (env.MCAUTH_SERVER_URI ?? "").replace(/\/+$/, "");
  try {
    const url =
      `${serverUri}/api/v1/users?search=${encodeURIComponent(email)}` +
      `&page_size=20&page_number=1`;
    const res = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { error: `查询用户失败（${res.status}）` };
    const data = (await res.json()) as {
      users?: { authId?: string; email?: string | null }[];
    };
    const target = (data.users ?? []).find(
      (u) => (u.email ?? "").trim().toLowerCase() === email.toLowerCase()
    );
    if (!target?.authId) return { error: "该邮箱尚未在登录系统中注册，请让对方先注册登录后再添加" };
    return { authId: target.authId };
  } catch {
    return { error: "查询用户失败，请稍后重试" };
  }
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

  const superEmail = (env.SUPER_ADMIN_EMAIL ?? "").trim().toLowerCase();

  const row = await db
    .prepare("SELECT auth_id, email, role, created_at FROM admins WHERE auth_id = ?1")
    .bind(auth.authId)
    .first<AdminRow>();

  if (row?.role === "super") {
    return { authId: auth.authId, email, role: "super" };
  }

  if (superEmail && email.toLowerCase() === superEmail) {
    if (!row) {
      await db
        .prepare("INSERT INTO admins (auth_id, email, role) VALUES (?1, ?2, 'super')")
        .bind(auth.authId, email)
        .run();
    } else {
      await db.prepare("UPDATE admins SET role = 'super' WHERE auth_id = ?1").bind(auth.authId).run();
    }
    return { authId: auth.authId, email, role: "super" };
  }

  if (row?.role === "admin") {
    return { authId: auth.authId, email, role: "admin" };
  }

  return { authId: auth.authId, email, role: null };
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
