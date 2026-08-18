#!/usr/bin/env python3
"""
Bring new photographs into the site at web weight.

The originals are 5184px and 4-7MB each; dropped in raw they would add ~17MB to a
folder holding 1.7MB. Resized to 1600px on the long edge at quality 78, which
matches the weight of the existing set.

EXIF is stripped. It carries the camera serial and a capture timestamp, and the
timestamps here are not trustworthy anyway — two files are stamped October on a
spring blossom. Orientation is applied BEFORE stripping, or a rotated frame would
ship sideways.

Originals are only read; nothing is moved or deleted.
"""
import os, sys
from PIL import Image, ImageOps

SRC = '/Users/haotingyu/Downloads/web_page'
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'photography')
LONG_EDGE = 1600
QUALITY = 78
MAX_BYTES = 450_000

JOBS = [
    ('IMG_6225.jpg', 'swans.jpg'),
    ('IMG_7393.JPG', 'blossom.jpg'),
    ('IMG_7544.JPG', 'water-lily.jpg'),
]

missing = [s for s, _ in JOBS if not os.path.exists(os.path.join(SRC, s))]
if missing:
    raise SystemExit(f'FATAL: source not found: {missing} — nothing written')

os.makedirs(OUT, exist_ok=True)
results = []
for src_name, out_name in JOBS:
    src = os.path.join(SRC, src_name)
    dst = os.path.join(OUT, out_name)

    im = Image.open(src)
    im = ImageOps.exif_transpose(im)          # apply rotation, then let EXIF go
    im = im.convert('RGB')
    before = im.size
    im.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)
    # save with no exif= argument: metadata is not carried over
    im.save(dst, 'JPEG', quality=QUALITY, optimize=True, progressive=True)

    size = os.path.getsize(dst)
    w, h = Image.open(dst).size
    ok = max(w, h) <= LONG_EDGE and size <= MAX_BYTES
    results.append((out_name, before, (w, h), size, ok))
    print(f'  {out_name:<16} {before[0]}x{before[1]} -> {w}x{h}  {size/1024:6.0f} KB  {"ok" if ok else "TOO BIG"}')

bad = [r for r in results if not r[4]]
if bad:
    for r in bad:
        os.remove(os.path.join(OUT, r[0]))
    raise SystemExit(f'\nFATAL: {[r[0] for r in bad]} exceeded the budget — removed, nothing shipped')

total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT) if f.endswith(('.jpg', '.jpeg')))
print(f'\nphotography folder now {total/1024/1024:.2f} MB')

# prove the metadata really is gone
leftover = [n for n, *_ in [(r[0],) for r in results] if Image.open(os.path.join(OUT, n)).getexif()]
print('EXIF remaining:', leftover or 'none')
