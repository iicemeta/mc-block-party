import { useEffect, useMemo, useState } from "react";
import { Button, CheckboxGroup, Input, Tag } from "minecraft-react-ui";
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ApiResponse = {
  ok?: boolean;
  message?: string;
  uuid?: string;
};

export default function RegisterForm() {
  const [form, setForm] = useState<Registration>(EMPTY);
  const [draftRestored, setDraftRestored] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [issuedUuid, setIssuedUuid] = useState("");
  const [uuidCopied, setUuidCopied] = useState(false);
  const [activeUuid, setActiveUuid] = useState("");
  const [uuidInput, setUuidInput] = useState("");
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordMessage, setRecordMessage] = useState("");

  useEffect(() => {
    const draft = loadJSON<Registration>(STORAGE_KEYS.draft);
    if (draft && (draft.name || draft.mcId)) {
      setForm({ ...EMPTY, ...draft });
      setDraftRestored(true);
    }
    const record = loadJSON<Registration>(STORAGE_KEYS.registration);
    if (record?.uuid && UUID_RE.test(record.uuid)) {
      setActiveUuid(record.uuid);
    }
  }, []);

  const set = <K extends keyof Registration>(key: K, value: Registration[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      saveJSON(STORAGE_KEYS.draft, next);
      return next;
    });
  };

  const missing = useMemo(() => {
    const need: string[] = [];
    if (!form.name.trim()) need.push("姓名");
    if (!form.studentId.trim()) need.push("学号");
    if (!form.college.trim()) need.push("学院/班级");
    if (!form.qq.trim()) need.push("QQ 号");
    if (!form.mcId.trim()) need.push("MC 游戏 ID");
    if (form.skills.length === 0) need.push("擅长方向");
    return need;
  }, [form]);

  const valid = missing.length === 0 && turnstileToken.length > 0;

  const onSubmit = async () => {
    if (!valid || submitting) return;
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
          uuid: activeUuid || undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as ApiResponse | null;
      if (res.ok && data?.ok && data.uuid) {
        const finalRecord = { ...record, uuid: data.uuid };
        saveJSON(STORAGE_KEYS.draft, finalRecord);
        saveJSON(STORAGE_KEYS.registration, finalRecord);
        setIssuedUuid(data.uuid);
        setSubmitted(true);
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

  const loadByUuid = async () => {
    const uuid = uuidInput.trim();
    if (!UUID_RE.test(uuid)) {
      setRecordMessage("UUID 格式不正确");
      return;
    }
    setRecordLoading(true);
    setRecordMessage("");
    try {
      const res = await fetch(`/api/register?uuid=${encodeURIComponent(uuid)}`);
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; registration?: Omit<Registration, "uuid"> }
        | null;
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
        setActiveUuid(uuid);
        setRecordMessage("已载入报名记录，修改后提交将更新原报名");
      } else {
        setRecordMessage(data?.message ?? `载入失败（${res.status}）`);
      }
    } catch {
      setRecordMessage("网络异常，请稍后重试");
    } finally {
      setRecordLoading(false);
    }
  };

  const copyUuid = async () => {
    try {
      await navigator.clipboard.writeText(issuedUuid);
      setUuidCopied(true);
      window.setTimeout(() => setUuidCopied(false), 2000);
    } catch {
      window.prompt("请手动复制你的 UUID：", issuedUuid);
    }
  };

  if (submitted) {
    return (
      <div className="SuccessPanel mc-panel">
        <img src="/img/items/golden_apple.png" alt="" width={56} height={56} className="pixel" />
        <h2>报名成功！</h2>
        <p>
          欢迎加入 MC 联谊，<strong>{form.mcId}</strong>！你的信息已进入活动名单。
        </p>
        <div className="UuidBox">
          <span className="UuidLabel">你的唯一凭证（UUID）</span>
          <code className="UuidValue">{issuedUuid}</code>
          <Button variant="secondary" onClick={copyUuid}>
            {uuidCopied ? "已复制" : "复制"}
          </Button>
        </div>
        <p className="UuidWarning">
          请务必保存好此 UUID：它是查询与修改报名信息的唯一凭证，
          关闭页面后将无法再次查看！
        </p>
        <div className="SuccessActions">
          <a href="/lottery">
            <Button variant="primary">去随机组队</Button>
          </a>
          <Button variant="secondary" onClick={() => setSubmitted(false)}>
            返回修改
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="RegisterForm">
      <div className="FormMeta">
        <Tag className="Tag_success">草稿自动保存</Tag>
        {draftRestored && <Tag>已恢复上次草稿</Tag>}
        <Tag>提交后将返回 UUID 凭证，请妥善保存</Tag>
        {activeUuid && <Tag className="Tag_success">修改模式：将更新你原有报名</Tag>}
      </div>

      <div className="ModifyRow">
        <span>已有报名？输入 UUID 查询并修改：</span>
        <Input
          value={uuidInput}
          onChange={setUuidInput}
          placeholder="例如 3f2504e0-4f89-41d3-9a0c-0305e82c3301"
        />
        <Button variant="secondary" disabled={recordLoading} onClick={loadByUuid}>
          {recordLoading ? "载入中…" : "载入"}
        </Button>
      </div>
      {recordMessage && <p className="RecordMessage">{recordMessage}</p>}

      <div className="FormGrid">
        <label className="Field">
          <span>姓名 *</span>
          <Input value={form.name} onChange={(v) => set("name", v)} placeholder="你的真实姓名" />
        </label>
        <label className="Field">
          <span>学号 *</span>
          <Input
            value={form.studentId}
            onChange={(v) => set("studentId", v)}
            placeholder="例如 2024010101"
          />
        </label>
        <label className="Field">
          <span>学院 / 班级 *</span>
          <Input
            value={form.college}
            onChange={(v) => set("college", v)}
            placeholder="例如 计算机学院 计科2401"
          />
        </label>
        <label className="Field">
          <span>QQ 号 *</span>
          <Input value={form.qq} onChange={(v) => set("qq", v)} placeholder="用于拉群联系" />
        </label>
        <label className="Field Field-wide">
          <span>MC 游戏 ID *</span>
          <Input
            value={form.mcId}
            onChange={(v) => set("mcId", v)}
            placeholder="你的 Minecraft 玩家名（Java / 基岩均可）"
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
        />
      </div>

      <div className="TurnstileRow">
        <Turnstile
          action="register"
          onVerify={setTurnstileToken}
          onExpire={() => setTurnstileToken("")}
        />
      </div>

      {submitError && <p className="SubmitError">{submitError}</p>}

      <div className="SubmitRow">
        <Button variant="primary" disabled={!valid || submitting} onClick={onSubmit}>
          {submitting ? "提交中…" : "提交报名"}
        </Button>
        <span className="SubmitHint">
          {missing.length > 0
            ? `还差：${missing.join("、")}`
            : turnstileToken
              ? "信息已就绪，点击提交！"
              : "请先完成上方人机验证"}
        </span>
      </div>
    </div>
  );
}
