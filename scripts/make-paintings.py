#!/usr/bin/env python3
"""
The eleven pictures, repainted in Picasso's idiom.

These are ORIGINAL works in his manner, each after a named piece — not
reproductions. Picasso's estate holds copyright until 2043, so hanging actual
reproductions on a public site would be infringement; painting in the idiom is
not. The reference for each is named in its comment.

Palette is pulled toward the room deliberately: analytic-cubist ochres, umbers
and warm greys, with Blue- and Rose-period accents. Saturated primaries would
fight the dusty-rose salon and break the storybook mood the room is built on.

Vector, because the camera dollies ~6x into a frame.
"""
import os, math

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'scene', 'paintings')
os.makedirs(OUT, exist_ok=True)

C = dict(
    ochre='#b08d52', ochre_d='#7d6338', ochre_l='#cbab72',
    umber='#6d5740', umber_d='#45372a', umber_l='#8d7554',
    warm='#9a8f7d', cool='#7d8288', slate='#5f6670',
    stone='#c3b49c', cream='#e6dabf', white='#f2ead9',
    blue_d='#1e3350', blue='#2f5476', blue_l='#5c86a8',
    terra='#b5603a', rose='#c98d7e', olive='#7d7f57',
    ink='#1d1a18',
)

def head(w, h): return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
                        f'width="{w}" height="{h}" role="img">')

def grain(i):
    return (f'<filter id="g{i}" x="0" y="0" width="100%" height="100%">'
            f'<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="{i}"/>'
            f'<feColorMatrix type="saturate" values="0"/>'
            f'<feComponentTransfer><feFuncA type="linear" slope="0.30"/></feComponentTransfer></filter>')

def veil(w, h, i):
    """canvas tooth + aged varnish — this is what keeps them in the room"""
    return (f'<rect width="{w}" height="{h}" filter="url(#g{i})" opacity=".6" style="mix-blend-mode:overlay"/>'
            f'<radialGradient id="v{i}" cx="50%" cy="42%" r="72%">'
            f'<stop offset=".45" stop-color="#000" stop-opacity="0"/>'
            f'<stop offset="1" stop-color="#0b0810" stop-opacity=".6"/></radialGradient>'
            f'<rect width="{w}" height="{h}" fill="url(#v{i})"/>')

def P(pts, fill, op=1.0, sw=1.15, stroke=None):
    d = ' '.join(f'{x},{y}' for x, y in pts)
    return (f'<polygon points="{d}" fill="{fill}" opacity="{op}" '
            f'stroke="{stroke or C["ink"]}" stroke-width="{sw}" stroke-linejoin="round"/>')

def L(pts, col=None, w=1.4, cap='round'):
    d = 'M ' + ' L '.join(f'{x} {y}' for x, y in pts)
    return f'<path d="{d}" fill="none" stroke="{col or C["ink"]}" stroke-width="{w}" stroke-linecap="{cap}"/>'

f = {}

# ── publication ── after "Still Life with Chair Caning" (1912) ───────────────
w, h = 240, 180
f['stillife'] = head(w, h) + grain(1) + f'''
<rect width="{w}" height="{h}" fill="{C['umber_d']}"/>
{P([(0,0),(240,0),(240,58),(0,86)], C['warm'], .95)}
{P([(0,86),(240,58),(240,124),(0,148)], C['umber'], .95)}
{P([(0,148),(240,124),(240,180),(0,180)], C['umber_d'], .95)}
{P([(20,38),(122,24),(148,106),(40,130)], C['ochre'], .95)}
{P([(122,24),(216,48),(198,122),(148,106)], C['ochre_d'], .95)}
{P([(40,130),(148,106),(138,156),(50,162)], C['stone'], .92)}
{P([(96,64),(178,52),(186,116),(104,128)], C['umber_l'], .55)}
{P([(8,54),(58,44),(64,120),(14,132)], C['cool'], .45)}
<!-- the collaged newsprint fragment -->
{P([(40,52),(104,42),(112,86),(48,96)], C['cream'], .95)}
''' + ''.join(L([(48, 60 + i*7), (100 - i*6, 58 + i*7)], C['umber_d'], 1.1) for i in range(4)) + f'''
<text x="52" y="56" font-family="Times New Roman,serif" font-size="15" fill="{C['ink']}" letter-spacing="1">JOU</text>
<!-- glass, faceted into two viewpoints at once -->
{P([(154,56),(184,50),(178,104),(160,106)], C['cool'], .8)}
{P([(184,50),(202,58),(194,110),(178,104)], C['slate'], .75)}
<ellipse cx="178" cy="53" rx="24" ry="6" fill="{C['cream']}" opacity=".6" stroke="{C['ink']}" stroke-width="1.1"/>
<!-- pipe -->
{L([(62,132),(126,120),(150,128)], C['ink'], 3.2)}
{P([(146,120),(166,116),(170,134),(150,138)], C['umber_d'], .95)}
<!-- Picasso framed the original in rope; so is this -->
{L([(6,168),(234,158)], C['ochre_l'], 4)}
''' + ''.join(f'<circle cx="{10+i*13}" cy="{168-i*0.44:.1f}" r="2.1" fill="{C["umber_d"]}"/>' for i in range(18)) \
  + veil(w, h, 1) + '</svg>'

# ── ART ── after "Three Musicians" (1921), synthetic cubism ──────────────────
w, h = 180, 220
f['guitar'] = head(w, h) + grain(2) + f'''
<rect width="{w}" height="{h}" fill="{C['umber_d']}"/>
{P([(0,0),(180,0),(180,150),(0,168)], '#5a4634', .9)}
<!-- harlequin, left -->
{P([(14,44),(66,32),(74,150),(22,162)], C['terra'], .92)}
''' + ''.join(P([(22+ (i%3)*17, 56+(i//3)*20), (38+(i%3)*17, 52+(i//3)*20),
                 (42+(i%3)*17, 70+(i//3)*20), (26+(i%3)*17, 74+(i//3)*20)],
                C['ochre_l'] if i % 2 else C['cream'], .85, .8) for i in range(9)) + f'''
{P([(24,20),(62,14),(66,40),(28,46)], C['cream'], .95)}
{L([(34,26),(40,34)], C['ink'], 1.6)}{L([(52,24),(56,32)], C['ink'], 1.6)}
{L([(36,40),(56,37)], C['ink'], 1.4)}
<!-- the guitar, centre -->
{P([(70,74),(120,62),(132,132),(80,148)], C['ochre'], .95)}
{P([(120,62),(150,76),(146,130),(132,132)], C['ochre_d'], .9)}
<circle cx="106" cy="104" r="16" fill="{C['umber_d']}" stroke="{C['ink']}" stroke-width="1.2"/>
{P([(96,50),(112,46),(118,74),(102,78)], C['umber_l'], .95)}
''' + ''.join(L([(98 + i*4, 50), (106 + i*4, 140)], C['cream'], .9) for i in range(4)) + f'''
<!-- second player, right, reduced to a mask and a sheet of music -->
{P([(126,26),(168,20),(172,58),(130,64)], C['blue'], .9)}
{P([(138,32),(160,28),(162,50),(140,54)], C['cream'], .9, .8)}
<circle cx="146" cy="40" r="2.6" fill="{C['ink']}"/><circle cx="156" cy="38" r="2.6" fill="{C['ink']}"/>
{P([(128,152),(176,142),(180,196),(132,206)], C['cream'], .9)}
''' + ''.join(L([(136, 160 + i*9), (172, 156 + i*9)], C['slate'], .9) for i in range(5)) + f'''
{P([(0,168),(180,150),(180,220),(0,220)], C['umber_d'], .95)}
''' + veil(w, h, 2) + '</svg>'

# ── projects ── after "The Factory at Horta de Ebro" (1909) ──────────────────
w, h = 220, 170
f['factory'] = head(w, h) + grain(3) + f'''
<rect width="{w}" height="{h}" fill="{C['ochre_d']}"/>
{P([(0,0),(220,0),(220,58),(0,74)], C['cool'], .75)}
{P([(0,74),(220,58),(220,112),(0,124)], C['warm'], .7)}
{P([(24,60),(84,48),(92,116),(30,126)], C['stone'], .95)}
{P([(84,48),(126,60),(130,120),(92,116)], C['ochre'], .95)}
{P([(126,60),(178,52),(184,110),(130,120)], C['umber_l'], .92)}
{P([(178,52),(214,64),(212,108),(184,110)], C['ochre_d'], .92)}
{P([(96,20),(116,16),(120,60),(100,62)], C['stone'], .95)}
{P([(116,16),(128,22),(130,62),(120,60)], C['umber'], .92)}
''' + ''.join(P([(36+i*22, 70), (52+i*22, 66), (54+i*22, 88), (38+i*22, 92)],
                C['umber_d'], .85, .8) for i in range(7)) + f'''
<!-- the faceted palm Picasso set against the roofs -->
{L([(190,116),(196,66)], C['umber_d'], 3.4)}
''' + ''.join(P([(196,66),(196+22*math.cos(math.radians(a)), 66-18*abs(math.sin(math.radians(a)))),
                 (196+14*math.cos(math.radians(a)), 62)], C['olive'], .9, .9)
              for a in (-140,-110,-70,-40,20,160)) + f'''
{P([(0,124),(220,112),(220,170),(0,170)], C['umber'], .9)}
''' + ''.join(L([(10+i*30, 130 + (i%2)*6), (44+i*30, 124 + (i%2)*6)], C['ochre_d'], 1.1) for i in range(7)) \
  + veil(w, h, 3) + '</svg>'

# ── photography ── after "Landscape at Céret" (1911), analytic cubism ────────
w, h = 180, 220
f['landscape'] = head(w, h) + grain(4)
f['landscape'] += f'<rect width="{w}" height="{h}" fill="{C["warm"]}"/>'
_seed = [(0,0,180,52,'stone'),(0,44,96,108,'ochre'),(84,38,180,104,'cool'),
         (0,100,74,168,'umber_l'),(66,96,144,180,'ochre_d'),(132,94,180,176,'stone'),
         (0,160,88,220,'umber'),(80,172,180,220,'ochre'),(40,60,120,132,'cream')]
for i,(x0,y0,x1,y1,col) in enumerate(_seed):
    j = (i % 3) * 5 - 5
    f['landscape'] += P([(x0, y0+j), (x1, y0-j), (x1+j, y1), (x0-j, y1+j)], C[col], .95, 1.15)
f['landscape'] += ''.join(
    P([(24+i*26, 74+(i%3)*22), (52+i*26, 66+(i%3)*22), (58+i*26, 128+(i%3)*20), (30+i*26, 136+(i%3)*20)],
      C['cream'] if i % 2 else C['umber_d'], .62, 1.1) for i in range(6))
f['landscape'] += ''.join(L([(20+i*30, 40+(i%2)*14), (44+i*30, 96+(i%2)*10)], C['ink'], 1.5) for i in range(6))
f['landscape'] += ''.join(L([(8+i*34, 150+(i%2)*16), (40+i*34, 196+(i%2)*8)], C['ink'], 1.4) for i in range(5))
f['landscape'] += L([(96,214),(104,120),(88,64)], C['umber_d'], 3.0)
f['landscape'] += ''.join(L([(100,86+i*16),(126-i*8,70+i*16)], C['olive'], 1.6) for i in range(3))
f['landscape'] += veil(w, h, 4) + '</svg>'

# ── education ── after "Girl with a Mandolin" (1910), a reader instead ───────
w, h = 170, 215
f['woman'] = head(w, h) + grain(5) + f'''
<rect width="{w}" height="{h}" fill="{C['umber']}"/>
{P([(0,0),(170,0),(170,80),(0,96)], C['warm'], .7)}
{P([(0,96),(170,80),(170,215),(0,215)], C['umber_d'], .55)}
<!-- head, broken into planes seen from two sides at once -->
{P([(58,26),(96,20),(104,58),(62,64)], C['stone'], .95)}
{P([(96,20),(118,34),(116,70),(104,58)], C['ochre_l'], .92)}
{P([(62,64),(104,58),(100,88),(66,90)], C['ochre'], .9)}
{L([(70,40),(86,38)], C['ink'], 1.5)}
<circle cx="76" cy="44" r="3" fill="{C['ink']}"/>
{P([(96,38),(108,36),(107,48),(95,50)], C['cream'], .95, .8)}
<circle cx="101" cy="43" r="2.4" fill="{C['ink']}"/>
{L([(88,56),(92,72),(82,74)], C['ink'], 1.3)}
{L([(74,80),(94,77)], C['ink'], 1.4)}
<!-- shoulders and arms as planes -->
{P([(38,88),(104,80),(122,140),(46,152)], C['slate'], .9)}
{P([(104,80),(140,100),(136,152),(122,140)], C['cool'], .88)}
{P([(46,152),(122,140),(132,215),(34,215)], C['umber_d'], .92)}
<!-- the book -->
{P([(48,124),(92,116),(96,150),(52,158)], C['cream'], .95)}
{P([(92,116),(126,122),(128,152),(96,150)], C['stone'], .95)}
{L([(94,118),(97,150)], C['ink'], 1.2)}
''' + ''.join(L([(56, 130+i*7), (86, 126+i*7)], C['slate'], .9) for i in range(3)) \
  + ''.join(L([(102, 130+i*7), (122, 132+i*7)], C['slate'], .9) for i in range(3)) + f'''
{P([(4,168),(30,164),(34,206),(8,210)], C['rose'], .55)}
''' + veil(w, h, 5) + '</svg>'

# ── contact ── after the Blue Period; a window, and someone still up ─────────
w, h = 160, 160
f['bluewindow'] = head(w, h) + grain(6) + f'''
<rect width="{w}" height="{h}" fill="{C['blue_d']}"/>
{P([(0,0),(160,0),(160,58),(0,72)], C['blue'], .8)}
{P([(0,72),(160,58),(160,160),(0,160)], C['blue_d'], .85)}
{P([(20,26),(74,18),(80,44),(26,52)], C['blue_l'], .5)}
<!-- the window, faceted, with the only warm light in the picture -->
{P([(52,44),(112,36),(118,104),(58,114)], C['blue_l'], .85)}
{P([(60,52),(84,48),(87,74),(63,78)], '#e0b070', .95, .9)}
{P([(88,47),(110,44),(112,72),(90,75)], '#c98a4e', .9, .9)}
{P([(62,80),(86,77),(88,102),(64,106)], '#b5733c', .85, .9)}
{P([(90,77),(112,74),(114,100),(92,103)], '#e0b070', .8, .9)}
{L([(87,44),(90,104)], C['ink'], 1.6)}{L([(56,78),(116,72)], C['ink'], 1.6)}
<circle cx="86" cy="76" r="30" fill="#e0b070" opacity=".14"/>
<circle cx="86" cy="76" r="52" fill="#e0b070" opacity=".07"/>
<!-- a bird on the sill, three strokes -->
{L([(30,120),(46,112),(62,120)], C['cream'], 1.8)}
{L([(46,112),(44,126)], C['cream'], 1.6)}
{P([(0,128),(160,116),(160,160),(0,160)], '#16263c', .95)}
{L([(8,132),(152,121)], C['blue_l'], 1.2)}
''' + veil(w, h, 6) + '</svg>'

# ── orbiters ─────────────────────────────────────────────────────────────────
# after "La Colombe" (1949) — the dove, in as few strokes as it takes
w, h = 100, 130
f['dove'] = head(w, h) + grain(7) + f'''
<rect width="{w}" height="{h}" fill="{C['umber_d']}"/>
{P([(0,0),(100,0),(100,84),(0,96)], '#3b3025', .9)}
<path d="M10 88 C18 48 44 30 66 36 C82 41 90 54 93 66 C82 60 71 60 63 66
         C77 72 85 84 82 100 C68 88 52 85 41 90 C30 96 18 96 10 88Z"
      fill="{C['white']}" stroke="{C['ink']}" stroke-width="1.2" stroke-linejoin="round"/>
<path d="M34 62 C46 50 62 47 74 52" fill="none" stroke="{C['ink']}" stroke-width="1.2"/>
{L([(93,66),(108,63),(97,71)], C['ochre_l'], 2)}
<circle cx="84" cy="57" r="2.2" fill="{C['ink']}"/>
{L([(60,96),(54,116)], C['olive'], 2)}
''' + ''.join(f'<ellipse cx="{59-i*3}" cy="{100+i*7}" rx="6" ry="3" fill="{C["olive"]}" '
              f'transform="rotate({-30+i*18} {59-i*3} {100+i*7})" opacity=".95"/>' for i in range(3)) \
  + veil(w, h, 7) + '</svg>'

# the double profile — one face seen frontally and in profile at once
w, h = 130, 110
f['profiles'] = head(w, h) + grain(8) + f'''
<rect width="{w}" height="{h}" fill="{C['stone']}"/>
{P([(0,0),(130,0),(130,44),(0,54)], C['ochre_l'], .55)}
{P([(30,14),(78,8),(86,86),(38,96)], C['cream'], .95)}
{P([(78,8),(104,26),(100,80),(86,86)], C['ochre'], .9)}
{L([(78,10),(84,88)], C['ink'], 1.3)}
{P([(44,32),(64,29),(66,42),(46,45)], C['white'], .95, .8)}
<circle cx="55" cy="37" r="3.4" fill="{C['ink']}"/>
{P([(84,30),(98,34),(96,46),(83,43)], C['white'], .9, .8)}
<circle cx="90" cy="38" r="3" fill="{C['blue']}"/>
{L([(72,40),(70,58),(60,60)], C['ink'], 1.4)}
{L([(50,70),(76,66)], C['ink'], 1.5)}
{L([(38,96),(88,88)], C['ink'], 1.2)}
{P([(0,54),(130,44),(130,110),(0,110)], C['umber_l'], .5)}
''' + veil(w, h, 8) + '</svg>'

w, h = 160, 120
f['houses'] = head(w, h) + grain(9) + f'''
<rect width="{w}" height="{h}" fill="{C['blue_d']}"/>
{P([(0,0),(160,0),(160,52),(0,64)], C['blue'], .7)}
{P([(18,44),(58,36),(64,92),(24,100)], C['slate'], .9)}
{P([(58,36),(92,48),(96,90),(64,92)], C['cool'], .85)}
{P([(92,48),(134,40),(138,88),(96,90)], C['umber_l'], .85)}
{P([(48,56),(62,54),(63,68),(49,70)], '#e0b070', .95, .8)}
{P([(104,58),(118,56),(119,70),(105,72)], '#c98a4e', .85, .8)}
{P([(0,92),(160,84),(160,120),(0,120)], '#161f30', .95)}
{L([(6,98),(154,90)], C['blue_l'], 1.1)}
''' + veil(w, h, 9) + '</svg>'

w, h = 130, 170
f['bouquet'] = head(w, h) + grain(10) + f'''
<rect width="{w}" height="{h}" fill="{C['umber']}"/>
{P([(0,0),(130,0),(130,96),(0,108)], C['warm'], .6)}
{P([(46,104),(84,98),(92,152),(40,158)], C['blue'], .9)}
{P([(84,98),(96,108),(98,148),(92,152)], C['blue_d'], .9)}
<ellipse cx="66" cy="101" rx="21" ry="6" fill="{C['blue_l']}" stroke="{C['ink']}" stroke-width="1.1"/>
''' + ''.join(L([(66, 100), (px, py)], C['olive'], 2.2) for px, py in ((30,50),(66,32),(102,56))) \
  + ''.join(P([(px-19,py),(px,py-22),(px+19,py),(px,py+20)], col, .96, 1.3)
            for px, py, col in ((30,50,C['rose']),(66,32,C['cream']),(102,56,C['terra']))) \
  + ''.join(P([(px-9,py),(px,py-10),(px+9,py),(px,py+9)], C['ochre_l'], .9, 1.1)
            for px, py in ((30,50),(66,32),(102,56))) \
  + ''.join(f'<circle cx="{px}" cy="{py}" r="4.5" fill="{C["umber_d"]}"/>'
            for px, py in ((30,50),(66,32),(102,56))) + f'''
{P([(0,108),(130,96),(130,170),(0,170)], C['umber_d'], .8)}
''' + veil(w, h, 10) + '</svg>'

w, h = 80, 110
f['key'] = head(w, h) + grain(11) + f'''
<rect width="{w}" height="{h}" fill="{C['umber_d']}"/>
{P([(0,0),(80,0),(80,52),(0,62)], C['slate'], .55)}
{P([(0,62),(80,52),(80,110),(0,110)], '#2b2320', .8)}
<g transform="translate(40 54) rotate(-16)">
  {P([(-13,-30),(0,-38),(13,-30),(13,-16),(0,-8),(-13,-16)], C['ochre_l'], .98, 1.2)}
  {P([(-5,-26),(0,-30),(5,-26),(5,-19),(0,-15),(-5,-19)], C['umber_d'], 1, 1.0)}
  {P([(-4,-10),(4,-10),(4,30),(-4,30)], C['ochre'], .98, 1.2)}
  {P([(4,14),(15,14),(15,21),(4,21)], C['ochre_l'], .98, 1.1)}
  {P([(4,24),(12,24),(12,30),(4,30)], C['ochre_l'], .98, 1.1)}
  {L([(-1,-8),(-1,28)], C['umber_d'], 1.1)}
</g>
{P([(0,92),(80,86),(80,110),(0,110)], '#1d1714', .85)}
''' + veil(w, h, 11) + '</svg>'

for name, svg in f.items():
    open(os.path.join(OUT, name + '.svg'), 'w').write(svg)
    print(f'  {name:<12} {len(svg):>6} bytes')
print(f'\n{len(f)} pictures, after Picasso.')
