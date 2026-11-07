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
      className="panel fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-20 p-4 side:left-auto side:right-6 side:bottom-auto side:top-1/2 side:w-[300px] side:-translate-y-[46%] side:p-6 min-[1200px]:w-[370px] short:side:right-3 short:side:top-[92px] short:side:translate-y-0 short:side:p-3"
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
          <h2 className="t-title mt-1.5 text-[17px] min-[1200px]:text-[22px] short:text-[15px]">{save.file}</h2>
          <p className="mt-1 text-[15px] font-medium text-ice">{save.title}</p>

          <dl className="t-sys mt-3 hidden text-[13px] side:mt-5 side:block short:!hidden">
            <Row label="SAVED" value={save.saved} />
            <Row label="SIZE" value={save.size} />
          </dl>

          <p className="mt-3 min-h-[3em] text-[14px] leading-relaxed text-ice/90 side:mt-4 side:min-h-[4.9em] short:mt-1 short:min-h-0 short:text-[13px]">
            {save.blurb}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-3 flex gap-2 side:mt-4 short:mt-2">
        <button type="button" className="btn side:!hidden" aria-label="Previous save" onClick={() => step(-1)}>
          ◄
        </button>
        <button type="button" className="btn flex-1" onClick={() => open()}>
          {secret ? "LOAD ???" : "LOAD DATA"}
        </button>
        <button type="button" className="btn side:!hidden" aria-label="Next save" onClick={() => step(1)}>
          ►
        </button>
      </div>
    </motion.aside>
  );
}
