"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useSystem } from "@/lib/store";
import { Boot } from "./Boot";
import { Cursor } from "./Cursor";
import { FilePanel } from "./FilePanel";
import { ControlBar, Hud } from "./Hud";
import { Notices } from "./Notices";
import { SaveLoader } from "./SaveLoader";
import { useControls, useHashRoute } from "./useControls";

const Stage = dynamic(() => import("@/three/Stage"), { ssr: false });

export function Console() {
  const phase = useSystem((s) => s.phase);
  useControls();
  useHashRoute();

  const browsing = phase === "browser";

  return (
    <>
      <Stage />
      <AnimatePresence>
        {browsing && <Hud key="hud" />}
        {browsing && <FilePanel key="file" />}
        {browsing && <ControlBar key="bar" />}
        {phase === "loading" && <SaveLoader key="loader" />}
      </AnimatePresence>
      <Notices />
      <Boot />
      <div className="crt" aria-hidden />
      <Cursor />
    </>
  );
}
