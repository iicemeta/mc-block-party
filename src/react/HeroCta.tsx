import { AuthProvider, useAuth } from "@melody-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@iicemeta/minecraft-react-ui";
import { authConfig } from "../lib/auth";
import { SITE_CONFIG } from "../config/site";

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

  // 昵称口径与导航栏 AuthStatus 一致：firstName 优先，回退邮箱；已报名则显示 MC ID
  const fallbackName = account?.first_name || account?.email || "已登录";
  const label = isAuthenticated ? `欢迎您，${mcId || fallbackName}` : SITE_CONFIG.cta.primary;

  return (
    <div className="HeroCta">
      <a href={SITE_CONFIG.cta.primaryHref}>
        <Button variant="primary">
          <span className="mc-inline">
            <img src="/img/items/golden_apple.png" alt="" width={20} height={20} className="pixel" />
            {label}
          </span>
        </Button>
      </a>
      <a href={SITE_CONFIG.cta.secondaryHref}>
        <Button variant="secondary">
          <span className="mc-inline">
            <img src="/img/items/tnt.png" alt="" width={20} height={20} className="pixel" />
            {SITE_CONFIG.cta.secondary}
          </span>
        </Button>
      </a>
    </div>
  );
}
