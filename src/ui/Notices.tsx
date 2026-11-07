"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSystem } from "@/lib/store";

/** System messages that slide down from the top edge. */
export function Notices() {
  const notices = useSystem((s) => s.notices);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[104px] z-40 flex flex-col items-center gap-2 px-4 sm:top-6" role="status">
      <AnimatePresence>
        {notices.map((n) => (
          <motion.p
            key={n.id}
            layout
            className="panel t-sys px-4 py-2 text-[13px] text-snow"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
          >
            <span className="mr-2 text-cyan">SYSTEM</span>
            {n.text}
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  );
}
