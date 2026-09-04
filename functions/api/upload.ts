/// <reference types="@cloudflare/workers-types" />
import { errMsg, resolveD1, siteverify, UUID_RE } from "../_lib";

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

const CREATE_SHOWCASE_DDL = `CREATE TABLE IF NOT EXISTS showcase (
  id INTEGER PRIMARY KEY,
  registration_uuid TEXT NOT NULL,
  mc_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

const CREATE_SHOWCASE_INDEX = `CREATE INDEX IF NOT EXISTS idx_showcase_created ON showcase(created_at DESC)`;

type UpstreamResult = {
  url?: string;
  code?: number;
  msg?: string;
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) {
    console.error("upload 500: TURNSTILE_SECRET 未配置");
    return bad("服务端未配置 TURNSTILE_SECRET", 500);
  }

  const upstreamUrl = (env.IMG_UPLOAD_URL ?? "").trim();
  if (!upstreamUrl) {
    console.error("upload 500: IMG_UPLOAD_URL 未配置");
    return bad("服务端未配置 IMG_UPLOAD_URL（值应为完整的图床接口地址）", 500);
  }
  if (!/^https:\/\/\S+$/.test(upstreamUrl)) {
    console.error(`upload 500: IMG_UPLOAD_URL 配置不正确，当前值：${upstreamUrl}`);
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

  const uuid = typeof form.get("uuid") === "string" ? (form.get("uuid") as string).trim() : "";
  if (!uuid) return bad("请填写报名时获得的 UUID");
  if (!UUID_RE.test(uuid)) return bad("UUID 格式不正确");

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return bad("未选择任何图片");
  if (files.length > MAX_FILES) return bad(`单次最多提交 ${MAX_FILES} 张图片`);
  for (const f of files) {
    if (!f.type.startsWith("image/")) return bad(`包含非图片文件：${f.name}`);
    if (f.size > MAX_FILE_BYTES) return bad(`图片超过 5MB 限制：${f.name}`);
  }
  const captions = form.getAll("captions").map((c) => (typeof c === "string" ? c.trim() : ""));

  const db = resolveD1(env);
  if (!db) return bad("数据库绑定不可用", 500);

  let mcId: string;
  try {
    const reg = await db
      .prepare("SELECT mc_id FROM registrations WHERE uuid = ?1")
      .bind(uuid)
      .first<{ mc_id: string }>();
    if (!reg) {
      return json(
        {
          ok: false,
          message: "未找到该 UUID 对应的报名记录。请先完成报名，或检查 UUID 是否输入正确。",
        },
        403
      );
    }
    mcId = reg.mc_id;
  } catch (e) {
    console.error("upload d1 error", e);
    return bad(`数据库查询失败：${errMsg(e)}`, 500);
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

  try {
    await db.prepare(CREATE_SHOWCASE_DDL).run();
    await db.prepare(CREATE_SHOWCASE_INDEX).run();
    for (let i = 0; i < results.length; i++) {
      await db
        .prepare(
          `INSERT INTO showcase (registration_uuid, mc_id, image_url, caption)
           VALUES (?1, ?2, ?3, ?4)`
        )
        .bind(uuid, mcId, results[i].url, (captions[i] ?? "").slice(0, 100))
        .run();
    }
  } catch (e) {
    console.error("upload d1 error", e);
    return bad(`图片已上传，但风采展示记录写入失败：${errMsg(e)}`, 500);
  }

  return json({ ok: true, mcId, results });
};
