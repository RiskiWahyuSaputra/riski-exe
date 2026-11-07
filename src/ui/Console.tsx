"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useSystem } from "@/lib/store";

const Stage = dynamic(() => import("@/three/Stage"), { ssr: false });

export function Console() {
  useEffect(() => {
    useSystem.getState().finishBoot();
  }, []);
  return <Stage />;
}
