"use client";

import { motion } from "framer-motion";
import { ALL_SAVES } from "@/data/saves";
import { slotCount, useSystem } from "@/lib/store";

/** Slot menu for devices that cannot render 3D. Every save stays reachable. */
export function Fallback() {
  const selected = useSystem((s) => s.selected);
  const secret = useSystem((s) => s.secret);
  const select = useSystem((s) => s.select);
  const open = useSystem((s) => s.open);

  return (
    <motion.nav
      aria-label="Save data"
      className="fixed inset-x-3 top-[112px] z-20 min-[900px]:left-6 min-[900px]:right-[350px] min-[900px]:top-[130px] min-[1200px]:right-[420px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="t-sys mb-3 text-[12px] text-haze">3D RENDERER UNAVAILABLE ON THIS DEVICE. SLOT MENU LOADED.</p>
      <ul className="grid grid-cols-2 gap-2 min-[900px]:grid-cols-3">
        {ALL_SAVES.slice(0, slotCount(secret)).map((save) => (
          <li key={save.hash}>
            <button
              type="button"
              data-on={selected === save.index}
              className="btn !h-full w-full !flex-col !items-start !gap-0.5 !py-2 text-left"
              onMouseEnter={() => select(save.index, "hover")}
              onFocus={() => select(save.index, "tap")}
              onClick={() => open(save.index)}
            >
              <span className="text-[11px] text-cyan">SLOT {save.slot}</span>
              <span className="text-[13px] text-snow">{save.file}</span>
            </button>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
