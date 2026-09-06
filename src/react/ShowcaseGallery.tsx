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
  /** 灯箱当前展示的条目下标；null = 关闭 */
  const [lightbox, setLightbox] = useState<number | null>(null);

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

  // 灯箱打开时支持 ESC 关闭 / 左右键切换，并锁定页面滚动
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") setLightbox((v) => (v === null ? v : (v - 1 + entries!.length) % entries!.length));
      if (e.key === "ArrowRight") setLightbox((v) => (v === null ? v : (v + 1) % entries!.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, entries]);

  if (error) return <p className="ShowcaseEmpty">{error}</p>;
  if (entries === null) return <p className="ShowcaseEmpty">作品加载中…</p>;
  if (entries.length === 0)
    return <p className="ShowcaseEmpty">还没有作品——上传第一张截图，抢占首页！</p>;

  return (
    <>
      <div className="ShowcaseGrid">
        {entries.map((e, i) => (
          <div key={e.imageId} className="ShowcaseCard mc-panel">
          <div className="ShowcaseArt">
              <img
                src={e.imageUrl}
                alt={e.caption || `MCID 为 ${e.mcId} 的玩家上传的截图`}
                loading="lazy"
                className="ShowcaseArtImg"
                onClick={() => setLightbox(i)}
              />
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
      {lightbox !== null && entries[lightbox] && (
        <div
          className="Lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="截图大图预览"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="LightboxClose"
            aria-label="关闭预览"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          {entries.length > 1 && (
            <button
              type="button"
              className="LightboxNav LightboxPrev"
              aria-label="上一张"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((lightbox - 1 + entries.length) % entries.length);
              }}
            >
              ‹
            </button>
          )}
          <figure className="LightboxBody" onClick={(e) => e.stopPropagation()}>
            <img
              src={entries[lightbox].imageUrl}
              alt={entries[lightbox].caption || `MCID 为 ${entries[lightbox].mcId} 的玩家上传的截图`}
            />
            <figcaption>
              <span className="ShowcaseId">
                #{entries[lightbox].imageId}
              </span>
              <strong>{entries[lightbox].mcId}</strong>
              <span className="LightboxCaption">
                {entries[lightbox].caption || "（没有留言）"}
              </span>
              <span className="LightboxCount">
                {lightbox + 1} / {entries.length}
              </span>
            </figcaption>
          </figure>
          {entries.length > 1 && (
            <button
              type="button"
              className="LightboxNav LightboxNext"
              aria-label="下一张"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((lightbox + 1) % entries.length);
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
