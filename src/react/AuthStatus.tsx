import { logout, triggerLogin } from "@melody-auth/web";
import { useEffect, useState } from "react";
import {
  authConfig,
  LOCALE,
  ORG_SLUG,
  postLogoutRedirectUri,
  readAccount,
  readRefreshToken,
  stashReturnTo,
} from "../lib/auth";
import { exchangeTokenByRefreshToken } from "@melody-auth/web";

export default function AuthStatus() {
  const [account, setAccount] = useState<ReturnType<typeof readAccount>>(null);

  useEffect(() => {
    setAccount(readAccount());
  }, []);

  const handleLogin = () => {
    stashReturnTo();
    void triggerLogin("redirect", authConfig, { org: ORG_SLUG, locale: LOCALE });
  };

  const handleLogout = async () => {
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
          <span className="AuthUser" title={account.email ?? ""}>
            <img src="/img/items/diamond.png" alt="" width={20} height={20} className="pixel" />
            {displayName}
          </span>
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
