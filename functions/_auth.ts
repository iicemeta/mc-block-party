/// <reference types="@cloudflare/workers-types" />
import { createRemoteJWKSet, jwtVerify } from "jose";

export type AuthEnv = {
  MCAUTH_SERVER_URI?: string;
  MCAUTH_CLIENT_ID?: string;
} & Record<string, unknown>;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export const unauthorized = (message = "登录状态无效或已过期，请重新登录后再操作") =>
  json({ ok: false, code: "unauthorized", message }, 401);

// isolate 生命周期内缓存 JWKS 与远程密钥集，避免每次请求重复拉取
let remoteJwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksUri = "";

export type AuthResult = { authId: string; token: string } | { error: Response };

/**
 * 校验 Authorization: Bearer <accessToken>（melody auth 签发的 RS256 JWT）。
 * 验证签名（JWKS）、算法、iss、azp 与有效期，返回用户 authId（即 sub）。
 */
export async function requireAuth(
  request: Request,
  env: AuthEnv
): Promise<AuthResult> {
  const serverUri = (env.MCAUTH_SERVER_URI ?? "").replace(/\/+$/, "");
  const clientId = (env.MCAUTH_CLIENT_ID ?? "").trim();
  if (!serverUri || !clientId) {
    return { error: json({ ok: false, message: "服务端未配置 MCAUTH_SERVER_URI / MCAUTH_CLIENT_ID" }, 500) };
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { error: unauthorized("缺少登录凭证，请先登录") };

  const expectedJwksUri = `${serverUri}/.well-known/jwks.json`;
  if (!remoteJwks || jwksUri !== expectedJwksUri) {
    remoteJwks = createRemoteJWKSet(new URL(expectedJwksUri));
    jwksUri = expectedJwksUri;
  }

  try {
    const { payload } = await jwtVerify(token, remoteJwks, {
      algorithms: ["RS256"],
      issuer: serverUri,
    });
    if (payload.azp !== clientId) throw new Error("azp mismatch");
    const authId = typeof payload.sub === "string" ? payload.sub : "";
    if (!authId) throw new Error("missing sub");
    return { authId, token };
  } catch (e) {
    console.error("auth verify failed", e instanceof Error ? e.message : e);
    return { error: unauthorized() };
  }
}

export function isAuthError(result: AuthResult): result is { error: Response } {
  return "error" in result;
}
