# Haoting (Alexa) Yu - Personal Website

A personal website built as a small interactive world rather than a scrolling page.
The visitor arrives in a dark room, their cursor becomes a flashlight, and an
antique pull on the left wall lights a chandelier — revealing an illustrated salon
whose hung paintings are the navigation. Each painting leads to a section of the
site.

Live at **https://alexayu1204.github.io/**

## Code Structure and Architecture

The site is a static Astro build. Every route is a real directory with its own
`index.html`, so GitHub Pages serves it with no rewrite rules and no client-side
router.

```
alexayu1204.github.io/
├── .github/workflows/deploy.yml   # build → verify → actions/deploy-pages
├── public/
│   ├── .nojekyll                  # required: Astro emits _astro/
│   ├── scene/                     # the room's own artwork
│   │   ├── damask.svg             # seamless wallpaper tile
│   │   ├── grain.svg              # paper tooth overlay
│   │   └── paintings/             # the eleven pictures on the wall
│   ├── assets/                    # artwork, photography, project reports
│   ├── Resume.pdf · og.jpg · favicon.ico · robots.txt
├── src/
│   ├── room/                      # the engine — plain TypeScript, one rAF loop
│   ├── scene/                     # composition data + SVG fixtures
│   ├── content/                   # publications · projects · artwork · photography
│   ├── data/                      # cv.json · site.json · art.json
│   ├── layouts/                   # Base.astro · Section.astro
│   ├── pages/                     # index + six sections + 404
│   └── styles/                    # room.css · page.css
├── scripts/                       # generators and build gates
└── legacy/                        # the previous site, kept as content provenance
```

### Page Structure

The homepage carries the room; the six sections are ordinary documents.

```html
<body>
  <a class="room__escape" href="#index">Skip the room</a>

  <div class="room" data-lit="0">
    <div class="room__camera">           <!-- the dolly, screen space -->
      <div class="room__world">…</div>   <!-- wall, cornice, dado, corners -->
      <div class="stage">                <!-- the design canvas -->
        <div class="layer layer--frames">…</div>
      </div>
      <div class="stage stage--vec">
        <svg id="room-vec">              <!-- chandelier + pull -->
      </div>
    </div>
    <canvas id="dark"></canvas>          <!-- the darkness and the flashlight -->
    <button id="pull-hit">               <!-- keyboard-operable cord -->
  </div>

  <!-- real, crawlable content present from the first byte -->
  <h1 class="sr-only">Haoting (Alexa) Yu — …</h1>
  <nav id="index" class="sr-only">…six section links…</nav>
</body>
```

### CSS Architecture

Two stylesheets, no framework, no reset beyond the essentials.

```css
/* room.css — the interactive homepage */
:root {
  --bloom: 0;        /* chandelier halo, driven by the ignition timeline */
  --exposure: 0;     /* room lighting, 0 → 1 */
  --wall: #4d3039;   /* dusty rose damask */
  --serif: 'Times New Roman', Times, serif;
}

/* Light comes from the fixture, so each frame is told where the fixture is */
.frame {
  background-image: var(--moulding);
  box-shadow: var(--sx) var(--sy) 20px rgba(0,0,0,.42);
}
.frame__glint {
  background: linear-gradient(var(--glint-angle),
    rgba(255,240,205, calc(.58 * var(--glint-power))) 0%, transparent 32%);
}
```

- **Only `transform` and `opacity` animate per frame.** Filters, shadows and
  gradients are either static or move once, during the 2.2-second ignition.
- **`--glint-angle`, `--glint-power`, `--sx`, `--sy`** are written per frame by
  the engine from each picture's position relative to the chandelier, so the
  highlight, the moulding's metal shading and the drop shadow all agree about
  where the light is.
- **`page.css`** styles the six sections: dark plum ground, faint damask, a 62–74ch
  reading measure, and gilt plates for gallery images.

### JavaScript Implementation

The room is eight plain-TypeScript modules under `src/room/`, driven by a single
`requestAnimationFrame` loop. The section pages ship no JavaScript of their own
beyond a two-line arrival transition.

```javascript
// one loop, everything ticks from it
const frame = (now) => {
  const dt = Math.min(0.05, (now - last) / 1000);
  tickFlashlight(dt);
  tickPull(dt);
  requestAnimationFrame(frame);
};
```

| module | responsibility |
|---|---|
| `state.ts` | shared light state, visit memory, frame-rate-independent easing |
| `stage.ts` | design canvas → viewport mapping (contain fit) |
| `flashlight.ts` | the darkness, and the hole carried through it |
| `pull.ts` | drag physics, the catch before the trigger, spring return |
| `lighting.ts` | the ignition timeline |
| `camera.ts` | frame → section dolly and the hand-off |
| `audio.ts` | synthesised, gesture-unlocked, default muted |
| `index.ts` | boot, wiring, the loop |

### Key Implementation Features

1. **Time-based easing, not frame-based.** `approach()` uses `1 - e^(-dt/τ)`. The
   obvious `cur += (target - cur) * k` advances once per *frame*, so the
   flashlight would travel 46% faster on a 120Hz display. `npm run verify:easing`
   holds the drift under 2% from 30Hz to 240Hz.
2. **The room is always rendered lit.** One downscaled canvas decides what is
   visible, so ignition is the spot *growing* until it swallows the screen — one
   continuous shot rather than a cross-fade.
3. **Contain fit, not cover.** Cover crops the sides, and between roughly 1.35 and
   1.6 aspect it pushes the pull clean off screen. The wall, ceiling and floor are
   laid out in screen space and extend to fill whatever is left.
4. **Two hand-authored compositions.** Wide (16:9) and narrow (portrait), each with
   its own coordinates. Auto-layout would produce the even grid the room is
   designed not to be.
5. **Wall labels choose their own side.** Each plate tests eight candidate
   positions against the real geometry and takes the first that clears.
6. **Progressive enhancement throughout.** Every section link is in the static HTML;
   the room is an enhancement over a page that already works.

## Website Features

### The Room (homepage)

- Opens in near-total darkness with a soft ambient grain — no navigation, no
  name, no visible interface
- The cursor becomes a flashlight that lags slightly behind the pointer, with a
  two-frequency flicker so its edge breathes rather than buzzes
- Proximity warmth: the light widens and warms as it nears the pull, which is how
  the cord is discovered rather than by any tooltip
- After ten seconds the cord catches its own travelling highlight, unprompted
- An antique brass pull on the left wall, dragged with real resistance and a catch
  just before the trigger, then returned by an underdamped spring

### The Opening Sequence

| ms | |
|---|---|
| 0 | mechanical click, the trigger crossed |
| 120–420 | filaments come up unevenly — one switch, six ageing bulbs |
| 300–800 | the halo blooms outward from the fixture |
| 500–1400 | the flashlight's spot grows until it swallows the screen |
| 800–1600 | the pictures arrive, together, with the light |
| 900–1800 | wallpaper and moulding gain exposure; the vignette closes in |

### Publication

- Two peer-reviewed entries, each as title, citation and finding
- DOI rendered as a link to `doi.org`

### ART

- *Inbox Archive: Learning to Sound Like Myself*, shown in *The Mosaic of Becoming*
  at the Nunnery Gallery, London — presented as the work it is: installation view,
  medium line, exhibition credit, artist statement
- The five pages hung in a row as they hung on the wall, captioned by year, so the
  2018 → 2025 progression reads left to right
- **Other work** — ink and brush, paint and mixed media

### Projects

- Ten projects in three domain groups, reverse-chronological within each
- Each entry carries its written description, period, technique tags and links to
  repositories, reports and technical write-ups

### Photography

- Nine photographs, one per row, unframed, uncaptioned
- Sized by height rather than width, so portraits and landscapes carry the same
  visual weight instead of the column lurching

### Education

- Profile, degrees and skills, with the CV downloadable as a PDF

### Contact

- Email, phone, location and CV. Nothing else

## Technical Features

### Responsive Design

- Two hand-authored wall compositions, switching below 1.2 aspect
- Verified from 2560×1080 down to 390×844: the pull always reachable, no frame
  clipped, no horizontal overflow on any page
- On touch devices the pull begins faintly ember-lit and the spotlight rides above
  the fingertip — a finger occludes exactly what it is meant to reveal

### Animation

- GSAP timelines for the ignition and the camera dolly; everything else is the
  single rAF loop
- 60fps sustained during continuous pointer movement — median 16.7ms, p95 17.8ms,
  zero frames over 50ms
- `prefers-reduced-motion` is a defined product: the room loads already lit, no
  pull required, no camera travel

### Accessibility

- The homepage ships real crawlable HTML with all six section links present from
  the first byte
- Frames are `inert` while the room is dark, so nothing tabs into the invisible
- The cord is a real `<button>`; Enter or Space works it, and Escape lights the
  room from anywhere
- Every artwork and photograph carries a full alt description

### Performance

- 35 kB of gzipped JavaScript on the homepage; the section pages ship none
- 312 kB of scene artwork, mostly vector so it stays crisp through the camera dolly
- The image archive is lazy-loaded and only on the gallery pages

## Technologies Used

- **Astro 5** — static output, one HTML file per route, zero JS by default
- **TypeScript** — the room engine, no framework
- **GSAP** — ignition and camera timelines
- **Times New Roman** — the only typeface; no webfonts, no network font requests
- **SVG** — chandelier, pull, frames, wallpaper, and the remaining hand-drawn
  pictures
- **Canvas 2D** — the darkness and the flashlight
- **Web Audio** — synthesised sounds, no audio files
- **Python** — the artwork generators and content migration scripts

## Recent Updates

### Paintings and lighting (August 2026)

- Five of the six paintings replaced with commissioned surreal-vintage work
- Chandelier rebuilt as an early-electric fixture — brass sockets, glass envelopes,
  visible filaments. Candles made no sense on a wall worked by a pull switch
- Frame lighting now derived from the fixture's position: highlight, moulding
  shading and drop shadow all agree about where the light is
- Parallax removed; the room stays still

### Section content (August 2026)

- Project descriptions restored from the previous site — the original migration had
  silently dropped them
- ART reorganised around the Inbox Archive as an exhibited work
- Photography extended to nine, one per row
- Contact reduced to email, phone, location and CV

### The Room (August 2026)

- Complete rebuild: the previous single-page Bootstrap portfolio replaced with an
  interactive room on Astro
- Content migrated into Markdown collections
- Deployment moved from branch-serving to a GitHub Actions workflow

## Setup and Deployment

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
npm run verify     # composition + easing gates, also run in CI
```

Pushing to `main` triggers `.github/workflows/deploy.yml`, which installs, runs the
verification gates, builds, and publishes through `actions/deploy-pages`. Pages must
be set to **GitHub Actions** as its source — serving the branch directly would try
to serve `src/` and fail. `public/.nojekyll` is required, or Jekyll strips the
`_astro/` directory.

### Build gates

- `npm run verify:wall` — fails the build if a picture enters the pull gutter or the
  chandelier's space, if navigating frames overlap, if the size hierarchy collapses,
  or if the hang drifts into a grid
- `npm run verify:easing` — proves the flashlight's easing is time-based, not
  frame-based

### Regenerating artwork

```bash
npm run art        # the hand-drawn pictures and the wallpaper tile
python3 scripts/import-paintings.py    # fit new paintings to their frames
```

## License

© 2026 Haoting (Alexa) Yu. All rights reserved.
