/**
 * A breath of depth between the wall, the frames, the fixture and the foreground
 * shadow. Clamped hard — this is a 2D illustrated world that leans, not a 3D scene.
 */
import { approach, clamp, media, room } from './state';
import { fit } from './stage';

interface Layer { el: HTMLElement; depth: number; x: number; y: number }
let layers: Layer[] = [];
let tx = 0, ty = 0;

export function initParallax(root: ParentNode) {
  if (media.reducedMotion()) return;
  layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
    el, depth: parseFloat(el.dataset.depth || '0'), x: 0, y: 0,
  }));
}

export function aimParallax(px: number, py: number) {
  tx = clamp((px / fit.vw - 0.5) * 2, -1, 1);
  ty = clamp((py / fit.vh - 0.5) * 2, -1, 1);
}

const MAX_PX = 10;

export function tickParallax(dt: number) {
  if (room.phase === 'travelling') return;
  for (const l of layers) {
    const gx = -tx * MAX_PX * l.depth;
    const gy = -ty * MAX_PX * l.depth;
    l.x = approach(l.x, gx, 0.22, dt);
    l.y = approach(l.y, gy, 0.22, dt);
    l.el.style.transform = `translate3d(${l.x.toFixed(2)}px, ${l.y.toFixed(2)}px, 0)`;
  }
}
