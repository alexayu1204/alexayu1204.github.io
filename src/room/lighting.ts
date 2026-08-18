/**
 * Ignition.
 *
 * The room is never revealed by fading black to zero. Instead the spot the visitor
 * has been carrying *grows* — drifting toward the chandelier as it opens — until it
 * has swallowed the screen, and the pictures come up with it.
 */
import gsap from 'gsap';
import { light, room, emit, rememberLit } from './state';
import { fit, toScreen } from './stage';
import { FIXTURES } from '../scene/composition';
import { forceWake } from './flashlight';

let tl: gsap.core.Timeline | null = null;

const bulbs = () => Array.from(document.querySelectorAll<SVGGElement>('.bulb'));
const frameEls = () => Array.from(document.querySelectorAll<HTMLElement>('.frame'));
const root = () => document.documentElement;

export function ignite() {
  if (tl) return;
  room.setPhase('igniting');
  forceWake();

  // pull the spot toward the fixture as it opens, so the light has a source
  const c = toScreen(FIXTURES[fit.mode].chandelier.x, FIXTURES[fit.mode].chandelier.y + 90);
  light.locked = true;
  gsap.to(light, { tx: c.x, ty: c.y, duration: 1.1, ease: 'power2.inOut' });

  const cs = bulbs();
  tl = gsap.timeline({
    onComplete() {
      room.setPhase('lit');
      rememberLit(true);
      emit('room:lit');
      tl = null;
    },
  });

  // 120ms — the first filament stutters up. A clean fade reads like a dimmer;
  // an old filament on a mechanical switch does not come up evenly.
  if (cs[0]) {
    tl.to(cs[0], { duration: 0.05, '--glow': 0.35 }, 0.12)
      .to(cs[0], { duration: 0.07, '--glow': 0.10 }, 0.17)
      .to(cs[0], { duration: 0.12, '--glow': 0.62 }, 0.24)
      .to(cs[0], { duration: 0.45, '--glow': 1 }, 0.36);
  }
  // 180–420ms — the rest come up, unevenly: one switch, six ageing filaments.
  const order = [3, 1, 5, 2, 6, 4];
  order.forEach((idx, i) => {
    const el = cs[idx];
    if (!el) return;
    tl!.to(el, { duration: 0.5, '--glow': 1, ease: 'power2.out' }, 0.18 + i * 0.042 + (i % 2) * 0.012);
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

  // 800–1600ms — the pictures come up TOGETHER, with the light, not one after
  // another. They are what the room is for; parading them in sequence made the
  // reveal about the animation instead of about the wall.
  tl.to(frameEls(), { duration: 0.8, opacity: 1, ease: 'power2.out' }, 0.8);

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
    bulbs().forEach((el, i) =>
      gsap.to(el, { duration: 0.35, '--glow': 1, ease: 'power2.out', delay: i * 0.03 }));
    gsap.to(light, { ...LIT, duration: 0.6, ease: 'power2.inOut' });
  } else {
    bulbs().forEach((el) => el.style.setProperty('--glow', '1'));
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
  bulbs().forEach((el, i) =>
    t.to(el, { duration: 0.18, '--glow': 0, ease: 'power2.in' }, i * 0.035)
  );
  t.to(root(), { duration: 0.4, '--bloom': 0, ease: 'power2.in' }, 0.1)
    .to(root(), { duration: 0.5, '--exposure': 0, ease: 'power2.in' }, 0.15)
    .to(light, { duration: 0.7, spread: 1, bite: 0.89, darkness: 1, warm: 0.055, vignette: 0, ease: 'power3.inOut' }, 0.2);
  document.querySelectorAll<HTMLElement>('.frame').forEach((el) =>
    t.to(el, { duration: 0.3, opacity: 0, ease: 'power1.in' }, 0.1)
  );
}
