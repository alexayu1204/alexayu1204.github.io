#!/usr/bin/env python3
"""
Lifts every piece of real content out of the old 88KB monolith into content
collections, so adding a publication later is a new .md file rather than an edit
somewhere inside a wall of HTML.

Nothing here is invented. If the old site did not say it, it does not appear.
"""
import re, html, json, os, unicodedata

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = open(os.path.join(ROOT, 'legacy/index.html')).read()

def txt(s):
    s = re.sub(r'^\s*id="[^"]*"\s*>', ' ', s)
    s = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', s, flags=re.S)
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()

def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return re.sub(r'-+', '-', s)[:70]

def yamlq(s):
    return '"' + str(s).replace('\\', '\\\\').replace('"', '\\"') + '"'

def write(path, front, body):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fm = '\n'.join(f'{k}: {v}' for k, v in front.items())
    open(path, 'w').write(f'---\n{fm}\n---\n\n{body.strip()}\n')

def items(prefix, stop):
    """each accordion item: (header html, body html)"""
    out = []
    pat = re.compile(rf'id="{prefix}Heading(\d+)".*?</h3>(.*?)(?=id="{prefix}Heading\d+"|{stop})', re.S)
    for m in pat.finditer(SRC):
        head = re.search(rf'id="{prefix}Heading{m.group(1)}".*?</h3>', SRC, re.S)
        out.append((m.group(1), SRC[head.start():head.end()], m.group(2)))
    return out

counts = {}

# ── publications ──────────────────────────────────────────────────────────
pubs = []
for n, head, body in items('res', '</section>'):
    title = txt(re.search(r'class="research-title">(.*?)</span>', head, re.S).group(1))
    typ = txt(re.search(r'class="research-type">(.*?)</span>', head, re.S).group(1))
    st = txt(re.search(r'class="research-badge[^"]*">(.*?)</span>', head, re.S).group(1))
    venue_m = re.search(r'class="research-venue".*?</i>(.*?)</p>', body, re.S)
    venue = txt(venue_m.group(1)) if venue_m else ''
    desc = ' '.join(txt(p) for p in re.findall(r'<p(?! class="research-venue")[^>]*>(.*?)</p>', body, re.S))
    pubs.append(title)
    write(f'{ROOT}/src/content/publications/{n}-{slug(title)}.md',
          {'title': yamlq(title), 'venue': yamlq(venue), 'kind': yamlq(typ),
           'status': yamlq(st), 'order': n}, desc)
counts['publications'] = len(pubs)

# ── projects: the written record, then the gallery blurbs merged in ────────
written = {}
for n, head, body in items('proj', '</section>'):
    full = txt(head)
    dm = re.search(r'((?:Jan|Feb|Mar|Apr|May|June?|July?|Aug|Sept?|Oct|Nov|Dec)[^—]*|\d{4}\s*$)', full)
    period = dm.group(1).strip() if dm else ''
    title = full.replace(period, '').strip(' —-–')
    written[slug(title)[:34]] = (title, period, ' '.join(txt(p) for p in re.findall(r'<p[^>]*>(.*?)</p>', body, re.S)))

cards = []
for m in re.finditer(r'<div class="project-card"[^>]*data-tags="([^"]*)"(.*?)(?=<div class="project-card"|</div>\s*<button class="projects-nav-btn projects-right)', SRC, re.S):
    tags, blk = m.group(1), m.group(2)
    t = re.search(r'<h3>(.*?)</h3>', blk, re.S)
    if not t: continue
    title = txt(t.group(1))
    desc = txt(re.search(r'<h3>.*?</h3>\s*<p>(.*?)</p>', blk, re.S).group(1)) if re.search(r'<h3>.*?</h3>\s*<p>(.*?)</p>', blk, re.S) else ''
    img = re.search(r'<img src="([^"]+)"', blk)
    links = [(txt(a.group(2)), a.group(1)) for a in re.finditer(r'<a href="(https?://[^"]+)"[^>]*>(.*?)</a>', blk, re.S)]
    cards.append((title, tags.split(), desc, img.group(1) if img else '', links))

for i, (title, tags, desc, img, links) in enumerate(cards, 1):
    key = slug(title)[:34]
    match = next((v for k, v in written.items() if k[:16] in key or key[:16] in k), None)
    period = match[1] if match else ''
    body = (match[2] if match else '') or desc
    front = {'title': yamlq(title), 'order': i, 'tags': json.dumps(tags),
             'period': yamlq(period), 'summary': yamlq(desc),
             'cover': yamlq('/' + img) if img else yamlq(''),
             'links': json.dumps([{'label': l[0], 'href': l[1]} for l in links])}
    write(f'{ROOT}/src/content/projects/{i:02d}-{key}.md', front, body)
counts['projects'] = len(cards)

# ── artwork & photography: from the asset manifest + the Art section copy ──
art_sec = SRC[SRC.index('id="art"'):SRC.index('id="contact"')]
statement = ' '.join(txt(p) for p in re.findall(r'<p[^>]*class="[^"]*artist-statement[^"]*"[^>]*>(.*?)</p>', art_sec, re.S))
if not statement:
    statement = ' '.join(txt(p) for p in re.findall(r'<p[^>]*>(.*?)</p>', art_sec, re.S)[:3])

seen = set()
n = 0
for m in re.finditer(r'assets/art/([a-z0-9-]+)\.jpg', SRC):
    stem = m.group(1)
    if stem.endswith('-thumb') or stem in seen: continue
    seen.add(stem); n += 1
    cat = 'Inbox Archive' if stem.startswith('inbox') else 'Studio'
    label = stem.replace('inbox-', '').replace('studio-', '').replace('-', ' ').title()
    write(f'{ROOT}/src/content/artwork/{n:02d}-{stem}.md',
          {'title': yamlq(label), 'series': yamlq(cat), 'order': n,
           'image': yamlq(f'/assets/art/{stem}.jpg'),
           'thumb': yamlq(f'/assets/art/{stem}-thumb.jpg')}, '')
counts['artwork'] = n

seen, n = set(), 0
for m in re.finditer(r'assets/photography/([a-z0-9-]+)\.jpg', SRC):
    stem = m.group(1)
    if stem.endswith('-thumb') or stem in seen: continue
    seen.add(stem); n += 1
    write(f'{ROOT}/src/content/photography/{n:02d}-{stem}.md',
          {'title': yamlq(stem.replace('-', ' ').title()), 'order': n,
           'image': yamlq(f'/assets/photography/{stem}.jpg'),
           'thumb': yamlq(f'/assets/photography/{stem}-thumb.jpg')}, '')
counts['photography'] = n

# ── CV: work, education, skills ───────────────────────────────────────────
def accordion(prefix):
    out = []
    for n, head, body in items(prefix, '</section>'):
        full = txt(head)
        parts = re.split(r'\s{2,}|(?<=\S)\s(?=(?:Jan|Feb|Mar|Apr|May|June?|July?|Aug|Sept?|Oct|Nov|Dec)\w*\s+\d{4})', full)
        dm = re.search(r'((?:Jan|Feb|Mar|Apr|May|June?|July?|Aug|Sept?|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}.*)$', full)
        period = dm.group(1).strip() if dm else ''
        title = full[:full.rfind(period)].strip(' —-–') if period else full
        bullets = [txt(li) for li in re.findall(r'<li[^>]*>(.*?)</li>', body, re.S)]
        paras = [txt(p) for p in re.findall(r'<p[^>]*>(.*?)</p>', body, re.S)]
        out.append({'title': title, 'period': period, 'points': bullets or paras})
    return out

skills = []
sk = SRC[SRC.index('id="skills"'):SRC.index('id="projects"')]
for m in re.finditer(r'<h3[^>]*>(.*?)</h3>(.*?)(?=<h3|</section>)', sk, re.S):
    skills.append({'group': txt(m.group(1)),
                   'items': [txt(li) for li in re.findall(r'<li[^>]*>(.*?)</li>', m.group(2), re.S)]
                             or [x.strip() for x in txt(m.group(2)).split('·') if x.strip()]})

about = [txt(p) for p in re.findall(r'<p[^>]*>(.*?)</p>', SRC[SRC.index('id="about"'):SRC.index('id="research"')], re.S)]
cv = {'about': [p for p in about if len(p) > 60],
      'work': accordion('work'), 'education': accordion('edu'), 'skills': skills}
os.makedirs(f'{ROOT}/src/data', exist_ok=True)
json.dump(cv, open(f'{ROOT}/src/data/cv.json', 'w'), indent=1, ensure_ascii=False)
counts['work'] = len(cv['work']); counts['education'] = len(cv['education']); counts['skills'] = len(skills)

site = {
  'name': 'Haoting (Alexa) Yu',
  'role': 'Creative Computing researcher · artist · photographer',
  'email': 'alexy1204@yahoo.com',
  'location': 'London, UK',
  'links': [
    {'label': 'GitHub', 'href': 'https://github.com/alexayu1204'},
    {'label': 'LinkedIn', 'href': 'https://www.linkedin.com/in/alexa-yu'},
    {'label': 'Studio site', 'href': 'https://alexy1204.wixsite.com/website'},
  ],
  'cvFile': '/Resume.pdf',
  'artistStatement': statement,
}
json.dump(site, open(f'{ROOT}/src/data/site.json', 'w'), indent=1, ensure_ascii=False)

for k, v in counts.items():
    print(f'  {k:<14} {v}')
