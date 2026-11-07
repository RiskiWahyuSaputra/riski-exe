"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CERTIFICATES, ISSUERS } from "@/data/certificates";
import { Label, Panel } from "./shared";

export function Trophies() {
  const [issuer, setIssuer] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = CERTIFICATES.filter((c) => issuer === "All" || c.issuer === issuer);
  const index = list.findIndex((c) => c.id === openId);
  const current = index >= 0 ? list[index] : null;

  useEffect(() => {
    if (openId === null) return;
    const move = (dir: number) => {
      const at = list.findIndex((c) => c.id === openId);
      setOpenId(list[(at + dir + list.length) % list.length].id);
    };
    // Capture phase: while the viewer is up, these keys belong to it, not to the section.
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
      else if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "ArrowRight") move(1);
      else return;
      e.stopPropagation();
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [openId, list]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by issuer">
        {ISSUERS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={issuer === name}
            data-on={issuer === name}
            className="btn !min-h-[36px] !px-3 !text-[12px] uppercase"
            onClick={() => setIssuer(name)}
          >
            {name}
          </button>
        ))}
        <span className="t-sys ml-auto text-[13px] text-cyan">
          {CERTIFICATES.length}/{CERTIFICATES.length} UNLOCKED
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {list.map((cert) => (
          <li key={cert.id}>
            <button
              type="button"
              onClick={() => setOpenId(cert.id)}
              className="panel group block h-full w-full p-2 text-left transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(111,220,255,.45)]"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-abyss">
                <Image
                  src={cert.image}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 280px, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </span>
              <span className="t-sys mt-2 block text-[11px] text-cyan">
                No.{cert.id} / {cert.issuer}
              </span>
              <span className="mt-0.5 line-clamp-2 block text-[13px] font-medium leading-snug text-snow">{cert.title}</span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-[rgba(2,8,30,.82)] p-3 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => setOpenId(null)}
          >
            <motion.div
              key={current.id}
              className="w-full max-w-[860px]"
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Panel>
                <div className="relative h-[52dvh] w-full">
                  <Image src={current.image} alt={`Certificate: ${current.title}`} fill sizes="860px" className="object-contain" />
                </div>
                <div className="mt-3">
                  <Label aside={`${index + 1} / ${list.length}`}>TROPHY No.{current.id}</Label>
                  <h2 className="text-[16px] font-bold text-snow">{current.title}</h2>
                  <p className="t-sys mt-1 text-[13px] text-ice">
                    {current.issuer} / {current.date}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="btn" aria-label="Previous certificate" onClick={() => setOpenId(list[(index - 1 + list.length) % list.length].id)}>
                    ◄
                  </button>
                  <button type="button" className="btn" aria-label="Next certificate" onClick={() => setOpenId(list[(index + 1) % list.length].id)}>
                    ►
                  </button>
                  <a className="btn" href={current.credentialUrl} target="_blank" rel="noreferrer">
                    VERIFY
                  </a>
                  <button type="button" className="btn ml-auto" onClick={() => setOpenId(null)}>
                    CLOSE
                  </button>
                </div>
              </Panel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
