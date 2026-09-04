import { useEffect, useState } from "react";

type Entry = {
  mcId: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
};

export default function ShowcaseGallery() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/showcase")
      .then((r) => r.json())
      .then((d: { ok?: boolean; entries?: Entry[] }) => {
        if (cancelled) return;
        setEntries(d?.entries ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("风采数据加载失败，请稍后刷新重试");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="ShowcaseEmpty">{error}</p>;
  if (entries === null) return <p className="ShowcaseEmpty">作品加载中…</p>;
  if (entries.length === 0)
    return <p className="ShowcaseEmpty">还没有作品——上传第一张截图，抢占首页！</p>;

  return (
    <div className="ShowcaseGrid">
      {entries.map((e) => (
        <div key={e.imageUrl} className="ShowcaseCard mc-panel">
          <div className="ShowcaseArt">
            <img src={e.imageUrl} alt={e.caption || `MCID 为 ${e.mcId} 的玩家上传的截图`} loading="lazy" />
          </div>
          <strong className="ShowcaseTitle">{e.mcId}</strong>
          <p className="ShowcaseCaption">{e.caption || "（没有留言）"}</p>
        </div>
      ))}
    </div>
  );
}
