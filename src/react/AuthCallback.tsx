import { AuthProvider, useAuth } from "@melody-auth/react";
import { useEffect } from "react";
import { authConfig, popReturnTo } from "../lib/auth";

function CallbackInner() {
  const { isAuthenticated, authenticationError } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.replace(popReturnTo());
    }
  }, [isAuthenticated]);

  if (authenticationError) {
    return (
      <div className="AuthLoading mc-panel">
        <img src="/img/items/tnt.png" alt="" width={40} height={40} className="pixel" />
        <h2>登录未完成</h2>
        <p className="AuthLoadingHint">{authenticationError}</p>
        <p>
          <a href="/register">返回登记处重试</a>
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
