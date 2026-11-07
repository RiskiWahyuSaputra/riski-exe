"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ALL_SAVES } from "@/data/saves";
import { useSystem } from "@/lib/store";

const BLOCKS = 18;

/** The save bar shown under the icon once the camera has arrived. */
export function SaveLoader() {
  const openId = useSystem((s) => s.openId);
  const [filled, setFilled] = useState(0);
  const save = openId === null ? null : ALL_SAVES[openId];

  useEffect(() => {
    const id = setInterval(() => setFilled((n) => Math.min(BLOCKS, n + 1)), 72);
    return () => clearInterval(id);
  }, []);

  if (!save) return null;

  return (
    <motion.div
      role="status"
      className="fixed inset-x-0 bottom-[12%] z-30 flex flex-col items-center px-6 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <p className="t-title text-[15px] sm:text-[20px]">{save.file}</p>
      <p className="t-sys mt-2 text-[14px] text-cyan">
        LOADING SAVE DATA<span className="blink">...</span>
      </p>
      <div className="mt-4 flex w-full max-w-[420px] gap-[3px]">
        {Array.from({ length: BLOCKS }, (_, i) => (
          <span
            key={i}
            className="h-3 flex-1"
            style={{
              background: i < filled ? "var(--color-cyan)" : "rgba(160,220,255,.16)",
              boxShadow: i < filled ? "0 0 8px rgba(111,220,255,.8)" : "none",
            }}
          />
        ))}
      </div>
      <p className="t-sys mt-3 text-[12px] text-haze">DO NOT REMOVE MEMORY CARD 1</p>
    </motion.div>
  );
}
