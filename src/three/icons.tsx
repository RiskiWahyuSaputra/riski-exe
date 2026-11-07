"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import type { IconKind } from "@/data/saves";
import { certificateTexture, screenTexture } from "./textures";

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

const SKIN = "#f3c9a2";
const HAIR = "#1b1e30";
const HOODIE = "#2279e0";
const HOODIE_DARK = "#165ab0";
const PHONES = "#22252f";

/** Cylinder between two points, for thin parts such as the mic boom. */
function Stick({ from, to, radius, children }: { from: THREE.Vector3; to: THREE.Vector3; radius: number; children: ReactNode }) {
  const { position, quaternion, length } = useMemo(() => {
    const direction = to.clone().sub(from);
    return {
      position: from.clone().add(to).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()),
      length: direction.length(),
    };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 6]} />
      {children}
    </mesh>
  );
}

function Headphones() {
  const micFrom = useMemo(() => new THREE.Vector3(-0.6, -0.1, 0.06), []);
  const micTo = useMemo(() => new THREE.Vector3(-0.27, -0.33, 0.43), []);

  return (
    <group>
      {/* The band arcs ear to ear, over the top of the hair. */}
      <Part>
        <torusGeometry args={[0.61, 0.05, 6, 16, Math.PI]} />
        <Flat color={PHONES} metal={0.3} rough={0.4} />
      </Part>
      <Part position={[0, 0.655, 0]} scale={[0.5, 0.45, 1.3]}>
        <icosahedronGeometry args={[0.1, 0]} />
        <Flat color="#6fdcff" glow="#2f8fe6" power={0.6} />
      </Part>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.6, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <Part position={[0, side * 0.055, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.07, 10]} />
            <Flat color="#3a3e4c" rough={0.8} />
          </Part>
          <Part position={[0, -side * 0.035, 0]}>
            <cylinderGeometry args={[0.21, 0.18, 0.11, 10]} />
            <Flat color={PHONES} metal={0.3} rough={0.4} />
          </Part>
          <Part position={[0, -side * 0.1, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.025, 10]} />
            <Flat color="#6fdcff" glow="#2f8fe6" power={0.8} />
          </Part>
        </group>
      ))}
      <Stick from={micFrom} to={micTo} radius={0.016}>
        <Flat color={PHONES} />
      </Stick>
      <Part position={[-0.27, -0.33, 0.43]}>
        <icosahedronGeometry args={[0.05, 0]} />
        <Flat color="#6fdcff" glow="#2f8fe6" power={0.6} />
      </Part>
    </group>
  );
}

function Face() {
  const lids = useRef<THREE.Group>(null);

  useFrame((state) => {
    // A quick blink every few seconds.
    const blink = state.clock.elapsedTime % 3.6 < 0.11;
    if (lids.current) lids.current.scale.y = blink ? 0.12 : 1;
  });

  return (
    <group>
      <group ref={lids} position={[0, -0.02, 0]}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.19, 0, 0.455]} rotation={[0, side * 0.36, 0]}>
            <Part scale={[0.078, 0.104, 0.03]}>
              <icosahedronGeometry args={[1, 1]} />
              <Flat color="#141726" rough={0.25} />
            </Part>
            <Part position={[-0.022, 0.04, 0.024]} scale={[0.026, 0.032, 0.012]}>
              <icosahedronGeometry args={[1, 0]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </Part>
          </group>
        ))}
      </group>
      {[-1, 1].map((side) => (
        <Part key={side} position={[side * 0.2, 0.135, 0.465]} rotation={[0, side * 0.36, side * -0.14]}>
          <boxGeometry args={[0.15, 0.03, 0.02]} />
          <Flat color={HAIR} />
        </Part>
      ))}
      {[-1, 1].map((side) => (
        <Part key={side} position={[side * 0.31, -0.14, 0.39]} rotation={[0, side * 0.62, 0]} scale={[0.082, 0.05, 0.012]}>
          <icosahedronGeometry args={[1, 1]} />
          <Flat color="#f09a8c" rough={0.8} />
        </Part>
      ))}
      <Part position={[0, -0.075, 0.49]} scale={[0.03, 0.026, 0.03]}>
        <icosahedronGeometry args={[1, 0]} />
        <Flat color="#e2ab84" />
      </Part>
      <Part position={[0, -0.155, 0.462]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.07, 0.013, 4, 10, Math.PI]} />
        <Flat color="#8a3c34" />
      </Part>
    </group>
  );
}

function Hair() {
  const fringe: [number, number, number, number, number][] = [
    [-0.36, 0.2, 0.31, -0.5, 0.62],
    [-0.19, 0.27, 0.41, -0.2, 0.74],
    [0.01, 0.29, 0.44, 0.14, 0.78],
    [0.2, 0.27, 0.41, 0.34, 0.7],
    [0.37, 0.2, 0.3, 0.52, 0.58],
  ];

  return (
    <group>
      {/* A cap tilted back, so the hairline clears the face. */}
      <Part rotation={[-0.62, 0, 0]} scale={[1.06, 1, 1]}>
        <sphereGeometry args={[0.535, 12, 7, 0, Math.PI * 2, 0, 1.72]} />
        <Flat color={HAIR} rough={0.55} />
      </Part>
      {fringe.map(([x, y, z, tilt, size]) => (
        <Part key={x} position={[x, y, z]} rotation={[-0.3, 0, Math.PI + tilt]} scale={[size * 0.26, size * 0.42, size * 0.16]}>
          <coneGeometry args={[1, 1, 5]} />
          <Flat color={HAIR} rough={0.55} />
        </Part>
      ))}
    </group>
  );
}

/* 01: a small developer in a hoodie, wearing a headset */
function Character({ active }: { active: Active }) {
  const arm = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const a = active.current;
    if (arm.current) arm.current.rotation.z = 0.14 + a * (2.05 + Math.sin(t * 8) * 0.24);
    if (body.current) body.current.position.y = -0.03 + Math.abs(Math.sin(t * 4)) * 0.05 * a;
    if (head.current) head.current.rotation.z = Math.sin(t * 4) * 0.05 * a;
  });

  return (
    <group ref={body} scale={0.9}>
      {/* Legs and sneakers */}
      {[-0.17, 0.17].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Part position={[0, -0.7, 0]}>
            <capsuleGeometry args={[0.125, 0.2, 2, 8]} />
            <Flat color="#1a2750" />
          </Part>
          <Part position={[0, -0.95, 0.07]} scale={[0.15, 0.1, 0.25]}>
            <icosahedronGeometry args={[1, 1]} />
            <Flat color="#f4f6fa" />
          </Part>
          <Part position={[0, -1.02, 0.07]}>
            <boxGeometry args={[0.25, 0.04, 0.43]} />
            <Flat color="#ff5a3c" />
          </Part>
        </group>
      ))}

      {/* Hoodie */}
      <Part position={[0, -0.14, 0]} scale={[1, 1, 0.76]}>
        <capsuleGeometry args={[0.34, 0.14, 3, 8]} />
        <Flat color={HOODIE} />
      </Part>
      <Part position={[0, -0.5, 0]} scale={[1, 1, 0.76]}>
        <cylinderGeometry args={[0.34, 0.33, 0.1, 8]} />
        <Flat color={HOODIE_DARK} />
      </Part>
      <Part position={[0, -0.33, 0.235]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[0.36, 0.17, 0.05]} />
        <Flat color={HOODIE_DARK} />
      </Part>
      <Part position={[0, 0.1, -0.06]} rotation={[Math.PI / 2 - 0.3, 0, 0]}>
        <torusGeometry args={[0.2, 0.1, 6, 10]} />
        <Flat color={HOODIE_DARK} />
      </Part>
      {[-0.07, 0.07].map((x) => (
        <Part key={x} position={[x, -0.03, 0.27]}>
          <cylinderGeometry args={[0.012, 0.012, 0.18, 4]} />
          <Flat color="#f4f6fa" />
        </Part>
      ))}
      <Part position={[0, 0.1, 0.02]}>
        <cylinderGeometry args={[0.13, 0.15, 0.14, 8]} />
        <Flat color="#e2ab84" />
      </Part>

      {/* Resting arm */}
      <group position={[-0.37, 0.03, 0]} rotation={[0, 0, -0.14]}>
        <Part position={[0, -0.24, 0]}>
          <capsuleGeometry args={[0.105, 0.3, 2, 8]} />
          <Flat color={HOODIE} />
        </Part>
        <Part position={[0, -0.47, 0]}>
          <icosahedronGeometry args={[0.095, 1]} />
          <Flat color={SKIN} />
        </Part>
      </group>

      {/* Waving arm */}
      <group ref={arm} position={[0.37, 0.03, 0]}>
        <Part position={[0, -0.24, 0]}>
          <capsuleGeometry args={[0.105, 0.3, 2, 8]} />
          <Flat color={HOODIE} />
        </Part>
        <Part position={[0, -0.47, 0]}>
          <icosahedronGeometry args={[0.095, 1]} />
          <Flat color={SKIN} />
        </Part>
      </group>

      <group ref={head} position={[0, 0.54, 0]}>
        <Part scale={[1.06, 0.97, 1]}>
          <icosahedronGeometry args={[0.5, 2]} />
          <Flat color={SKIN} rough={0.6} />
        </Part>
        <Face />
        <Hair />
        <Headphones />
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
        <Flat color="#9db9dc" metal={0.65} rough={0.34} />
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
          <Flat color="#9db9dc" metal={0.65} rough={0.34} />
        </Part>
        <Part position={[0, 0.51, -0.055]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.24, 0.24, 0.01]} />
          <Flat color="#2f8fe6" glow="#2f8fe6" power={0.8} />
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

/* 04: a framed certificate with a gold seal and ribbons */
function Certificate({ active }: { active: Active }) {
  const seal = useRef<THREE.Group>(null);
  const [face, setFace] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let alive = true;
    document.fonts.load('700 34px "M PLUS Rounded 1c"').then(() => {
      if (alive) setFace(certificateTexture());
    });
    return () => {
      alive = false;
    };
  }, []);

  useFrame((state) => {
    if (seal.current) {
      seal.current.rotation.z = state.clock.elapsedTime * 0.8 * active.current;
      seal.current.scale.setScalar(1 + active.current * 0.1);
    }
  });

  return (
    <group rotation={[-0.08, 0, 0.05]} scale={1.04}>
      <Part position={[0, 0, -0.05]}>
        <boxGeometry args={[2.06, 1.54, 0.08]} />
        <Flat color="#17498f" metal={0.3} rough={0.4} />
      </Part>
      <Part position={[0, 0, 0.005]}>
        <boxGeometry args={[1.86, 1.34, 0.03]} />
        <Flat color="#fbf6e6" />
      </Part>
      {face && (
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.84, 1.32]} />
          <meshBasicMaterial map={face} toneMapped={false} />
        </mesh>
      )}
      {[-0.1, 0.1].map((x) => (
        <Part key={x} position={[0.52 + x, -0.72, 0.07]} rotation={[0, 0, x * 2]}>
          <boxGeometry args={[0.14, 0.44, 0.02]} />
          <Flat color="#d8352a" />
        </Part>
      ))}
      <group ref={seal} position={[0.52, -0.42, 0.1]}>
        <Part rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.06, 12]} />
          <Flat color="#ffc02e" metal={0.42} rough={0.32} glow="#9a5c00" power={0.75} />
        </Part>
        <Part position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.03, 6]} />
          <Flat color="#fff0b0" metal={0.3} rough={0.3} glow="#ffe08a" power={0.5} />
        </Part>
      </group>
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
    case "certificate":
      return <Certificate active={active} />;
    case "cube":
      return <PixelCube active={active} />;
    case "crystal":
      return <Crystal active={active} />;
    case "glitch":
      return <Glitch />;
  }
}
