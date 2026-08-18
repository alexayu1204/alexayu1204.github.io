/**
 * The salon wall.
 *
 * Every position is authored by hand in DESIGN-CANVAS pixels, not derived by any
 * layout algorithm. Auto-layout is what produces the evenly-spaced grid of equal
 * rectangles the brief explicitly rules out, so there deliberately isn't one here.
 *
 * Two coordinate sets per frame: `wide` (16:9 desktop) and `narrow` (portrait /
 * tablet). Below ~1.2 aspect the whole wall recomposes into the taller canvas
 * rather than cropping the pull off the left edge.
 *
 * `npm run verify:wall` checks every placement against the reserved zones below.
 */

export type FrameShape = 'rect' | 'oval' | 'tondo' | 'arch';
export type FrameStyle = 'gilt' | 'walnut' | 'brass' | 'ebony';

export interface Placement {
  /** centre x in canvas px */ x: number;
  /** centre y in canvas px */ y: number;
  /** outer width  */ w: number;
  /** outer height */ h: number;
  /** degrees, tiny — a wall hung by hand is never perfectly level */
  rot?: number;
}

export interface FrameDef {
  id: string;
  /** `nav` frames navigate; `orbiter` frames exist purely to give the wall density */
  kind: 'nav' | 'orbiter';
  title?: string;
  href?: string;
  shape: FrameShape;
  style: FrameStyle;
  /** id of the painted subject, resolved to artwork by <Frame> */
  art: string;
  wide: Placement;
  /** null = not hung on the narrow wall at all */
  narrow: Placement | null;
  /** paint order; higher sits in front */
  z?: number;
}

export const CANVAS = {
  wide: { w: 1920, h: 1080 },
  narrow: { w: 1080, h: 1440 },
} as const;

/** Below this viewport aspect ratio the narrow composition takes over. */
export const NARROW_ASPECT = 1.2;

/**
 * Regions the composition may not enter. These are what actually make the brief's
 * "the pull must never cover a painting" and "the chandelier must not overlap
 * important paintings" enforceable instead of aspirational.
 */
export const RESERVED = {
  wide: {
    pullGutter: { x0: 0, x1: 278 },
    chandelier: { cx: 998, cy: 216, rx: 326, ry: 151 },
    wainscot: { y0: 886 },
    field: { x0: 278, x1: 1872, y0: 250, y1: 886 },
  },
  narrow: {
    pullGutter: { x0: 0, x1: 156 },
    chandelier: { cx: 596, cy: 250, rx: 232, ry: 150 },
    wainscot: { y0: 1244 },
    field: { x0: 156, x1: 1044, y0: 300, y1: 1244 },
  },
} as const;

/** Where the chandelier hangs, and where the pull hangs. Canvas px. */
export const FIXTURES = {
  wide: {
    chandelier: { x: 998, y: 252, scale: 1.15 },
    pull: { x: 150, y: 0, length: 470, scale: 1 },
  },
  narrow: {
    chandelier: { x: 596, y: 262, scale: 0.85 },
    pull: { x: 88, y: 0, length: 560, scale: 1.7 },
  },
} as const;

/**
 * SIX navigating frames. Two anchors (Research, Art) carry the wall; the rest orbit.
 * Subjects are metaphors drawn from Alexa's real work — never a label reading "RESEARCH".
 */
export const FRAMES: FrameDef[] = [
  {
    id: 'research',
    kind: 'nav',
    title: 'Research',
    href: '/research/',
    shape: 'rect',
    style: 'gilt',
    art: 'observatory', // a hillside observatory whose dome is a drum head
    wide: { x: 860,  y: 620, w: 432, h: 322, rot: -0.3 },
    narrow: { x: 500, y: 800,  w: 440, h: 330, rot: -0.3 },
    z: 6,
  },
  {
    id: 'art',
    kind: 'nav',
    title: 'Artwork',
    href: '/art/',
    shape: 'rect',
    style: 'walnut',
    art: 'letters', // the Inbox Archive — a wall of opened letters
    wide: { x: 1500, y: 600, w: 296, h: 376, rot: 0.4 },
    narrow: { x: 880, y: 1080, w: 280, h: 300, rot: 0.4 },
    z: 6,
  },
  {
    id: 'projects',
    kind: 'nav',
    title: 'Projects',
    href: '/projects/',
    shape: 'rect',
    style: 'ebony',
    art: 'machine', // a strange brass machine, half-diagrammed
    wide: { x: 430,  y: 700, w: 252, h: 196, rot: 0.6 },
    narrow: { x: 325, y: 1110, w: 258, h: 200, rot: 0.6 },
    z: 5,
  },
  {
    id: 'photography',
    kind: 'nav',
    title: 'Photography',
    href: '/photography/',
    shape: 'rect',
    style: 'brass',
    art: 'magnolia', // her magnolia photograph, hung as a picture
    wide: { x: 1215, y: 675, w: 232, h: 288, rot: -0.5 },
    narrow: { x: 860, y: 520,  w: 236, h: 292, rot: -0.5 },
    z: 5,
  },
  {
    id: 'study',
    kind: 'nav',
    title: 'The Study',
    href: '/study/',
    shape: 'oval',
    style: 'gilt',
    art: 'portrait', // a formal portrait beside an ink plum blossom
    wide: { x: 500,  y: 420, w: 196, h: 250, rot: 0 },
    narrow: { x: 300, y: 470,  w: 208, h: 264, rot: 0 },
    z: 6,
  },
  {
    id: 'contact',
    kind: 'nav',
    title: 'Contact',
    href: '/contact/',
    shape: 'tondo',
    style: 'ebony',
    art: 'window', // a distant lit window at night
    wide: { x: 1740, y: 800, w: 138, h: 138, rot: 0 },
    narrow: { x: 960, y: 770,  w: 140, h: 140, rot: 0 },
    z: 5,
  },

  /* ---- orbiters: density, not navigation. No title, no pointer, no destination. ---- */
  {
    id: 'orb-beetle',
    kind: 'orbiter',
    shape: 'oval',
    style: 'brass',
    art: 'beetle',
    wide: { x: 600,  y: 690, w: 76,  h: 94,  rot: 1.1 },
    narrow: { x: 620, y: 1090, w: 84,  h: 104, rot: 1.1 },
    z: 4,
  },
  {
    id: 'orb-butterfly',
    kind: 'orbiter',
    shape: 'rect',
    style: 'gilt',
    art: 'butterfly',
    wide: { x: 1730, y: 330, w: 116, h: 100, rot: -0.8 },
    narrow: null,
    z: 4,
  },
  {
    id: 'orb-cottage',
    kind: 'orbiter',
    shape: 'rect',
    style: 'walnut',
    art: 'cottage',
    wide: { x: 760,  y: 832, w: 148, h: 96,  rot: 0.5 },
    narrow: { x: 600, y: 1195, w: 150, h: 96,  rot: 0.5 },
    z: 4,
  },
  {
    id: 'orb-vase',
    kind: 'orbiter',
    shape: 'arch',
    style: 'walnut',
    art: 'vase',
    wide: { x: 1395, y: 330, w: 120, h: 140, rot: 0.3 },
    narrow: null,
    z: 4,
  },
  {
    /** the one easter egg on the wall: clicking it puts the light back out */
    id: 'orb-key',
    kind: 'orbiter',
    shape: 'oval',
    style: 'brass',
    art: 'key',
    wide: { x: 1770, y: 560, w: 72,  h: 98,  rot: 0 },
    narrow: { x: 200, y: 690,  w: 74,  h: 100, rot: 0 },
    z: 4,
  },
];

export const NAV_FRAMES = FRAMES.filter((f) => f.kind === 'nav');

export function placementFor(f: FrameDef, mode: 'wide' | 'narrow'): Placement | null {
  return mode === 'wide' ? f.wide : f.narrow;
}

/** Frames actually hung in a given composition. */
export function framesFor(mode: 'wide' | 'narrow'): FrameDef[] {
  return FRAMES.filter((f) => placementFor(f, mode) !== null);
}
