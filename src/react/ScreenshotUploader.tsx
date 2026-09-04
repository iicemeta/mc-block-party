import { useEffect, useRef, useState } from "react";
import { Button, Input } from "minecraft-react-ui";
import Turnstile, { resetTurnstile } from "./Turnstile";

type Shot = {
  id: string;
  file: File;
  name: string;
  url: string;
  caption: string;
};

type UploadResult = { name: string; url: string };

const MAX_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 20;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ScreenshotUploader() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [notice, setNotice] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uuidInput, setUuidInput] = useState("");
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
      if (shots.length + accepted.length >= MAX_FILES) {
        flash(`单次最多提交 ${MAX_FILES} 张图片`);
        break;
      }
      if (!f.type.startsWith("image/")) {
        flash(`已跳过非图片文件：${f.name}`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        flash(`已跳过超过 5MB 的图片：${f.name}`);
        continue;
      }
      accepted.push({
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file: f,
        name: f.name,
        url: URL.createObjectURL(f),
        caption: "",
      });
    }
    if (accepted.length > 0) {
      setShots((prev) => [...prev, ...accepted]);
      setSubmitted(false);
      setResults([]);
    }
  };

  const remove = (id: string) => {
    setShots((prev) => prev.filter((s) => s.id !== id));
  };

  const setCaption = (id: string, caption: string) => {
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, caption } : s)));
  };

  const onSubmit = async () => {
    if (shots.length === 0 || !turnstileToken || uploading) return;
    const uuid = uuidInput.trim();
    if (!uuid) {
      setSubmitError("请先填写报名时获得的 UUID（它标识图片的上传者）");
      return;
    }
    if (!UUID_RE.test(uuid)) {
      setSubmitError("UUID 格式不正确，请检查后重新输入");
      return;
    }
    setUploading(true);
    setSubmitError("");
    try {
      const fd = new FormData();
      for (const s of shots) {
        fd.append("files", s.file, s.name);
        fd.append("captions", s.caption);
      }
      fd.append("turnstileToken", turnstileToken);
      fd.append("uuid", uuid);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; results?: UploadResult[] }
        | null;
      if (res.ok && data?.ok && data.results) {
        setResults(data.results);
        setSubmitted(true);
        setShots([]);
        setTurnstileToken("");
        resetTurnstile();
      } else {
        setSubmitError(data?.message ?? `提交失败（${res.status}），请稍后重试`);
        setTurnstileToken("");
        resetTurnstile();
      }
    } catch {
      setSubmitError("网络异常，请检查网络后重试");
      setTurnstileToken("");
      resetTurnstile();
    } finally {
      setUploading(false);
    }
  };

  if (submitted && results.length > 0) {
    return (
      <div className="SuccessPanel mc-panel">
        <img src="/img/items/ender_pearl.png" alt="" width={56} height={56} className="pixel" />
        <h2>提交成功！</h2>
        <p>已成功上传 {results.length} 张图片，链接如下（可分享到群里的摄影展）：</p>
        <ul className="ResultList">
          {results.map((r, i) => (
            <li key={r.url}>
              <span className="ResultIndex">#{i + 1}</span>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.url}
              </a>
            </li>
          ))}
        </ul>
        <div className="SuccessActions">
          <Button variant="primary" onClick={() => setSubmitted(false)}>
            继续上传
          </Button>
        </div>
      </div>
    );
  }

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
        <span>或点击选择图片（可多选，单张不超过 5MB）</span>
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

      <div className="ModifyRow">
        <span>报名凭证 UUID *（标识上传者，提交后图片将进入风采展示区）</span>
        <Input
          value={uuidInput}
          onChange={setUuidInput}
          placeholder="例如 3f2504e0-4f89-41d3-9a0c-0305e82c3301"
        />
      </div>

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

      <div className="TurnstileRow">
        <Turnstile
          action="gallery"
          onVerify={setTurnstileToken}
          onExpire={() => setTurnstileToken("")}
        />
      </div>

      {submitError && <p className="SubmitError">{submitError}</p>}

      <div className="SubmitRow">
        <Button
          variant="primary"
          disabled={shots.length === 0 || !turnstileToken || uploading}
          onClick={onSubmit}
        >
          {uploading ? "上传中…" : `提交 ${shots.length > 0 ? `(${shots.length} 张)` : ""}`}
        </Button>
        {shots.length > 0 && !turnstileToken && !uploading && (
          <span className="SubmitPending">请先完成人机验证</span>
        )}
      </div>
    </div>
  );
}
