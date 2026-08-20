#!/usr/bin/env python3
"""
Bring generated paintings onto the wall.

Each source arrives as a screenshot that already contains its own moulding and a
brass nameplate. Both have to come off: the site draws its own frames, and it
reveals the category name on hover, so leaving them in would double-frame every
picture and print the label twice.

The rail is found by colour — the first strongly warm, darker band in the bottom
third — rather than by a fixed fraction, so it survives sources of different
heights.
"""
import os, sys
from PIL import Image
import numpy as np

SRC = '/Users/haotingyu/Downloads/web_page'
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'scene', 'paintings')

# source file  ->  (output name, target aspect w/h)
JOBS = [
    ('Screenshot 2026-08-20 at 7.39.12 pm.png', 'p-art',      296/376),
    ('Screenshot 2026-08-20 at 7.39.23 pm.png', 'p-contact',  200/147),
    ('Screenshot 2026-08-20 at 7.42.47 pm.png', 'p-projects', 252/196),
]
INSET = 0.018      # trims the thin outer moulding edge the rail detector leaves

missing = [f for f, *_ in JOBS if not os.path.exists(os.path.join(SRC, f))]
if missing:
    raise SystemExit(f'FATAL: not found: {missing} — nothing written')

results = []
for fname, out, target in JOBS:
    im = Image.open(os.path.join(SRC, fname)).convert('RGB')
    a = np.asarray(im).astype(int)
    h, w, _ = a.shape

    rows = a.mean(axis=1)
    warm = rows[:, 0] - rows[:, 2]
    dark = rows.mean(axis=1)
    top = int(h * 0.6)
    cand = [y for y in range(top, h)
            if warm[y] > warm[:top].mean() + 12 and dark[y] < dark[:top].mean()]
    rail = cand[0] if cand else int(h * 0.86)

    dx, dy = int(w * INSET), int(rail * INSET)
    im = im.crop((dx, dy, w - dx, rail - dy))

    # cover-fit to the frame's aspect, trimming the long side only
    cw, ch = im.size
    if cw / ch > target:
        nw = int(ch * target); im = im.crop(((cw - nw) // 2, 0, (cw - nw) // 2 + nw, ch))
    else:
        nh = int(cw / target); im = im.crop((0, (ch - nh) // 2, cw, (ch - nh) // 2 + nh))

    dst = os.path.join(OUT, out + '.webp')
    im.save(dst, 'WEBP', quality=88, method=6)
    kb = os.path.getsize(dst) / 1024
    results.append((out, im.size, kb, im.size[0] / im.size[1]))
    print(f'  {out:<12} rail y={rail:<4} -> {im.size[0]}x{im.size[1]}  ar={im.size[0]/im.size[1]:.2f}  {kb:.0f} KB')

thin = [r for r in results if max(r[1]) < 900]
if thin:
    print(f'\n  note: {[r[0] for r in thin]} are under 900px on the long edge.')
    print('  Fine on the wall; visibly soft during the 6x click-through.')
