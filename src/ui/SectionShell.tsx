"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { ALL_SAVES, type IconKind } from "@/data/saves";
import { slotCount, useSystem } from "@/lib/store";
import { Contact } from "@/sections/Contact";
import { DevRoom } from "@/sections/DevRoom";
import { Journey } from "@/sections/Journey";
import { Profile } from "@/sections/Profile";
import { Projects } from "@/sections/Projects";
import { Stats } from "@/sections/Stats";
import { Trophies } from "@/sections/Trophies";
import { SoundToggles } from "./Hud";

const CONTENT: Record<IconKind, ReactNode> = {
  character: <Profile />,
  laptop: <Projects />,
  rocket: <Journey />,
  trophy: <Trophies />,
  cube: <Stats />,
  crystal: <Contact />,
  glitch: <DevRoom />,
};

/** Frame shared by every open save: header, scrolling content, and console navigation. */
export function SectionShell() {
  const openId = useSystem((s) => s.openId);
  const phase = useSystem((s) => s.phase);
  const secret = useSystem((s) => s.secret);
  const back = useSystem((s) => s.back);
  const shift = useSystem((s) => s.shift);
  const heading = useRef<HTMLHeadingElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    body.current?.scrollTo(0, 0);
  }, [openId]);

  if (openId === null) return null;
  const save = ALL_SAVES[openId];
  const n = slotCount(secret);
  const previous = ALL_SAVES[(openId - 1 + n) % n];
  const next = ALL_SAVES[(openId + 1) % n];
  const fitted = save.icon === "laptop";

  return (
    <motion.main
      className="fixed inset-0 z-30 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--hairline)] bg-gradient-to-b from-[rgba(2,10,40,.62)] to-transparent px-4 pb-3 pt-[max(14px,env(safe-area-inset-top))] sm:px-8 sm:pb-4 sm:pt-6">
        <div className="min-w-0 pr-[92px] sm:pr-[170px]">
          <p className="t-sys text-[12px] text-cyan sm:text-[14px]">
            MEMORY CARD 1 / SAVE SLOT {save.slot}
          </p>
          <h1 key={save.file} ref={heading} tabIndex={-1} className="t-title glitch mt-1 truncate text-[19px] outline-none sm:text-[32px]">
            {save.file}
          </h1>
          <p className="mt-0.5 text-[14px] font-medium text-ice sm:text-[16px]">{save.title}</p>
        </div>
        <div className="absolute right-[190px] top-7 hidden lg:block">
          <SoundToggles />
        </div>
      </header>

      <div ref={body} className={`scroll-area min-h-0 flex-1 overflow-y-auto overscroll-contain ${fitted ? "lg:overflow-hidden" : ""}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={save.index}
            className={`mx-auto w-full max-w-[1240px] px-3 py-4 sm:px-8 sm:py-6 ${fitted ? "lg:h-full" : ""}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24 }}
          >
            {CONTENT[save.icon]}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav
        aria-label="Save navigation"
        className="flex shrink-0 items-stretch justify-between gap-2 border-t border-[var(--hairline)] bg-gradient-to-t from-[rgba(2,10,40,.72)] to-transparent px-3 py-2.5 pb-[max(10px,env(safe-area-inset-bottom))] sm:px-8"
      >
        <button type="button" className="btn min-w-0 flex-1 !justify-start sm:max-w-[300px]" onClick={() => shift(-1)}>
          <span aria-hidden>◄</span>
          <span className="sr-only">Previous: </span>
          <span className="hidden truncate sm:inline">{previous.file}</span>
          <span className="sm:hidden">PREV</span>
        </button>
        <button type="button" className="btn shrink-0" onClick={back}>
          <span className="sm:hidden">BROWSER</span>
          <span className="hidden sm:inline">RETURN TO BROWSER</span>
          <span className="keycap only-mouse">ESC</span>
        </button>
        <button type="button" className="btn min-w-0 flex-1 !justify-end sm:max-w-[300px]" onClick={() => shift(1)}>
          <span className="sr-only">Next: </span>
          <span className="hidden truncate sm:inline">{next.file}</span>
          <span className="sm:hidden">NEXT</span>
          <span aria-hidden>►</span>
        </button>
      </nav>

      <AnimatePresence>
        {phase === "switching" && (
          <motion.div
            className="absolute inset-0 z-10 grid place-items-center bg-[rgba(4,20,70,.72)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <p className="t-sys text-[15px] text-cyan">
              LOADING SAVE DATA<span className="blink">...</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
