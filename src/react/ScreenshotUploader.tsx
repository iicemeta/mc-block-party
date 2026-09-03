import { useEffect, useRef, useState } from "react";
import { Button, Input } from "minecraft-react-ui";

type Shot = {
  id: string;
  name: string;
  url: string;
  caption: string;
};

const MAX_SIZE = 10 * 1024 * 1024;

export default function ScreenshotUploader() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [notice, setNotice] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    const urls = shots.map((s) => s.url);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [shots]);

  const flash = (msg: string) => {
    setNotice(msg);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 3000);
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted: Shot[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) {
        flash(`已跳过非图片文件：${f.name}`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        flash(`已跳过超过 10MB 的文件：${f.name}`);
        continue;
      }
      accepted.push({
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        url: URL.createObjectURL(f),
        caption: "",
      });
    }
    if (accepted.length > 0) {
      setShots((prev) => [...prev, ...accepted]);
      setSubmitted(false);
    }
  };

  const remove = (id: string) => {
    setShots((prev) => prev.filter((s) => s.id !== id));
  };

  const setCaption = (id: string, caption: string) => {
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, caption } : s)));
  };

  const onSubmit = () => {
    if (shots.length === 0) return;
    setSubmitted(true);
    setShots([]);
  };

  return (
    <div className="Uploader">
      <label
        className={dragOver ? "DropZone mc-panel over" : "DropZone mc-panel"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <img src="/img/items/ender_pearl.png" alt="" width={48} height={48} className="pixel" />
        <strong>把截图拖进这里</strong>
        <span>或点击选择图片（可多选，单张不超过 10MB）</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {notice && <p className="Notice">{notice}</p>}

      {shots.length > 0 && (
        <div className="ShotGrid">
          {shots.map((s) => (
            <div key={s.id} className="ShotCard mc-panel">
              <img src={s.url} alt={s.name} />
              <Input
                value={s.caption}
                onChange={(v) => setCaption(s.id, v)}
                placeholder="配句话…（例如：团灭末影龙名场面）"
              />
              <button
                type="button"
                className="ShotRemove"
                onClick={() => remove(s.id)}
                aria-label={`删除 ${s.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="SubmitRow">
        <Button variant="primary" disabled={shots.length === 0} onClick={onSubmit}>
          提交 {shots.length > 0 ? `(${shots.length} 张)` : ""}
        </Button>
        {submitted && <span className="SubmitOk">提交成功！（演示：后端未接入）</span>}
      </div>
    </div>
  );
}
