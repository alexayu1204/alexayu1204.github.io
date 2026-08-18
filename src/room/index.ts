/** Boots the room and owns the single animation loop everything else ticks from. */
import { FRAMES, FIXTURES, CANVAS, RESERVED, placementFor, type FrameDef } from '../scene/composition';
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

  /**
   * Wall labels choose their own side.
   *
   * Hanging every plaque under its picture guarantees that somewhere on a wall
   * this dense it will touch a neighbour — and hand-picking a side per frame
   * breaks the next time the composition moves. So test the candidate positions
   * against the actual geometry and take the first that clears everything with
   * room to spare. Deterministic: frames don't move, so this runs once per fit.
   */
  function placeLabels() {
    const mode = fit.mode;
    const c = CANVAS[mode];
    const R = RESERVED[mode];
    const CLEAR = 16;  // canvas px of empty wall demanded around a plaque
    const GAP = 14;    // its own offset from the frame it belongs to

    const boxes = frames
      .map(({ def }) => ({ id: def.id, p: placementFor(def, mode) }))
      .filter((b) => b.p)
      .map(({ id, p }) => ({
        id, x0: p!.x - p!.w / 2, x1: p!.x + p!.w / 2, y0: p!.y - p!.h / 2, y1: p!.y + p!.h / 2,
      }));

    for (const { def, el } of frames) {
      if (def.kind !== 'nav') continue;
      const label = el.querySelector<HTMLElement>('.frame__label');
      const p = placementFor(def, mode);
      if (!label || !p) continue;

      label.style.removeProperty('--lx');
      label.style.removeProperty('--ly');
      const lw = label.offsetWidth || 120;
      const lh = label.offsetHeight || 30;
      const hw = p.w / 2, hh = p.h / 2;

      const candidates = [
        { x: p.x - lw / 2,      y: p.y + hh + GAP },
        { x: p.x - lw / 2,      y: p.y - hh - GAP - lh },
        { x: p.x + hw + GAP,    y: p.y - lh / 2 },
        { x: p.x - hw - GAP - lw, y: p.y - lh / 2 },
        { x: p.x - hw,          y: p.y + hh + GAP },
        { x: p.x + hw - lw,     y: p.y + hh + GAP },
        { x: p.x - hw,          y: p.y - hh - GAP - lh },
        { x: p.x + hw - lw,     y: p.y - hh - GAP - lh },
      ];

      // area of `r` that lands on something it shouldn't; 0 means genuinely clear
      const penalty = (cand: { x: number; y: number }, clear: number) => {
        const r = { x0: cand.x - clear, x1: cand.x + lw + clear, y0: cand.y - clear, y1: cand.y + lh + clear };
        let bad = 0;
        if (r.x0 < R.pullGutter.x1) bad += (R.pullGutter.x1 - r.x0) * lh * 4;
        if (r.x1 > c.w - 8) bad += (r.x1 - c.w + 8) * lh * 4;
        if (r.y1 > R.wainscot.y0) bad += (r.y1 - R.wainscot.y0) * lw * 4;
        if (r.y0 < 84) bad += (84 - r.y0) * lw * 4;
        // The chandelier's *drawn* extent, not the composition's generous reserve —
        // that reserve exists to keep pictures off the fixture, and applying it to a
        // small plaque rules out space the fixture never actually occupies.
        const e = R.chandelier, rx = e.rx * 0.82, ry = e.ry * 0.62;
        const nx = Math.max(r.x0, Math.min(e.cx, r.x1));
        const ny = Math.max(r.y0, Math.min(e.cy, r.y1));
        if (((nx - e.cx) / rx) ** 2 + ((ny - e.cy) / ry) ** 2 < 1) bad += lw * lh;
        for (const b of boxes) {
          if (b.id === def.id) continue;
          const ox = Math.min(r.x1, b.x1) - Math.max(r.x0, b.x0);
          const oy = Math.min(r.y1, b.y1) - Math.max(r.y0, b.y0);
          if (ox > 0 && oy > 0) bad += ox * oy;
        }
        return bad;
      };

      // strict first; if nothing clears with room to spare, relax the demanded
      // margin before ever accepting an actual collision
      let pick = candidates[0];
      let best = Infinity;
      for (const clear of [CLEAR, 8, 3]) {
        const hit = candidates.find((cand) => penalty(cand, clear) === 0);
        if (hit) { pick = hit; best = 0; break; }
        for (const cand of candidates) {
          const score = penalty(cand, clear);
          if (score < best) { best = score; pick = cand; }
        }
      }

      label.style.setProperty('--lx', (pick.x - (p.x - hw)).toFixed(1) + 'px');
      label.style.setProperty('--ly', (pick.y - (p.y - hh)).toFixed(1) + 'px');
    }
  }

  onFit(() => {
    const c = CANVAS[fit.mode];
    vec.setAttribute('viewBox', `0 0 ${c.w} ${c.h}`);
    const ch = FIXTURES[fit.mode].chandelier;
    chandelier.setAttribute('transform', `translate(${ch.x} ${ch.y}) scale(${ch.scale})`);
    layoutFrames();
    placeLabels();
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
  // re-measure once layout has certainly settled — plaque widths depend on it
  requestAnimationFrame(() => placeLabels());
}
