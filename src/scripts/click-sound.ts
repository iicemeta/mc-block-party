const MUTE_KEY = "mc-event:muted";
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

function fetchBuffer(name: SfxName): void {
  if (buffers.has(name)) return;
  const c = getCtx();
  if (!c) return;
  const conf = SOUNDS[name];
  const load = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    return c.decodeAudioData(await res.arrayBuffer());
  };
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

function play(name: SfxName): void {
  const c = getCtx();
  if (!c) return;
  const buf = buffers.get(name);
  if (!buf) return;
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

function warmup(): void {
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

window.addEventListener("pointerdown", warmup, { once: true, capture: true });

let lastClickGesture = 0;

window.addEventListener("mc-sfx", (e) => {
  const name = (e as CustomEvent<SfxName>).detail;
  if (name in SOUNDS && !isMuted()) play(name);
});

document.addEventListener(
  "click",
  (e) => {
    if (!(e.target instanceof Element)) return;
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

warmup();
applyMuteUI();
