import { useEffect, useRef, useState } from "react";

const SITE_KEY =
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEmcKHpkdTedZjS9";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loaderPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("turnstile api missing"));
    };
    script.onerror = () => {
      loaderPromise = null;
      reject(new Error("turnstile script failed"));
    };
    document.head.append(script);
  });
  return loaderPromise;
}

export function resetTurnstile(): void {
  window.turnstile?.reset();
}

type Props = {
  action: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
};

export default function Turnstile({ action, onVerify, onExpire }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const verifyRef = useRef(onVerify);
  const expireRef = useRef(onExpire);
  const [failed, setFailed] = useState(false);

  verifyRef.current = onVerify;
  expireRef.current = onExpire;

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    loadTurnstile()
      .then((api) => {
        if (cancelled || !holderRef.current) return;
        holderRef.current.innerHTML = "";
        widgetIdRef.current = api.render(holderRef.current, {
          sitekey: SITE_KEY,
          action,
          theme: "dark",
          language: "zh-cn",
          callback: (token: string) => verifyRef.current(token),
          "expired-callback": () => expireRef.current?.(),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action]);

  if (failed) {
    return (
      <p className="TurnstileFailed">人机验证组件加载失败，请检查网络后刷新页面</p>
    );
  }

  return <div ref={holderRef} className="TurnstileHolder" />;
}
