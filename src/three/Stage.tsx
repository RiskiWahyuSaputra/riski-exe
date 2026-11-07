"use client";

import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Component, Suspense, useEffect, useState, type ReactNode } from "react";
import { useSystem } from "@/lib/store";
import { Atmosphere } from "./Atmosphere";
import { CameraRig } from "./CameraRig";
import { MemoryCard } from "./MemoryCard";
import { FOV } from "./rig";
import { SaveGrid } from "./SaveGrid";

/** A GPU failure mid-session falls back to the slot menu rather than a blank page. */
class Guard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useSystem.getState().setNo3d();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  if (new URLSearchParams(window.location.search).has("no3d")) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Stage() {
  const [supported] = useState(hasWebGL);
  useEffect(() => {
    if (!supported) useSystem.getState().setNo3d();
  }, [supported]);
  const [light] = useState(
    () => window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768,
  );
  const [maxDpr, setMaxDpr] = useState(light ? 1.25 : 1.5);

  if (!supported) return null;

  return (
    <Guard>
      <Canvas
        className="!fixed inset-0 touch-none"
        flat
        dpr={[1, maxDpr]}
        camera={{ fov: FOV, near: 0.1, far: 140, position: [0, 7, 40] }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <PerformanceMonitor onDecline={() => setMaxDpr(1)} />
        <ambientLight intensity={1} color="#ffffff" />
        <directionalLight position={[-4, 7, 8]} intensity={2.1} color="#ffffff" />
        <directionalLight position={[6, -2, -6]} intensity={0.9} color="#ffffff" />
        <Suspense fallback={null}>
          <Environment frames={1} resolution={64}>
            <Lightformer form="rect" intensity={5} color="#ffffff" position={[0, 6, 4]} scale={[12, 4, 1]} />
            <Lightformer form="rect" intensity={2.4} color="#d8d8d4" position={[-7, 0, 3]} rotation={[0, Math.PI / 2, 0]} scale={[8, 8, 1]} />
            <Lightformer form="rect" intensity={1.6} color="#c8c8c8" position={[7, -2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 6, 1]} />
          </Environment>
        </Suspense>
        <Atmosphere light={light} />
        <CameraRig>
          <MemoryCard />
          <SaveGrid />
        </CameraRig>
      </Canvas>
    </Guard>
  );
}
