"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useSystem } from "@/lib/store";
import { Boot } from "./Boot";
import { BrowserChrome, OptionsWindow } from "./Chrome";
import { Cursor } from "./Cursor";
import { Fallback } from "./Fallback";
import { Notices } from "./Notices";
import { SaveLoader } from "./SaveLoader";
import { SectionShell } from "./SectionShell";
import { useControls, useHashRoute } from "./useControls";

const Stage = dynamic(() => import("@/three/Stage"), { ssr: false });

export function Console() {
  const phase = useSystem((s) => s.phase);
  useControls();
  useHashRoute();

  const no3d = useSystem((s) => s.no3d);
  const browsing = phase === "browser";

  return (
    <>
      <Stage />
      {no3d && <div className="fixed inset-0 bg-gradient-to-br from-[#b4b3af] via-[#85847f] to-[#14170f]" />}
      <AnimatePresence>
        {no3d && browsing && <Fallback key="menu" />}
        {browsing && <BrowserChrome key="chrome" />}
        {phase === "loading" && <SaveLoader key="loader" />}
        {(phase === "section" || phase === "switching") && <SectionShell key="section" />}
      </AnimatePresence>
      <OptionsWindow />
      <Notices />
      <Boot />
      <div className="crt" aria-hidden />
      <Cursor />
    </>
  );
}
