"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ALL_SAVES, type SaveSlot } from "@/data/saves";
import { slotCount, useSystem } from "@/lib/store";
import { SaveIcon } from "./icons";
import { fx, gridCell, useStage, type Stage } from "./rig";
import { glowTexture } from "./textures";

const damp = THREE.MathUtils.damp;
const TAU = Math.PI * 2;

const point = new THREE.Vector3();

function Slot({ save, stage }: { save: SaveSlot; stage: Stage }) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Sprite>(null);
  const active = useRef(0);
  const size = useRef(0);
  const started = useRef(false);
  const pointerKind = useRef("mouse");
  const haloTexture = useMemo(() => glowTexture(), []);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const { phase, selected, openId, secret } = useSystem.getState();
    const n = slotCount(secret);
    const t = state.clock.elapsedTime;
    const open = openId === save.index;
    const picked = selected === save.index;
    const exists = save.index < n;

    const cell = gridCell(save.index, n, stage, point);
    const browsing = phase === "browser" || phase === "closing";
    let targetSize = 0;

    if (exists && browsing) {
      targetSize = fx.reveal > 0.2 + save.index * 0.07 ? cell * (picked ? 1.16 : 1) : 0;
      point.y += picked ? Math.sin(t * 2.4) * 0.05 : 0;
    } else if (open && (phase === "opening" || phase === "loading")) {
      targetSize = cell * 1.16;
    } else if (open) {
      point.set(stage.corner[0], stage.corner[1], 0);
      targetSize = (stage.cornerPx * stage.unit) / 2;
    }

    if (!started.current) {
      g.position.copy(point);
      started.current = true;
    }
    const speed = browsing ? 9 : 4.6;
    g.position.x = damp(g.position.x, point.x, speed, dt);
    g.position.y = damp(g.position.y, point.y, speed, dt);
    g.position.z = damp(g.position.z, point.z, speed, dt);

    size.current = damp(size.current, targetSize, 9, dt);
    g.scale.setScalar(Math.max(size.current, 0.0001));
    g.visible = size.current > 0.004;

    const lit = (picked && browsing) || open;
    active.current = damp(active.current, lit ? 1 : 0, 7, dt);

    if (spin.current) {
      const s = spin.current;
      if (lit) {
        s.rotation.y += dt * 1.15;
      } else {
        // Settle back to facing the viewer with a slow sway, as idle save icons do.
        const home = Math.round(s.rotation.y / TAU) * TAU + Math.sin(t * 0.6 + save.index * 1.7) * 0.42 - 0.2;
        s.rotation.y = damp(s.rotation.y, home, 3, dt);
      }
    }
    if (halo.current) {
      const pulse = 0.82 + Math.sin(t * 3.2) * 0.1;
      halo.current.material.opacity = active.current * pulse * (browsing ? 1 : 0.4);
      halo.current.scale.setScalar(3.3 + active.current * 0.7);
    }
    if (open) {
      fx.focus.copy(g.position).add(state.scene.userData.origin as THREE.Vector3);
      fx.focusSize = size.current;
    }
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const { select, setHot, phase } = useSystem.getState();
    if (phase !== "browser") return;
    setHot(true);
    if (e.pointerType === "mouse") select(save.index);
  };

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const { open, select, selected, phase } = useSystem.getState();
    if (phase !== "browser") return;
    if (pointerKind.current === "mouse" || selected === save.index) open(save.index);
    else select(save.index);
  };

  return (
    <group ref={root} scale={0.0001}>
      <sprite ref={halo} position={[0, 0, -1.3]}>
        <spriteMaterial map={haloTexture} color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <group ref={spin}>
        <SaveIcon kind={save.icon} active={active} />
      </group>
      <mesh
        visible={false}
        onPointerOver={over}
        onPointerOut={() => useSystem.getState().setHot(false)}
        onPointerDown={(e) => {
          pointerKind.current = e.pointerType;
        }}
        onClick={click}
      >
        <sphereGeometry args={[1.1, 10, 8]} />
      </mesh>
    </group>
  );
}

export function SaveGrid() {
  const stage = useStage();
  return ALL_SAVES.map((save) => <Slot key={save.index} save={save} stage={stage} />);
}
