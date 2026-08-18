/** Boots the room and owns the single animation loop everything else ticks from. */
import { FRAMES, FIXTURES, CANVAS, placementFor, type FrameDef } from '../scene/composition';
import { light, media, room, on, hasLitBefore } from './state';
import { initStage, onFit, fit, measure } from './stage';
import { initFlashlight, pointTo, tickFlashlight, forceWake } from './flashlight';
import { initPull, tickPull, yank, retirePull, rearmPull } from './pull';
import { ignite, litInstantly, douse } from './lighting';
import { initCamera, enterFrame, warmArt, openFromReturn, resetCamera } from './camera';
import { initParallax, aimParallax, tickParallax } from './parallax';
import { initDust, startDust, tickDust } from './dust';
import { initAudio, unlockAudio, playClick, playIgnite, startAmbience, toggleMute } from './audio';

const q = <T extends Element>(sel: string) => document.querySelector(sel) as T;

export function bootRoom() {
  const roomEl = q<HTMLElement>('#room');
  const stage = q<HTMLElement>('#stage');
  const camera = q<HTMLElement>('#camera');
  const curtain = q<HTMLElement>('#curtain');
  const vec = q<SVGSVGElement>('#room-vec');
  const chandelier = q<SVGGElement>('#chandelier-group');
  const skip = q<HTMLButtonElement>('#skip');
  const muteBtn = q<HTMLButtonElement>('#mute');
  if (!stage) return;

  document.documentElement.dataset.phase = 'dark';
  document.documentElement.classList.toggle('is-coarse', media.coarse());

  initStage(stage);
  initFlashlight(q<HTMLCanvasElement>('#dark'));
  initDust(q<HTMLCanvasElement>('#dust'));
  initCamera(camera, curtain);
  initAudio();

  /* ---- frames: one DOM, coordinates swapped per composition ---- */
  const frames = FRAMES.map((def) => ({
    def,
    el: document.querySelector<HTMLElement>(`[data-frame-id="${def.id}"]`)!,
  })).filter((f) => f.el);

  function layoutFrames() {
    for (const { def, el } of frames) {
      const p = placementFor(def, fit.mode);
      if (!p) { el.hidden = true; continue; }
      el.hidden = false;
      el.style.left = p.x - p.w / 2 + 'px';
      el.style.top = p.y - p.h / 2 + 'px';
      el.style.width = p.w + 'px';
      el.style.height = p.h + 'px';
      el.style.setProperty('--rot', (p.rot ?? 0) + 'deg');
      el.dataset.cx = String(p.x);
      el.dataset.cy = String(p.y);
    }
  }

  onFit(() => {
    const c = CANVAS[fit.mode];
    vec.setAttribute('viewBox', `0 0 ${c.w} ${c.h}`);
    const ch = FIXTURES[fit.mode].chandelier;
    chandelier.setAttribute('transform', `translate(${ch.x} ${ch.y}) scale(${ch.scale})`);
    layoutFrames();
  });

  initPull({
    rope: q<SVGPathElement>('#pull-rope'),
    bob: q<SVGGElement>('#pull-bob'),
    hit: q<HTMLButtonElement>('#pull-hit'),
    glint: q<SVGGElement>('#pull-glint'),
  });
  initParallax(stage);

  /* ---- pointer ---- */
  const COARSE_LIFT = 80; // a fingertip covers exactly what it is meant to reveal
  const aim = (x: number, y: number) => {
    pointTo(x, media.coarse() ? y - COARSE_LIFT : y);
    aimParallax(x, y);
  };
  addEventListener('pointermove', (e) => aim(e.clientX, e.clientY), { passive: true });
  addEventListener('pointerdown', (e) => { unlockAudio(); aim(e.clientX, e.clientY); }, { passive: true });

  // Subscribe BEFORE deciding how the room opens: litInstantly() emits 'room:lit'
  // synchronously, so a listener registered afterwards never runs — which left
  // reduced-motion and returning visitors with a lit room whose frames were still
  // inert and unclickable.
  on('pull:click', () => playClick());
  on('pull:fire', () => { playIgnite(); ignite(); });
  const framesLayer = stage.querySelector<HTMLElement>('.layer--frames')!;
  framesLayer.inert = true; // nothing to tab into while the room is dark

  // one place decides whether the wall is live, so putting the light back out with
  // the brass key really does make the frames untouchable again
  on('phase', (p: string) => {
    const live = p === 'lit' || p === 'travelling';
    roomEl.dataset.lit = live ? '1' : '0';
    framesLayer.inert = !live;
  });

  on('room:lit', () => {
    roomEl.dataset.lit = '1';
    framesLayer.inert = false;
    startDust();
    startAmbience();
    if (!openFromReturn(frames)) resetCamera();
    skip?.remove();
    muteBtn?.removeAttribute('hidden');
  });

  /* ---- the ritual, or the sensible way around it ---- */
  const reduced = media.reducedMotion();
  const returning = hasLitBefore();

  if (reduced) {
    retirePull();
    forceWake();
    litInstantly(false);
  } else if (returning) {
    retirePull();
    litInstantly(true);
  }

  /* ---- escape routes: never trap anyone in a dark room ---- */
  const lightsOn = () => {
    if (room.phase !== 'dark') return;
    retirePull();
    litInstantly(true);
  };
  skip?.addEventListener('click', lightsOn);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightsOn();
  });
  // the skip affordance only surfaces once someone has plainly been standing still
  setTimeout(() => skip?.setAttribute('data-visible', '1'), 18000);

  /* ---- the wall ---- */
  for (const { def, el } of frames) {
    if (def.kind === 'nav') {
      el.addEventListener('pointerenter', () => warmArt(el));
      el.addEventListener('focus', () => warmArt(el));
      el.addEventListener('click', (e) => {
        if (room.phase !== 'lit') { e.preventDefault(); return; }
        if (e.metaKey || e.ctrlKey || e.shiftKey || (e as MouseEvent).button > 0) return;
        e.preventDefault();
        enterFrame(el, def);
      });
    } else if (def.id === 'orb-key') {
      el.addEventListener('click', () => {
        if (room.phase !== 'lit') return;
        douse(() => { rearmPull(); resetCamera(); });
      });
    }
  }

  muteBtn?.addEventListener('click', () => { unlockAudio(); toggleMute(); });

  /* ---- one loop ---- */
  let last = performance.now();
  let t = 0;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    tickFlashlight(dt);
    tickPull(dt);
    tickParallax(dt);
    tickDust(dt, t);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  measure();
}
