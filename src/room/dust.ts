/** Motes in the lamplight. Only once there is lamplight to hang in. */
let cvs: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let motes: { x: number; y: number; r: number; vx: number; vy: number; a: number; p: number }[] = [];
let on = false;

export function initDust(canvas: HTMLCanvasElement) {
  cvs = canvas;
  ctx = canvas.getContext('2d');
  size();
  addEventListener('resize', size, { passive: true });
}

function size() {
  if (!cvs) return;
  cvs.width = Math.round(innerWidth * 0.5);
  cvs.height = Math.round(innerHeight * 0.5);
  cvs.style.width = innerWidth + 'px';
  cvs.style.height = innerHeight + 'px';
}

export function startDust(count = 44) {
  if (!cvs) return;
  const seed = (i: number) => (Math.sin(i * 12.9898) * 43758.5453) % 1;
  motes = Array.from({ length: count }, (_, i) => ({
    x: Math.abs(seed(i + 1)) * cvs!.width,
    y: Math.abs(seed(i + 31)) * cvs!.height,
    r: 0.5 + Math.abs(seed(i + 7)) * 1.2,
    vx: (Math.abs(seed(i + 13)) - 0.5) * 5,
    vy: -2 - Math.abs(seed(i + 19)) * 5,
    a: 0.12 + Math.abs(seed(i + 23)) * 0.3,
    p: Math.abs(seed(i + 29)) * 6.28,
  }));
  on = true;
}

export function tickDust(dt: number, t: number) {
  if (!on || !ctx || !cvs) return;
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  for (const m of motes) {
    m.x += (m.vx + Math.sin(t * 0.4 + m.p) * 3) * dt;
    m.y += m.vy * dt;
    if (m.y < -4) { m.y = cvs.height + 4; m.x = Math.random() * cvs.width; }
    if (m.x < -4) m.x = cvs.width + 4;
    if (m.x > cvs.width + 4) m.x = -4;
    const tw = 0.6 + 0.4 * Math.sin(t * 1.3 + m.p);
    ctx.beginPath();
    ctx.fillStyle = `rgba(247, 219, 176, ${(m.a * tw).toFixed(3)})`;
    ctx.arc(m.x, m.y, m.r, 0, 6.2832);
    ctx.fill();
  }
}
