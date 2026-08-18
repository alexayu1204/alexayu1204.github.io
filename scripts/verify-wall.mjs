/**
 * Enforces the composition rules the brief states but cannot check by eye:
 *   - no frame may enter the pull gutter, the chandelier keyhole, or the wainscot
 *   - no frame may sit outside the frame field
 *   - navigating frames may not overlap each other at all
 *   - orbiters may not overlap navigating frames (they may kiss, not cover)
 *   - the wall must not read as a grid: sizes and spacing must actually vary
 */
import { FRAMES, RESERVED, CANVAS, framesFor } from '../src/scene/composition.ts';

const box = (p) => ({ x0: p.x - p.w / 2, x1: p.x + p.w / 2, y0: p.y - p.h / 2, y1: p.y + p.h / 2 });
const overlap = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const overlapArea = (a, b) =>
  Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) *
  Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

/** closest-point test between an axis-aligned box and the chandelier ellipse */
function hitsEllipse(bx, e) {
  const cx = Math.max(bx.x0, Math.min(e.cx, bx.x1));
  const cy = Math.max(bx.y0, Math.min(e.cy, bx.y1));
  const dx = (cx - e.cx) / e.rx;
  const dy = (cy - e.cy) / e.ry;
  return dx * dx + dy * dy < 1;
}

let errors = 0;
const fail = (m) => { console.error('  ✗ ' + m); errors++; };

for (const mode of ['wide', 'narrow']) {
  console.log(`\n${mode.toUpperCase()}  (${CANVAS[mode].w}×${CANVAS[mode].h})`);
  const R = RESERVED[mode];
  const hung = framesFor(mode);
  const boxes = hung.map((f) => ({ f, b: box(f[mode]) }));
  const skipped = FRAMES.length - hung.length;
  if (skipped) console.log(`  · ${skipped} orbiter(s) not hung in this composition`);

  for (const { f, b } of boxes) {
    if (b.x0 < R.pullGutter.x1) fail(`${f.id} enters the pull gutter (x0=${b.x0.toFixed(0)} < ${R.pullGutter.x1})`);
    if (hitsEllipse(b, R.chandelier)) fail(`${f.id} enters the chandelier keyhole`);
    if (b.y1 > R.wainscot.y0) fail(`${f.id} hangs below the picture rail (y1=${b.y1.toFixed(0)} > ${R.wainscot.y0})`);
    if (b.x0 < R.field.x0 || b.x1 > R.field.x1 || b.y0 < R.field.y0 || b.y1 > R.field.y1)
      fail(`${f.id} is outside the frame field  [${b.x0.toFixed(0)},${b.y0.toFixed(0)} → ${b.x1.toFixed(0)},${b.y1.toFixed(0)}]`);
  }

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const A = boxes[i], B = boxes[j];
      if (!overlap(A.b, B.b)) continue;
      const bothNav = A.f.kind === 'nav' && B.f.kind === 'nav';
      const area = overlapArea(A.b, B.b);
      if (bothNav || area > 0) fail(`${A.f.id} overlaps ${B.f.id} by ${area.toFixed(0)}px²`);
    }
  }

  // anti-grid: frame areas must span a real range, and no two nav frames may share a centre line
  const navs = hung.filter((f) => f.kind === 'nav').map((f) => f[mode]);
  const areas = navs.map((p) => p.w * p.h);
  const ratio = Math.max(...areas) / Math.min(...areas);
  if (ratio < 3) fail(`nav frames are too uniform in size (largest/smallest = ${ratio.toFixed(1)}, want ≥ 3)`);
  else console.log(`  ✓ size hierarchy: largest nav frame is ${ratio.toFixed(1)}× the smallest`);

  const xs = navs.map((p) => p.x).sort((a, b) => a - b);
  const ys = navs.map((p) => p.y).sort((a, b) => a - b);
  const sharedX = xs.filter((v, i) => i && Math.abs(v - xs[i - 1]) < 12).length;
  const sharedY = ys.filter((v, i) => i && Math.abs(v - ys[i - 1]) < 12).length;
  if (sharedX || sharedY) fail(`frames are aligning into rows/columns (${sharedX} shared x, ${sharedY} shared y)`);
  else console.log('  ✓ no two nav frames share a centre line — not a grid');

  if (!errors) console.log('  ✓ all placements legal');
}

console.log(errors ? `\n${errors} composition error(s)\n` : '\nWall composition is valid.\n');
process.exit(errors ? 1 : 0);
