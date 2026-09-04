/// <reference types="@cloudflare/workers-types" />
import { errMsg, resolveD1 } from "../_lib";

export type Env = {
  TURNSTILE_SECRET?: string;
  TURNSTILE_HOSTNAMES?: string;
  IMG_UPLOAD_URL?: string;
} & Record<string, unknown>;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const bad = (message: string, status = 400) => json({ ok: false, message }, status);

type ShowcaseRow = {
  mc_id: string;
  image_url: string;
  caption: string;
  created_at: string;
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const db = resolveD1(env);
  if (!db) return bad("数据库绑定不可用", 500);

  try {
    const result = await db
      .prepare(
        `SELECT mc_id, image_url, caption, created_at
         FROM showcase ORDER BY id DESC LIMIT 60`
      )
      .all<ShowcaseRow>();
    const entries = (result.results ?? []).map((r) => ({
      mcId: r.mc_id,
      imageUrl: r.image_url,
      caption: r.caption,
      createdAt: r.created_at,
    }));
    return json({ ok: true, entries });
  } catch (e) {
    console.error("showcase d1 error", e);
    return bad(`风采数据查询失败：${errMsg(e)}`, 500);
  }
};
