import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";

export const FOV = 35;

/**
 * Values shared between GSAP timelines and the render loop.
 * They live outside React because they change every frame.
 */
export const fx = {
  /** 0 calm, 1 full speed through the particle field. */
  warp: 0,
  /** Seconds since the browser appeared, for the staggered icon pop-in. */
  reveal: 0,
  /** World position of the save being opened, written by the ring. */
  focus: new THREE.Vector3(),
};

export type Stage = {
  dist: number;
  worldW: number;
  worldH: number;
  /** Where the ring sits, so it stays clear of the file panel. */
  ox: number;
  oy: number;
  rx: number;
  rz: number;
  ry: number;
  portrait: boolean;
  /** Corner of the screen a save's icon flies to while its section is open. */
  hero: [number, number];
  heroScale: number;
};

export function useStage(): Stage {
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);

  return useMemo(() => {
    const aspect = width / height;
    const portrait = width < 900 && aspect < 1.1;
    const panel = portrait ? 0 : Math.min(0.42, (width < 1200 ? 330 : 410) / width);
    const availW = 1 - panel;
    const availH = portrait ? 0.58 : 0.84;

    const rx = portrait ? 2.75 : 3.6;
    const rz = 3;
    const ry = portrait ? 2.4 : 2.05;

    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const distForW = (rx + 1) / (tan * aspect * availW);
    const distForH = (ry + 1.2) / (tan * availH);
    const dist = Math.max(11, distForW, distForH) + rz * 0.6;

    const worldH = 2 * dist * tan;
    const worldW = worldH * aspect;
    const ox = -(panel / 2) * worldW;
    const oy = portrait ? ((1 - availH) / 2) * worldH - worldH * 0.035 : 0;

    // Sized in pixels, so the icon fits the section header on any screen.
    const unitsPerPx = worldH / height;
    const heroPx = width < 640 ? 62 : 118;
    const heroRight = width < 640 ? 52 : 92;
    const heroTop = width < 640 ? 54 : 72;
    const hero: [number, number] = [
      worldW / 2 - heroRight * unitsPerPx - ox,
      worldH / 2 - heroTop * unitsPerPx - oy,
    ];
    const heroScale = (heroPx * unitsPerPx) / 2;

    return { dist, worldW, worldH, ox, oy, rx, rz, ry, portrait, hero, heroScale };
  }, [width, height]);
}

/** Point on the tilted orbit. Angle 0 is the front of the ring, closest to the camera. */
export function ringPoint(angle: number, stage: Stage, out: THREE.Vector3) {
  return out.set(Math.sin(angle) * stage.rx, -Math.cos(angle) * stage.ry, Math.cos(angle) * stage.rz);
}
