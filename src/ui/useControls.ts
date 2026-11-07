"use client";

import { useEffect } from "react";
import { saveByHash, ALL_SAVES } from "@/data/saves";
import { useSystem } from "@/lib/store";

const CHEAT = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const SWIPE = 44;

/** Keyboard, swipe, and the hidden code. */
export function useControls() {
  useEffect(() => {
    let cheat = 0;
    let startX: number | null = null;
    let startY = 0;

    const key = (e: KeyboardEvent) => {
      const sys = useSystem.getState();

      cheat = e.key.toLowerCase() === CHEAT[cheat].toLowerCase() ? cheat + 1 : e.key === CHEAT[0] ? 1 : 0;
      if (cheat === CHEAT.length) {
        cheat = 0;
        sys.unlockSecret();
      }

      const typing = (e.target as HTMLElement).closest?.("input, textarea");
      const control = (e.target as HTMLElement).closest?.("a, button");
      if (typing) return;

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const dir = e.key === "ArrowRight" ? 1 : -1;
        if (sys.phase === "browser") sys.step(dir);
        if (sys.phase === "section") sys.shift(dir);
      } else if (e.key === "Enter" && !control && sys.phase === "browser") {
        sys.open();
      } else if (e.key === "Escape") {
        sys.back();
      }
    };

    const touchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const touchEnd = (e: TouchEvent) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      startX = null;
      const sys = useSystem.getState();
      if (sys.phase === "browser" && !sys.grip && Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * 1.5) {
        sys.step(dx < 0 ? 1 : -1);
      }
    };

    window.addEventListener("keydown", key);
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchend", touchEnd, { passive: true });
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchend", touchEnd);
    };
  }, []);
}

/** Keeps the URL hash and the open save in step, so links and the back button work. */
export function useHashRoute() {
  useEffect(() => {
    const target = saveByHash(window.location.hash.slice(1));
    if (target) useSystem.getState().queueOpen(target.index);

    const unsubscribe = useSystem.subscribe((state, prev) => {
      if (state.openId === prev.openId) return;
      const want = state.openId === null ? "" : `#${ALL_SAVES[state.openId].hash}`;
      if (window.location.hash !== want) {
        history.pushState(null, "", want || window.location.pathname + window.location.search);
      }
    });

    const popped = () => {
      const sys = useSystem.getState();
      const save = saveByHash(window.location.hash.slice(1));
      if (save) sys.jump(save.index);
      else sys.back();
    };
    window.addEventListener("popstate", popped);
    return () => {
      unsubscribe();
      window.removeEventListener("popstate", popped);
    };
  }, []);
}
