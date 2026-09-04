import { STORAGE_KEYS, loadJSON, removeKey, saveJSON } from "./storage";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * 当前登录（会话）UUID。整个浏览器只有一个活动会话；
 * 换人登录时会清空上一位的草稿与本地报名记录，防止表单串号。
 */
export function getSessionUuid(): string {
  const saved = loadJSON<string>(STORAGE_KEYS.session);
  return saved && UUID_RE.test(saved) ? saved : "";
}

export function loginSession(uuid: string): void {
  const current = getSessionUuid();
  saveJSON(STORAGE_KEYS.session, uuid);
  if (current !== uuid) {
    // 换人：清空上一位的本地痕迹（其真实数据仍在服务端，按 UUID 可随时找回）
    removeKey(STORAGE_KEYS.draft);
    removeKey(STORAGE_KEYS.registration);
  }
}

export function clearSession(): void {
  removeKey(STORAGE_KEYS.session);
  removeKey(STORAGE_KEYS.draft);
  removeKey(STORAGE_KEYS.registration);
}

/**
 * 读取 URL 中的 ?uuid= 并写入会话，然后从地址栏抹除（避免残留在历史/书签中）。
 * 返回处理后的会话 UUID。
 */
export function consumeUuidFromUrl(): string {
  try {
    const url = new URL(window.location.href);
    const raw = (url.searchParams.get("uuid") ?? "").trim();
    if (raw && UUID_RE.test(raw)) {
      loginSession(raw);
    }
    if (raw) {
      url.searchParams.delete("uuid");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  } catch {
    /* 忽略 URL 解析异常 */
  }
  return getSessionUuid();
}
