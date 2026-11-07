"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { ALL_SAVES, type IconKind } from "@/data/saves";
import { slotCount, useSystem } from "@/lib/store";
import { Certificates } from "@/sections/Certificates";
import { Contact } from "@/sections/Contact";
import { DevRoom } from "@/sections/DevRoom";
import { Journey } from "@/sections/Journey";
import { Profile } from "@/sections/Profile";
import { Projects } from "@/sections/Projects";
import { Stats } from "@/sections/Stats";
import { LegendButton } from "./Chrome";

const CONTENT: Record<IconKind, ReactNode> = {
  character: <Profile />,
  laptop: <Projects />,
  rocket: <Journey />,
  certificate: <Certificates />,
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
  const toggleOptions = useSystem((s) => s.toggleOptions);
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
      <header className="flex shrink-0 items-start justify-between gap-3 px-3 pb-2 pt-[max(12px,env(safe-area-inset-top))] sm:px-8 sm:pb-3 sm:pt-6 short:pb-1 short:pt-2">
        <div className="min-w-0 pl-[64px] sm:pl-[112px] short:pl-[72px]">
          <p className="t-title truncate text-[20px] leading-tight sm:text-[34px] short:text-[18px]">Memory Card 1</p>
          <p className="t-title text-[13px] sm:text-[20px]">Save Slot {save.slot}</p>
        </div>
        <div className="shrink-0 text-right">
          <h1 key={save.file} ref={heading} tabIndex={-1} className="t-yellow glitch text-[17px] leading-snug outline-none sm:text-[28px] short:text-[17px]">
            {save.file}
          </h1>
          <p className="t-yellow text-[14px] leading-snug sm:text-[22px] short:hidden">{save.title}</p>
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
        className="flex shrink-0 items-center justify-between gap-3 px-3 pb-[max(6px,env(safe-area-inset-bottom))] pt-1 text-[16px] sm:px-8 sm:pb-3 sm:text-[24px] short:text-[15px]"
      >
        <button type="button" className="legend min-w-0" onClick={() => shift(-1)}>
          <span aria-hidden>◄</span>
          <span className="sr-only">Previous: </span>
          <span className="hidden truncate sm:inline">{previous.file}</span>
          <span className="sm:hidden">Prev</span>
        </button>
        <div className="flex shrink-0 items-center gap-3 sm:gap-8">
          <LegendButton glyph="circle" onClick={back}>
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">RETURN TO BROWSER</span>
          </LegendButton>
          <LegendButton glyph="triangle" onClick={toggleOptions}>
            <span className="hidden sm:inline">Options</span>
            <span className="sr-only sm:hidden">Options</span>
          </LegendButton>
        </div>
        <button type="button" className="legend min-w-0" onClick={() => shift(1)}>
          <span className="sr-only">Next: </span>
          <span className="hidden truncate sm:inline">{next.file}</span>
          <span className="sm:hidden">Next</span>
          <span aria-hidden>►</span>
        </button>
      </nav>

      <AnimatePresence>
        {phase === "switching" && (
          <motion.div
            className="absolute inset-0 z-10 grid place-items-center bg-[rgba(0,0,0,.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <p className="t-title text-[18px]">
              Loading save data<span className="blink">...</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
