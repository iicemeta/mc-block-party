import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile 人机验证组件（备用，暂未接入任何页面）。
 *
 * 用法：
 *   <Turnstile siteKey="0x..." action="register" onSuccess={(token) => ...} />
 * 拿到 token 后随请求发给后端，用 functions/_lib.ts 的 siteverify(secret, token, hostnames, action) 校验。
 *
 * 注意：Turnstile token 为一次性，消费后需重置组件再获取下一个；
 * 传入 autoReset 让组件在成功回调后自动重置，或持有 reset 句柄手动控制。
 */

type TurnstileRenderParams = {
  sitekey: string;
  action?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
  appearance?: "always" | "execute" | "interaction-only";
  callback?: (token: string) => void;
  "error-callback"?: (code?: string) => void;
  "expired-callback"?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, params: TurnstileRenderParams) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
      ready: (cb: () => void) => void;
    };
  }
}

const SCRIPT_ID = "cf-turnstile-api";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

/** 单例加载 Turnstile 脚本（explicit 模式），失败后允许下次重试 */
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const mount = (script: HTMLScriptElement, isNew: boolean) => {
      const onLoad = () => resolve();
      const onError = () => {
        scriptPromise = null;
        if (isNew) script.remove();
        reject(new Error("Turnstile 脚本加载失败"));
      };
      script.addEventListener("load", onLoad, { once: true });
      script.addEventListener("error", onError, { once: true });
      if (isNew) {
        script.id = SCRIPT_ID;
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
    };
    const existing = document.getElementById(SCRIPT_ID);
    if (existing instanceof HTMLScriptElement) {
      mount(existing, false);
    } else {
      mount(document.createElement("script"), true);
    }
  });
  return scriptPromise;
}

export type TurnstileProps = {
  /** Cloudflare Dashboard 里的 Turnstile sitekey（明键，可公开） */
  siteKey: string;
  /** 与后端 siteverify 的 expectedAction 对应（字母 / 数字 / 下划线，≤32 字符） */
  action?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
  /** 收到一次性 token 时触发 */
  onSuccess: (token: string) => void;
  /** 渲染 / 校验出错时触发（含脚本加载失败） */
  onError?: (code?: string) => void;
  /** token 过期（约 300 秒）时触发 */
  onExpire?: () => void;
  /** 成功回调后自动 reset，便于再次提交时获取新 token */
  autoReset?: boolean;
  className?: string;
};

export default function Turnstile({
  siteKey,
  action,
  theme = "auto",
  size = "normal",
  onSuccess,
  onError,
  onExpire,
  autoReset = false,
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // 回调存 ref：props 回调身份变化不触发 widget 重建（重建会打断用户验证）
  const callbacksRef = useRef({ onSuccess, onError, onExpire, autoReset });
  callbacksRef.current = { onSuccess, onError, onExpire, autoReset };

  useEffect(() => {
    let cancelled = false;
    void loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme,
          size,
          callback: (token) => {
            callbacksRef.current.onSuccess(token);
            if (callbacksRef.current.autoReset && window.turnstile && widgetIdRef.current) {
              window.turnstile.reset(widgetIdRef.current);
            }
          },
          "error-callback": (code) => callbacksRef.current.onError?.(code),
          "expired-callback": () => callbacksRef.current.onExpire?.(),
        });
      })
      .catch(() => {
        if (!cancelled) callbacksRef.current.onError?.("script_load_failed");
      });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, action, theme, size]);

  return <div ref={containerRef} className={className} />;
}
