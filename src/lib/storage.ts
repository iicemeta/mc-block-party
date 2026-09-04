export const STORAGE_KEYS = {
  draft: "mc-event:registration-draft",
  registration: "mc-event:registration",
  showcaseUuid: "mc-event:showcase-uuid",
} as const;

function backend(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadJSON<T>(key: string): T | null {
  const store = backend();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveJSON(key: string, value: unknown): boolean {
  const store = backend();
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
