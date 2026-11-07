import * as THREE from "three";

function canvas(w: number, h: number) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  return [el, el.getContext("2d")!] as const;
}

function toTexture(el: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(el);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function glowTexture() {
  const [el, g] = canvas(128, 128);
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.28, "rgba(255,255,255,.42)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return toTexture(el);
}

/** Sticker on the front of the card. Drawn after fonts load, so the type is right. */
export function labelTexture() {
  const [el, g] = canvas(512, 384);
  g.fillStyle = "#26282e";
  g.fillRect(0, 0, 512, 384);
  g.fillStyle = "#f4f4f0";
  g.textBaseline = "middle";
  g.font = '700 92px "M PLUS Rounded 1c"';
  g.fillText("RISKI", 34, 130);
  g.fillStyle = "#ffe63c";
  g.fillText(".EXE", 34, 240);
  g.fillStyle = "#b0b0aa";
  g.font = '500 32px "M PLUS Rounded 1c"';
  g.fillText("MEMORY CARD 8MB", 34, 330);
  return toTexture(el);
}

export function screenTexture() {
  const [el, g] = canvas(256, 160);
  g.fillStyle = "#03122e";
  g.fillRect(0, 0, 256, 160);
  const palette = ["#6fdcff", "#f2fbff", "#2f8fe6", "#8df0c4"];
  let seed = 5;
  for (let y = 0; y < 11; y++) {
    let x = 12 + (y % 4) * 12;
    for (let k = 0; k < 4; k++) {
      seed = (seed * 37 + 11) % 101;
      const w = 12 + (seed % 46);
      g.fillStyle = palette[(seed + k) % 4];
      g.fillRect(x, 12 + y * 13, w, 6);
      x += w + 7;
      if (x > 220) break;
    }
  }
  return toTexture(el);
}
