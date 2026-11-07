"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSystem } from "@/lib/store";

const SEEN_KEY = "riski-exe-booted";
const STATUS = ["INITIALIZING MEMORY SYSTEM...", "LOADING USER PROFILE...", "ACCESSING MEMORY CARD..."];

type Scene = "dark" | "title" | "gap" | "towers" | "logo" | "out";

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

/**
 * Two beats, like a console starting up: a streak of light and a name on black,
 * then a slow flight over glass towers (the 3D scene behind this overlay)
 * before fading into the browser.
 */
export function Boot() {
  const finishBoot = useSystem((s) => s.finishBoot);
  const sfx = useSystem((s) => s.sfx);
  const toggleSfx = useSystem((s) => s.toggleSfx);

  const [scene, setScene] = useState<Scene>("dark");
  const [status, setStatus] = useState(0);
  const [lifted, setLifted] = useState(false);
  const [gone, setGone] = useState(false);
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const beat = alreadyBooted() ? 0.4 : 1;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let done = false;

    const end = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      setScene("out");
      rememberBoot();
      // The cover is opaque by now, so the world can switch unseen.
      setTimeout(() => {
        finishBoot();
        setLifted(true);
        setTimeout(() => setGone(true), 750);
      }, 420);
    };
    skip.current = end;

    const at = (ms: number, run: () => void) => timers.push(setTimeout(run, ms * beat));
    at(350, () => setScene("title"));
    at(3500, () => setScene("gap"));
    at(4100, () => setScene("towers"));
    at(4900, () => setStatus(1));
    at(5800, () => setStatus(2));
    at(6000, () => setScene("logo"));
    at(9000, end);

    const key = (e: KeyboardEvent) => {
      if (e.key !== "Tab") end();
    };
    window.addEventListener("keydown", key);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", key);
    };
  }, [finishBoot]);

  if (gone) return null;

  const covered = scene === "dark" || scene === "title" || scene === "gap" || scene === "out";
  const flying = scene === "towers" || scene === "logo";

  return (
    <div className="fixed inset-0 z-50" onClick={() => skip.current()}>
      <motion.div
        className="absolute inset-0 bg-black"
        animate={{ opacity: lifted ? 0 : covered ? 1 : 0 }}
        initial={{ opacity: 1 }}
        transition={{ duration: lifted ? 0.7 : scene === "out" ? 0.4 : 1.1, ease: "easeInOut" }}
      />

      <AnimatePresence>
        {scene === "title" && (
          <motion.div
            key="title"
            className="absolute inset-0 grid place-items-center overflow-hidden px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* A streak of light crosses the dark, then settles behind the name. */}
            <motion.span
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[3px] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#bfe0ff] blur-[1px]"
              style={{ boxShadow: "0 0 26px 8px rgba(70,140,255,.75), 0 0 120px 40px rgba(30,80,255,.3)" }}
              initial={{ x: "-120vw", scaleX: 0.3 }}
              animate={{ x: "-50%", scaleX: 1, opacity: [1, 1, 0.16] }}
              transition={{ duration: 1.7, ease: [0.2, 0.7, 0.2, 1] }}
            />
            <motion.p
              className="relative text-center text-[17px] font-medium tracking-[0.34em] text-white sm:text-[26px]"
              style={{ textShadow: "0 0 18px rgba(120,170,255,.8)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
            >
              RISKI WAHYU SAPUTRA
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scene === "logo" && (
          <motion.p
            key="logo"
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[34px] font-bold tracking-[0.12em] text-white sm:text-[64px]"
            style={{ textShadow: "0 0 30px rgba(110,170,255,.95), 0 0 80px rgba(50,110,255,.7)" }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3 }}
          >
            RISKI.EXE
          </motion.p>
        )}
      </AnimatePresence>

      {flying && (
        <p className="absolute inset-x-0 bottom-[12%] text-center text-[12px] tracking-[0.18em] text-white/60 sm:text-[13px]" aria-live="polite">
          {STATUS[status]}
        </p>
      )}

      {!lifted && (
        <div className="absolute inset-x-0 bottom-[max(18px,env(safe-area-inset-bottom))] flex items-center justify-between px-5 text-[12px] tracking-[0.1em] text-white/45">
          <span>
            <span className="only-mouse">PRESS ANY KEY TO SKIP</span>
            <span className="only-touch">TAP TO SKIP</span>
          </span>
          <button
            type="button"
            className="min-h-[44px] px-2 hover:text-white"
            aria-pressed={sfx}
            onClick={(e) => {
              e.stopPropagation();
              toggleSfx();
            }}
          >
            SOUND {sfx ? "ON" : "OFF"}
          </button>
        </div>
      )}
    </div>
  );
}
