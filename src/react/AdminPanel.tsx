import { useAuth } from "@melody-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Input, Tag } from "minecraft-react-ui";
import AuthGate from "./AuthGate";

type AdminInfo = {
  authId: string;
  email: string;
  role: "super" | "admin";
  createdAt: string;
};

type Overview = {
  ok?: boolean;
  message?: string;
  email?: string;
  role?: "super" | "admin";
  totalRegistrations?: number;
  admins?: AdminInfo[];
};

export default function AdminPanel() {
  return (
    <AuthGate enforce>
      <AdminPanelInner />
    </AuthGate>
  );
}

function AdminPanelInner() {
  const { acquireToken } = useAuth();
  const [phase, setPhase] = useState<"loading" | "denied" | "error" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState<Overview | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const accessToken = await acquireToken();
    if (!accessToken) {
      setPhase("error");
      setErrorMessage("登录状态已过期，请刷新页面重新登录");
      return;
    }
    const res = await fetch("/api/admin/overview", {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const body = (await res.json().catch(() => null)) as Overview | null;
    if (res.status === 403) {
      setPhase("denied");
      return;
    }
    if (res.ok && body?.ok) {
      setData(body);
      setPhase("ready");
    } else {
      setPhase("error");
      setErrorMessage(body?.message ?? `载入失败（${res.status}）`);
    }
  }, [acquireToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const addAdmin = async () => {
    const email = newEmail.trim();
    if (!email || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const accessToken = await acquireToken();
      if (!accessToken) {
        setError("登录状态已过期，请刷新页面重新登录");
        return;
      }
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ email }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (res.ok && body?.ok) {
        setNotice(`已添加管理员：${email}`);
        setNewEmail("");
        await load();
      } else {
        setError(body?.message ?? `添加失败（${res.status}）`);
      }
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setBusy(false);
    }
  };

  const removeAdmin = async (authId: string, email: string) => {
    if (!window.confirm(`确定移除管理员 ${email} 吗？`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const accessToken = await acquireToken();
      if (!accessToken) {
        setError("登录状态已过期，请刷新页面重新登录");
        return;
      }
      const res = await fetch(`/api/admin/admins?authId=${encodeURIComponent(authId)}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (res.ok && body?.ok) {
        setNotice(`已移除管理员：${email}`);
        await load();
      } else {
        setError(body?.message ?? `移除失败（${res.status}）`);
      }
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    setError("");
    try {
      const accessToken = await acquireToken();
      if (!accessToken) {
        setError("登录状态已过期，请刷新页面重新登录");
        return;
      }
      const res = await fetch("/api/admin/export", {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        setError(`导出失败（${res.status}）`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mc-event-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice("名单已导出");
    } catch {
      setError("导出失败，请稍后重试");
    }
  };

  if (phase === "loading") {
    return (
      <div className="AuthLoading mc-panel">
        <img src="/img/items/ender_pearl.png" alt="" width={40} height={40} className="pixel" />
        <p>正在核验管理员身份…</p>
      </div>
    );
  }

  if (phase === "denied") {
    return (
      <div className="AuthLoading mc-panel">
        <img src="/img/items/redstone_block.png" alt="" width={40} height={40} className="pixel" />
        <h2>无访问权限</h2>
        <p>管理控制台仅对活动管理员开放。如需权限，请联系超级管理员添加你的账号邮箱。</p>
        <p>
          <a href="/me">返回个人主页</a>
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="AuthLoading mc-panel">
        <img src="/img/items/tnt.png" alt="" width={40} height={40} className="pixel" />
        <p>{errorMessage}</p>
      </div>
    );
  }

  const isSuper = data?.role === "super";

  return (
    <div className="AdminPanel">
      <div className="FormMeta">
        <Tag>当前账号：{data?.email}</Tag>
        <Tag className={isSuper ? "Tag_success" : ""}>
          {isSuper ? "超级管理员" : "管理员"}
        </Tag>
      </div>

      <div className="AdminStats mc-panel">
        <div className="StatBlock">
          <span className="StatLabel">报名总人数</span>
          <span className="StatValue">{data?.totalRegistrations ?? 0}</span>
        </div>
        <Button variant="primary" onClick={() => void exportCsv()}>
          导出报名名单（CSV）
        </Button>
      </div>

      <h2 className="AdminSectionTitle">管理员管理</h2>
      <p className="AdminHint">
        {isSuper
          ? "你可以添加 / 移除管理员；管理员可以查看本页并导出名单，但不能管理其他管理员。"
          : "你可以在本页查看管理员列表并导出报名名单。添加 / 移除管理员需要超级管理员操作。"}
      </p>

      {isSuper && (
        <div className="ModifyRow">
          <span>添加管理员（对方需已在登录系统注册）：</span>
          <Input
            value={newEmail}
            onChange={setNewEmail}
            placeholder="例如 someone@example.com"
          />
          <Button variant="primary" disabled={!newEmail.trim() || busy} onClick={() => void addAdmin()}>
            {busy ? "处理中…" : "添加"}
          </Button>
        </div>
      )}

      {notice && <p className="Notice">{notice}</p>}
      {error && <p className="SubmitError">{error}</p>}

      <table className="AdminTable mc-panel">
        <thead>
          <tr>
            <th>邮箱</th>
            <th>角色</th>
            <th>添加时间</th>
            {isSuper && <th>操作</th>}
          </tr>
        </thead>
        <tbody>
          {(data?.admins ?? []).map((a) => (
            <tr key={a.authId}>
              <td>{a.email}</td>
              <td>
                <Tag className={a.role === "super" ? "Tag_success" : ""}>
                  {a.role === "super" ? "超级管理员" : "管理员"}
                </Tag>
              </td>
              <td>{a.createdAt}</td>
              {isSuper && (
                <td>
                  {a.role !== "super" && (
                    <button
                      type="button"
                      className="ExitModify"
                      disabled={busy}
                      onClick={() => void removeAdmin(a.authId, a.email)}
                    >
                      移除
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
