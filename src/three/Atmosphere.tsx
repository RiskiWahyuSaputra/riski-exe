"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ALL_SAVES } from "@/data/saves";
import { useSystem } from "@/lib/store";
import { fx } from "./rig";

const damp = THREE.MathUtils.damp;
const REST_TINT = "#0e4fb0";

/* ---------- Sky: a fullscreen shader behind everything ---------- */

const skyVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform float uWarp;
  uniform vec3 uTint;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 p = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.5);
    float t = uTime * 0.03;

    vec3 deep = vec3(0.002, 0.008, 0.04);
    vec3 col = mix(deep, uTint * 0.2, smoothstep(-0.6, 0.62, p.y + 0.1));

    // Slow smoke banks of light.
    float smoke = fbm(p * 1.7 + vec2(t, -t * 0.6) + fbm(p * 2.4 - t) * 0.9);
    col += uTint * pow(smoke, 2.6) * 0.62;

    // A soft source of light high behind the scene, with faint rays leaving it.
    vec2 q = p - vec2(-0.06, 0.34);
    float glow = exp(-dot(q, q) * 3.4);
    float rays = sin(atan(q.y, q.x) * 7.0 + smoke * 6.0 + uTime * 0.05) * smoothstep(0.05, 0.5, length(q));
    col += mix(uTint, vec3(0.35, 0.7, 1.0), 0.35) * glow * (0.17 + 0.035 * rays);

    col += vec3(0.2, 0.55, 1.0) * uWarp * 0.26 * exp(-dot(p, p) * 5.0);

    float vignette = smoothstep(1.25, 0.28, length(p * vec2(0.86, 1.2)));
    col *= mix(0.3, 1.0, vignette);

    col += (hash(vUv * 913.0 + uTime) - 0.5) * 0.006;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Sky() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1.6 },
      uWarp: { value: 0 },
      uTint: { value: new THREE.Color(REST_TINT) },
    }),
    [],
  );
  const target = useMemo(() => new THREE.Color(), []);

  useFrame((state, dt) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uAspect.value = state.size.width / state.size.height;
    u.uWarp.value = fx.warp;
    const { openId } = useSystem.getState();
    target.set(openId === null ? REST_TINT : ALL_SAVES[openId].tint);
    u.uTint.value.lerp(target, 1 - Math.exp(-2.4 * dt));
  });

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ---------- Glass: faceted additive prisms ---------- */

const glassVertex = /* glsl */ `
  uniform float uTime;
  attribute float aPhase;
  varying vec3 vView;
  varying float vHeight;
  void main() {
    vec3 p = position;
    vHeight = uv.y;
    #ifdef USE_INSTANCING
      vec4 world = instanceMatrix * vec4(p, 1.0);
      world.y += sin(uTime * 0.16 + aPhase * 6.28) * 0.7;
    #else
      vec4 world = vec4(p, 1.0);
    #endif
    vec4 view = modelViewMatrix * world;
    vView = view.xyz;
    gl_Position = projectionMatrix * view;
  }
`;

const glassFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uFadeEnds;
  varying vec3 vView;
  varying float vHeight;
  void main() {
    vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));
    float facing = abs(dot(n, normalize(-vView)));
    float fresnel = pow(1.0 - facing, 1.7);
    float ends = mix(1.0, smoothstep(0.0, 0.3, vHeight) * smoothstep(1.0, 0.72, vHeight), uFadeEnds);
    float depth = smoothstep(58.0, 8.0, -vView.z);
    float alpha = (0.05 + fresnel * 0.5) * ends * uOpacity * depth;
    gl_FragColor = vec4(uColor * (0.55 + fresnel), alpha);
    #include <colorspace_fragment>
  }
`;

function glass(color: string, opacity: number, fadeEnds: number) {
  return new THREE.ShaderMaterial({
    vertexShader: glassVertex,
    fragmentShader: glassFragment,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uFadeEnds: { value: fadeEnds },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

/** Deterministic random, so the world looks the same on every visit. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Towers({ count }: { count: number }) {
  const { geometry, material, matrices } = useMemo(() => {
    const rand = seeded(20);
    const geo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, false);
    const phases = new Float32Array(count);
    const list: THREE.Matrix4[] = [];
    const m = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (6 + rand() * 32);
      const z = -13 - rand() * 36;
      const h = 8 + rand() * 26;
      const r = 0.6 + rand() * 1.9;
      m.position.set(x, -9 + h * 0.5 - rand() * 5, z);
      m.scale.set(r, h, r);
      m.rotation.set(0, rand() * Math.PI, 0);
      m.updateMatrix();
      list.push(m.matrix.clone());
      phases[i] = rand();
    }
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    return { geometry: geo, material: glass("#4fb0f0", 0.62, 1), matrices: list };
  }, [count]);

  const setup = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  };

  const group = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (group.current) group.current.rotation.y += dt * (0.004 + fx.warp * 0.18);
  });

  return (
    <group ref={group} position={[0, 0, -18]}>
      <group position={[0, 0, 18]}>
        <instancedMesh ref={setup} args={[geometry, material, count]} frustumCulled={false} />
      </group>
    </group>
  );
}

const SHARD_KINDS = [
  new THREE.IcosahedronGeometry(1, 0),
  new THREE.OctahedronGeometry(1, 0),
  new THREE.TetrahedronGeometry(1, 0),
  new THREE.DodecahedronGeometry(1, 0),
];

function Shards({ count }: { count: number }) {
  const items = useMemo(() => {
    const rand = seeded(7);
    return Array.from({ length: count }, (_, i) => ({
      geometry: SHARD_KINDS[i % SHARD_KINDS.length],
      position: [(rand() < 0.5 ? -1 : 1) * (7 + rand() * 11), (rand() - 0.5) * 14, -5 - rand() * 15] as const,
      scale: 0.26 + rand() * 0.7,
      speed: 0.05 + rand() * 0.16,
      phase: rand() * 6.28,
    }));
  }, [count]);
  const fill = useMemo(() => glass("#7ad6ff", 0.5, 0), []);
  const wire = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#6fc8ff", wireframe: true, transparent: true, opacity: 0.11 }),
    [],
  );
  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    items.forEach((item, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.rotation.x += dt * item.speed * (1 + fx.warp * 12);
      g.rotation.y += dt * item.speed * 1.4 * (1 + fx.warp * 12);
      g.position.y = item.position[1] + Math.sin(t * item.speed * 2 + item.phase) * 0.6;
    });
  });

  return items.map((item, i) => (
    <group
      key={i}
      ref={(el) => {
        refs.current[i] = el;
      }}
      position={[item.position[0], item.position[1], item.position[2]]}
      scale={item.scale}
    >
      <mesh geometry={item.geometry} material={fill} />
      <mesh geometry={item.geometry} material={wire} scale={1.01} />
    </group>
  ));
}

/* ---------- Dust: points that wrap through a box around the camera ---------- */

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uTravel;
  uniform float uWarp;
  uniform float uPixel;
  attribute float aSeed;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * (0.1 + aSeed * 0.22) + 12.0, 24.0) - 12.0;
    p.x += sin(uTime * 0.2 + aSeed * 40.0) * 0.4;
    p.z = mod(p.z + uTravel + 44.0, 52.0) - 40.0;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    vTwinkle = 0.45 + 0.55 * sin(uTime * (0.8 + aSeed * 2.0) + aSeed * 90.0);
    gl_PointSize = uPixel * (0.6 + aSeed * 1.9) * (1.0 + uWarp * 2.0) * 22.0 / max(1.0, -view.z);
    gl_Position = projectionMatrix * view;
  }
`;

const dustFragment = /* glsl */ `
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(0.72, 0.93, 1.0), a * a * vTwinkle * 0.9);
    #include <colorspace_fragment>
  }
`;

function Dust({ count }: { count: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const rand = seeded(99);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions.set([(rand() - 0.5) * 44, rand() * 24, rand() * 52], i * 3);
      seeds[i] = rand();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, [count]);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uTravel: { value: 0 }, uWarp: { value: 0 }, uPixel: { value: 1 } }),
    [],
  );

  useFrame((state, dt) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uTravel.value += dt * (0.25 + fx.warp * 60);
    u.uWarp.value = damp(u.uWarp.value, fx.warp, 6, dt);
    u.uPixel.value = state.gl.getPixelRatio() * 2;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function Atmosphere({ light }: { light: boolean }) {
  return (
    <>
      <Sky />
      <Towers count={light ? 20 : 40} />
      <Shards count={light ? 8 : 16} />
      <Dust count={light ? 240 : 620} />
    </>
  );
}
