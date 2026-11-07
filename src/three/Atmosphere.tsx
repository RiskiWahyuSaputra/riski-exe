"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ALL_SAVES } from "@/data/saves";
import { useSystem } from "@/lib/store";
import { fx } from "./rig";
import { glowTexture } from "./textures";

const damp = THREE.MathUtils.damp;
/** Neutral grey of the browser. An open save only nudges it toward its own tint. */
const REST_TINT = "#8c8c88";

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
  uniform float uWorld;
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

    // Boot: near-black space with slow blue fog.
    float smoke = fbm(p * 1.7 + vec2(t, -t * 0.6) + fbm(p * 2.4 - t) * 0.9);
    vec3 fog = vec3(0.012, 0.05, 0.3);
    vec3 boot = fog * smoothstep(-0.7, 0.5, p.y) * 0.55 + fog * pow(smoke, 2.6) * 1.6;

    // Browser: brushed grey lit from the top left, falling to dark olive at the bottom right.
    vec2 uv = vUv;
    float light = dot(uv - vec2(0.12, 0.92), vec2(0.72, -0.7));
    vec3 grey = mix(vec3(0.56, 0.55, 0.53), vec3(0.27, 0.27, 0.255), smoothstep(0.0, 0.62, light));
    grey = mix(grey, vec3(0.024, 0.03, 0.018), smoothstep(0.62, 1.12, light));
    grey *= mix(0.62, 1.0, smoothstep(-0.02, 0.34, uv.x + uv.y * 0.55));
    grey *= 0.97 + smoke * 0.06;
    grey = mix(grey, grey * uTint * 2.6, 0.5);
    grey += vec3(0.5) * uWarp * 0.3 * exp(-dot(p, p) * 5.0);

    vec3 col = mix(boot, grey, uWorld);

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
      uWorld: { value: 0 },
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
    u.uWorld.value = fx.world;
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

/** A city of glass columns, only seen during boot. */
function Towers({ side }: { side: number }) {
  const count = side * side;
  const { geometry, material, matrices } = useMemo(() => {
    const rand = seeded(20);
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const phases = new Float32Array(count);
    const list: THREE.Matrix4[] = [];
    const m = new THREE.Object3D();
    const gap = 2.7;
    for (let i = 0; i < count; i++) {
      const gx = (i % side) - (side - 1) / 2;
      const gz = Math.floor(i / side) - (side - 1) / 2;
      const h = 1.5 + Math.pow(rand(), 2.2) * 15;
      m.position.set(gx * gap, -7 + h / 2, gz * gap - 8);
      m.scale.set(1.75, h, 1.75);
      m.updateMatrix();
      list.push(m.matrix.clone());
      phases[i] = rand();
    }
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    return { geometry: geo, material: glass("#3f86ff", 1.1, 0.45), matrices: list };
  }, [count, side]);

  const instances = useRef<THREE.InstancedMesh>(null);
  const setup = (mesh: THREE.InstancedMesh | null) => {
    instances.current = mesh;
    if (!mesh) return;
    matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  };

  useFrame((state) => {
    const mesh = instances.current;
    if (!mesh) return;
    mesh.visible = fx.world < 1;
    (mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <instancedMesh ref={setup} args={[geometry, material, count]} frustumCulled={false} />;
}

/** Points of light drifting between the columns. */
function Orbs({ count }: { count: number }) {
  const texture = useMemo(() => glowTexture(), []);
  const items = useMemo(() => {
    const rand = seeded(7);
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * 30,
      z: -8 + (rand() - 0.5) * 26,
      y: rand() * 9 - 1,
      speed: 0.12 + rand() * 0.26,
      phase: rand() * 6.28,
      size: 0.7 + rand() * 1.5,
    }));
  }, [count]);
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    g.visible = fx.world < 1;
    const t = state.clock.elapsedTime;
    g.children.forEach((child, i) => {
      const o = items[i];
      child.position.set(
        o.x + Math.sin(t * o.speed + o.phase) * 5,
        o.y + Math.sin(t * o.speed * 1.7 + o.phase) * 2,
        o.z + Math.cos(t * o.speed + o.phase) * 5,
      );
    });
  });

  return (
    <group ref={group}>
      {items.map((o, i) => (
        <sprite key={i} scale={o.size}>
          <spriteMaterial map={texture} color="#a8d4ff" transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
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

  const points = useRef<THREE.Points>(null);

  useFrame((state, dt) => {
    if (points.current) points.current.visible = fx.world < 1;
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uTravel.value += dt * (0.25 + fx.warp * 60);
    u.uWarp.value = damp(u.uWarp.value, fx.warp, 6, dt);
    u.uPixel.value = state.gl.getPixelRatio() * 2;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
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
      <Towers side={light ? 9 : 13} />
      <Orbs count={light ? 10 : 20} />
      <Dust count={light ? 160 : 360} />
    </>
  );
}
