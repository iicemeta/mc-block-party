import { AuthProvider, useAuth } from "@melody-auth/react";
import { useEffect } from "react";
import { authConfig, popReturnTo } from "../lib/auth";

function CallbackInner() {
  const { isAuthenticated, isAuthenticating, authenticationError } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.replace(popReturnTo());
      return;
    }
    // 无 code 且无错误的异常进入（登出回退 / 手动访问），回首页避免卡在当前页
    if (!isAuthenticating && !authenticationError) {
      window.location.replace("/");
    }
  }, [isAuthenticated, isAuthenticating, authenticationError]);

  if (authenticationError) {
    return (
      <div className="AuthLoading mc-panel">
        <img src="/img/items/tnt.png" alt="" width={40} height={40} className="pixel" />
        <h2>登录未完成</h2>
        <p className="AuthLoadingHint">{authenticationError}</p>
        <p>
          <a href="/me">返回个人主页重试</a>
        </p>
      </div>
    );
  }

  return (
    <div className="AuthLoading mc-panel">
      <img src="/img/items/ender_pearl.png" alt="" width={40} height={40} className="pixel" />
      <p>登录处理中，即将返回…</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <AuthProvider {...authConfig}>
      <CallbackInner />
    </AuthProvider>
  );
}
