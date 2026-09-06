import type { APIContext } from "astro";
import { env } from "cloudflare:workers";
import { isAuthError, requireAuth } from "../../server/_auth";
import { ensureRegistrationsSchema, ensureShowcaseSchema } from "../../server/_db";
import { getVar, resolveD1 } from "../../server/_lib";

export const prerender = false;

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

export async function POST(context: APIContext): Promise<Response> {
  const request = context.request;
  const auth = await requireAuth(request, env);
  if (isAuthError(auth)) return auth.error;
  const { authId } = auth;

  const upstreamUrl = getVar(env, "IMG_UPLOAD_URL").trim();
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

  let registrationId: number;
  let mcId: string;
  try {
    await ensureRegistrationsSchema(db);

    const reg = await db
      .prepare("SELECT id, mc_id FROM registrations WHERE auth_id = ?1")
      .bind(authId)
      .first<{ id: number; mc_id: string }>();
    if (!reg) {
      return json(
        {
          ok: false,
          code: "not_registered",
          message: "尚未找到你的报名记录，请先到「登记处」完成报名再提交晒图。",
        },
        403
      );
    }
    registrationId = reg.id;
    mcId = reg.mc_id;
  } catch (e) {
    console.error("upload d1 error", e);
    return bad("数据库查询失败，请稍后重试", 500);
  }

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
    console.error("upload upstream error", e);
    return bad("图床连接失败，请稍后重试", 502);
  }

  try {
    await ensureShowcaseSchema(db);
    const inserted = await db.batch(
      results.map((r, i) =>
        db
          .prepare(
            `INSERT INTO showcase (registration_id, mc_id, image_url, caption)
             VALUES (?1, ?2, ?3, ?4)`
          )
          .bind(registrationId, mcId, r.url, (captions[i] ?? "").slice(0, 100))
      )
    );
    // 回填图片编号（showcase.id 行主键），供展示区快速定位
    const withIds = results.map((r, i) => ({
      name: r.name,
      url: r.url,
      id: inserted[i]?.meta?.last_row_id ?? 0,
    }));
    return json({ ok: true, mcId, results: withIds });
  } catch (e) {
    console.error("upload d1 error", e);
    return bad("图片已上传，但风采展示记录写入失败，请稍后重试", 500);
  }
}
