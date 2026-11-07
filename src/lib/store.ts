import { create } from "zustand";
import { playCue, setAmbient, type Cue } from "./audio";

/**
 * The console's flow, in order:
 * boot -> browser -> opening (camera dives) -> loading (save bar) -> section -> closing -> browser.
 * switching is the short load between Previous / Next inside an open save.
 */
export type Phase = "boot" | "browser" | "opening" | "loading" | "section" | "switching" | "closing";

export type Notice = { id: number; text: string };

type System = {
  phase: Phase;
  /** Highlighted slot in the browser. */
  selected: number;
  /** Unbounded ring position, so wrapping past the last slot keeps turning the same way. */
  ringStep: number;
  /** Open save, or null while browsing. */
  openId: number | null;
  /** Set when the page was opened on a save's URL, consumed after boot. */
  pending: number | null;
  sfx: boolean;
  ambient: boolean;
  secret: boolean;
  /** True when WebGL is unavailable and the plain slot menu is shown instead. */
  no3d: boolean;
  hot: boolean;
  /** Finger is holding the memory card, so a drag must not count as a swipe. */
  grip: boolean;
  notices: Notice[];

  finishBoot: () => void;
  queueOpen: (index: number) => void;
  select: (index: number, source: "hover" | "tap") => void;
  step: (dir: 1 | -1) => void;
  open: (index?: number) => void;
  back: () => void;
  shift: (dir: 1 | -1) => void;
  jump: (index: number) => void;
  toggleSfx: () => void;
  toggleAmbient: () => void;
  notify: (text: string) => void;
  unlockSecret: () => void;
  setNo3d: () => void;
  setHot: (hot: boolean) => void;
};

const wrap = (value: number, size: number) => ((value % size) + size) % size;

const calm = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let timers: ReturnType<typeof setTimeout>[] = [];
let noticeId = 0;

function schedule(steps: [number, () => void][]) {
  timers.forEach(clearTimeout);
  timers = [];
  let at = 0;
  for (const [delay, run] of steps) {
    at += delay;
    timers.push(setTimeout(run, at));
  }
}

export const useSystem = create<System>((set, get) => {
  const cue = (name: Cue) => {
    if (get().sfx) playCue(name);
  };
  const count = () => (get().secret ? 7 : 6);

  const load = (index: number) => {
    const quick = calm() || get().no3d;
    set({ phase: "opening", selected: index, openId: index, hot: false });
    cue("confirm");
    schedule([
      [
        quick ? 80 : 950,
        () => {
          set({ phase: "loading" });
          cue("load");
        },
      ],
      [quick ? 500 : 1500, () => set({ phase: "section" })],
    ]);
  };

  const swap = (index: number) => {
    set({ phase: "switching" });
    cue("move");
    schedule([
      [260, () => set({ openId: index, selected: index, ringStep: index })],
      [calm() ? 120 : 460, () => set({ phase: "section" })],
    ]);
  };

  return {
    phase: "boot",
    selected: 0,
    ringStep: 0,
    openId: null,
    pending: null,
    sfx: false,
    ambient: false,
    secret: false,
    no3d: false,
    hot: false,
    grip: false,
    notices: [],

    finishBoot() {
      if (get().phase !== "boot") return;
      const { pending, notify } = get();
      set({ phase: "browser", pending: null });
      if (pending !== null) {
        set({ ringStep: pending, selected: pending });
        schedule([[900, () => load(pending)]]);
      } else {
        schedule([[1600, () => notify("MEMORY CARD 1 CHECK COMPLETE")]]);
      }
    },

    queueOpen(index) {
      if (index === 6) set({ secret: true });
      set({ pending: index });
    },

    select(index, source) {
      const { phase, selected, ringStep } = get();
      if (phase !== "browser") return;
      if (index === selected && source === "hover") return;
      if (source === "tap") {
        const n = count();
        const delta = wrap(index - ringStep + n / 2, n) - n / 2;
        set({ ringStep: ringStep + Math.round(delta) });
      }
      set({ selected: index });
      cue("move");
    },

    step(dir) {
      const { phase, selected, ringStep } = get();
      if (phase !== "browser") return;
      const n = count();
      const next = wrap(selected + dir, n);
      // Hovering can leave the highlight away from the front, so turn from there.
      const offset = wrap(next - ringStep + n / 2, n) - n / 2;
      set({ selected: next, ringStep: ringStep + Math.round(offset) });
      cue("move");
    },

    open(index) {
      const { phase, selected } = get();
      if (phase !== "browser") return;
      load(index ?? selected);
    },

    back() {
      if (get().phase !== "section") return;
      set({ phase: "closing" });
      cue("back");
      schedule([
        [
          calm() ? 100 : 700,
          () => {
            set({ phase: "browser", openId: null });
            get().notify("SAVE DATA CLOSED");
          },
        ],
      ]);
    },

    shift(dir) {
      const { phase, openId } = get();
      if (phase !== "section" || openId === null) return;
      swap(wrap(openId + dir, count()));
    },

    jump(index) {
      const { phase, openId } = get();
      if (phase === "section" && openId !== index) swap(index);
      if (phase === "browser") load(index);
    },

    toggleSfx() {
      const on = !get().sfx;
      set({ sfx: on });
      if (on) playCue(get().phase === "boot" ? "boot" : "notice");
    },

    toggleAmbient() {
      const on = !get().ambient;
      set({ ambient: on });
      setAmbient(on);
    },

    notify(text) {
      const id = ++noticeId;
      set((s) => ({ notices: [...s.notices.slice(-2), { id, text }] }));
      cue("notice");
      setTimeout(() => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })), 3400);
    },

    unlockSecret() {
      if (get().secret) return;
      set({ secret: true });
      cue("secret");
      get().notify("WARNING: UNKNOWN SAVE DATA DETECTED");
    },

    setNo3d: () => set({ no3d: true }),
    setHot: (hot) => {
      if (get().hot !== hot) set({ hot });
    },
  };
});

export const slotCount = (secret: boolean) => (secret ? 7 : 6);
