import { logout, triggerLogin } from "@melody-auth/web";
import { useEffect, useState } from "react";
import {
  authConfig,
  clearCachedAdminRole,
  getCachedAdminRole,
  LOCALE,
  ORG_SLUG,
  postLogoutRedirectUri,
  readAccount,
  readRefreshToken,
  setCachedAdminRole,
  stashReturnTo,
  type CachedAdminRole,
} from "../lib/auth";
import { exchangeTokenByRefreshToken } from "@melody-auth/web";

export default function AuthStatus() {
  const [account, setAccount] = useState<ReturnType<typeof readAccount>>(null);
  const [adminRole, setAdminRole] = useState<CachedAdminRole>("no");

  useEffect(() => {
    const acc = readAccount();
    setAccount(acc);
    const email = acc?.email ?? "";
    if (!acc || !email) {
      setAdminRole("no");
      return;
    }
    // 管理员识别结果按邮箱缓存：每个浏览器会话最多向后端确认一次
    const cached = getCachedAdminRole(email);
    if (cached) {
      setAdminRole(cached);
      return;
    }
    let cancelled = false;
    const check = async () => {
      try {
        const refresh = readRefreshToken();
        let accessToken = "";
        if (refresh?.refreshToken) {
          const res = await exchangeTokenByRefreshToken(authConfig, refresh.refreshToken);
          accessToken = res.accessToken;
        }
        if (!accessToken || cancelled) return;
        const api = await fetch("/api/admin/status", {
          headers: { authorization: `Bearer ${accessToken}` },
        });
        const body = (await api.json().catch(() => null)) as
          | { ok?: boolean; admin?: boolean; role?: "super" | "admin" | null }
          | null;
        if (cancelled || !api.ok || !body?.ok) return;
        const role: CachedAdminRole = body.admin && body.role ? body.role : "no";
        setCachedAdminRole(email, role);
        setAdminRole(role);
      } catch {
        /* 查询失败按非管理员处理，下次加载再试 */
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = () => {
    stashReturnTo();
    void triggerLogin("redirect", authConfig, { org: ORG_SLUG, locale: LOCALE });
  };

  const handleLogout = async () => {
    clearCachedAdminRole();
    const refresh = readRefreshToken();
    let accessToken = "";
    if (refresh?.refreshToken) {
      try {
        const res = await exchangeTokenByRefreshToken(authConfig, refresh.refreshToken);
        accessToken = res.accessToken;
      } catch {
        /* 拿不到 access token 时退化为本地登出 */
      }
    }
    await logout(
      authConfig,
      accessToken,
      refresh?.refreshToken ?? null,
      postLogoutRedirectUri,
      !accessToken
    );
  };

  const displayName = account
    ? account.first_name || account.email || "已登录"
    : "";

  return (
    <div className="AuthStatus">
      {account ? (
        <>
          <a className="AuthUser" href="/me" title="进入个人主页">
            <img src="/img/items/diamond.png" alt="" width={20} height={20} className="pixel" />
            {displayName}
          </a>
          {adminRole !== "no" && (
            <a
              className="Navbar-link"
              href="/admin"
              title="管理控制台"
            >
              <img src="/img/items/redstone_block.png" alt="" width={20} height={20} className="pixel" />
              管理
            </a>
          )}
          <button type="button" className="AuthBtn" onClick={() => void handleLogout()}>
            退出
          </button>
        </>
      ) : (
        <button type="button" className="AuthBtn" onClick={handleLogin}>
          <img src="/img/items/golden_apple.png" alt="" width={20} height={20} className="pixel" />
          登录 / 注册
        </button>
      )}
    </div>
  );
}
