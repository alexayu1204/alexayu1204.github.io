/**
 * Maps the fixed design canvas onto whatever viewport we were given.
 *
 * Two nested transforms so they never fight each other:
 *   .camera  — the dolly (screen space).  Identity while looking at the whole wall.
 *   .stage   — the cover-fit of the canvas into the viewport.
 */
import { CANVAS, NARROW_ASPECT } from '../scene/composition';

export type Mode = 'wide' | 'narrow';

export const fit = {
  mode: 'wide' as Mode,
  scale: 1,
  tx: 0,
  ty: 0,
  vw: 0,
  vh: 0,
};

let stageEl: HTMLElement;
let stageEls: HTMLElement[] = [];
const listeners = new Set<(f: typeof fit) => void>();

export function initStage(el: HTMLElement) {
  stageEl = el;
  stageEls = Array.from(document.querySelectorAll<HTMLElement>('.stage'));
  measure();
  addEventListener('resize', measure, { passive: true });
  addEventListener('orientationchange', () => setTimeout(measure, 260), { passive: true });
}

export function onFit(fn: (f: typeof fit) => void) {
  listeners.add(fn);
  fn(fit);
  return () => listeners.delete(fn);
}

export function measure() {
  const vw = innerWidth;
  const vh = innerHeight;
  const mode: Mode = vw / vh < NARROW_ASPECT ? 'narrow' : 'wide';
  const c = CANVAS[mode];

  // CONTAIN, not cover.
  //
  // Cover crops the sides, and at aspect ratios between roughly 1.35 and 1.6 it
  // crops far enough to push the pull clean off the left edge — a visitor on a
  // 16:10 laptop would be locked in a black room with nothing to find. Contain
  // guarantees that every placement the composition validator approved is actually
  // on screen at every aspect ratio.
  //
  // The leftover viewport is not letterboxing: the wall, ceiling and floor are laid
  // out in screen space and simply extend to fill it, so a shorter canvas just reads
  // as a taller room.
  const scale = Math.min(vw / c.w, vh / c.h);
  fit.mode = mode;
  fit.scale = scale;
  fit.tx = (vw - c.w * scale) / 2;
  fit.ty = (vh - c.h * scale) / 2;
  fit.vw = vw;
  fit.vh = vh;

  if (stageEl) {
    for (const el of stageEls) {
      el.style.width = c.w + 'px';
      el.style.height = c.h + 'px';
      el.style.transform = `translate3d(${fit.tx}px, ${fit.ty}px, 0) scale(${scale})`;
    }
    // the wall dresses itself from these: it lives in screen space so it can always
    // reach the viewport edges, but its mouldings sit at the canvas's own boundaries
    const r = document.documentElement.style;
    r.setProperty('--fit-scale', String(scale));
    r.setProperty('--canvas-top', fit.ty + 'px');
    r.setProperty('--canvas-bottom', (fit.ty + c.h * scale) + 'px');
    r.setProperty('--cornice-h', 74 * scale + 'px');
    r.setProperty('--dado-top', (fit.ty + 886 * scale) + 'px');
    r.setProperty('--halo-x', (fit.tx + FIXTURE_X[mode] * scale) + 'px');
    r.setProperty('--halo-y', (fit.ty + FIXTURE_Y[mode] * scale) + 'px');
  }
  document.documentElement.dataset.wall = mode;
  listeners.forEach((fn) => fn(fit));
}

const FIXTURE_X = { wide: 998, narrow: 596 } as const;
const FIXTURE_Y = { wide: 252, narrow: 262 } as const;

/** canvas px → viewport px (ignoring the camera dolly, which is identity at the wall) */
export const toScreen = (x: number, y: number) => ({
  x: fit.tx + x * fit.scale,
  y: fit.ty + y * fit.scale,
});

export const canvasSize = () => CANVAS[fit.mode];
