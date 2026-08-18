#!/usr/bin/env python3
"""
One-off repair.

The original migration matched portfolio cards to the old site's Project
Experience accordion by fuzzy title. That match failed for EVERY project and did
so silently, so all fourteen entries fell back to the short carousel blurb and the
substantial written descriptions — 227 to 517 characters each — never reached the
new site.

This restores them from an EXPLICIT map. Fuzzy matching is exactly what failed the
first time; an explicit map fails loudly. Nothing is written unless every mapping
resolves.

Also sets the domain group, the cross-cutting technique tags, display order
(reverse-chronological within each group), and the two missing periods.
"""
import os, re, sys, html, json

ROOT = os.path.join(os.path.dirname(__file__), '..')
LEGACY = open(os.path.join(ROOT, 'legacy/index.html')).read()
PROJ = os.path.join(ROOT, 'src/content/projects')

# slug -> (legacy projHeading number | None, group, tags, order, period-override)
CREATIVE = 'Creative AI systems'
MLVISION = 'Machine learning & vision'
OPTSTATS = 'Optimisation & statistics'

MAP = {
    '01-ai-courtroom-veritas':          (7,    CREATIVE, ['LLM', 'creative coding'],        1,  'Mar 2026'),
    '03-neural-illumination':           (9,    CREATIVE, ['generative', 'creative coding'], 2,  None),
    '02-hidden-connections':            (8,    CREATIVE, ['LLM', 'data', 'creative coding'],3,  None),
    '04-personalized-poem-generation':  (1,    CREATIVE, ['LLM', 'generative'],             4,  None),
    '08-yolov9-rock-detection':         (5,    MLVISION, ['vision'],                        5,  None),
    '11-3d-object-generation-from-text':(6,    MLVISION, ['generative', 'vision'],          6,  None),
    '06-sentiment-classification':      (4,    MLVISION, ['LLM'],                           7,  None),
    '12-stable-diffusion-implementation':(None,MLVISION, ['generative', 'vision'],          8,  None),
    '07-anomaly-detection':             (2,    OPTSTATS, ['data'],                          9,  None),
    '05-ev-charging-optimization':      (3,    OPTSTATS, ['data'],                          10, 'Oct 2022 – Nov 2022'),
}
DROP = ['09-incomplete-data-analysis', '10-statistical-methods-for-incomplete',
        '13-textile-design-portfolio', '14-content-creation-portfolio']


def txt(t):
    t = re.sub(r'<[^>]+>', ' ', t)
    return re.sub(r'\s+', ' ', html.unescape(t)).strip()


def bullets(n):
    sec = LEGACY[LEGACY.index('id="projects"'):LEGACY.index('id="portfolio"')]
    m = re.search(rf'id="projHeading{n}"(.*?)</h3>(.*?)(?=id="projHeading|\Z)', sec, re.S)
    if not m:
        raise SystemExit(f'FATAL: projHeading{n} not found in legacy/index.html')
    out = [txt(li) for li in re.findall(r'<li[^>]*>(.*?)</li>', m.group(2), re.S)]
    if not out:
        raise SystemExit(f'FATAL: projHeading{n} has no bullets')
    return out


# ---- resolve everything BEFORE touching a single file ----------------------
resolved, problems = {}, []
for slug, (n, group, tags, order, period) in MAP.items():
    path = os.path.join(PROJ, slug + '.md')
    if not os.path.exists(path):
        problems.append(f'missing file: {slug}.md')
        continue
    resolved[slug] = bullets(n) if n is not None else None
for slug in DROP:
    if not os.path.exists(os.path.join(PROJ, slug + '.md')):
        problems.append(f'cannot drop, missing: {slug}.md')

on_disk = {f[:-3] for f in os.listdir(PROJ) if f.endswith('.md')}
unaccounted = on_disk - set(MAP) - set(DROP)
if unaccounted:
    problems.append(f'not in the map and not dropped: {sorted(unaccounted)}')
if problems:
    for p in problems:
        print('  ✗ ' + p)
    raise SystemExit('nothing written')

# ---- render every file in memory first, THEN commit to disk ---------------
# The earlier version wrote as it went and left nine files half-migrated when the
# tenth threw. "Resolve before writing" has to cover the writing too.
pending = {}
for slug, (n, group, tags, order, period) in MAP.items():
    path = os.path.join(PROJ, slug + '.md')
    _, fm, body = open(path).read().split('---', 2)

    def setf(key, value):
        global fm
        line = f'{key}: {value}'
        if re.search(rf'^{key}: ', fm, re.M):
            fm = re.sub(rf'^{key}: .*$', lambda _m: line, fm, flags=re.M)
        else:
            fm = fm.rstrip('\n') + '\n' + line + '\n'

    setf('order', order)
    setf('tags', json.dumps(tags, ensure_ascii=False))
    setf('group', json.dumps(group, ensure_ascii=False))
    if period:
        setf('period', json.dumps(period, ensure_ascii=False))
    # the generated covers were in the old brand and the page shows no imagery;
    # only the two real screenshots are worth keeping as metadata
    cover = re.search(r'^cover: "(.*)"$', fm, re.M)
    if cover and '/ph-' in cover.group(1):
        setf('cover', '""')
    # summary duplicated the body verbatim on every entry — one of them had to go
    fm = re.sub(r'^summary: .*$\n', '', fm, flags=re.M)

    text = ('\n'.join(f'- {b}' for b in resolved[slug]) if resolved[slug] else body.strip())
    pending[path] = (f'---{fm}---\n\n{text}\n', group, len(text))

for path, (content, group, n) in pending.items():
    open(path, 'w').write(content)
    print(f'  {os.path.basename(path)[:-3]:<36} {group:<26} {n:>4} chars')

for slug in DROP:
    os.remove(os.path.join(PROJ, slug + '.md'))
    print(f'  dropped  {slug}')

print(f'\n{len(MAP)} projects restored, {len(DROP)} dropped.')
