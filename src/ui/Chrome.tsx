"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { ALL_SAVES, SAVES } from "@/data/saves";
import { slotCount, useSystem } from "@/lib/store";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const pad = (n: number) => String(n).padStart(2, "0");

const CARD_KB = 8192;
const USED_KB = SAVES.reduce((sum, s) => sum + Number(s.size.replace(/\D/g, "")), 0);

/** Button shapes of the legend, drawn here rather than taken from any console's artwork. */
export function Glyph({ kind }: { kind: "cross" | "circle" | "triangle" }) {
  return (
    <svg viewBox="0 0 32 32" className="h-[1.2em] w-[1.2em] shrink-0" aria-hidden>
      {kind !== "triangle" && <circle cx="16" cy="16" r="14.5" fill="#26283a" stroke="#000" strokeWidth="2" />}
      {kind === "cross" && (
        <path d="M9.5 9.5l13 13m0-13l-13 13" stroke="#a4b0ff" strokeWidth="3.6" strokeLinecap="round" />
      )}
      {kind === "circle" && <circle cx="16" cy="16" r="7.8" fill="none" stroke="#ff8a8a" strokeWidth="3.6" />}
      {kind === "triangle" && (
        <path d="M16 5l12.5 21h-25z" fill="#16201e" stroke="#54e8b4" strokeWidth="3.6" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function LegendButton({
  glyph,
  onClick,
  children,
}: {
  glyph: "cross" | "circle" | "triangle";
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="legend" onClick={onClick}>
      <Glyph kind={glyph} />
      {children}
    </button>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time className="t-title block text-[14px] sm:text-[16px]" dateTime={now.toISOString()}>
      {now.getFullYear()}/{pad(now.getMonth() + 1)}/{pad(now.getDate())} {DAYS[now.getDay()]} {pad(now.getHours())}:
      {pad(now.getMinutes())}:{pad(now.getSeconds())}
    </time>
  );
}

/** Sound settings, opened from the triangle. */
export function OptionsWindow() {
  const options = useSystem((s) => s.options);
  const sfx = useSystem((s) => s.sfx);
  const ambient = useSystem((s) => s.ambient);
  const toggleSfx = useSystem((s) => s.toggleSfx);
  const toggleAmbient = useSystem((s) => s.toggleAmbient);

  return (
    <AnimatePresence>
      {options && (
        <motion.div
          className="panel fixed bottom-[76px] right-3 z-40 w-[240px] p-3 sm:right-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.14 }}
        >
          <p className="t-yellow mb-2 text-[16px]">Options</p>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn justify-between!" data-on={sfx} aria-pressed={sfx} onClick={toggleSfx}>
              Sound Effects <span>{sfx ? "ON" : "OFF"}</span>
            </button>
            <button type="button" className="btn justify-between!" data-on={ambient} aria-pressed={ambient} onClick={toggleAmbient}>
              Ambient Music <span>{ambient ? "ON" : "OFF"}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CardStatus() {
  const secret = useSystem((s) => s.secret);
  const found = slotCount(secret);

  return (
    <div className="min-w-0 pl-[64px] sm:pl-[112px] short:pl-[72px]">
      <h2 className="t-title whitespace-nowrap text-[20px] leading-tight sm:text-[34px] short:text-[18px]">Memory Card 1</h2>
      <p className="t-title whitespace-nowrap text-[14px] sm:text-[24px] short:text-[13px]">
        {(CARD_KB - USED_KB).toLocaleString("en-US")} KBytes Free
      </p>
      <p className="t-title mt-0.5 whitespace-nowrap text-[11px] sm:text-[14px] short:hidden">
        {found} SAVE DATA FOUND / {found}/6 DATA AVAILABLE
      </p>
    </div>
  );
}

/** Everything drawn over the save grid: status, title, details, and the legend. */
export function BrowserChrome() {
  const selected = useSystem((s) => s.selected);
  const open = useSystem((s) => s.open);
  const notify = useSystem((s) => s.notify);
  const options = useSystem((s) => s.options);
  const back = useSystem((s) => s.back);
  const toggleOptions = useSystem((s) => s.toggleOptions);
  const save = ALL_SAVES[selected];

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:px-8 sm:pt-7 short:pt-2">
        <CardStatus />
        <div className="hidden text-right sm:block" aria-live="polite">
          <p className="t-yellow text-[20px] leading-snug lg:text-[32px] short:text-[17px]">{save.file}</p>
          <p className="t-yellow text-[18px] leading-snug lg:text-[28px] short:text-[14px]">{save.title}</p>
        </div>
      </header>

      <footer className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-x-6 gap-y-1 px-3 pb-[max(10px,env(safe-area-inset-bottom))] sm:px-8 sm:pb-5">
        <div className="min-w-0 max-w-[560px] flex-1 basis-[300px]">
          <p className="t-yellow text-[17px] leading-snug sm:hidden">
            {save.file} / {save.title}
          </p>
          <p className="t-title text-[13px] sm:text-[16px] short:text-[12px]">
            SLOT {save.slot} / SAVED {save.saved} / {save.size}
          </p>
          <p className="t-title mt-0.5 min-h-[2.8em] text-[14px] leading-snug sm:text-[17px] short:hidden">{save.blurb}</p>
          <div className="hidden sm:block short:hidden">
            <Clock />
          </div>
        </div>
        <nav aria-label="Controls" className="pointer-events-auto ml-auto flex items-center gap-4 text-[20px] sm:gap-8 sm:text-[30px] short:text-[18px]">
          <LegendButton glyph="cross" onClick={() => open()}>
            Enter
          </LegendButton>
          <LegendButton
            glyph="circle"
            onClick={() => (options ? back() : notify("ALREADY AT THE TOP MENU"))}
          >
            Back
          </LegendButton>
          <LegendButton glyph="triangle" onClick={toggleOptions}>
            Options
          </LegendButton>
        </nav>
      </footer>
    </motion.div>
  );
}
