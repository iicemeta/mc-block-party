import { AuthProvider, useAuth } from "@melody-auth/react";
import { useEffect, useState } from "react";
import { Button } from "minecraft-react-ui";
import { authConfig } from "../lib/auth";

export default function HeroCta() {
  return (
    <AuthProvider {...authConfig}>
      <HeroCtaInner />
    </AuthProvider>
  );
}

function HeroCtaInner() {
  const { isAuthenticated, acquireToken, account } = useAuth();
  const [mcId, setMcId] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isAuthenticated) return;
      try {
        const accessToken = await acquireToken();
        if (!accessToken || cancelled) return;
        const res = await fetch("/api/me", {
          headers: { authorization: `Bearer ${accessToken}` },
        });
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; registration?: { mcId?: string } | null }
          | null;
        if (!cancelled && res.ok && data?.ok && data.registration?.mcId) {
          setMcId(data.registration.mcId);
        }
      } catch {
        /* 拿不到报名信息时按账号昵称显示 */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, acquireToken]);

  // 昵称口径与导航栏 AuthUser 一致：firstName 优先，回退邮箱；已报名则显示 MC ID
  const fallbackName = account?.first_name || account?.email || "已登录";
  const label = isAuthenticated ? `欢迎您，${mcId || fallbackName}` : "登录并报名";

  return (
    <div className="HeroCta">
      <a href="/me">
        <Button variant="primary">{label}</Button>
      </a>
      <a href="/lottery">
        <Button variant="secondary">查看随机组队</Button>
      </a>
    </div>
  );
}
