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
  const bg = g.createLinearGradient(0, 0, 512, 384);
  bg.addColorStop(0, "#f4fbff");
  bg.addColorStop(1, "#b8dcf5");
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 384);

  g.fillStyle = "#0a3f94";
  g.fillRect(0, 0, 512, 84);
  g.fillStyle = "#f4fbff";
  g.font = "34px Michroma";
  g.textBaseline = "middle";
  g.fillText("MEMORY CARD", 30, 44);

  g.fillStyle = "#0a2f70";
  g.font = "64px Michroma";
  g.fillText("RISKI", 28, 158);
  g.fillStyle = "#1f8fe0";
  g.fillText(".EXE", 28, 238);

  g.fillStyle = "#0a2f70";
  g.font = "26px 'Share Tech Mono'";
  g.fillText("8 MB  /  6 SAVE DATA", 30, 318);
  g.fillText("DEV-2026  SLOT 1", 30, 350);

  // Save-block meter along the right edge.
  for (let i = 0; i < 6; i++) {
    g.fillStyle = "#1f8fe0";
    g.fillRect(440, 110 + i * 40, 44, 28);
  }
  return toTexture(el);
}

/** Circuit board visible through the clear shell. */
export function boardTexture() {
  const [el, g] = canvas(512, 640);
  g.fillStyle = "#06235c";
  g.fillRect(0, 0, 512, 640);
  g.strokeStyle = "#39b6ff";
  g.lineWidth = 3;
  g.globalAlpha = 0.75;
  for (let i = 0; i < 26; i++) {
    const x = 20 + i * 18;
    g.beginPath();
    g.moveTo(x, 640);
    g.lineTo(x, 470 - (i % 5) * 18);
    g.lineTo(x + ((i % 3) - 1) * 46, 400 - (i % 4) * 26);
    g.lineTo(x + ((i % 3) - 1) * 46, 30 + (i % 6) * 22);
    g.stroke();
  }
  g.globalAlpha = 1;
  g.fillStyle = "#020a22";
  g.fillRect(70, 90, 170, 170);
  g.fillRect(290, 120, 130, 90);
  g.fillRect(150, 320, 210, 90);
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
