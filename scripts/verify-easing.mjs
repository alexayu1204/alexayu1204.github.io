/**
 * The brief specified `cur += (target - cur) * k`, which advances once per FRAME.
 * On a 120Hz display that runs twice as fast as on 60Hz, so the flashlight's weight
 * — the single most-felt quality in the opening — changes with the monitor.
 *
 * This asserts the shipped easing is a function of TIME, not of frame count.
 */
import { approach } from '../src/room/state.ts';

const naive = (cur, target, k) => cur + (target - cur) * k;

function run(fn, hz, seconds) {
  // step an EXACT number of times covering exactly `seconds`, otherwise the harness
  // measures its own rounding (0.1s does not divide evenly by 1/144) instead of the
  // property under test
  const steps = Math.round(seconds * hz);
  const dt = seconds / steps;
  let cur = 0;
  for (let i = 0; i < steps; i++) cur = fn(cur, 100, dt);
  return cur;
}

const TAU = 0.085;
const shipped = (cur, target, dt) => approach(cur, target, TAU, dt);
const asSpecced = (cur, target) => naive(cur, target, 0.12);

let bad = 0;
console.log('\nAfter 100ms of travel toward a target 100px away:\n');
console.log('  refresh    brief’s formula     shipped');
for (const hz of [30, 60, 90, 120, 144]) {
  const a = run(asSpecced, hz, 0.1);
  const b = run(shipped, hz, 0.1);
  console.log(`  ${String(hz).padStart(3)}Hz    ${a.toFixed(2).padStart(8)}px      ${b.toFixed(2).padStart(8)}px`);
}

const ref = run(shipped, 60, 0.1);
for (const hz of [30, 90, 120, 144, 240]) {
  const got = run(shipped, hz, 0.1);
  const driftPct = Math.abs(got - ref) / ref * 100;
  if (driftPct > 2) { console.error(`  ✗ ${hz}Hz drifts ${driftPct.toFixed(1)}% from the 60Hz reference`); bad++; }
}
const naiveDrift = Math.abs(run(asSpecced, 120, 0.1) - run(asSpecced, 60, 0.1)) / run(asSpecced, 60, 0.1) * 100;
console.log(`\n  brief’s formula drifts ${naiveDrift.toFixed(0)}% between 60Hz and 120Hz`);
console.log(bad ? `  ✗ shipped easing is frame-rate dependent\n` : `  ✓ shipped easing holds within 2% across 30–240Hz\n`);
process.exit(bad ? 1 : 0);
