/** Shared room state, visit memory and environment queries. */

export type Phase = 'dark' | 'igniting' | 'lit' | 'travelling';

const LIT_KEY = 'room.lit.v1';
const MUTE_KEY = 'room.muted.v1';

export const media = {
  reducedMotion: () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  /** true for finger-driven devices, where a flashlight *hunt* is impossible:
   *  the finger covers exactly the spot the light reveals.
   *  Belt and braces — some emulators and hybrid laptops report only one of these,
   *  and guessing wrong here strands a mobile visitor in a black room. */
  coarse: () =>
    matchMedia('(hover: none) and (pointer: coarse)').matches ||
    matchMedia('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0,
};

const safe = <T>(fn: () => T, fallback: T): T => {
  try { return fn(); } catch { return fallback; }
};

/** Has this visitor already lit the room once? Second visits skip the ritual. */
export const hasLitBefore = () => safe(() => localStorage.getItem(LIT_KEY) === '1', false);
export const rememberLit = (v: boolean) =>
  safe(() => { v ? localStorage.setItem(LIT_KEY, '1') : localStorage.removeItem(LIT_KEY); }, undefined);

export const isMuted = () => safe(() => localStorage.getItem(MUTE_KEY) !== '0', true);
export const setMuted = (v: boolean) => safe(() => localStorage.setItem(MUTE_KEY, v ? '1' : '0'), undefined);

/** The light the whole room is rendered against. One object, mutated in place,
 *  read by the darkness renderer every frame. */
export const light = {
  /** smoothed centre, CSS px, viewport space */
  x: 0, y: 0,
  /** raw pointer target */
  tx: 0, ty: 0,
  /** 0 → 1 as the visitor's eyes "adjust"; driven by how far they've explored */
  wake: 0,
  /** base spot radius in px before breathing */
  radius: 46,
  /** opacity of the black fill covering the room */
  darkness: 1,
  /** how much of that darkness the spot removes at its centre */
  bite: 0.55,
  /** multiplier on the spot radius — ignition blows this up to swallow the screen */
  spread: 1,
  /** warm cast laid back over the revealed wall */
  warm: 0.055,
  /** 0 → 1, only meaningful once the room is lit */
  vignette: 0,
  /** 0 → 1 proximity to the pull; warms and widens the spot */
  prox: 0,
  /** while true the spot ignores the pointer — ignition is driving it */
  locked: false,
};

type Handler = (detail?: any) => void;
const bus = new Map<string, Set<Handler>>();
export const on = (evt: string, fn: Handler) => {
  if (!bus.has(evt)) bus.set(evt, new Set());
  bus.get(evt)!.add(fn);
  return () => bus.get(evt)!.delete(fn);
};
export const emit = (evt: string, detail?: any) => bus.get(evt)?.forEach((fn) => fn(detail));

export const room = {
  phase: 'dark' as Phase,
  setPhase(p: Phase) {
    if (this.phase === p) return;
    this.phase = p;
    document.documentElement.dataset.phase = p;
    emit('phase', p);
  },
};

/**
 * Framerate-independent exponential smoothing.
 *
 * The naive `cur += (target - cur) * k` runs twice as fast on a 120Hz display as
 * on a 60Hz one — the light would visibly lag differently on a MacBook Pro than
 * on an external monitor. Converting the per-frame factor into a time constant
 * fixes that for good.
 */
export const approach = (cur: number, target: number, tau: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-dt / tau));

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
