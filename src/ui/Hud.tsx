"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { slotCount, useSystem } from "@/lib/store";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const pad = (n: number) => String(n).padStart(2, "0");

function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time className="t-sys block text-right text-[13px] leading-5 text-ice sm:text-[15px]" dateTime={now.toISOString()}>
      {now.getFullYear()}/{pad(now.getMonth() + 1)}/{pad(now.getDate())} {DAYS[now.getDay()]}
      <span className="ml-2 text-snow sm:ml-3">
        {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
      </span>
    </time>
  );
}

export function SoundToggles() {
  const sfx = useSystem((s) => s.sfx);
  const ambient = useSystem((s) => s.ambient);
  const toggleSfx = useSystem((s) => s.toggleSfx);
  const toggleAmbient = useSystem((s) => s.toggleAmbient);

  return (
    <div className="flex gap-2">
      <button type="button" className="btn !min-h-[34px] !px-2.5 !text-[12px]" data-on={sfx} aria-pressed={sfx} onClick={toggleSfx}>
        SFX {sfx ? "ON" : "OFF"}
      </button>
      <button type="button" className="btn !min-h-[34px] !px-2.5 !text-[12px]" data-on={ambient} aria-pressed={ambient} onClick={toggleAmbient}>
        BGM {ambient ? "ON" : "OFF"}
      </button>
    </div>
  );
}

function CardGlyph() {
  return (
    <svg viewBox="0 0 24 30" className="h-9 w-7 shrink-0 sm:h-11 sm:w-9" aria-hidden>
      <path d="M2 1h15l5 5v23H2z" fill="rgba(47,143,230,.4)" stroke="#9fe4ff" strokeWidth="1.3" />
      <rect x="5" y="5" width="11" height="9" fill="#e8f7ff" />
      <path d="M5 22h2v6H5zm4 0h2v6H9zm4 0h2v6h-2zm4 0h2v6h-2z" fill="#f0c860" />
    </svg>
  );
}

/** Card status and clock. Always visible while browsing. */
export function Hud() {
  const secret = useSystem((s) => s.secret);
  const found = slotCount(secret);

  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-[max(14px,env(safe-area-inset-top))] sm:p-6"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.45 }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <CardGlyph />
        <div className="min-w-0">
          <h2 className="t-title text-[12px] sm:text-[17px]">MEMORY CARD 1</h2>
          <p className="t-sys mt-1 text-[12px] text-cyan sm:text-[14px]">
            <span className="text-snow">{found}</span> SAVE DATA FOUND
          </p>
          <p className="t-sys mt-1 flex items-center gap-1.5 text-[11px] text-haze sm:text-[12px]">
            <span className="flex gap-[2px]" aria-hidden>
              {Array.from({ length: found }, (_, i) => (
                <i key={i} className={`block h-2 w-2 ${i > 5 ? "bg-[#ff4fd8]" : "bg-cyan"}`} />
              ))}
            </span>
            {found}/6 DATA AVAILABLE
          </p>
        </div>
      </div>
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <Clock />
        <SoundToggles />
      </div>
    </motion.header>
  );
}

/** Control legend at the bottom edge. */
export function ControlBar() {
  return (
    <motion.div
      className="t-sys pointer-events-none fixed bottom-5 left-6 z-20 hidden items-center gap-5 text-[12px] text-haze min-[900px]:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <span className="only-mouse flex items-center gap-2">
        <span className="keycap">←</span>
        <span className="keycap">→</span> SELECT
      </span>
      <span className="only-mouse flex items-center gap-2">
        <span className="keycap">ENTER</span> OPEN
      </span>
      <span className="only-mouse flex items-center gap-2">
        <span className="keycap">ESC</span> BACK
      </span>
      <span className="only-touch">SWIPE TO SELECT / TAP TO OPEN</span>
    </motion.div>
  );
}
