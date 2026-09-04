import { useEffect, useMemo, useState } from "react";
import { Button, CheckboxGroup, Input, Tag } from "minecraft-react-ui";
import {
  clearSession,
  consumeUuidFromUrl,
  getSessionUuid,
  isValidUuid,
  loginSession,
} from "../lib/session";
import { STORAGE_KEYS, loadJSON, saveJSON } from "../lib/storage";
import Turnstile, { resetTurnstile } from "./Turnstile";

export type Registration = {
  name: string;
  studentId: string;
  college: string;
  qq: string;
  mcId: string;
  skills: string[];
  uuid?: string;
  submittedAt?: string;
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

type Mode = "new" | "view" | "edit";
type ApiResponse = {
  ok?: boolean;
  message?: string;
  uuid?: string;
  created?: boolean;
  registration?: Omit<Registration, "uuid" | "submittedAt">;
};

export default function RegisterForm() {
  const [mode, setMode] = useState<Mode>("new");
  const [form, setForm] = useState<Registration>(EMPTY);
  const [draftRestored, setDraftRestored] = useState(false);
  const [sessionUuid, setSessionUuid] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastCreated, setLastCreated] = useState(false);
  const [issuedUuid, setIssuedUuid] = useState("");
  const [uuidCopied, setUuidCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadRecord = async (uuid: string): Promise<boolean> => {
    setLoadingRecord(true);
    try {
      const res = await fetch(`/api/register?uuid=${encodeURIComponent(uuid)}`);
      const data = (await res.json().catch(() => null)) as ApiResponse | null;
      if (res.ok && data?.ok && data.registration) {
        const reg = data.registration;
        setForm({
          name: reg.name,
          studentId: reg.studentId,
          college: reg.college,
          qq: reg.qq,
          mcId: reg.mcId,
          skills: reg.skills,
        });
        setMode("view");
        return true;
      }
      setSessionMessage(data?.message ?? `载入失败（${res.status}）`);
      return false;
    } catch {
      setSessionMessage("网络异常，请稍后重试");
      return false;
    } finally {
      setLoadingRecord(false);
    }
  };

  useEffect(() => {
    const uuid = consumeUuidFromUrl();
    if (uuid) {
      setSessionUuid(uuid);
      setSessionMessage("已通过登录链接自动登录");
      void loadRecord(uuid);
      return;
    }
    const existing = getSessionUuid();
    if (existing) {
      setSessionUuid(existing);
      setSessionMessage("检测到本机登录，已显示你的报名信息");
      void loadRecord(existing);
      return;
    }
    const draft = loadJSON<Registration>(STORAGE_KEYS.draft);
    if (draft && (draft.name || draft.mcId)) {
      setForm({ ...EMPTY, ...draft });
      setDraftRestored(true);
    }
  }, []);

  const set = <K extends keyof Registration>(key: K, value: Registration[K]) => {
    if (mode === "view") return;
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (mode === "new") saveJSON(STORAGE_KEYS.draft, next);
      return next;
    });
  };

  const doLogin = async () => {
    const uuid = loginInput.trim();
    if (!isValidUuid(uuid)) {
      setSessionMessage("UUID 格式不正确");
      return;
    }
    const ok = await loadRecord(uuid);
    if (ok) {
      loginSession(uuid);
      setSessionUuid(uuid);
      setSessionMessage("");
      setLoginInput("");
    }
  };

  const startEdit = () => setMode("edit");

  const logout = () => {
    clearSession();
    setSessionUuid("");
    setForm(EMPTY);
    setMode("new");
    setSubmitted(false);
    setIssuedUuid("");
    setTurnstileToken("");
    setSessionMessage("已退出登录");
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

  const valid = missing.length === 0 && turnstileToken.length > 0;

  const onSubmit = async () => {
    if (mode === "view" || !valid || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    const record: Registration = {
      name: form.name.trim(),
      studentId: form.studentId.trim(),
      college: form.college.trim(),
      qq: form.qq.trim(),
      mcId: form.mcId.trim(),
      skills: form.skills,
      submittedAt: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: record.name,
          studentId: record.studentId,
          college: record.college,
          qq: record.qq,
          mcId: record.mcId,
          skills: record.skills,
          turnstileToken,
          uuid: mode === "edit" ? sessionUuid : undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as ApiResponse | null;
      if (res.ok && data?.ok && data.uuid) {
        const finalRecord = { ...record, uuid: data.uuid };
        saveJSON(STORAGE_KEYS.draft, finalRecord);
        saveJSON(STORAGE_KEYS.registration, finalRecord);
        loginSession(data.uuid);
        setSessionUuid(data.uuid);
        setIssuedUuid(data.uuid);
        setLastCreated(Boolean(data.created));
        setSubmitted(true);
        setMode("view");
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
      setSubmitting(false);
    }
  };

  const copyText = async (text: string, mark: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      mark();
      window.setTimeout(mark, 2000);
    } catch {
      window.prompt("请手动复制：", text);
    }
  };

  if (submitted) {
    const loginLink = `${window.location.origin}/register?uuid=${issuedUuid}`;
    return (
      <div className="SuccessPanel mc-panel">
        <img src="/img/items/golden_apple.png" alt="" width={56} height={56} className="pixel" />
        <h2>{lastCreated ? "报名成功！" : "报名信息已更新！"}</h2>
        <p>
          欢迎加入 MC 联谊，<strong>{form.mcId}</strong>！你的信息已进入活动名单。
        </p>
        <div className="UuidBox">
          <span className="UuidLabel">你的唯一凭证（UUID）</span>
          <code className="UuidValue">{issuedUuid}</code>
          <Button
            variant="secondary"
            onClick={() => copyText(issuedUuid, () => setUuidCopied(true))}
          >
            {uuidCopied ? "已复制" : "复制"}
          </Button>
        </div>
        <div className="UuidBox">
          <span className="UuidLabel">你的登录链接</span>
          <code className="UuidValue">{loginLink}</code>
          <Button
            variant="secondary"
            onClick={() => copyText(loginLink, () => setLinkCopied(true))}
          >
            {linkCopied ? "已复制" : "复制链接"}
          </Button>
        </div>
        <p className="UuidWarning">
          请务必保存好 UUID 或登录链接：它是查询与修改报名信息的唯一凭证，
          关闭页面后将无法再次查看！在任何设备上打开登录链接即可登录。
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
        {mode === "new" && <Tag>提交后将返回 UUID 凭证，请妥善保存</Tag>}
        {draftRestored && mode === "new" && <Tag>已恢复上次草稿</Tag>}
        {mode !== "new" && (
          <button type="button" className="ExitModify" onClick={logout}>
            退出登录
          </button>
        )}
      </div>

      {mode === "new" && (
        <div className="ModifyRow">
          <span>已有报名？输入 UUID 登录查看 / 修改：</span>
          <Input
            value={loginInput}
            onChange={setLoginInput}
            placeholder="例如 3f2504e0-4f89-41d3-9a0c-0305e82c3301"
          />
          <Button variant="secondary" disabled={loadingRecord} onClick={doLogin}>
            {loadingRecord ? "登录中…" : "登录"}
          </Button>
        </div>
      )}
      {sessionMessage && <p className="RecordMessage">{sessionMessage}</p>}

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

      {mode !== "view" && (
        <div className="TurnstileRow">
          <Turnstile
            action="register"
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken("")}
          />
        </div>
      )}

      {submitError && <p className="SubmitError">{submitError}</p>}

      <div className="SubmitRow">
        {mode === "view" ? (
          <Button variant="primary" onClick={startEdit}>
            启用修改
          </Button>
        ) : (
          <Button variant="primary" disabled={!valid || submitting} onClick={onSubmit}>
            {submitting ? "提交中…" : mode === "edit" ? "保存修改" : "提交报名"}
          </Button>
        )}
        <span className="SubmitHint">
          {mode === "view"
            ? "确认信息无误后可退出登录；如需调整请点击「启用修改」"
            : missing.length > 0
              ? `还差：${missing.join("、")}`
              : turnstileToken
                ? "信息已就绪，点击提交！"
                : "请先完成上方人机验证"}
        </span>
      </div>
    </div>
  );
}
