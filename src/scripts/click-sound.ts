const MUTE_KEY = "mc-event:muted";
const PROMPT_KEY = "mc-event:sound-prompted";
const NAV_DELAY_MS = 150;

import clickOgg from "../assets/audio/click_stereo.ogg?inline";
import clickMp3 from "../assets/audio/click_stereo.mp3?inline";
import explodeOgg from "../assets/audio/explode3.ogg?inline";
import explodeMp3 from "../assets/audio/explode3.mp3?inline";

const SOUNDABLE =
  "button, [role='button'], a[href], label, summary, input[type='radio'], input[type='checkbox']";

const SOUNDS = {
  click: { src: clickOgg, fallback: clickMp3, volume: 0.8 },
  explode: { src: explodeOgg, fallback: explodeMp3, volume: 0.9 },
} as const;

type SfxName = keyof typeof SOUNDS;

declare global {
  interface Window {
    __mcSfx: {
      play: (name: SfxName) => void;
      counts: () => Record<string, number>;
      ctxState: () => string;
    };
  }
}

let ctx: AudioContext | null = null;
const buffers = new Map<SfxName, AudioBuffer | null>();
const playing = new Map<SfxName, AudioBufferSourceNode>();
const playCounts = new Map<SfxName, number>();

function getCtx(): AudioContext | null {
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

/**
 * 解码用 OfflineAudioContext：不受自动播放政策限制，
 * 页面加载时即可解码，也不会产生 "AudioContext was not allowed to start" 警告。
 */
function decodeBuffer(url: string): Promise<AudioBuffer> {
  const OC =
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;
  if (!OC) return Promise.reject(new Error("no OfflineAudioContext"));
  const oc = new OC(1, 1, 44100);
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.arrayBuffer();
    })
    .then((ab) => oc.decodeAudioData(ab));
}

function fetchBuffer(name: SfxName): void {
  if (buffers.has(name)) return;
  const conf = SOUNDS[name];
  buffers.set(name, null);
  const load = (url: string) => decodeBuffer(url);
  (async () => {
    let buf: AudioBuffer;
    try {
      buf = await load(conf.src);
    } catch {
      if (!conf.fallback) {
        buffers.delete(name);
        return;
      }
      try {
        buf = await load(conf.fallback);
      } catch {
        buffers.delete(name);
        return;
      }
    }
    buffers.set(name, buf);
  })();
}

function startSource(c: AudioContext, name: SfxName, buf: AudioBuffer): void {
  const prev = playing.get(name);
  if (prev) {
    try {
      prev.stop();
    } catch {
      /* 已停止 */
    }
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const gain = c.createGain();
  gain.gain.value = SOUNDS[name].volume;
  src.connect(gain).connect(c.destination);
  src.start();
  playCounts.set(name, (playCounts.get(name) ?? 0) + 1);
  src.onended = () => {
    if (playing.get(name) === src) playing.delete(name);
  };
  playing.set(name, src);
}

function play(name: SfxName): void {
  const c = getCtx();
  if (!c) return;
  const buf = buffers.get(name);
  if (!buf) return;
  if (c.state !== "running") {
    // resume 完成后再播，避免 suspended 状态下静默丢失
    void c.resume()
      .then(() => {
        if (c.state === "running") startSource(c, name, buf);
      })
      .catch(() => {});
    return;
  }
  startSource(c, name, buf);
}

/** 必须在用户手势事件中调用：创建 / 恢复 AudioContext 并预解码 */
function initAudio(): void {
  getCtx();
  (Object.keys(SOUNDS) as SfxName[]).forEach(fetchBuffer);
}

function isMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function setMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* 隐私模式等场景忽略 */
  }
  applyMuteUI();
}

function applyMuteUI(): void {
  const muted = isMuted();
  document.documentElement.classList.toggle("sound-muted", muted);
  document
    .querySelectorAll<HTMLButtonElement>("[data-mute-toggle]")
    .forEach((btn) => btn.setAttribute("data-muted", String(muted)));
}

/** 是否已经做过音效选择（弹窗选过，或老用户点过音效开关） */
function hasSoundChoice(): boolean {
  try {
    if (window.localStorage.getItem(PROMPT_KEY) === "1") return true;
    return window.localStorage.getItem(MUTE_KEY) !== null;
  } catch {
    return true; /* 无法存储（隐私模式）则不打扰用户 */
  }
}

function markPrompted(): void {
  try {
    window.localStorage.setItem(PROMPT_KEY, "1");
  } catch {
    /* 忽略 */
  }
}

function showSoundPrompt(): void {
  if (hasSoundChoice()) return;
  const overlay = document.createElement("div");
  overlay.className = "SoundPrompt";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <div class="SoundPrompt-panel mc-panel">
      <img src="/img/items/note_block.png" alt="" width="44" height="44" class="pixel" />
      <h2>开启按钮音效？</h2>
      <p>本站的按钮自带一点点像素风音效。<br />浏览器规定：需要你先点一下，我们才能播放声音。</p>
      <div class="SoundPrompt-actions">
        <button type="button" class="AuthBtn SoundOn" data-sound-choice="on">开启音效</button>
        <button type="button" class="AuthBtn" data-sound-choice="off">保持静音</button>
      </div>
      <small>之后可随时用导航栏右侧的音效按钮切换</small>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector("[data-sound-choice='on']")?.addEventListener("click", () => {
    markPrompted();
    setMuted(false);
    initAudio(); // 用户手势内创建 / 恢复 AudioContext
    applyMuteUI();
    close();
    play("click");
  });
  overlay.querySelector("[data-sound-choice='off']")?.addEventListener("click", () => {
    markPrompted();
    setMuted(true);
    close();
  });
}

// 首次用户手势兜底初始化（即使用户没点弹窗，点了页面其它地方也能激活音频）
window.addEventListener("pointerdown", () => initAudio(), { once: true, capture: true });

let lastClickGesture = 0;

window.addEventListener("mc-sfx", (e) => {
  const name = (e as CustomEvent<SfxName>).detail;
  if (name in SOUNDS && !isMuted()) play(name);
});

document.addEventListener(
  "click",
  (e) => {
    if (!(e.target instanceof Element)) return;

    // 音效选择弹窗由自己的处理器负责，避免双播 / 误切换
    if (e.target.closest(".SoundPrompt")) return;

    const hit = e.target.closest(SOUNDABLE);
    if (!hit) return;

    if (hit.matches("[data-mute-toggle]")) {
      const next = !isMuted();
      setMuted(next);
      if (!next) play("click");
      return;
    }

    if (isMuted()) return;
    const now = performance.now();
    if (now - lastClickGesture >= 80) {
      lastClickGesture = now;
      play("click");
    }

    const link = e.target.closest("a[href]");
    if (
      link instanceof HTMLAnchorElement &&
      !link.target &&
      link.origin === window.location.origin &&
      link.pathname.startsWith("/") &&
      !e.defaultPrevented &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey
    ) {
      e.preventDefault();
      window.setTimeout(() => {
        window.location.href = link.href;
      }, NAV_DELAY_MS);
    }
  },
  { capture: true }
);

window.__mcSfx = {
  play: (name: SfxName) => {
    if (!isMuted()) play(name);
  },
  counts: () => Object.fromEntries(playCounts),
  ctxState: () => ctx?.state ?? "none",
};

// 页面加载：仅预解码音频（OfflineAudioContext，无手势要求），不创建 AudioContext
(Object.keys(SOUNDS) as SfxName[]).forEach(fetchBuffer);
applyMuteUI();
showSoundPrompt();
