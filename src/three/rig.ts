import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { gridCols } from "@/lib/grid";

export const FOV = 35;
const DIST = 14;

/**
 * Values shared between GSAP timelines and the render loop.
 * They live outside React because they change every frame.
 */
export const fx = {
  /** 0 calm, 1 full speed through the particle field. */
  warp: 0,
  /** Seconds since the browser appeared, for the staggered icon pop-in. */
  reveal: 0,
  /** 0 is the dark boot world, 1 the grey browser. */
  world: 0,
  /** World position and size of the save being opened, written by the grid. */
  focus: new THREE.Vector3(),
  focusSize: 1,
};

export type Stage = {
  dist: number;
  width: number;
  height: number;
  worldW: number;
  worldH: number;
  /** World units per CSS pixel on the z = 0 plane. */
  unit: number;
  /** Vertical offset of the grid, so it stays clear of the header and legend. */
  oy: number;
  regionW: number;
  regionH: number;
  /** Top-left corner spot shared by the memory card and an open save's icon. */
  corner: [number, number];
  cornerPx: number;
};

export function useStage(): Stage {
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);

  return useMemo(() => {
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const worldH = 2 * DIST * tan;
    const worldW = (worldH * width) / height;
    const unit = worldH / height;

    const portrait = width < height * 1.05;
    const short = height < 560;
    const top = short ? 74 : portrait ? 128 : 165;
    const bottom = short ? 64 : portrait ? 196 : 170;
    const oy = ((bottom - top) / 2) * unit;

    const compact = width < 640 || short;
    const cornerPx = compact ? 58 : 84;
    const cornerX = compact ? 42 : 76;
    const cornerY = compact ? 46 : 74;

    return {
      dist: DIST,
      width,
      height,
      worldW,
      worldH,
      unit,
      oy,
      regionW: (width - (portrait ? 20 : width * 0.16)) * unit,
      regionH: (height - top - bottom) * unit,
      corner: [-worldW / 2 + cornerX * unit, worldH / 2 - cornerY * unit - oy],
      cornerPx,
    };
  }, [width, height]);
}

/** Cell of the save grid: filled left to right, top to bottom, like a real card. */
export function gridCell(index: number, count: number, stage: Stage, out: THREE.Vector3) {
  const cols = gridCols(count, stage.width, stage.height);
  const rows = Math.ceil(count / cols);
  const ch = stage.regionH / rows;
  const cw = Math.min(stage.regionW / cols, ch * 1.75);
  const col = index % cols;
  const row = Math.floor(index / cols);
  out.set((col - (cols - 1) / 2) * cw, ((rows - 1) / 2 - row) * ch, 0);
  return Math.min(cw * 0.34, ch * 0.36, 0.84);
}
