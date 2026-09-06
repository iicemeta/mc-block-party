import { useAuth } from "@melody-auth/react";
import { useCallback, useEffect, useState } from "react";
import AuthGate from "./AuthGate";

type Entry = {
  imageId: number;
  mcId: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  /** 仅管理员请求时由服务端返回（学号不下发给普通访客） */
  studentId?: string;
};

export default function ShowcaseGallery() {
  return (
    <AuthGate>
      <ShowcaseGalleryInner />
    </AuthGate>
  );
}

function ShowcaseGalleryInner() {
  const { acquireToken } = useAuth();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      // 已登录时带上凭证：服务端识别管理员后额外返回学号；未登录 / 凭证失效按访客返回公开数据
      const headers: Record<string, string> = {};
      try {
        const token = await acquireToken();
        if (token) headers.authorization = `Bearer ${token}`;
      } catch {
        /* 未登录按访客处理 */
      }
      const res = await fetch("/api/showcase", { headers });
      const d = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; entries?: Entry[] }
        | null;
      if (!res.ok || !d?.ok) {
        setError(d?.message ?? "风采数据加载失败，请稍后刷新重试");
        return;
      }
      setError("");
      setEntries(d.entries ?? []);
    } catch {
      setError("风采数据加载失败，请稍后刷新重试");
    }
  }, [acquireToken]);

  useEffect(() => {
    void load();
    window.addEventListener("showcase:refresh", load);
    return () => {
      window.removeEventListener("showcase:refresh", load);
    };
  }, [load]);

  if (error) return <p className="ShowcaseEmpty">{error}</p>;
  if (entries === null) return <p className="ShowcaseEmpty">作品加载中…</p>;
  if (entries.length === 0)
    return <p className="ShowcaseEmpty">还没有作品——上传第一张截图，抢占首页！</p>;

  return (
    <div className="ShowcaseGrid">
      {entries.map((e) => (
        <div key={e.imageId} className="ShowcaseCard mc-panel">
          <div className="ShowcaseArt">
            <img src={e.imageUrl} alt={e.caption || `MCID 为 ${e.mcId} 的玩家上传的截图`} loading="lazy" />
          </div>
          <div className="ShowcaseMeta">
            <span className="ShowcaseId" title={`图片编号 #${e.imageId}`}>
              #{e.imageId}
            </span>
            <strong className="ShowcaseTitle">
              {e.mcId}
              {e.studentId && <span className="ShowcaseSid">（{e.studentId}）</span>}
            </strong>
          </div>
          <p className="ShowcaseCaption">{e.caption || "（没有留言）"}</p>
        </div>
      ))}
    </div>
  );
}
