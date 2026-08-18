/**
 * Entering a painting.
 *
 * Not a route change with a fade. The camera dollies into the frame until its edge
 * leaves the viewport, and only then does the page underneath swap — behind a
 * curtain already painted the colour of the room you are arriving in, so there is
 * never a white flash and never a visible cut.
 */
import gsap from 'gsap';
import { room, media, emit, light } from './state';
import { fit, toScreen } from './stage';
import type { FrameDef } from '../scene/composition';
import { placementFor } from '../scene/composition';

const RETURN_KEY = 'room.return';

let cameraEl: HTMLElement;
let curtainEl: HTMLElement;

export function initCamera(camera: HTMLElement, curtain: HTMLElement) {
  cameraEl = camera;
  curtainEl = curtain;
}

function targetTransform(def: FrameDef) {
  const p = placementFor(def, fit.mode)!;
  const s = toScreen(p.x, p.y);
  const w = p.w * fit.scale;
  const h = p.h * fit.scale;
  // fill ~92% of the smaller viewport dimension — close enough to feel like arrival,
  // not so close that the frame's own texture turns to mush
  const z = 0.92 * Math.min(fit.vw / w, fit.vh / h);
  return { x: fit.vw / 2 - z * s.x, y: fit.vh / 2 - z * s.y, z };
}

/** Preloaded on hover, so the sharp version is warm by the time they commit. */
export function warmArt(el: HTMLElement) {
  const hi = el.dataset.hi;
  if (!hi || el.dataset.warm === '1') return;
  el.dataset.warm = '1';
  const img = new Image();
  img.decoding = 'async';
  img.src = hi;
}

export function enterFrame(el: HTMLElement, def: FrameDef) {
  if (room.phase === 'travelling') return;
  room.setPhase('travelling');
  light.locked = true; // the spot must not chase the cursor through the move
  emit('camera:enter', def.id);
  try { sessionStorage.setItem(RETURN_KEY, def.id); } catch {}

  const href = def.href!;

  if (media.reducedMotion()) {
    curtainEl.style.transition = 'opacity 160ms linear';
    curtainEl.style.opacity = '1';
    setTimeout(() => location.assign(href), 170);
    return;
  }

  const t = targetTransform(def);
  el.classList.add('is-entering');
  document.documentElement.classList.add('is-travelling');

  gsap.timeline({ onComplete: () => location.assign(href) })
    .to(cameraEl, {
      duration: 1.05,
      x: t.x, y: t.y, scale: t.z,
      ease: 'power3.inOut',
    }, 0.08)
    // the frame's interior begins dissolving into the room it leads to, before the
    // move finishes — so the two spaces overlap rather than butt against each other
    .to(curtainEl, { duration: 0.44, opacity: 1, ease: 'power2.in' }, 0.66)
    // hold on a fully-opaque curtain for a beat before swapping documents; without
    // the margin the navigation can land a frame early and show a cut
    .to({}, { duration: 0.14 });
}

/**
 * Arriving back at the wall from a section: start inside the frame they left by and
 * pull out, so the round trip is one continuous move rather than two unrelated ones.
 */
export function openFromReturn(frames: { el: HTMLElement; def: FrameDef }[]) {
  let id: string | null = null;
  try { id = sessionStorage.getItem(RETURN_KEY); sessionStorage.removeItem(RETURN_KEY); } catch {}
  if (!id || media.reducedMotion()) return false;
  const hit = frames.find((f) => f.def.id === id);
  if (!hit) return false;

  const t = targetTransform(hit.def);
  gsap.set(cameraEl, { x: t.x, y: t.y, scale: t.z });
  gsap.set(curtainEl, { opacity: 1 });
  document.documentElement.classList.add('is-travelling');
  gsap.timeline({ onComplete: () => document.documentElement.classList.remove('is-travelling') })
    .to(curtainEl, { duration: 0.45, opacity: 0, ease: 'power2.out' }, 0)
    .to(cameraEl, { duration: 1.0, x: 0, y: 0, scale: 1, ease: 'power3.inOut' }, 0.1);
  return true;
}

export function resetCamera() {
  gsap.set(cameraEl, { x: 0, y: 0, scale: 1 });
  gsap.set(curtainEl, { opacity: 0 });
  document.documentElement.classList.remove('is-travelling');
}
