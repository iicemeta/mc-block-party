/// <reference types="@cloudflare/workers-types" />
import { errMsg, siteverify } from "../_turnstile";

export type Env = {
  TURNSTILE_SECRET?: string;
  TURNSTILE_HOSTNAMES?: string;
  IMG_UPLOAD_URL?: string;
} & Record<string, unknown>;

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 20;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const bad = (message: string, status = 400) => json({ ok: false, message }, status);

type UpstreamResult = {
  url?: string;
  code?: number;
  msg?: string;
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) return bad("服务端未配置 TURNSTILE_SECRET", 500);

  const upstreamUrl = (env.IMG_UPLOAD_URL ?? "").trim();
  if (!upstreamUrl) {
    return bad("服务端未配置 IMG_UPLOAD_URL（值应为完整的图床接口地址）", 500);
  }
  if (!/^https:\/\/\S+$/.test(upstreamUrl)) {
    return bad(
      "IMG_UPLOAD_URL 配置不正确：值只能填接口地址本身（https:// 开头、不含空格与引号），不要带上变量名或等号",
      500
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_FILE_BYTES * MAX_FILES + 64_000) {
    return bad("上传内容过大", 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("表单数据不合法");
  }

  const turnstileToken = typeof form.get("turnstileToken") === "string"
    ? (form.get("turnstileToken") as string).trim()
    : "";
  if (!turnstileToken || turnstileToken.length > 2048) {
    return bad("缺少人机验证凭证，请先完成验证");
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return bad("未选择任何图片");
  if (files.length > MAX_FILES) return bad(`单次最多提交 ${MAX_FILES} 张图片`);
  for (const f of files) {
    if (!f.type.startsWith("image/")) return bad(`包含非图片文件：${f.name}`);
    if (f.size > MAX_FILE_BYTES) return bad(`图片超过 5MB 限制：${f.name}`);
  }

  const verifyError = await siteverify(secret, turnstileToken, env.TURNSTILE_HOSTNAMES, "gallery");
  if (verifyError !== null) return bad(verifyError, 403);

  const results: { name: string; url: string }[] = [];
  try {
    for (const f of files) {
      const upstream = new FormData();
      upstream.append("file", f, f.name);
      const res = await fetch(upstreamUrl, {
        method: "POST",
        body: upstream,
        signal: AbortSignal.timeout(60_000),
      });
      const data = (await res.json().catch(() => null)) as UpstreamResult | null;
      if (!res.ok || !data || data.code !== 200 || !data.url) {
        return bad(`图片上传失败（${f.name}）：${data?.msg ?? `上游返回 ${res.status}`}`, 502);
      }
      results.push({ name: f.name, url: data.url });
    }
  } catch (e) {
    return bad(`图床连接失败：${errMsg(e)}`, 502);
  }

  return json({ ok: true, results });
};
