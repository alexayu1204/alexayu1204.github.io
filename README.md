# alexayu1204.github.io

A small interactive world that happens to contain a portfolio.

You arrive in a dark room. Your cursor becomes a flashlight. Somewhere on the left
wall hangs an antique light pull; drag it, and a chandelier blooms until the room
resolves into an illustrated salon whose hung pictures *are* the navigation.

Static Astro site, no backend, deployed to GitHub Pages.

---

## Running it

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # → dist/
npm run verify         # composition + easing gates (also run in CI)
```

## Layout

```
src/
  room/                the engine — plain TypeScript, one rAF loop
    state.ts           shared light state, visit memory, framerate-independent easing
    stage.ts           design-canvas → viewport mapping (contain fit)
    flashlight.ts      the darkness, and the hole carried through it
    pull.ts            drag physics, catch, spring return
    lighting.ts        the ignition timeline
    camera.ts          frame → section dolly
    parallax.ts  dust.ts  audio.ts
  scene/
    composition.ts     ← THE WALL. Hand-authored coordinates. Start here.
    Chandelier.astro  Pull.astro  Frame.astro
  content/             publications · projects · artwork · photography  (Markdown)
  data/                cv.json · site.json
  pages/               index + six sections, one directory each
scripts/
  verify-wall.mjs      enforces the composition rules
  verify-easing.mjs    proves the easing is time-based, not frame-based
  make-paintings.py    regenerates the eleven pictures
  make-wallpaper.py    regenerates the damask + grain
  extract-content.py   re-lifts content out of legacy/index.html
  capture.sh           screenshots the five storyboard states
legacy/                the previous site, kept only as the provenance of the content
```

## Adding content

Add a Markdown file to the right folder under `src/content/`. That is the whole
procedure — nothing else needs editing.

```markdown
---
title: "A new paper"
venue: "Somewhere 2027"
kind: "Paper"
status: "Under Review"
order: 4
---

What it is.
```

## Changing the wall

`src/scene/composition.ts` holds every frame's position in design-canvas pixels, in
two compositions: `wide` (16:9 and up) and `narrow` (portrait). Placements are
hand-authored on purpose — auto-layout produces exactly the even grid of equal
rectangles this room is designed not to be.

`npm run verify:wall` enforces the rules that hand-authoring can break:

- nothing may enter the **pull gutter**, the **chandelier keyhole**, or the wainscot
- navigating frames may not overlap
- the largest frame must be at least 3× the smallest — a real hierarchy
- no two frames may share a centre line — i.e. it must not become a grid

CI runs it, so a frame that drifts into the chandelier fails the build rather than
shipping.

To add a section: add one entry to `FRAMES` with `kind: 'nav'`, a painting in
`scripts/make-paintings.py`, and a page under `src/pages/`.

## Notes worth keeping

- **Easing is time-based.** `approach()` uses `1 - e^(-dt/τ)`. The obvious
  `cur += (target-cur) * k` advances once per *frame*, so the flashlight's weight
  would change with the monitor — 46% faster on a 120Hz display. `npm run verify:easing`
  holds it to within 2% across 30–240Hz.
- **The fit is `contain`, not `cover`.** Cover crops the sides, and between about
  1.35 and 1.6 aspect it crops far enough to push the pull off screen entirely. The
  wall, ceiling and floor are laid out in *screen* space and extend to fill whatever
  is left, so a shorter canvas reads as a taller room rather than as letterboxing.
- **The room is always rendered lit.** A single downscaled canvas overlay decides
  what is visible. That is what lets ignition be the spot *growing* until it swallows
  the screen — one continuous shot — instead of a cross-fade.
- **Frames arrive sorted by distance from the chandelier.** One sort, and the light
  demonstrably comes from the fixture.
- **Everything is reachable without the ritual.** `prefers-reduced-motion` and second
  visits load the room already lit; Esc, a click, Enter on the cord, and a visible-on-
  focus skip link all work. The homepage ships real crawlable HTML and the six section
  links in the DOM from the first byte.

## Deployment

GitHub Actions builds `dist/` and publishes it via `actions/deploy-pages`. The Pages
source must be set to **GitHub Actions** (Settings → Pages → Build and deployment).
`public/.nojekyll` is required — without it Pages' Jekyll step drops `_astro/`.
