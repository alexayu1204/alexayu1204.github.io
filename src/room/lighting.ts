/**
 * Ignition.
 *
 * The room is never revealed by fading black to zero. Instead the spot the visitor
 * has been carrying *grows* — drifting toward the chandelier as it opens — until it
 * has swallowed the screen. Frames then fade in sorted by their distance from the
 * chandelier, so the light demonstrably arrives from the fixture rather than from
 * everywhere at once. That ordering is what sells the whole illusion, and it costs
 * one sort.
 */
import gsap from 'gsap';
import { light, room, emit, rememberLit } from './state';
import { fit, toScreen } from './stage';
import { FIXTURES } from '../scene/composition';
import { forceWake } from './flashlight';

let tl: gsap.core.Timeline | null = null;

const candles = () => Array.from(document.querySelectorAll<SVGGElement>('.candle'));
const frameEls = () => Array.from(document.querySelectorAll<HTMLElement>('.frame'));
const root = () => document.documentElement;

/** frames sorted by how far they sit from the chandelier, nearest first */
function framesByDistance() {
  const fx = FIXTURES[fit.mode].chandelier;
  return frameEls()
    .map((el) => {
      const x = +(el.dataset.cx || 0);
      const y = +(el.dataset.cy || 0);
      return { el, d: Math.hypot(x - fx.x, y - fx.y) };
    })
    .sort((a, b) => a.d - b.d)
    .map((o) => o.el);
}

export function ignite() {
  if (tl) return;
  room.setPhase('igniting');
  forceWake();

  // pull the spot toward the fixture as it opens, so the light has a source
  const c = toScreen(FIXTURES[fit.mode].chandelier.x, FIXTURES[fit.mode].chandelier.y + 90);
  light.locked = true;
  gsap.to(light, { tx: c.x, ty: c.y, duration: 1.1, ease: 'power2.inOut' });

  const cs = candles();
  tl = gsap.timeline({
    onComplete() {
      room.setPhase('lit');
      rememberLit(true);
      emit('room:lit');
      tl = null;
    },
  });

  // 120ms — the first filament stutters. Three uneven steps; a clean fade reads electric,
  // and this room is meant to read as candle-and-brass.
  if (cs[0]) {
    tl.to(cs[0], { duration: 0.05, '--flame': 0.35 }, 0.12)
      .to(cs[0], { duration: 0.07, '--flame': 0.10 }, 0.17)
      .to(cs[0], { duration: 0.12, '--flame': 0.62 }, 0.24)
      .to(cs[0], { duration: 0.45, '--flame': 1 }, 0.36);
  }
  // 180–420ms — the rest catch, unevenly. A perfectly even stagger reads mechanical.
  const order = [3, 1, 5, 2, 6, 4];
  order.forEach((idx, i) => {
    const el = cs[idx];
    if (!el) return;
    tl!.to(el, { duration: 0.5, '--flame': 1, ease: 'power2.out' }, 0.18 + i * 0.042 + (i % 2) * 0.012);
  });

  // 300–800ms — the halo blooms outward from the fixture
  tl.fromTo(root(), { '--bloom': 0 }, { duration: 0.5, '--bloom': 1, ease: 'power2.out' }, 0.3);

  // 500–1400ms — the spot swallows the screen. One continuous move, never a cut.
  tl.to(light, { duration: 0.9, spread: 15, bite: 1, ease: 'power3.inOut' }, 0.5)
    .to(light, { duration: 0.85, darkness: 0.1, ease: 'power2.inOut' }, 0.55)
    .to(light, { duration: 0.7, warm: 0.02, ease: 'power1.out' }, 0.6);

  // 900–1800ms — the room gains exposure, and the vignette closes in gently
  tl.fromTo(root(), { '--exposure': 0 }, { duration: 0.9, '--exposure': 1, ease: 'power2.inOut' }, 0.9)
    .to(light, { duration: 0.9, vignette: 0.38, ease: 'power2.inOut' }, 0.9);

  // 1500–2200ms — frames arrive nearest-the-light first
  framesByDistance().forEach((el, i) => {
    tl!.to(el, { duration: 0.5, opacity: 1, ease: 'power2.out' }, 1.5 + i * 0.04);
  });

  tl.call(() => { light.locked = false; }, undefined, 1.4);
  tl.to({}, { duration: 0.1 }, 2.2);
}

/** Second visit, or reduced motion: the room is simply already lit. */
export function litInstantly(fade = true) {
  forceWake();
  root().style.setProperty('--bloom', '1');
  root().style.setProperty('--exposure', '1');
  light.locked = true;
  light.tx = light.x = fit.vw / 2;
  light.ty = light.y = fit.vh / 2;
  const LIT = { spread: 15, bite: 1, darkness: 0.1, warm: 0.02, vignette: 0.38 };
  if (fade) {
    // a returning visitor gets the room warming up around them, not a hard cut
    candles().forEach((el, i) =>
      gsap.to(el, { duration: 0.35, '--flame': 1, ease: 'power2.out', delay: i * 0.03 }));
    gsap.to(light, { ...LIT, duration: 0.6, ease: 'power2.inOut' });
  } else {
    candles().forEach((el) => el.style.setProperty('--flame', '1'));
    Object.assign(light, LIT);
  }
  frameEls().forEach((el) => {
    if (!fade) { el.style.opacity = '1'; return; }
    gsap.to(el, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 });
  });
  room.setPhase('lit');
  rememberLit(true);
  emit('room:lit');
}

/** The brass key on the wall: put the light back out and let them do it again. */
export function douse(onDone?: () => void) {
  if (room.phase !== 'lit') return;
  room.setPhase('igniting');
  rememberLit(false);
  const t = gsap.timeline({
    onComplete() {
      room.setPhase('dark');
      light.locked = false;
      onDone?.();
    },
  });
  candles().forEach((el, i) =>
    t.to(el, { duration: 0.18, '--flame': 0, ease: 'power2.in' }, i * 0.035)
  );
  t.to(root(), { duration: 0.4, '--bloom': 0, ease: 'power2.in' }, 0.1)
    .to(root(), { duration: 0.5, '--exposure': 0, ease: 'power2.in' }, 0.15)
    .to(light, { duration: 0.7, spread: 1, bite: 0.89, darkness: 1, warm: 0.055, vignette: 0, ease: 'power3.inOut' }, 0.2);
  document.querySelectorAll<HTMLElement>('.frame').forEach((el) =>
    t.to(el, { duration: 0.3, opacity: 0, ease: 'power1.in' }, 0.1)
  );
}
