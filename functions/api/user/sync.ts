/// <reference types="@cloudflare/workers-types" />
import {
  determineRole,
  fetchUserInfo,
  type AdminEnv,
} from "../../_admin";
import { ensureAdminsSchema, ensureUsersSchema, upsertUser } from "../../_db";
import { isAuthError, requireAuth } from "../../_auth";
import { errMsg, resolveD1 } from "../../_lib";

export type Env = AdminEnv & Record<string, unknown>;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

/**
 * 登录会话同步：把服务端可信的邮箱 / 昵称写入 users 表（每会话由前端触发一次），
 * 同时返回管理员角色判定（供导航栏决定是否展示管理入口）。
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAuth(request, env);
  if (isAuthError(auth)) {
    const status = auth.error.status;
    if (status === 401 || status === 403) {
      return json({ ok: true, synced: false, admin: false, role: null });
    }
    return auth.error;
  }

  const db = resolveD1(env);
  if (!db) return json({ ok: false, message: "数据库绑定不可用" }, 500);

  const info = await fetchUserInfo(env, auth.token);
  if (!info || info.authId !== auth.authId) {
    return json({ ok: true, synced: false, admin: false, role: null });
  }
  const email = (info.email ?? "").trim();
  if (!email) return json({ ok: true, synced: false, admin: false, role: null });

  // 昵称口径与导航栏显示一致：firstName 优先，回退邮箱
  const nickname = info.firstName?.trim() || email;

  let admin: boolean;
  let role: string | null = null;
  try {
    await ensureUsersSchema(db);
    await upsertUser(db, { authId: auth.authId, email, nickname });

    await ensureAdminsSchema(db);
    role = await determineRole(db, env, auth.authId, email);
    admin = role !== null;
    return json({ ok: true, synced: true, admin, role });
  } catch (e) {
    console.error("user sync d1 error", e);
    return json({ ok: false, message: `数据库写入失败：${errMsg(e)}` }, 500);
  }
};
