"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ALL_SAVES } from "@/data/saves";
import { useSystem } from "@/lib/store";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--hairline)] py-1.5 last:border-b-0">
      <dt className="text-haze">{label}</dt>
      <dd className="text-snow">{value}</dd>
    </div>
  );
}

/** Details of the highlighted save. A side window on desktop, a bottom sheet on phones. */
export function FilePanel() {
  const selected = useSystem((s) => s.selected);
  const open = useSystem((s) => s.open);
  const step = useSystem((s) => s.step);
  const save = ALL_SAVES[selected];
  const secret = save.icon === "glitch";

  return (
    <motion.aside
      aria-live="polite"
      className="panel fixed z-20 p-4 max-[899px]:inset-x-3 max-[899px]:bottom-[max(12px,env(safe-area-inset-bottom))] min-[900px]:right-6 min-[900px]:top-1/2 min-[900px]:w-[300px] min-[900px]:-translate-y-[46%] min-[900px]:p-6 min-[1200px]:w-[370px]"
      initial={{ opacity: 0, x: 26 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 26 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={save.index}
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -7 }}
          transition={{ duration: 0.13 }}
        >
          <p className="t-sys text-[13px] text-cyan">SAVE SLOT {save.slot}</p>
          <h2 className="t-title mt-1.5 text-[17px] min-[1200px]:text-[22px]">{save.file}</h2>
          <p className="mt-1 text-[15px] font-medium text-ice">{save.title}</p>

          <dl className="t-sys mt-3 hidden text-[13px] min-[900px]:mt-5 min-[420px]:block">
            <Row label="SAVED" value={save.saved} />
            <Row label="SIZE" value={save.size} />
          </dl>

          <p className="mt-3 min-h-[3em] text-[14px] leading-relaxed text-ice/90 min-[900px]:mt-4 min-[900px]:min-h-[4.9em]">
            {save.blurb}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-3 flex gap-2 min-[900px]:mt-4">
        <button type="button" className="btn min-[900px]:!hidden" aria-label="Previous save" onClick={() => step(-1)}>
          ◄
        </button>
        <button type="button" className="btn flex-1" onClick={() => open()}>
          {secret ? "LOAD ???" : "LOAD DATA"}
        </button>
        <button type="button" className="btn min-[900px]:!hidden" aria-label="Next save" onClick={() => step(1)}>
          ►
        </button>
      </div>
    </motion.aside>
  );
}
