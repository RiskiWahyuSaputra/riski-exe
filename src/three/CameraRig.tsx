"use client";

import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSystem, type Phase } from "@/lib/store";
import { fx, useStage } from "./rig";

// Phase changes run on wall-clock timers, so tweens must not stretch on a slow frame.
gsap.ticker.lagSmoothing(0);

const damp = THREE.MathUtils.damp;
const IDLE_HEIGHT = 0.35;
const CLOSE_UP = 7;
/** Keeps the icon above the save bar during the close-up. */
const CLOSE_UP_DROP = -0.62;

/**
 * The camera is a mix of two poses: the wide browser view and a close-up of the
 * open save. GSAP only animates the mix, so the dive stays locked onto the icon
 * even while the ring is still turning.
 */
export function CameraRig({ children }: { children: React.ReactNode }) {
  const stage = useStage();
  const rig = useRef({ zoom: 0, intro: 1, px: 0, py: 0 });
  const origin = useMemo(() => new THREE.Vector3(), []);
  const eye = useMemo(() => new THREE.Vector3(), []);
  const near = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const r = rig.current;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const time = (s: number) => (calm ? 0.01 : s);

    const enter = (phase: Phase, previous: Phase) => {
      gsap.killTweensOf(r, "zoom");
      gsap.killTweensOf(fx, "warp");
      switch (phase) {
        case "browser":
          if (previous === "boot") {
            gsap.to(r, { intro: 0, duration: time(2.6), ease: "power3.out" });
            gsap.fromTo(fx, { warp: 1 }, { warp: 0, duration: time(2.2), ease: "power2.out" });
          }
          break;
        case "opening":
          gsap.to(r, { zoom: 1, duration: time(0.95), ease: "power3.inOut" });
          gsap.to(fx, { warp: 1, duration: time(0.7), ease: "power2.in" });
          break;
        case "loading":
          gsap.to(fx, { warp: 0.16, duration: time(0.6), ease: "power2.out" });
          break;
        case "section":
          gsap.to(r, { zoom: 0, duration: time(1), ease: "power3.inOut" });
          gsap.to(fx, { warp: 0, duration: time(0.8) });
          break;
        case "switching":
          gsap.fromTo(fx, { warp: 0.6 }, { warp: 0, duration: time(0.7), ease: "power2.out" });
          break;
        case "closing":
          gsap.fromTo(fx, { warp: 0.75 }, { warp: 0, duration: time(1), ease: "power2.out" });
          break;
      }
    };

    return useSystem.subscribe((state, prev) => {
      if (state.phase !== prev.phase) enter(state.phase, prev.phase);
    });
  }, []);

  useFrame((state, dt) => {
    const r = rig.current;
    const { phase } = useSystem.getState();
    if (phase !== "boot") fx.reveal += dt;

    const follow = phase === "browser" ? 1 : 0;
    r.px = damp(r.px, state.pointer.x * follow, 2.5, dt);
    r.py = damp(r.py, state.pointer.y * follow, 2.5, dt);

    eye.set(r.px * 0.55, IDLE_HEIGHT + r.py * 0.34 + r.intro * 7, stage.dist + r.intro * 30);
    near.set(fx.focus.x, fx.focus.y + 0.2, fx.focus.z + CLOSE_UP);
    state.camera.position.lerpVectors(eye, near, r.zoom);

    look.copy(fx.focus);
    look.y += CLOSE_UP_DROP;
    look.multiplyScalar(r.zoom);
    state.camera.lookAt(look);

    origin.set(stage.ox, stage.oy, 0);
    state.scene.userData.origin = origin;
  });

  return <group position={[stage.ox, stage.oy, 0]}>{children}</group>;
}
