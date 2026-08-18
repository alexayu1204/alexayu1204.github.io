#!/usr/bin/env python3
"""
Repair and extend the photography collection.

Every entry carried only a title, so alt="Magnolia" was all a screen reader got.
The real descriptions live in legacy/index.html and were never migrated — and they
record something the page hid completely: three of the six photographs have small
figures drawn onto them by hand.

Recovery is keyed on IMAGE FILENAME, never on a fuzzy title match. Fuzzy matching
is what silently failed in the original migration.

Sequence note: EXIF orientation revealed that blossom and water-lily are PORTRAIT,
not landscape as their raw pixel dimensions suggested. That leaves 7 portrait to
2 landscape, so alternating orientation is impossible. Ordered by subject instead:
water -> spring -> dusk -> mountains -> city -> night.
"""
import re, html, json, os

ROOT = os.path.join(os.path.dirname(__file__), '..')
LEG = open(os.path.join(ROOT, 'legacy/index.html')).read()
DIR = os.path.join(ROOT, 'src/content/photography')
SEC = LEG[LEG.index('id="art"'):LEG.index('id="contact"')]

recovered = {}
for m in re.finditer(r'<img[^>]*src="assets/photography/([a-z0-9-]+)-thumb\.jpg"[^>]*alt="([^"]*)"', SEC):
    recovered[m.group(1)] = html.unescape(m.group(2))

NEW_ALT = {
    'swans': 'A crowd of mute swans pressing toward the bank on dark rippled water, '
             'gulls and ducks scattered behind them',
    'blossom': 'A sprig of white blossom lit by low sun on a mossy trunk, a red-brick '
               'house blurred behind',
    'water-lily': 'A purple water lily open above dark still water, lily pads and '
                  'unopened buds around it',
}

# stem: (title, order)  — order is the subject arc, not the file order
SEQ = [
    ('swans',        'Swans',        1),
    ('water-lily',   'Water lily',   2),
    ('blossom',      'Blossom',      3),
    ('magnolia',     'Magnolia',     4),
    ('garden-rose',  'Garden rose',  5),
    ('sunset-hands', 'Sunset hands', 6),
    ('alpine-dusk',  'Alpine dusk',  7),
    ('westminster',  'Westminster',  8),
    ('night-city',   'Night city',   9),
]

PUB = os.path.join(ROOT, 'public', 'assets', 'photography')
problems = []
for stem, _t, _o in SEQ:
    if not os.path.exists(os.path.join(PUB, stem + '.jpg')):
        problems.append(f'image missing: {stem}.jpg')
    if stem not in recovered and stem not in NEW_ALT:
        problems.append(f'no alt available for {stem}')
if problems:
    for p in problems:
        print('  ✗ ' + p)
    raise SystemExit('nothing written')

# render every file before writing any of them
pending = {}
for stem, title, order in SEQ:
    alt = recovered.get(stem) or NEW_ALT[stem]
    pending[os.path.join(DIR, f'{order:02d}-{stem}.md')] = (
        '---\n'
        f'title: {json.dumps(title, ensure_ascii=False)}\n'
        f'order: {order}\n'
        f'image: "/assets/photography/{stem}.jpg"\n'
        f'alt: {json.dumps(alt, ensure_ascii=False)}\n'
        '---\n'
    )

for f in os.listdir(DIR):
    if f.endswith('.md'):
        os.remove(os.path.join(DIR, f))
for path, content in pending.items():
    open(path, 'w').write(content)
    print(f'  {os.path.basename(path)}')

drawn = [s for s, *_ in SEQ if 'hand-drawn' in (recovered.get(s) or '')]
print(f'\n{len(pending)} photographs. {len(drawn)} carry hand-drawn figures: {", ".join(drawn)}')
