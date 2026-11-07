"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ALL_SAVES, type SaveSlot } from "@/data/saves";
import { slotCount, useSystem } from "@/lib/store";
import { SaveIcon } from "./icons";
import { fx, ringPoint, useStage, type Stage } from "./rig";
import { glowTexture } from "./textures";

const damp = THREE.MathUtils.damp;
const TAU = Math.PI * 2;

const point = new THREE.Vector3();

function Slot({ save, ring, stage }: { save: SaveSlot; ring: React.RefObject<number>; stage: Stage }) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Sprite>(null);
  const marker = useRef<THREE.Mesh>(null);
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

    ringPoint(((save.index - ring.current) * TAU) / n, stage, point);
    const browsing = phase === "browser" || phase === "closing";
    let targetSize = 0;

    if (exists && browsing) {
      targetSize = fx.reveal > 0.35 + save.index * 0.09 ? (picked ? 1.36 : 0.94) : 0;
      point.y += picked ? 0.2 : Math.sin(t * 1.1 + save.index) * 0.05;
    } else if (open && (phase === "opening" || phase === "loading")) {
      targetSize = 1.36;
    } else if (open) {
      point.set(stage.hero[0], stage.hero[1], 0);
      targetSize = stage.heroScale;
    }

    if (!started.current) {
      g.position.copy(point);
      started.current = true;
    }
    const speed = browsing ? 8 : 4.6;
    g.position.x = damp(g.position.x, point.x, speed, dt);
    g.position.y = damp(g.position.y, point.y, speed, dt);
    g.position.z = damp(g.position.z, point.z, speed, dt);

    size.current = damp(size.current, targetSize, 9, dt);
    g.scale.setScalar(Math.max(size.current, 0.0001));
    g.visible = size.current > 0.004;

    const lit = (picked && browsing) || open;
    active.current = damp(active.current, lit ? 1 : 0, 7, dt);

    if (spin.current) {
      spin.current.rotation.y += dt * (0.42 + active.current * 0.75);
      spin.current.rotation.z = Math.sin(t * 2.2 + save.index) * 0.05 * active.current;
    }
    if (halo.current) {
      halo.current.material.opacity = 0.14 + active.current * (0.5 + Math.sin(t * 3.2) * 0.07);
      halo.current.scale.setScalar(2.7 + active.current * 1.3);
    }
    if (marker.current) {
      marker.current.rotation.z -= dt * 0.9;
      (marker.current.material as THREE.MeshBasicMaterial).opacity = active.current * (browsing ? 0.8 : 0);
    }
    if (open) fx.focus.copy(g.position).add(state.scene.userData.origin as THREE.Vector3);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const { select, setHot, phase } = useSystem.getState();
    if (phase !== "browser") return;
    setHot(true);
    if (e.pointerType === "mouse") select(save.index, "hover");
  };

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const { open, select, selected, phase } = useSystem.getState();
    if (phase !== "browser") return;
    if (pointerKind.current === "mouse" || selected === save.index) open(save.index);
    else select(save.index, "tap");
  };

  return (
    <group ref={root} scale={0.0001}>
      <sprite ref={halo} renderOrder={-1}>
        <spriteMaterial
          map={haloTexture}
          color="#59c8ff"
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
        />
      </sprite>
      <mesh ref={marker} position={[0, -1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.8, 6]} />
        <meshBasicMaterial color="#9fe9ff" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
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
        <sphereGeometry args={[1.02, 10, 8]} />
      </mesh>
    </group>
  );
}

function Orbit({ stage }: { stage: Stage }) {
  const line = useRef<THREE.LineLoop>(null);
  const geometry = useMemo(() => {
    const out = new THREE.Vector3();
    const points = Array.from({ length: 96 }, (_, i) => ringPoint((i / 96) * TAU, stage, out).clone());
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [stage]);

  useFrame((_, dt) => {
    const material = line.current?.material as THREE.LineBasicMaterial | undefined;
    if (!material) return;
    const { phase } = useSystem.getState();
    const show = phase === "browser" && fx.reveal > 0.3;
    material.opacity = damp(material.opacity, show ? 0.34 : 0, 6, dt);
  });

  return (
    <lineLoop ref={line} geometry={geometry}>
      <lineBasicMaterial color="#8fe4ff" transparent opacity={0} depthWrite={false} />
    </lineLoop>
  );
}

export function SaveRing() {
  const stage = useStage();
  const ring = useRef(0);

  useFrame((_, dt) => {
    ring.current = damp(ring.current, useSystem.getState().ringStep, 5.5, dt);
  });

  return (
    <>
      <Orbit stage={stage} />
      {ALL_SAVES.map((save) => (
        <Slot key={save.index} save={save} ring={ring} stage={stage} />
      ))}
    </>
  );
}
