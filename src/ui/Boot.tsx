"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSystem } from "@/lib/store";

const LINES = ["INITIALIZING MEMORY SYSTEM...", "LOADING USER PROFILE...", "ACCESSING MEMORY CARD..."];
const BLOCKS = 24;
const SEEN_KEY = "riski-exe-booted";

function alreadyBooted() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberBoot() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* Private windows may refuse storage; the full boot just plays again. */
  }
}

/** Black screen, system log, then the picture opens like a tube warming up. */
export function Boot() {
  const finishBoot = useSystem((s) => s.finishBoot);
  const sfx = useSystem((s) => s.sfx);
  const toggleSfx = useSystem((s) => s.toggleSfx);

  const [line, setLine] = useState(0);
  const [filled, setFilled] = useState(0);
  const [welcome, setWelcome] = useState(false);
  const [opening, setOpening] = useState(false);
  const [gone, setGone] = useState(false);
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const beat = alreadyBooted() ? 0.35 : 1;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let done = false;

    const open = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      rememberBoot();
      setWelcome(true);
      setOpening(true);
      finishBoot();
      setTimeout(() => setGone(true), calm ? 100 : 1000);
    };
    skip.current = open;

    const at = (ms: number, run: () => void) => timers.push(setTimeout(run, ms * beat));
    LINES.forEach((_, i) => at(350 + i * 950, () => setLine(i + 1)));
    for (let i = 1; i <= BLOCKS; i++) at(300 + i * 120, () => setFilled(i));
    at(3500, () => setWelcome(true));
    at(4900, open);

    const key = (e: KeyboardEvent) => {
      if (e.key !== "Tab") open();
    };
    window.addEventListener("keydown", key);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", key);
    };
  }, [finishBoot]);

  if (gone) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={() => skip.current()}>
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-black"
        animate={opening ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 0.85, ease: [0.7, 0, 0.2, 1] }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-black"
        animate={opening ? { y: "100%" } : { y: 0 }}
        transition={{ duration: 0.85, ease: [0.7, 0, 0.2, 1] }}
      />
      <motion.div
        className="absolute inset-x-0 top-1/2 h-px bg-ice shadow-[0_0_30px_8px_rgba(111,220,255,.8)]"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={opening ? { scaleX: 1, opacity: [0, 1, 0] } : {}}
        transition={{ duration: 0.7 }}
      />

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-full max-w-[460px]">
          <div className="t-sys min-h-[92px] text-[15px] leading-7 text-cyan" aria-live="polite">
            {LINES.slice(0, line).map((text, i) => (
              <div key={text} className="flex justify-between gap-4">
                <span>{text}</span>
                <span className={i === line - 1 && !welcome ? "blink" : "text-ice"}>
                  {i === line - 1 && !welcome ? "_" : "OK"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-[3px]" role="progressbar" aria-valuemin={0} aria-valuemax={BLOCKS} aria-valuenow={filled}>
            {Array.from({ length: BLOCKS }, (_, i) => (
              <span
                key={i}
                className="h-3 flex-1 transition-colors duration-100"
                style={{
                  background: i < filled ? "var(--color-cyan)" : "rgba(60,130,220,.16)",
                  boxShadow: i < filled ? "0 0 8px rgba(111,220,255,.7)" : "none",
                }}
              />
            ))}
          </div>

          <div className="mt-9 h-10 text-center">
            <AnimatePresence>
              {welcome && (
                <motion.p
                  className="t-title text-[17px] sm:text-[21px]"
                  initial={{ opacity: 0, letterSpacing: "0.4em" }}
                  animate={{ opacity: 1, letterSpacing: "0.08em" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  WELCOME TO RISKI.EXE
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="t-sys absolute inset-x-0 bottom-[max(24px,env(safe-area-inset-bottom))] flex items-center justify-between px-6 text-[13px] text-haze">
          <span className="blink">
            <span className="only-mouse">PRESS ANY KEY TO SKIP</span>
            <span className="only-touch">TAP TO SKIP</span>
          </span>
          <button
            type="button"
            className="btn"
            data-on={sfx}
            aria-pressed={sfx}
            onClick={(e) => {
              e.stopPropagation();
              toggleSfx();
            }}
          >
            SOUND {sfx ? "ON" : "OFF"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
