"use client";

import { useEffect, useRef, useState } from "react";
import { useSystem } from "@/lib/store";

/**
 * Arrow pointer in the console's style. It is moved by writing the transform
 * directly, so it never trails the real mouse by a React render.
 */
export function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  const hotScene = useSystem((s) => s.hot);
  const [hotDom, setHotDom] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("console-cursor");

    const move = (e: PointerEvent) => {
      setEnabled(true);
      if (el.current) el.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const target = e.target as Element | null;
      setHotDom(Boolean(target?.closest?.("a, button, [role='button']")));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("console-cursor");
    };
  }, []);

  const hot = hotDom || hotScene;

  return (
    <div ref={el} className="pointer-events-none fixed left-0 top-0 z-[70]" style={{ opacity: enabled ? 1 : 0 }} aria-hidden>
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        className="transition-transform duration-150"
        style={{ transform: hot ? "scale(1.22)" : "none", transformOrigin: "2px 2px", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.7))" }}
      >
        <path d="M2 2 L24 11 L14.5 14.5 L11 24 Z" fill={hot ? "#ffe63c" : "#ffffff"} stroke="#000" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
