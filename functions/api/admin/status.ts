/// <reference types="@cloudflare/workers-types" />
import { resolveAdminRole, type AdminEnv } from "../../_admin";

export type Env = AdminEnv & Record<string, unknown>;

/** 当前登录用户是否为管理员（供导航栏决定是否展示管理入口） */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const result = await resolveAdminRole(request, env);
  if ("error" in result) {
    const status = result.error.status;
    // 401/403 统一视为"非管理员"，不暴露更多细节
    if (status === 401 || status === 403) {
      return new Response(JSON.stringify({ ok: true, admin: false, role: null }), {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
    return result.error;
  }
  return new Response(
    JSON.stringify({ ok: true, admin: result.role !== null, role: result.role }),
    { headers: { "content-type": "application/json; charset=utf-8" } }
  );
};
