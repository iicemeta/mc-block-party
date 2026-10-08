import {
  exchangeTokenByRefreshToken,
  logout,
  triggerLogin,
} from "@melody-auth/web";
import { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Menu,
  Tag,
  Tooltip,
  type MenuItemProps,
} from "@iicemeta/minecraft-react-ui";
import {
  authConfig,
  clearCachedAdminRole,
  getCachedAdminRole,
  getSyncedEmail,
  LOCALE,
  ORG_SLUG,
  postLogoutRedirectUri,
  readAccount,
  readRefreshToken,
  setCachedAdminRole,
  setSyncedEmail,
  stashReturnTo,
  type CachedAdminRole,
} from "../lib/auth";

const ROLE_LABEL: Record<Exclude<CachedAdminRole, "no">, string> = {
  super: "超级管理员",
  admin: "管理员",
};

/**
 * 导航栏的登录状态。视觉全部交给组件库：
 * 未登录 = Button(primary)；已登录 = Dropdown + Menu（账号菜单）+ Tag（角色）+ Tooltip。
 * 鉴权逻辑与之前完全一致，只换表现层。
 */
export default function AuthStatus() {
  const [account, setAccount] = useState<ReturnType<typeof readAccount>>(null);
  const [adminRole, setAdminRole] = useState<CachedAdminRole>("no");
  const [onAdminPage, setOnAdminPage] = useState(false);

  useEffect(() => {
    setOnAdminPage(window.location.pathname.startsWith("/admin"));
    const acc = readAccount();
    setAccount(acc);
    const email = acc?.email ?? "";
    if (!acc || !email) {
      setAdminRole("no");
      return;
    }
    // 同步与管理员识别结果均按邮箱缓存：每个浏览器会话最多向后端请求一次
    const cachedRole = getCachedAdminRole(email);
    if (cachedRole) {
      setAdminRole(cachedRole);
      if (getSyncedEmail() === email) return;
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
        const api = await fetch("/api/user/sync", {
          method: "POST",
          headers: { authorization: `Bearer ${accessToken}` },
        });
        const body = (await api.json().catch(() => null)) as
          | { ok?: boolean; admin?: boolean; role?: "super" | "admin" | null }
          | null;
        if (cancelled || !api.ok || !body?.ok) return;
        setSyncedEmail(email);
        const role: CachedAdminRole = body.admin && body.role ? body.role : "no";
        setCachedAdminRole(email, role);
        setAdminRole(role);
      } catch {
        /* 失败按非管理员处理，下次加载再试 */
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

  if (!account) {
    return (
      <Button type="button" variant="primary" onClick={handleLogin}>
        <span className="mc-inline">
          <img src="/img/items/golden_apple.png" alt="" width={20} height={20} className="pixel" />
          登录 / 注册
        </span>
      </Button>
    );
  }

  const displayName = account.first_name || account.email || "已登录";
  const items: MenuItemProps[] = [
    {
      id: "me",
      label: "个人中心",
      onClick: () => window.location.assign("/me"),
    },
    ...(adminRole !== "no"
      ? [
          {
            id: "admin",
            label: onAdminPage ? "管理控制台（当前页）" : "管理控制台",
            disabled: onAdminPage,
            onClick: () => window.location.assign("/admin"),
          } satisfies MenuItemProps,
        ]
      : []),
    { id: "logout", label: "退出登录", onClick: () => void handleLogout() },
  ];

  return (
    <div className="AuthStatus">
      <Dropdown
        placement="bottom-end"
        closeOnClickOutside
        closeOnClickContent
        content={<Menu items={items} />}
        target={
          <Button type="button" variant="clear" className="AuthUser" title="账号菜单">
            <span className="mc-inline">
              <img src="/img/items/diamond.png" alt="" width={20} height={20} className="pixel" />
              <span className="AuthUser-name">{displayName}</span>
              {adminRole !== "no" && (
                <Tooltip
                  placement="bottom"
                  content={`${ROLE_LABEL[adminRole]}：可以进入管理控制台`}
                >
                  <Tag className="Tag_success">{ROLE_LABEL[adminRole]}</Tag>
                </Tooltip>
              )}
            </span>
          </Button>
        }
      />
    </div>
  );
}
