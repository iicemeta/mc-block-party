export type EnvTurnstile = {
  TURNSTILE_SECRET?: string;
  TURNSTILE_HOSTNAMES?: string;
} & Record<string, unknown>;

export const errMsg = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

export async function siteverify(
  secret: string,
  token: string,
  allowlistCsv: string | undefined,
  expectedAction: string
): Promise<string | null> {
  const allowlist = (allowlistCsv ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ secret, response: token }),
    });
    if (!res.ok) return "验证服务不可用，请稍后重试";
    const result = (await res.json()) as {
      success: boolean;
      action?: string;
      hostname?: string;
    };
    if (!result.success) return "人机验证未通过，请重新验证后再提交";
    if (result.action !== expectedAction) return "验证类型不符";
    if (allowlist.length > 0 && (!result.hostname || !allowlist.includes(result.hostname))) {
      return "验证来源域名不符";
    }
    return null;
  } catch {
    return "验证服务连接失败，请稍后重试";
  }
}
