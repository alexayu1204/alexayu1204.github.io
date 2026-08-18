/**
 * The darkness, and the hole the visitor carries through it.
 *
 * Implemented as one downscaled canvas laid over the room. The room underneath is
 * always rendered fully lit; this layer alone decides what is visible and how warm
 * it looks. That is what lets ignition be *the spot growing until it swallows the
 * screen* rather than a cross-fade — one continuous shot, no cut.
 *
 * Per frame: fill black → punch a feathered hole (destination-out) → lay a warm
 * cast back over the revealed wall → vignette. Four gradient fills on a canvas at
 * 0.6× resolution: ~0.4M pixels, comfortably inside a 16ms budget.
 */
import { light, approach, clamp } from './state';

let cvs: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let RES = 0.6;
let w = 0, h = 0;
let t = 0;

export function initFlashlight(canvas: HTMLCanvasElement) {
  cvs = canvas;
  ctx = canvas.getContext('2d', { alpha: true })!;
  resize();
  addEventListener('resize', resize, { passive: true });

  light.x = light.tx = innerWidth / 2;
  light.y = light.ty = innerHeight / 2;
}

function resize() {
  // a blurry gradient does not need device pixels; grain on top hides the banding
  RES = innerWidth < 700 ? 0.75 : 0.6;
  w = Math.round(innerWidth * RES);
  h = Math.round(innerHeight * RES);
  cvs.width = w;
  cvs.height = h;
  cvs.style.width = innerWidth + 'px';
  cvs.style.height = innerHeight + 'px';
}

/** total pointer travel, used to let the visitor's eyes "adjust" as they explore */
let travelled = 0;

export function pointTo(x: number, y: number) {
  if (light.locked) return;
  travelled += Math.hypot(x - light.tx, y - light.ty);
  light.tx = x;
  light.ty = y;
}

export function tickFlashlight(dt: number) {
  t += dt;

  // The spot lags the cursor by a hair — enough to feel like it has weight,
  // not enough to feel broken. 85ms time constant.
  light.x = approach(light.x, light.tx, 0.085, dt);
  light.y = approach(light.y, light.ty, 0.085, dt);

  // eyes adjusting: the spot opens up over the first ~600px of exploration
  const wakeTarget = clamp(travelled / 600, 0, 1);
  light.wake = approach(light.wake, wakeTarget, 0.65, dt);

  render();
}

function render() {
  if (!ctx) return;
  const ease = light.wake * light.wake * (3 - 2 * light.wake); // smoothstep

  // Two incommensurable frequencies, never random jitter: the edge breathes like a
  // flame instead of buzzing like noise.
  const breathe = 1 + 0.018 * Math.sin(t * 0.9) + 0.012 * Math.sin(t * 2.3);
  const driftX = 1.4 * Math.sin(t * 0.61);
  const driftY = 1.1 * Math.sin(t * 0.83 + 1.7);

  const base = (46 + 150 * ease + 26 * light.prox) * breathe;
  const r = Math.max(2, base * light.spread) * RES;
  const cx = (light.x + driftX) * RES;
  const cy = (light.y + driftY) * RES;
  const bite = clamp(light.bite + 0.34 * ease, 0, 1);

  ctx.clearRect(0, 0, w, h);

  // 1 — the dark
  if (light.darkness > 0.001) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(9, 6, 12, ${light.darkness})`;
    ctx.fillRect(0, 0, w, h);
  }

  // 2 — punch the spot, softly. Five stops make a feathered falloff that reads as
  //     lamplight rather than a stencil.
  if (light.darkness > 0.001 && bite > 0.001) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0.0, `rgba(0,0,0,${bite})`);
    g.addColorStop(0.42, `rgba(0,0,0,${bite * 0.94})`);
    g.addColorStop(0.66, `rgba(0,0,0,${bite * 0.66})`);
    g.addColorStop(0.84, `rgba(0,0,0,${bite * 0.28})`);
    g.addColorStop(1.0, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // 3 — warm the revealed wall. Candle amber, and warmer still near the pull.
  const warmA = light.warm + 0.085 * light.prox;
  if (warmA > 0.002) {
    const rw = r * 1.22;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rw);
    g.addColorStop(0.0, `rgba(236, 186, 120, ${warmA})`);
    g.addColorStop(0.55, `rgba(226, 158, 104, ${warmA * 0.5})`);
    g.addColorStop(1.0, 'rgba(200, 130, 90, 0)');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g;
    ctx.fillRect(cx - rw, cy - rw, rw * 2, rw * 2);
  }

  // 4 — vignette, once there is light for it to eat into
  if (light.vignette > 0.002) {
    const vx = w / 2, vy = h / 2;
    const vr = Math.hypot(w, h) * 0.62;
    const g = ctx.createRadialGradient(vx, vy, vr * 0.42, vx, vy, vr);
    g.addColorStop(0, 'rgba(12, 7, 14, 0)');
    g.addColorStop(0.7, `rgba(12, 7, 14, ${light.vignette * 0.36})`);
    g.addColorStop(1, `rgba(9, 5, 11, ${light.vignette})`);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

/** Skip the "eyes adjusting" ramp — used on reduced-motion and second visits. */
export function forceWake() {
  travelled = 900;
  light.wake = 1;
}
