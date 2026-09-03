const MUTE_KEY = "mc-event:muted";
const NAV_DELAY_MS = 150;

const SOUNDABLE =
  "button, [role='button'], a[href], label, summary, input[type='radio'], input[type='checkbox']";

let sfx: HTMLAudioElement | null = null;

function ensureAudio(): HTMLAudioElement {
  if (!sfx) {
    sfx = document.createElement("audio");
    sfx.src = sfx.canPlayType("audio/ogg")
      ? "/audio/click_stereo.ogg"
      : "/audio/click_stereo.mp3";
    sfx.preload = "auto";
    sfx.volume = 0.8;
    sfx.style.display = "none";
    document.body.append(sfx);
    sfx.load();
  }
  return sfx;
}

function isMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function setMuted(muted: boolean) {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* 隐私模式等场景忽略 */
  }
  applyMuteUI();
}

function applyMuteUI() {
  const muted = isMuted();
  document.documentElement.classList.toggle("sound-muted", muted);
  document
    .querySelectorAll<HTMLButtonElement>("[data-mute-toggle]")
    .forEach((btn) => btn.setAttribute("data-muted", String(muted)));
}

function playSound() {
  const a = ensureAudio();
  try {
    a.currentTime = 0;
  } catch {
    /* 尚未就绪时忽略 */
  }
  a.play().catch(() => {});
}

window.addEventListener("pointerdown", ensureAudio, { once: true, capture: true });

document.addEventListener(
  "click",
  (e) => {
    if (!(e.target instanceof Element)) return;
    const hit = e.target.closest(SOUNDABLE);
    if (!hit) return;

    if (hit.matches("[data-mute-toggle]")) {
      const next = !isMuted();
      setMuted(next);
      if (!next) playSound();
      return;
    }

    if (isMuted()) return;
    playSound();

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

ensureAudio();
applyMuteUI();
