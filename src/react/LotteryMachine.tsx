import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Tag } from "minecraft-react-ui";
import { assignTeams, mulberry32, type Team } from "../lib/shuffle";
import { MOCK_PARTICIPANTS } from "../lib/mockParticipants";
import { STORAGE_KEYS, loadJSON } from "../lib/storage";
import shuffleSrc from "../lib/shuffle.ts?raw";

type Phase = "idle" | "rolling" | "boom" | "done";

type Registration = { mcId?: string };

const ROLL_MS = 2600;
const BOOM_MS = 550;
const SLOT_TICK_MS = 70;

export default function LotteryMachine() {
  const [total, setTotal] = useState(MOCK_PARTICIPANTS.length);
  const [teamSize, setTeamSize] = useState(4);
  const [phase, setPhase] = useState<Phase>("idle");
  const [slotName, setSlotName] = useState("?");
  const [seed, setSeed] = useState<number | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState("");
  const [myId, setMyId] = useState("");

  const slotTimer = useRef<number | null>(null);
  const stageTimer = useRef<number | null>(null);

  useEffect(() => {
    const reg = loadJSON<Registration>(STORAGE_KEYS.registration);
    if (reg?.mcId) setMyId(reg.mcId);
    return () => {
      if (slotTimer.current) window.clearInterval(slotTimer.current);
      if (stageTimer.current) window.clearTimeout(stageTimer.current);
    };
  }, []);

  const participants = useMemo(() => {
    const n = Math.max(2, Math.min(total, MOCK_PARTICIPANTS.length));
    return MOCK_PARTICIPANTS.slice(0, n);
  }, [total]);

  const run = (useSeed: number) => {
    setError("");
    setTeams([]);
    setSeed(useSeed);
    setPhase("rolling");

    const pool = participants;
    slotTimer.current = window.setInterval(() => {
      setSlotName(pool[Math.floor(Math.random() * pool.length)]);
    }, SLOT_TICK_MS);

    stageTimer.current = window.setTimeout(() => {
      if (slotTimer.current) window.clearInterval(slotTimer.current);
      setPhase("boom");
      stageTimer.current = window.setTimeout(() => {
        try {
          const result = assignTeams(pool, teamSize, mulberry32(useSeed));
          setTeams(result);
          setPhase("done");
        } catch (e) {
          setError(e instanceof Error ? e.message : "抽取失败");
          setPhase("idle");
        }
      }, BOOM_MS);
    }, ROLL_MS);
  };

  const start = () => {
    if (teamSize < 1 || !Number.isInteger(teamSize)) {
      setError("每组人数必须是正整数");
      return;
    }
    if (participants.length < teamSize) {
      setError(`总人数至少 ${teamSize} 人才能成队`);
      return;
    }
    run(Math.floor(Math.random() * 2 ** 31));
  };

  const rolling = phase === "rolling";
  const boom = phase === "boom";

  return (
    <div className={boom ? "Lottery shaking" : "Lottery"}>
      <div className="Controls mc-panel">
        <label className="Control">
          <span>报名总人数</span>
          <Input
            value={String(total)}
            onChange={(v) => setTotal(Number(v.replace(/\D/g, "")) || 0)}
            disabled={rolling || boom}
          />
        </label>
        <label className="Control">
          <span>每组人数</span>
          <Input
            value={String(teamSize)}
            onChange={(v) => setTeamSize(Number(v.replace(/\D/g, "")) || 0)}
            disabled={rolling || boom}
          />
        </label>
        <Button
          variant="primary"
          onClick={start}
          disabled={rolling || boom}
          className="StartBtn"
        >
          {phase === "done" ? "重新抽取" : "开始抽取"}
        </Button>
        {phase === "done" && seed !== null && (
          <Button variant="secondary" onClick={() => run(seed)}>
            同种子重抽（种子 {seed}）
          </Button>
        )}
      </div>

      {myId && (
        <p className="RegNotice">
          <Tag className="Tag_success">已报名</Tag> 检测到你的报名记录：{myId}（演示名单未含真实数据）
        </p>
      )}
      {error && (
        <p className="Error">
          <span className="ErrorTag">出错了</span> {error}
        </p>
      )}

      <div className="Machine mc-panel">
        <div className="Slot">{rolling ? slotName : phase === "idle" ? "等待开始…" : "TNT!"}</div>
        <div className="xp-bar">
          <div
            className="xp-bar-fill"
            style={
              rolling
                ? { animation: "xpFill 2.6s linear forwards" }
                : phase === "done"
                  ? { width: "100%" }
                  : undefined
            }
          />
        </div>
        {boom && <img src="/img/items/tnt.png" alt="" width={64} height={64} className="pixel BoomTnt" />}
        {boom && <div className="BoomFlash" />}
      </div>

      {phase === "done" && teams.length > 0 && seed !== null && (
        <>
          <h3 className="ResultTitle">
            抽取完成 · 种子 <code>{seed}</code> · 共 {teams.length} 队
          </h3>
          <div className="TeamGrid">
            {teams.map((t, i) => (
              <div
                key={t.name + i}
                className="TeamCard mc-panel"
                style={{ animation: `popIn 0.35s ease-out both`, animationDelay: `${i * 130}ms` }}
              >
                <div className="TeamHead">
                  <img src={t.icon} alt="" width={32} height={32} className="pixel" />
                  <strong>{t.name}</strong>
                  <Tag>{t.members.length} 人</Tag>
                </div>
                <ul>
                  {t.members.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

      <details className="SourcePanel">
        <summary>查看抽取核心源码（Fisher-Yates 洗牌 · 与本页执行代码同源）</summary>
        <p className="SourceNote">
          以下代码通过 Vite <code>?raw</code> 直接引入 <code>src/lib/shuffle.ts</code> 原文件，
          即页面实际执行的分组逻辑：随机种子 → 洗牌 → 顺序切片。同一种子必然得到同一结果，
          公示种子即可接受任何人复核。
        </p>
        <pre>
          <code>{shuffleSrc}</code>
        </pre>
      </details>
    </div>
  );
}
