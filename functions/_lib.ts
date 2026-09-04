export type EnvTurnstile = {
  TURNSTILE_SECRET?: string;
  TURNSTILE_HOSTNAMES?: string;
} & Record<string, unknown>;

export const errMsg = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function siteverify(
  secret: string,
  token: string,
  allowlistCsv: string | undefined,
  expectedAction: string
): Promise<string | null> {
  const allowlist = (allowlistCsv ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return (async () => {
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
  })();
}

export function isD1(value: unknown): value is D1Database {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { prepare?: unknown }).prepare === "function" &&
    typeof (value as { batch?: unknown }).batch === "function"
  );
}

export function resolveD1(env: Record<string, unknown>): D1Database | null {
  const preferred = ["DB", "mc_block_party_db", "MC_BLOCK_PARTY_DB", "mc-block-party-db"];
  for (const key of preferred) {
    const candidate = env[key];
    if (isD1(candidate)) return candidate;
  }
  for (const candidate of Object.values(env)) {
    if (isD1(candidate)) return candidate;
  }
  return null;
}
