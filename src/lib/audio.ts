/**
 * Every sound is synthesized here, so the site ships no audio files.
 * Nothing runs until the visitor turns a toggle on: the AudioContext is only
 * created inside that click, which also satisfies browser autoplay rules.
 */
export type Cue = "move" | "confirm" | "back" | "load" | "boot" | "notice" | "secret";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let padGain: GainNode | null = null;
let padNodes: AudioScheduledSourceNode[] = [];

function context() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, at: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
  const ac = context();
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(master!);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export function playCue(cue: Cue) {
  switch (cue) {
    case "move":
      tone(1320, 0, 0.07, "triangle", 0.12);
      tone(1760, 0.02, 0.06, "sine", 0.06);
      break;
    case "confirm":
      tone(660, 0, 0.12, "triangle", 0.16);
      tone(990, 0.07, 0.14, "triangle", 0.16);
      tone(1320, 0.14, 0.26, "sine", 0.14);
      break;
    case "back":
      tone(880, 0, 0.1, "triangle", 0.14);
      tone(587, 0.08, 0.18, "triangle", 0.12);
      break;
    case "load":
      for (let i = 0; i < 6; i++) tone(420 + i * 90, i * 0.16, 0.1, "square", 0.025);
      break;
    case "notice":
      tone(1046, 0, 0.09, "sine", 0.09);
      tone(1568, 0.07, 0.14, "sine", 0.07);
      break;
    case "secret":
      [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.09, 0.3, "square", 0.05));
      break;
    case "boot":
      // Slow rising fifths under a glassy shimmer.
      tone(55, 0, 3.2, "sine", 0.3, 110);
      tone(82.4, 0.3, 3, "sine", 0.18, 165);
      [440, 659, 880, 1318, 1760].forEach((f, i) => tone(f, 0.8 + i * 0.28, 2.2, "sine", 0.05));
      break;
  }
}

export function setAmbient(on: boolean) {
  if (!on) {
    if (padGain && ctx) {
      const gain = padGain;
      const nodes = padNodes;
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      setTimeout(() => {
        nodes.forEach((n) => n.stop());
        gain.disconnect();
      }, 2000);
    }
    padGain = null;
    padNodes = [];
    return;
  }

  const ac = context();
  padGain = ac.createGain();
  padGain.gain.value = 0;
  padGain.gain.setTargetAtTime(0.09, ac.currentTime, 1.5);

  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 520;
  filter.connect(padGain).connect(master!);

  const lfo = ac.createOscillator();
  const lfoDepth = ac.createGain();
  lfo.frequency.value = 0.07;
  lfoDepth.gain.value = 240;
  lfo.connect(lfoDepth).connect(filter.frequency);
  lfo.start();

  const voices = [73.4, 110, 146.8, 220.6, 277.2].map((f, i) => {
    const osc = ac.createOscillator();
    osc.type = i < 2 ? "sine" : "triangle";
    osc.frequency.value = f;
    osc.detune.value = (i - 2) * 4;
    osc.connect(filter);
    osc.start();
    return osc;
  });
  padNodes = [lfo, ...voices];
}
