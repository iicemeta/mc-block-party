/// <reference types="@cloudflare/workers-types" />
import { requireAdmin, csvCell, type AdminEnv } from "../../_admin";
import { ensureRegistrationsSchema } from "../../_db";
import { errMsg, resolveD1 } from "../../_lib";

export type Env = AdminEnv & Record<string, unknown>;

const SKILL_LABELS: Record<string, string> = {
  build: "建筑",
  redstone: "红石",
  survival: "生存",
  pvp: "PVP",
};

type RegistrationRow = {
  name: string;
  student_id: string;
  college: string;
  qq: string;
  mc_id: string;
  skills: string;
  created_at: string;
  updated_at: string;
};

/** 报名名单导出（CSV，带 BOM，Excel 直接打开不乱码） */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const admin = await requireAdmin(request, env);
  if ("error" in admin) return admin.error;

  const db = resolveD1(env);
  if (!db) {
    return new Response(
      JSON.stringify({ ok: false, message: "数据库绑定不可用" }),
      { status: 500, headers: { "content-type": "application/json; charset=utf-8" } }
    );
  }

  let rows: RegistrationRow[];
  try {
    await ensureRegistrationsSchema(db);
    const result = await db
      .prepare(
        `SELECT name, student_id, college, qq, mc_id, skills, created_at, updated_at
         FROM registrations ORDER BY created_at ASC`
      )
      .all<RegistrationRow>();
    rows = result.results ?? [];
  } catch (e) {
    console.error("admin export d1 error", e);
    return new Response(
      JSON.stringify({ ok: false, message: `数据库查询失败：${errMsg(e)}` }),
      { status: 500, headers: { "content-type": "application/json; charset=utf-8" } }
    );
  }

  const header = ["姓名", "学号", "学院/班级", "QQ号", "MC游戏ID", "擅长方向", "报名时间", "更新时间"];
  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    let skills = "";
    try {
      const parsed: unknown = JSON.parse(r.skills);
      if (Array.isArray(parsed)) {
        skills = parsed.map((s) => SKILL_LABELS[String(s)] ?? String(s)).join("、");
      }
    } catch {
      skills = r.skills;
    }
    lines.push(
      [
        r.name,
        r.student_id,
        r.college,
        r.qq,
        r.mc_id,
        skills,
        r.created_at,
        r.updated_at,
      ]
        .map(csvCell)
        .join(",")
    );
  }

  const date = new Date().toISOString().slice(0, 10);
  const csv = "\uFEFF" + lines.join("\r\n") + "\r\n";

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="mc-event-registrations-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
};
