import { AuthProvider, useAuth } from "@melody-auth/react";
import { useEffect, type ReactNode } from "react";
import { authConfig, LOCALE, ORG_SLUG, shouldAttemptLoginRedirect } from "../lib/auth";

type AuthGateProps = {
  /** true：未登录时自动跳转登录（登记处/晒图）；false：未登录也渲染内容（随机组队） */
  enforce?: boolean;
  children: ReactNode;
};

function GateInner({
  enforce,
  children,
}: Required<Pick<AuthGateProps, "enforce">> & AuthGateProps) {
  const { isAuthenticating, isAuthenticated, loginRedirect } = useAuth();

  useEffect(() => {
    if (enforce && !isAuthenticating && !isAuthenticated && shouldAttemptLoginRedirect()) {
      void loginRedirect({ org: ORG_SLUG, locale: LOCALE });
    }
  }, [enforce, isAuthenticating, isAuthenticated, loginRedirect]);

  if (isAuthenticating) {
    return (
      <div className="AuthLoading mc-panel">
        <img src="/img/items/ender_pearl.png" alt="" width={40} height={40} className="pixel" />
        <p>正在确认登录状态…</p>
      </div>
    );
  }

  if (enforce && !isAuthenticated) {
    return (
      <div className="AuthLoading mc-panel">
        <img src="/img/items/golden_apple.png" alt="" width={40} height={40} className="pixel" />
        <p>需要登录后才能继续，正在前往登录页…</p>
        <p className="AuthLoadingHint">
          若未跳转，请检查浏览器是否拦截了重定向，或稍后刷新重试。
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AuthGate({ enforce = false, children }: AuthGateProps) {
  return (
    <AuthProvider {...authConfig}>
      <GateInner enforce={enforce}>{children}</GateInner>
    </AuthProvider>
  );
}
