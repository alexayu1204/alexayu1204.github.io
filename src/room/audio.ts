/**
 * Synthesised, so the payload is zero bytes and nothing has to load before the room
 * can respond. Default MUTED — a portfolio opened in an office must not make noise.
 * The AudioContext unlocks on the pull gesture, which means the very first sound
 * anyone can possibly hear is the mechanism they just worked.
 */
import { isMuted, setMuted } from './state';

let ac: AudioContext | null = null;
let master: GainNode | null = null;
let bed: AudioBufferSourceNode | null = null;
let muted = true;

export function initAudio() {
  muted = isMuted();
  document.documentElement.dataset.muted = String(muted);
}

export function unlockAudio() {
  if (ac) return;
  try {
    ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = muted ? 0 : 0.6;
    master.connect(ac.destination);
  } catch { ac = null; }
}

function noiseBuffer(seconds: number, ctx: AudioContext) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02; // pink-ish
    d[i] = last * 3.5;
  }
  return buf;
}

/** the mechanism: a hard transient plus a short band-passed rasp */
export function playClick() {
  if (!ac || !master) return;
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  const og = ac.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(220, t);
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.04);
  og.gain.setValueAtTime(0.18, t);
  og.gain.exponentialRampToValueAtTime(0.0008, t + 0.06);
  osc.connect(og).connect(master);
  osc.start(t); osc.stop(t + 0.07);

  const n = ac.createBufferSource();
  n.buffer = noiseBuffer(0.09, ac);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 1.4;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.22, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  n.connect(bp).connect(ng).connect(master);
  n.start(t); n.stop(t + 0.09);
}

/** the filaments catching: a soft upward swell, no cymbal, no whoosh cliché */
export function playIgnite() {
  if (!ac || !master) return;
  const t = ac.currentTime;
  const n = ac.createBufferSource();
  n.buffer = noiseBuffer(1.6, ac);
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(220, t);
  lp.frequency.exponentialRampToValueAtTime(2600, t + 0.9);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
  n.connect(lp).connect(g).connect(master);
  n.start(t); n.stop(t + 1.6);
}

/** barely-there room tone */
export function startAmbience() {
  if (!ac || !master || bed) return;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(4, ac);
  src.loop = true;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 320;
  const g = ac.createGain(); g.gain.value = 0.035;
  src.connect(lp).connect(g).connect(master);
  src.start();
  bed = src;
}

export function toggleMute() {
  muted = !muted;
  setMuted(muted);
  document.documentElement.dataset.muted = String(muted);
  if (master && ac) master.gain.setTargetAtTime(muted ? 0 : 0.6, ac.currentTime, 0.08);
  return muted;
}

export const audioMuted = () => muted;
