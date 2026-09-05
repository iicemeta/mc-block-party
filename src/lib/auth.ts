import type { ProviderConfig } from "@melody-auth/shared";
import { StorageKey, getStorage } from "@melody-auth/shared";
import type { IdTokenBody, IdTokenStorage, RefreshTokenStorage } from "@melody-auth/shared";

export const ORG_SLUG = "mc-party";
export const LOCALE = "zh";

const trimSlash = (value: string) => value.replace(/\/+$/, "");

export const authConfig: ProviderConfig = {
  serverUri: (import.meta.env.PUBLIC_MCAUTH_SERVER_URI ?? "").trim(),
  clientId: (import.meta.env.PUBLIC_MCAUTH_CLIENT_ID ?? "").trim(),
  redirectUri: `${trimSlash((import.meta.env.PUBLIC_SITE_URI ?? "").trim())}/auth/callback`,
  scopes: ["openid", "profile", "offline_access"],
  storage: "localStorage",
};

export const postLogoutRedirectUri = `${trimSlash(
  (import.meta.env.PUBLIC_SITE_URI ?? "").trim()
)}/`;

const RETURN_TO_KEY = "mc-event:auth:returnTo";
const LOGIN_ATTEMPT_KEY = "mc-event:auth:lastLoginRedirect";

/** 记录当前页面路径，登录完成后跳回。仅允许站内相对路径。 */
export function stashReturnTo(): void {
  try {
    const { pathname, search } = window.location;
    if (pathname !== "/auth/callback") {
      window.sessionStorage.setItem(RETURN_TO_KEY, pathname + search);
    }
  } catch {
    /* 隐私模式等场景忽略 */
  }
}

export function popReturnTo(): string {
  try {
    const raw = window.sessionStorage.getItem(RETURN_TO_KEY) ?? "";
    window.sessionStorage.removeItem(RETURN_TO_KEY);
    if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  } catch {
    /* 忽略 */
  }
  return "/me";
}

/**
 * 防止「登录失败 → 自动重试」死循环：5 秒内不重复发起登录重定向。
 */
export function shouldAttemptLoginRedirect(): boolean {
  try {
    const last = Number(window.sessionStorage.getItem(LOGIN_ATTEMPT_KEY) ?? "0");
    if (Date.now() - last < 5000) return false;
    window.sessionStorage.setItem(LOGIN_ATTEMPT_KEY, String(Date.now()));
    return true;
  } catch {
    return true;
  }
}

function readIdTokenStorage(): IdTokenStorage | null {
  try {
    const raw = getStorage(authConfig.storage).getItem(StorageKey.IdToken);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IdTokenStorage;
    return parsed && parsed.account ? parsed : null;
  } catch {
    return null;
  }
}

/** 未包裹 AuthProvider 的组件（如导航栏）读取当前账号信息。 */
export function readAccount(): IdTokenBody | null {
  return readIdTokenStorage()?.account ?? null;
}

export function readRefreshToken(): RefreshTokenStorage | null {
  try {
    const raw = getStorage(authConfig.storage).getItem(StorageKey.RefreshToken);
    return raw ? (JSON.parse(raw) as RefreshTokenStorage) : null;
  } catch {
    return null;
  }
}

/** 清空本站遗留的 UUID 会话数据（历史版本写入）。 */
export function clearLegacySession(): void {
  try {
    window.localStorage.removeItem("mc-event:session");
    window.localStorage.removeItem("mc-event:registration");
  } catch {
    /* 忽略 */
  }
}
