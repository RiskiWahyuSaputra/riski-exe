"use client";

import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSystem, type Phase } from "@/lib/store";
import { fx, useStage } from "./rig";

// Phase changes run on wall-clock timers, so tweens must not stretch on a slow frame.
gsap.ticker.lagSmoothing(0);

const damp = THREE.MathUtils.damp;
const CLOSE_UP = 6.4;
/** Keeps the icon above the save bar during the close-up. */
const CLOSE_UP_DROP = 0.5;

// Scratch vectors, reused every frame.
const origin = new THREE.Vector3();
const eye = new THREE.Vector3();
const near = new THREE.Vector3();
const look = new THREE.Vector3();

/**
 * The camera is a mix of two poses: the flat browser view and a close-up of the
 * open save. GSAP only animates the mix, so the dive stays locked onto the icon.
 * During boot it drifts over the towers instead.
 */
export function CameraRig({ children }: { children: React.ReactNode }) {
  const stage = useStage();
  const rig = useRef({ zoom: 0, px: 0, py: 0 });

  useEffect(() => {
    const r = rig.current;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const time = (s: number) => (calm ? 0.01 : s);

    const enter = (phase: Phase) => {
      gsap.killTweensOf(r, "zoom");
      gsap.killTweensOf(fx, "warp");
      switch (phase) {
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

    // The 3D chunk can arrive after the boot has already been skipped.
    if (useSystem.getState().phase !== "boot") fx.world = 1;

    return useSystem.subscribe((state, prev) => {
      if (state.phase === prev.phase) return;
      if (prev.phase === "boot") fx.world = 1;
      enter(state.phase);
    });
  }, []);

  useFrame((state, dt) => {
    const r = rig.current;
    const { phase } = useSystem.getState();
    const t = state.clock.elapsedTime;

    if (phase === "boot") {
      state.camera.position.set(Math.sin(t * 0.13) * 13, 8.5 + Math.sin(t * 0.2) * 1.5, 25 - t * 0.5);
      state.camera.lookAt(0, 1.5, -8);
    } else {
      fx.reveal += dt;
      const follow = phase === "browser" ? 1 : 0;
      r.px = damp(r.px, state.pointer.x * follow, 2.5, dt);
      r.py = damp(r.py, state.pointer.y * follow, 2.5, dt);

      eye.set(r.px * 0.3, r.py * 0.2, stage.dist);
      near.set(fx.focus.x, fx.focus.y + 0.1, fx.focus.z + CLOSE_UP * fx.focusSize);
      state.camera.position.lerpVectors(eye, near, r.zoom);

      look.copy(fx.focus);
      look.y -= CLOSE_UP_DROP * fx.focusSize;
      look.multiplyScalar(r.zoom);
      state.camera.lookAt(look);
    }

    origin.set(0, stage.oy, 0);
    state.scene.userData.origin = origin;
  });

  return <group position={[0, stage.oy, 0]}>{children}</group>;
}
