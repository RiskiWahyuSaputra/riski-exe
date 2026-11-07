"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import type { IconKind } from "@/data/saves";
import { screenTexture } from "./textures";

/** 0 at rest, 1 while the slot is highlighted. Each icon animates off this. */
type Active = RefObject<number>;

type Flat = {
  color: string;
  metal?: number;
  rough?: number;
  glow?: string;
  power?: number;
};

/** Faceted shading is what gives these the look of an early-2000s save icon. */
function Flat({ color, metal = 0.08, rough = 0.5, glow, power = 1 }: Flat) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metal}
      roughness={rough}
      emissive={glow ?? "#000000"}
      emissiveIntensity={glow ? power : 0}
      flatShading
    />
  );
}

type PartProps = {
  children: ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
};

function Part({ children, ...props }: PartProps) {
  return <mesh {...props}>{children}</mesh>;
}

/* 01: a small developer with a headset */
function Character({ active }: { active: Active }) {
  const arm = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const a = active.current;
    if (arm.current) arm.current.rotation.z = 2.3 * a + 0.16 + Math.sin(t * 9) * 0.32 * a;
    if (body.current) body.current.position.y = Math.abs(Math.sin(t * 4.5)) * 0.07 * a;
  });

  return (
    <group ref={body} position={[0, -0.16, 0]} scale={0.98}>
      {[-0.17, 0.17].map((x) => (
        <group key={x} position={[x, -0.5, 0]}>
          <Part position={[0, 0.06, 0]}>
            <boxGeometry args={[0.2, 0.34, 0.22]} />
            <Flat color="#142a63" />
          </Part>
          <Part position={[0, -0.15, 0.05]}>
            <boxGeometry args={[0.23, 0.12, 0.34]} />
            <Flat color="#f2fbff" />
          </Part>
        </group>
      ))}
      <Part position={[0, -0.08, 0]} scale={[1, 1, 0.76]}>
        <cylinderGeometry args={[0.28, 0.42, 0.64, 6]} />
        <Flat color="#1f7fe0" />
      </Part>
      <Part position={[0, -0.14, 0.27]}>
        <boxGeometry args={[0.3, 0.14, 0.06]} />
        <Flat color="#125cb4" />
      </Part>
      <Part position={[-0.4, -0.1, 0]} rotation={[0, 0, -0.16]}>
        <boxGeometry args={[0.16, 0.54, 0.18]} />
        <Flat color="#1f7fe0" />
      </Part>
      <group ref={arm} position={[0.34, 0.16, 0]}>
        <Part position={[0.03, -0.26, 0]}>
          <boxGeometry args={[0.16, 0.54, 0.18]} />
          <Flat color="#1f7fe0" />
        </Part>
        <Part position={[0.03, -0.56, 0]}>
          <icosahedronGeometry args={[0.1, 0]} />
          <Flat color="#f0c49a" />
        </Part>
      </group>
      <group position={[0, 0.54, 0]}>
        <Part>
          <icosahedronGeometry args={[0.44, 1]} />
          <Flat color="#f0c49a" />
        </Part>
        <Part position={[0, 0.17, -0.07]} scale={[1.02, 0.8, 1]}>
          <dodecahedronGeometry args={[0.45, 0]} />
          <Flat color="#10162e" />
        </Part>
        {[
          [-0.26, 0.42, 0.14, 0.34],
          [0, 0.5, 0.2, 0],
          [0.26, 0.42, 0.14, -0.34],
        ].map(([x, y, z, r]) => (
          <Part key={x} position={[x, y, z]} rotation={[0.5, 0, r]}>
            <coneGeometry args={[0.13, 0.28, 4]} />
            <Flat color="#10162e" />
          </Part>
        ))}
        {[-0.16, 0.16].map((x) => (
          <Part key={x} position={[x, -0.02, 0.41]}>
            <boxGeometry args={[0.08, 0.13, 0.03]} />
            <Flat color="#0b1020" />
          </Part>
        ))}
        <Part position={[0, 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.47, 0.035, 5, 10, Math.PI]} />
          <Flat color="#6fdcff" glow="#2f8fe6" power={0.6} />
        </Part>
        {[-0.47, 0.47].map((x) => (
          <Part key={x} position={[x, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.09, 6]} />
            <Flat color="#6fdcff" />
          </Part>
        ))}
      </group>
    </group>
  );
}

/* 02: a laptop whose lid opens when highlighted */
function Laptop({ active }: { active: Active }) {
  const lid = useRef<THREE.Group>(null);
  const screen = useMemo(() => screenTexture(), []);

  useFrame(() => {
    if (lid.current) lid.current.rotation.x = 0.35 - active.current * 0.85;
  });

  return (
    <group position={[0, -0.28, 0]} rotation={[0.12, 0, 0]} scale={1.08}>
      <Part>
        <boxGeometry args={[1.62, 0.09, 1.08]} />
        <Flat color="#c4d8ee" metal={0.65} rough={0.3} />
      </Part>
      <Part position={[0, 0.05, -0.08]}>
        <boxGeometry args={[1.42, 0.02, 0.56]} />
        <Flat color="#10203f" />
      </Part>
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 11 }, (_, col) => (
          <Part key={`${row}-${col}`} position={[-0.6 + col * 0.12, 0.07, -0.29 + row * 0.13]}>
            <boxGeometry args={[0.095, 0.02, 0.1]} />
            <Flat color="#27477f" />
          </Part>
        )),
      )}
      <Part position={[0, 0.05, 0.36]}>
        <boxGeometry args={[0.46, 0.015, 0.24]} />
        <Flat color="#8fb0d6" metal={0.5} />
      </Part>
      <group ref={lid} position={[0, 0.05, -0.52]}>
        <Part position={[0, 0.51, -0.02]}>
          <boxGeometry args={[1.62, 1.04, 0.06]} />
          <Flat color="#c4d8ee" metal={0.65} rough={0.3} />
        </Part>
        <mesh position={[0, 0.51, 0.013]}>
          <planeGeometry args={[1.48, 0.92]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

const ROCKET_PROFILE = [
  [0.0, 1.0],
  [0.12, 0.84],
  [0.26, 0.52],
  [0.34, 0.14],
  [0.34, -0.26],
  [0.25, -0.58],
  [0.2, -0.64],
].map(([x, y]) => new THREE.Vector2(x, y));

function fin() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.3);
  s.lineTo(0.36, -0.3);
  s.lineTo(0.36, -0.54);
  s.lineTo(0, -0.26);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false }).translate(0, 0, -0.03);
}

/* 03: a rocket that lights its engine when highlighted */
function Rocket({ active }: { active: Active }) {
  const flame = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const finGeometry = useMemo(() => fin(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const a = active.current;
    if (flame.current) {
      const f = a * (0.86 + Math.sin(t * 32) * 0.14 + Math.sin(t * 19) * 0.1);
      flame.current.scale.set(0.5 + a * 0.5, Math.max(f, 0.001), 0.5 + a * 0.5);
      flame.current.visible = a > 0.02;
    }
    if (body.current) body.current.position.x = Math.sin(t * 40) * 0.008 * a;
  });

  return (
    <group rotation={[0, 0, -0.34]} position={[0, 0.06, 0]}>
      <group ref={body}>
        <Part>
          <latheGeometry args={[ROCKET_PROFILE, 8]} />
          <Flat color="#eaf6ff" metal={0.2} rough={0.35} />
        </Part>
        <Part position={[0, 0.8, 0]}>
          <coneGeometry args={[0.185, 0.42, 8]} />
          <Flat color="#ff5a3c" rough={0.35} />
        </Part>
        <Part position={[0, 0.2, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 8]} />
          <Flat color="#2f8fe6" metal={0.6} />
        </Part>
        <Part position={[0, 0.2, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
          <Flat color="#bfefff" glow="#6fdcff" power={1.2} />
        </Part>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 2 + Math.PI / 4, 0]}>
            <mesh geometry={finGeometry} position={[0.26, -0.2, 0]}>
              <Flat color="#ff5a3c" rough={0.35} />
            </mesh>
          </group>
        ))}
        <Part position={[0, -0.72, 0]}>
          <cylinderGeometry args={[0.15, 0.24, 0.18, 8]} />
          <Flat color="#1a2a55" metal={0.7} />
        </Part>
      </group>
      <group ref={flame} position={[0, -0.8, 0]}>
        <mesh position={[0, -0.32, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.2, 0.68, 7]} />
          <meshBasicMaterial color="#ff9a3c" transparent opacity={0.9} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.4, 7]} />
          <meshBasicMaterial color="#fff2c0" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

const CUP_PROFILE = [
  [0.0, -0.3],
  [0.1, -0.3],
  [0.13, -0.2],
  [0.3, -0.02],
  [0.44, 0.3],
  [0.5, 0.74],
  [0.46, 0.76],
  [0.4, 0.34],
  [0.0, 0.1],
].map(([x, y]) => new THREE.Vector2(x, y));

/* 04: a gold trophy */
function Trophy({ active }: { active: Active }) {
  const star = useRef<THREE.Mesh>(null);
  const starGeometry = useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.17 : 0.075;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false });
  }, []);

  useFrame((state) => {
    if (star.current) star.current.scale.setScalar(1 + active.current * 0.14 * (1 + Math.sin(state.clock.elapsedTime * 6)));
  });

  return (
    <group position={[0, -0.05, 0]} scale={1.08}>
      <Part>
        <latheGeometry args={[CUP_PROFILE, 9]} />
        <Flat color="#ffc93c" metal={0.85} rough={0.26} glow="#7a4a00" power={0.5} />
      </Part>
      {[-1, 1].map((side) => (
        <Part key={side} position={[side * 0.44, 0.42, 0]} rotation={[0, side > 0 ? 0 : Math.PI, -Math.PI / 2 + 0.1]}>
          <torusGeometry args={[0.2, 0.045, 5, 8, Math.PI]} />
          <Flat color="#ffc93c" metal={0.85} rough={0.26} glow="#7a4a00" power={0.5} />
        </Part>
      ))}
      <Part position={[0, -0.44, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 0.32, 6]} />
        <Flat color="#ffc93c" metal={0.85} rough={0.26} />
      </Part>
      <Part position={[0, -0.64, 0]}>
        <boxGeometry args={[0.66, 0.14, 0.5]} />
        <Flat color="#0f4c9c" metal={0.4} rough={0.35} />
      </Part>
      <Part position={[0, -0.78, 0]}>
        <boxGeometry args={[0.86, 0.14, 0.66]} />
        <Flat color="#0a3478" metal={0.4} rough={0.35} />
      </Part>
      <mesh ref={star} geometry={starGeometry} position={[0, 0.42, 0.44]} rotation={[-0.14, 0, 0]}>
        <Flat color="#fff4c8" metal={0.3} rough={0.3} glow="#ffe08a" power={0.7} />
      </mesh>
    </group>
  );
}

/* 05: a voxel cube that loosens when highlighted, shaded like a contribution graph */
function PixelCube({ active }: { active: Active }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const cells = useMemo(() => {
    const ramp = ["#0f4c9c", "#1f7fe0", "#46b4f4", "#8fe4ff", "#f2fbff"];
    const list: { base: THREE.Vector3; color: THREE.Color; phase: number }[] = [];
    let seed = 3;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          seed = (seed * 73 + 19) % 211;
          const corner = Math.abs(x) + Math.abs(y) + Math.abs(z) === 3;
          if (corner && seed % 3 === 0) continue;
          list.push({
            base: new THREE.Vector3(x, y, z),
            color: new THREE.Color(ramp[seed % ramp.length]),
            phase: (seed % 17) / 17,
          });
        }
      }
    }
    return list;
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const setup = (m: THREE.InstancedMesh | null) => {
    mesh.current = m;
    if (!m) return;
    cells.forEach((c, i) => m.setColorAt(i, c.color));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  };

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const gap = 0.41 + active.current * 0.1;
    cells.forEach((c, i) => {
      const wobble = 1 + Math.sin(t * 3 + c.phase * 6.28) * 0.06 * active.current;
      dummy.position.copy(c.base).multiplyScalar(gap * wobble);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group rotation={[0.5, 0.6, 0]} scale={0.98}>
      <instancedMesh ref={setup} args={[undefined, undefined, cells.length]} frustumCulled={false}>
        <boxGeometry args={[0.37, 0.37, 0.37]} />
        <meshStandardMaterial roughness={0.35} metalness={0.15} flatShading emissive="#0b3a80" emissiveIntensity={0.4} />
      </instancedMesh>
    </group>
  );
}

/* 06: a glowing crystal with orbiting shards */
function Crystal({ active }: { active: Active }) {
  const orbit = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    if (orbit.current) orbit.current.rotation.y += dt * (0.6 + active.current * 2.2);
    if (core.current) core.current.scale.setScalar(0.9 + Math.sin(state.clock.elapsedTime * 3) * 0.1 + active.current * 0.2);
  });

  return (
    <group>
      <mesh scale={[0.58, 1.02, 0.58]}>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#7fe6ff"
          emissive="#1b9cf0"
          emissiveIntensity={0.7}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          transparent
          opacity={0.72}
          flatShading
        />
      </mesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <group ref={orbit} rotation={[0.3, 0, 0.2]}>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <Part key={i} position={[Math.cos(a) * 0.86, Math.sin(a * 2) * 0.16, Math.sin(a) * 0.86]} scale={[0.09, 0.17, 0.09]}>
              <octahedronGeometry args={[1, 0]} />
              <Flat color="#bfefff" glow="#6fdcff" power={1} />
            </Part>
          );
        })}
      </group>
    </group>
  );
}

/* ??: a block that cannot hold its shape */
function Glitch() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const tick = Math.floor(state.clock.elapsedTime * 9);
    const jump = Math.sin(tick * 12.9898) * 43758.5453;
    const r = jump - Math.floor(jump);
    g.children.forEach((child, i) => {
      child.position.x = r > 0.72 ? (i - 1) * (r - 0.72) * 1.2 : 0;
    });
  });

  return (
    <group ref={group} rotation={[0.4, 0.5, 0]}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe toneMapped={false} />
      </mesh>
      <mesh scale={0.72}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ff4fd8" wireframe toneMapped={false} />
      </mesh>
      <mesh scale={0.36}>
        <dodecahedronGeometry args={[1, 0]} />
        <Flat color="#10163a" glow="#6fdcff" power={1.4} />
      </mesh>
    </group>
  );
}

export function SaveIcon({ kind, active }: { kind: IconKind; active: Active }) {
  switch (kind) {
    case "character":
      return <Character active={active} />;
    case "laptop":
      return <Laptop active={active} />;
    case "rocket":
      return <Rocket active={active} />;
    case "trophy":
      return <Trophy active={active} />;
    case "cube":
      return <PixelCube active={active} />;
    case "crystal":
      return <Crystal active={active} />;
    case "glitch":
      return <Glitch />;
  }
}
