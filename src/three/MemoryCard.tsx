"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useSystem } from "@/lib/store";
import { boardTexture, labelTexture } from "./textures";

const damp = THREE.MathUtils.damp;
const W = 1.72;
const H = 2.2;
const D = 0.3;
const CLICKS_FOR_SECRET = 7;

function shellShape() {
  const cut = 0.26;
  const s = new THREE.Shape();
  s.moveTo(-W / 2, -H / 2);
  s.lineTo(W / 2, -H / 2);
  s.lineTo(W / 2, H / 2 - cut);
  s.lineTo(W / 2 - cut, H / 2);
  s.lineTo(-W / 2, H / 2);
  s.closePath();
  return s;
}

/** The floating card in the center of the orbit. Drag spins it, clicks do something else. */
export function MemoryCard() {
  const root = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);
  const led = useRef<THREE.MeshStandardMaterial>(null);
  const drag = useRef({ active: false, moved: 0, x: 0, y: 0 });
  const motion = useRef({ yaw: -0.42, pitch: 0.1, velocity: 0.1, size: 0 });
  const clicks = useRef(0);

  const shell = useMemo(
    () =>
      new THREE.ExtrudeGeometry(shellShape(), {
        depth: D,
        bevelEnabled: true,
        bevelSize: 0.035,
        bevelThickness: 0.035,
        bevelSegments: 2,
      }).translate(0, 0, -D / 2),
    [],
  );
  const board = useMemo(() => boardTexture(), []);
  const [label, setLabel] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([document.fonts.load("34px Michroma"), document.fonts.load("26px 'Share Tech Mono'")]).then(() => {
      if (alive) setLabel(labelTexture());
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.active) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      d.moved += Math.abs(dx) + Math.abs(dy);
      motion.current.yaw += dx * 0.012;
      motion.current.pitch = THREE.MathUtils.clamp(motion.current.pitch + dy * 0.008, -0.8, 0.8);
      motion.current.velocity = dx * 0.5;
    };
    const up = () => {
      const d = drag.current;
      if (!d.active) return;
      d.active = false;
      if (d.moved > 6) return;

      motion.current.velocity += 9;
      clicks.current += 1;
      const { secret, notify, unlockSecret } = useSystem.getState();
      if (clicks.current >= CLICKS_FOR_SECRET) {
        clicks.current = 0;
        if (secret) notify("NOTHING ELSE HIDDEN HERE. PROBABLY.");
        else unlockSecret();
      } else if (clicks.current === 1) {
        notify(secret ? "MEMORY CARD 1: 7/6 DATA AVAILABLE" : "MEMORY CARD 1: 6/6 DATA AVAILABLE");
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const press = (e: ThreeEvent<PointerEvent>) => {
    if (useSystem.getState().phase !== "browser") return;
    e.stopPropagation();
    drag.current = { active: true, moved: 0, x: e.clientX, y: e.clientY };
  };

  useFrame((state, dt) => {
    const g = root.current;
    const s = spinner.current;
    if (!g || !s) return;
    const { phase } = useSystem.getState();
    const m = motion.current;
    const t = state.clock.elapsedTime;

    m.size = damp(m.size, phase === "browser" ? 1 : 0, phase === "browser" ? 4 : 7, dt);
    g.scale.setScalar(Math.max(m.size, 0.0001));
    g.visible = m.size > 0.002;
    g.position.y = 0.06 + Math.sin(t * 0.8) * 0.07;

    if (!drag.current.active) {
      m.yaw += dt * m.velocity;
      m.velocity = damp(m.velocity, 0, 1.8, dt);
      // Swing back toward the resting angle once it stops spinning.
      const rest = -0.42 + Math.sin(t * 0.35) * 0.2;
      const turns = Math.round((m.yaw - rest) / (Math.PI * 2)) * Math.PI * 2;
      if (Math.abs(m.velocity) < 0.8) m.yaw = damp(m.yaw, rest + turns, 1.4, dt);
      m.pitch = damp(m.pitch, 0.1, 1.5, dt);
    }
    s.rotation.set(m.pitch, m.yaw, 0.05);

    if (led.current) {
      const busy = phase !== "browser";
      led.current.emissiveIntensity = busy ? (Math.sin(t * 22) > 0 ? 5 : 0.4) : 1.5 + Math.sin(t * 2) * 1.2;
    }
  });

  const pins = useMemo(() => Array.from({ length: 11 }, (_, i) => -0.66 + i * 0.132), []);
  const hover = (hot: boolean) => () => useSystem.getState().setHot(hot);

  return (
    <group ref={root}>
      <group ref={spinner}>
        <mesh
          geometry={shell}
          onPointerDown={press}
          onPointerOver={hover(true)}
          onPointerOut={hover(false)}
          renderOrder={3}
        >
          <meshPhysicalMaterial
            color="#2f8fe6"
            transparent
            opacity={0.5}
            roughness={0.12}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.15}
            envMapIntensity={1.6}
            depthWrite={false}
          />
        </mesh>

        <mesh renderOrder={1}>
          <boxGeometry args={[W - 0.2, H - 0.26, 0.06]} />
          <meshStandardMaterial map={board} roughness={0.5} metalness={0.3} emissiveMap={board} emissive="#3aa8ff" emissiveIntensity={0.28} />
        </mesh>

        {label && (
          <mesh position={[0, 0.2, D / 2 + 0.04]} renderOrder={4}>
            <planeGeometry args={[1.42, 1.065]} />
            <meshStandardMaterial map={label} roughness={0.4} emissiveMap={label} emissive="#ffffff" emissiveIntensity={0.16} />
          </mesh>
        )}

        {/* Grip ridges under the label. */}
        {[-0.56, -0.66, -0.76].map((y) => (
          <mesh key={y} position={[0, y, D / 2 + 0.04]} renderOrder={4}>
            <boxGeometry args={[1.42, 0.035, 0.02]} />
            <meshStandardMaterial color="#9fd8ff" metalness={0.5} roughness={0.3} />
          </mesh>
        ))}

        {pins.map((x) => (
          <mesh key={x} position={[x, -H / 2 + 0.05, D / 2 + 0.012]} renderOrder={4}>
            <boxGeometry args={[0.085, 0.16, 0.02]} />
            <meshStandardMaterial color="#f0c860" metalness={0.9} roughness={0.25} />
          </mesh>
        ))}

        <mesh position={[-0.68, H / 2 - 0.13, D / 2 + 0.04]} renderOrder={4}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial ref={led} color="#6fdcff" emissive="#6fdcff" emissiveIntensity={2} />
        </mesh>
      </group>
    </group>
  );
}
