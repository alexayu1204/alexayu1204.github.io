#!/usr/bin/env python3
"""
One-off repair of the ART section.

Two migration defects:

1. Every artwork title was derived from its FILENAME ("Mixedmedia", "04"), while
   the real descriptive writing sat in the old site's alt attributes and reached
   the new site nowhere — so it was invisible even to screen readers. Recovered
   here, keyed on the image filename rather than on a fuzzy title match.

2. The artist statement was four distinct elements — section intro, medium line,
   exhibition credit and the statement itself — concatenated into one blob, with
   spacing artifacts from inline <em> tags stripped by a regex that replaced tags
   with a space (" to be accepted , to"). Un-glued into the record it always was.
"""
import re, html, json, os

ROOT = os.path.join(os.path.dirname(__file__), '..')
LEG = open(os.path.join(ROOT, 'legacy/index.html')).read()
ART = os.path.join(ROOT, 'src/content/artwork')
SEC = LEG[LEG.index('id="art"'):LEG.index('id="contact"')]


def inline(t):
    """strip inline tags WITHOUT inserting a space — the bug that produced ' , '"""
    t = re.sub(r'</?(em|strong|i|b|span)[^>]*>', '', t)
    t = re.sub(r'<[^>]+>', ' ', t)
    return re.sub(r'\s+', ' ', html.unescape(t)).strip()


# ---- recover every alt, keyed on filename stem ------------------------------
alts = {}
for m in re.finditer(r'<img[^>]*src="assets/art/([a-z0-9-]+)-thumb\.jpg"[^>]*alt="([^"]*)"', SEC):
    alts[m.group(1)] = html.unescape(m.group(2))

META = {
    # stem: (title, role, year)
    'inbox-install':      ('Installation view',        'install',       None),
    'inbox-01':           ('Page 01',                  'page',          '2018'),
    'inbox-02':           ('Page 02',                  'page',          '2019'),
    'inbox-03':           ('Page 03',                  'page',          '2021'),
    'inbox-04':           ('Page 04',                  'page',          '2024'),
    'inbox-05':           ('Page 05',                  'page',          '2025'),
    'inbox-artist':       ('The artist with the work', 'documentation', None),
    'studio-ink-plum':    ('Plum blossom',             'work',          None),
    'studio-ink-blossom': ('Blossom and leaves',       'work',          None),
    'studio-abstract':    ('Abstract',                 'work',          None),
    'studio-mixedmedia':  ('Stitched drawing',         'work',          None),
}

missing = [s for s in META if s not in alts]
if missing:
    raise SystemExit(f'FATAL: no alt recovered for {missing} — nothing written')

files = {f: os.path.join(ART, f) for f in sorted(os.listdir(ART)) if f.endswith('.md')}
pending = {}
for fname, path in files.items():
    stem = next((s for s in META if fname.endswith(s + '.md')), None)
    if stem is None:
        raise SystemExit(f'FATAL: {fname} is not in the map — nothing written')
    title, role, year = META[stem]
    _, fm, _body = open(path).read().split('---', 2)

    def setf(key, value):
        global fm
        line = f'{key}: {json.dumps(value, ensure_ascii=False)}'
        if re.search(rf'^{key}: ', fm, re.M):
            fm = re.sub(rf'^{key}: .*$', lambda _m: line, fm, flags=re.M)
        else:
            fm = fm.rstrip('\n') + '\n' + line + '\n'

    setf('title', title)
    setf('series', 'Inbox Archive' if stem.startswith('inbox') else 'Other work')
    setf('role', role)
    setf('alt', alts[stem])
    if year:
        setf('year', year)
    else:
        fm = re.sub(r'^year: .*$\n', '', fm, flags=re.M)
    pending[path] = f'---{fm}---\n'

for path, content in pending.items():
    open(path, 'w').write(content)
    print(f'  {os.path.basename(path)[:-3]:<26} ok')

# ---- un-glue the writing ----------------------------------------------------
stmt = inline(re.search(r'art-feature__text[^>]*>(.*?)</p>', SEC, re.S).group(1))
assert ' , ' not in stmt and ' .' not in stmt, f'artifact survived: {stmt[:120]}'

art = {
    'feature': {
        'title': 'Inbox Archive: Learning to Sound Like Myself',
        'medium': 'Inkjet print on paper with thread',
        'dimensions': '5 × A4',
        'year': '2026',
        'exhibition': 'Selected for The Mosaic of Becoming — Nunnery Gallery, London',
        'statement': stmt,
    },
    'otherWork': {
        'heading': 'Other work',
        'intro': 'Ink and brush, paint, and mixed media — pieces made between projects.',
    },
}
json.dump(art, open(os.path.join(ROOT, 'src/data/art.json'), 'w'), indent=1, ensure_ascii=False)

site_p = os.path.join(ROOT, 'src/data/site.json')
site = json.load(open(site_p))
site.pop('artistStatement', None)   # the glued blob; art.json replaces it
json.dump(site, open(site_p, 'w'), indent=1, ensure_ascii=False)

print(f'\nstatement: {len(stmt)} chars, artifacts clean')
print(f'art.json written, artistStatement removed from site.json')
