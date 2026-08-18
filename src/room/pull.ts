/**
 * The light pull: a real drag with real resistance.
 *
 * Extension is not linear in pointer travel — it stiffens asymptotically, and it
 * *catches* just before the trigger, so the mechanism announces itself through the
 * hand rather than through a tooltip. Release runs an underdamped spring, so the
 * cord returns with one or two decaying overshoots instead of snapping.
 *
 * Drag is the best affordance but never the only one: a plain click, Enter or Space
 * on the focused button, and a downward wheel gesture over the cord all work. A
 * black room you can only escape by discovering a drag is a trap.
 */
import { light, approach, clamp, emit, room } from './state';
import { fit, toScreen, onFit } from './stage';
import { FIXTURES } from '../scene/composition';

const MAX = 132;          // canvas px of travel at full stretch
const TRIGGER = 0.62;     // fraction of MAX that fires the mechanism
const CATCH0 = 0.46;      // the resistance band
const CATCH1 = 0.62;

let rope: SVGPathElement;
let bob: SVGGElement;
let hit: HTMLButtonElement;
let glint: SVGGElement;

let anchorX = 150, restLen = 470, bobScale = 1;
let ext = 0;            // current visual extension, canvas px
let vel = 0;            // spring velocity
let dragging = false;
let armed = false;      // trigger has been crossed this pull
let fired = false;      // the room has been lit; the pull is spent
let startPointerY = 0;
let startExt = 0;
let auto: { from: number; to: number; t: number; dur: number } | null = null;
let glintTimer = 0;
let interacted = false;

/** asymptotic stiffening — pulling twice as far does not extend twice as much */
const stretch = (raw: number) => 1 - Math.exp(-Math.max(0, raw) / 95);

/** compresses progress through the catch band so the trigger has to be *worked* past */
function gate(n: number) {
  if (n <= CATCH0 || n >= CATCH1) return n;
  const k = (n - CATCH0) / (CATCH1 - CATCH0);
  return CATCH0 + (CATCH1 - CATCH0) * k * k * k;
}

export function initPull(els: {
  rope: SVGPathElement; bob: SVGGElement; hit: HTMLButtonElement; glint: SVGGElement;
}) {
  ({ rope, bob, hit, glint } = els);

  onFit(() => {
    const f = FIXTURES[fit.mode].pull;
    anchorX = f.x;
    restLen = f.length;
    bobScale = f.scale;
    // the rope's gradient is in user space, so it has to follow the anchor —
    // left pinned to the wide anchor it renders as a flat edge colour on narrow
    const g = document.getElementById('ropeG');
    g?.setAttribute('x1', String(anchorX - 5));
    g?.setAttribute('x2', String(anchorX + 5));
    for (const el of [rope, document.getElementById('pull-rope-twist')]) {
      (el as SVGElement | null)?.setAttribute('stroke-width',
        el === rope ? String(9 * bobScale) : String(3 * bobScale));
    }
    layoutHit();
  });

  hit.addEventListener('pointerdown', onDown);
  hit.addEventListener('keydown', (e) => {
    if (fired) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      yank();
    }
  });
  addEventListener('wheel', onWheel, { passive: false });
}

function onDown(e: PointerEvent) {
  if (fired) return;
  e.preventDefault();
  interacted = true;
  dragging = true;
  auto = null;
  startPointerY = e.clientY;
  startExt = ext;
  try { hit.setPointerCapture(e.pointerId); } catch {} // synthetic events have no capture id
  hit.addEventListener('pointermove', onMove);
  hit.addEventListener('pointerup', onUp);
  hit.addEventListener('pointercancel', onUp);
  document.documentElement.classList.add('is-pulling');
}

function onMove(e: PointerEvent) {
  if (!dragging) return;
  const rawScreen = e.clientY - startPointerY;
  const raw = rawScreen / fit.scale + startExt; // screen px → canvas px
  const n = gate(stretch(raw));
  const next = MAX * n;
  vel = (next - ext) * 60;
  ext = next;
  checkTrigger();
}

function onUp() {
  if (!dragging) return;
  dragging = false;
  hit.removeEventListener('pointermove', onMove);
  hit.removeEventListener('pointerup', onUp);
  hit.removeEventListener('pointercancel', onUp);
  document.documentElement.classList.remove('is-pulling');
  release();
}

/** A trackpad user's first instinct over a hanging cord is to scroll down it. */
function onWheel(e: WheelEvent) {
  if (fired || dragging || light.prox < 0.35) return;
  e.preventDefault();
  interacted = true;
  auto = null;
  const raw = -Math.log(1 - clamp(ext / MAX, 0, 0.985)) * 95; // invert the stretch curve
  const n = gate(stretch(raw + e.deltaY * 0.55));
  ext = MAX * n;
  checkTrigger();
  clearTimeout(wheelIdle);
  wheelIdle = setTimeout(release, 130) as unknown as number;
}
let wheelIdle = 0;

function checkTrigger() {
  if (armed || ext < MAX * TRIGGER) return;
  armed = true;
  emit('pull:click');
  navigator.vibrate?.(8);
}

function release() {
  if (fired) return;
  if (armed) {
    fired = true;
    // Ignition fires on *release*, not on the trigger crossing, so the returning
    // cord and the waking light read as cause and effect.
    setTimeout(() => emit('pull:fire'), 60);
    hit.disabled = true;
    hit.setAttribute('aria-hidden', 'true');
  }
}

/** click, Enter/Space, or the skip path — plays the same gesture on the user's behalf */
export function yank() {
  if (fired || auto) return;
  interacted = true;
  auto = { from: ext, to: MAX * 0.78, t: 0, dur: 0.38 };
}

export function tickPull(dt: number) {
  if (auto) {
    auto.t += dt;
    const k = clamp(auto.t / auto.dur, 0, 1);
    const e = 1 - Math.pow(1 - k, 3);
    ext = auto.from + (auto.to - auto.from) * e;
    checkTrigger();
    if (k >= 1) { auto = null; release(); }
  } else if (!dragging) {
    // underdamped spring home: ζ ≈ 0.5, so it overshoots once or twice and settles
    const k = 170, c = 13;
    vel += (-k * ext - c * vel) * dt;
    ext += vel * dt;
    if (Math.abs(ext) < 0.05 && Math.abs(vel) < 0.4) { ext = 0; vel = 0; }
  }

  // proximity: warms and widens the spot as the visitor nears the cord. This is the
  // real teaching mechanism — a hot/cold gradient, discovered rather than announced.
  const bobScreen = toScreen(anchorX, restLen + ext);
  const d = Math.hypot(light.x - bobScreen.x, light.y - bobScreen.y);
  const target = fired ? 0 : clamp(1 - d / 260, 0, 1);
  light.prox = approach(light.prox, target, 0.12, dt);

  // after ~10s of no contact the cord catches its own highlight, unprompted
  if (!interacted && !fired && room.phase === 'dark') {
    glintTimer += dt;
    const DELAY = 10, SWEEP = 1.6, CYCLE = 9;
    if (glintTimer > DELAY) {
      const k = ((glintTimer - DELAY) % CYCLE) / SWEEP; // 0→1 across one travel
      if (k <= 1) {
        glint.style.setProperty('--glint', k.toFixed(3));
        glint.style.opacity = (Math.sin(k * Math.PI) * 0.85).toFixed(3);
      } else if (glint.style.opacity !== '0') glint.style.opacity = '0';
    }
  } else if (glint.style.opacity !== '0') {
    glint.style.opacity = '0';
  }

  draw();
}

function draw() {
  const sway = clamp(-vel * 0.012, -7, 7);
  const tipY = restLen + ext;
  const midY = restLen * 0.55;
  rope.setAttribute('d', `M ${anchorX} -6 Q ${anchorX + sway * 1.5} ${midY} ${anchorX + sway} ${tipY}`);
  bob.setAttribute('transform', `translate(${anchorX + sway} ${tipY}) rotate(${sway * 0.35}) scale(${bobScale})`);
  layoutHit();
}

function layoutHit() {
  if (!hit) return;
  const p = toScreen(anchorX, restLen + ext);
  const s = fit.scale * bobScale;
  // never smaller than a fingertip, however far the room has scaled down
  const w = Math.max(56, 60 * s);
  const h = Math.max(132, 148 * s);
  hit.style.left = p.x - w / 2 + 'px';
  hit.style.top = p.y - 14 * s + 'px';
  hit.style.width = w + 'px';
  hit.style.height = h + 'px';
}

/** reduced-motion and second visits don't make anyone find a cord in the dark */
export function retirePull() {
  fired = true;
  hit.disabled = true;
  hit.setAttribute('aria-hidden', 'true');
}

/** the brass key put the light out — make the cord live again */
export function rearmPull() {
  fired = false;
  armed = false;
  ext = 0;
  vel = 0;
  auto = null;
  glintTimer = 0;
  interacted = false;
  hit.disabled = false;
  hit.removeAttribute('aria-hidden');
}

export const pullSpent = () => fired;
