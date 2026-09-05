import { useAuth } from "@melody-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Button, CheckboxGroup, Input, Tag } from "minecraft-react-ui";
import AuthGate from "./AuthGate";
import { STORAGE_KEYS, loadJSON, saveJSON } from "../lib/storage";

export type Registration = {
  name: string;
  studentId: string;
  college: string;
  qq: string;
  mcId: string;
  skills: string[];
};

const EMPTY: Registration = {
  name: "",
  studentId: "",
  college: "",
  qq: "",
  mcId: "",
  skills: [],
};

const SKILL_OPTIONS = [
  { label: "建筑", value: "build" },
  { label: "红石", value: "redstone" },
  { label: "生存", value: "survival" },
  { label: "PVP", value: "pvp" },
];

type Mode = "loading" | "new" | "view" | "edit";

type MeResponse = {
  ok?: boolean;
  message?: string;
  registration?: Registration | null;
};

type SubmitResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  created?: boolean;
  claimed?: boolean;
};

export default function RegisterForm() {
  return (
    <AuthGate enforce>
      <RegisterFormInner />
    </AuthGate>
  );
}

function RegisterFormInner() {
  const { acquireToken } = useAuth();
  const [mode, setMode] = useState<Mode>("loading");
  const [form, setForm] = useState<Registration>(EMPTY);
  const [draftRestored, setDraftRestored] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [resultCreated, setResultCreated] = useState(false);
  const [resultClaimed, setResultClaimed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const accessToken = await acquireToken();
      if (!accessToken) {
        if (!cancelled) setLoadError("登录状态已过期，请刷新页面重新登录");
        return;
      }
      try {
        const res = await fetch("/api/me", {
          headers: { authorization: `Bearer ${accessToken}` },
        });
        const data = (await res.json().catch(() => null)) as MeResponse | null;
        if (cancelled) return;
        if (res.ok && data?.ok) {
          const reg = data.registration;
          if (reg) {
            setForm(reg);
            setMode("view");
          } else {
            const draft = loadJSON<Registration>(STORAGE_KEYS.draft);
            if (draft && (draft.name || draft.mcId)) {
              setForm({ ...EMPTY, ...draft });
              setDraftRestored(true);
            }
            setMode("new");
          }
        } else {
          setLoadError(data?.message ?? `载入报名信息失败（${res.status}）`);
        }
      } catch {
        if (!cancelled) setLoadError("网络异常，请刷新重试");
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, [acquireToken]);

  const set = <K extends keyof Registration>(key: K, value: Registration[K]) => {
    if (mode === "view" || mode === "loading") return;
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (mode === "new") saveJSON(STORAGE_KEYS.draft, next);
      return next;
    });
  };

  const missing = useMemo(() => {
    const need: string[] = [];
    if (!form.name.trim()) need.push("姓名");
    const sid = form.studentId.trim();
    if (!sid) need.push("学号");
    else if (!/^\d{10}$/.test(sid)) need.push("学号（需 10 位数字）");
    if (!form.college.trim()) need.push("学院/班级");
    if (!form.qq.trim()) need.push("QQ 号");
    if (!form.mcId.trim()) need.push("MC 游戏 ID");
    if (form.skills.length === 0) need.push("擅长方向");
    return need;
  }, [form]);

  const valid = missing.length === 0;

  const onSubmit = async () => {
    if (mode !== "new" && mode !== "edit") return;
    if (!valid || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const accessToken = await acquireToken();
      if (!accessToken) {
        setSubmitError("登录状态已过期，请刷新页面重新登录");
        return;
      }
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          studentId: form.studentId.trim(),
          college: form.college.trim(),
          qq: form.qq.trim(),
          mcId: form.mcId.trim(),
          skills: form.skills,
        }),
      });
      const data = (await res.json().catch(() => null)) as SubmitResponse | null;
      if (res.ok && data?.ok) {
        saveJSON(STORAGE_KEYS.draft, form);
        setResultCreated(Boolean(data.created));
        setResultClaimed(Boolean(data.claimed));
        setSubmitted(true);
        setMode("view");
      } else {
        setSubmitError(data?.message ?? `提交失败（${res.status}），请稍后重试`);
      }
    } catch {
      setSubmitError("网络异常，请检查网络后重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="AuthLoading mc-panel">
        <img src="/img/items/tnt.png" alt="" width={40} height={40} className="pixel" />
        <p>{loadError}</p>
      </div>
    );
  }

  if (mode === "loading") {
    return (
      <div className="AuthLoading mc-panel">
        <img src="/img/items/ender_pearl.png" alt="" width={40} height={40} className="pixel" />
        <p>正在载入你的报名信息…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="SuccessPanel mc-panel">
        <img src="/img/items/golden_apple.png" alt="" width={56} height={56} className="pixel" />
        <h2>{resultClaimed ? "欢迎回来！" : resultCreated ? "报名成功！" : "报名信息已更新！"}</h2>
        <p>
          {resultClaimed
            ? "已找回并绑定你之前的报名，信息以本次提交为准。"
            : "欢迎加入 MC 联谊，"}
          {!resultClaimed && <strong>{form.mcId}</strong>}
          {!resultClaimed && "！你的信息已进入活动名单。"}
        </p>
        <p className="AuthBindNote">
          报名信息已与你的登录账号绑定：以后无需保存任何凭证，
          随时在本站登录即可查看或修改，换设备也不会丢失。
        </p>
        <div className="SuccessActions">
          <a href="/lottery">
            <Button variant="primary">去随机组队</Button>
          </a>
          <Button variant="secondary" onClick={() => setSubmitted(false)}>
            返回登记处
          </Button>
        </div>
      </div>
    );
  }

  const locked = mode === "view";
  const sidLocked = locked || mode === "edit";

  return (
    <div className="RegisterForm">
      <div className="FormMeta">
        {mode === "view" && <Tag className="Tag_success">查看模式：信息只读</Tag>}
        {mode === "edit" && <Tag className="Tag_success">修改模式：提交将更新原报名</Tag>}
        {mode === "new" && <Tag>提交后将自动绑定当前登录账号</Tag>}
        {draftRestored && mode === "new" && <Tag>已恢复上次草稿</Tag>}
      </div>

      <div className="FormGrid">
        <label className="Field">
          <span>姓名 *</span>
          <Input
            value={form.name}
            onChange={(v) => set("name", v)}
            placeholder="你的真实姓名"
            disabled={locked}
          />
        </label>
        <label className="Field">
          <span>学号 *{sidLocked && "（不可修改，如需变更请联系活动负责人）"}</span>
          <Input
            value={form.studentId}
            onChange={(v) => set("studentId", v)}
            placeholder="10 位数字，例如 2026212700"
            disabled={sidLocked}
          />
        </label>
        <label className="Field">
          <span>学院 / 班级 *</span>
          <Input
            value={form.college}
            onChange={(v) => set("college", v)}
            placeholder="例如 计算机学院 计科2401"
            disabled={locked}
          />
        </label>
        <label className="Field">
          <span>QQ 号 *</span>
          <Input
            value={form.qq}
            onChange={(v) => set("qq", v)}
            placeholder="用于拉群联系"
            disabled={locked}
          />
        </label>
        <label className="Field Field-wide">
          <span>MC 游戏 ID *</span>
          <Input
            value={form.mcId}
            onChange={(v) => set("mcId", v)}
            placeholder="你的 Minecraft 玩家名（Java / 基岩均可）"
            disabled={locked}
          />
        </label>
      </div>

      <div className="Field">
        <span>擅长方向 *（可多选）</span>
        <CheckboxGroup
          name="skills"
          value={form.skills}
          onChange={(v) => set("skills", v)}
          direction="row"
          options={SKILL_OPTIONS}
          disabled={locked}
        />
      </div>

      {submitError && <p className="SubmitError">{submitError}</p>}

      <div className="SubmitRow">
        {mode === "view" ? (
          <Button variant="primary" onClick={() => setMode("edit")}>
            启用修改
          </Button>
        ) : (
          <Button variant="primary" disabled={!valid || submitting} onClick={() => void onSubmit()}>
            {submitting ? "提交中…" : mode === "edit" ? "保存修改" : "提交报名"}
          </Button>
        )}
        <span className="SubmitHint">
          {mode === "view"
            ? "信息与账号绑定，可随时登录查看；如需调整请点击「启用修改」"
            : missing.length > 0
              ? `还差：${missing.join("、")}`
              : "信息已就绪，点击提交！"}
        </span>
      </div>
    </div>
  );
}
