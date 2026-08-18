#!/usr/bin/env python3
"""
Paints the eleven pictures on the wall.

Vector, not raster: the camera dollies ~6x into a frame, and a raster interior would
turn to mush at the moment the visitor is looking hardest at it.

Six of these navigate, and their subjects are metaphors drawn from Alexa's own work —
never a label reading "RESEARCH". Five are curiosities that exist only to give the
salon its density.
"""
import os, math, random

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'scene', 'paintings')
os.makedirs(OUT, exist_ok=True)

C = dict(
    night='#1a1822', deep='#12111a', dusk='#2b2836', ink='#241f27',
    canvas='#cdbf9f', parch='#ded1b4', cream='#efe3c6',
    sage='#78876c', sagelt='#93a086', blue='#67788c', bluelt='#8ea0b0',
    burg='#7a3b40', rose='#bf8a83', brass='#b98f4e', brasslt='#dcb877',
    brassdk='#7d5c2c', shadow='#0d0b12', warm='#e6b878',
)

def head(w, h, extra=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}" role="img">{extra}')

def grain(idx):
    """A little tooth so nothing reads as flat vector fill."""
    return (f'<filter id="g{idx}" x="0" y="0" width="100%" height="100%">'
            f'<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="{idx}"/>'
            f'<feColorMatrix type="saturate" values="0"/>'
            f'<feComponentTransfer><feFuncA type="linear" slope="0.30"/></feComponentTransfer>'
            f'</filter>')

def veil(w, h, idx):
    """aged varnish + canvas tooth, laid over every picture"""
    return (f'<rect width="{w}" height="{h}" filter="url(#g{idx})" opacity=".62" style="mix-blend-mode:overlay"/>'
            f'<radialGradient id="v{idx}" cx="50%" cy="42%" r="72%">'
            f'<stop offset=".45" stop-color="#000" stop-opacity="0"/>'
            f'<stop offset="1" stop-color="#0b0810" stop-opacity=".62"/></radialGradient>'
            f'<rect width="{w}" height="{h}" fill="url(#v{idx})"/>')

def stars(n, w, h, seed, ymax=None):
    random.seed(seed)
    ymax = ymax or h * 0.55
    out = []
    for _ in range(n):
        x, y = random.uniform(4, w - 4), random.uniform(3, ymax)
        r = random.choice([.6, .7, .9, 1.1])
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{C["cream"]}" opacity="{random.uniform(.25,.8):.2f}"/>')
    return ''.join(out)

files = {}

# ── RESEARCH ─────────────────────────────────────────────────────────────────
# A hillside observatory whose dome is a drum head — her ISMIR drum-transcription
# work and her MRAG governance work, folded into one impossible building.
w, h = 240, 180
files['observatory'] = head(w, h) + grain(1) + f'''
<linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="{C['deep']}"/><stop offset=".62" stop-color="#2a2740"/>
  <stop offset="1" stop-color="#5c4a52"/></linearGradient>
<rect width="{w}" height="{h}" fill="url(#sky1)"/>
{stars(38, w, h, 4, 110)}
<circle cx="196" cy="34" r="11" fill="{C['cream']}" opacity=".82"/>
<circle cx="191" cy="31" r="11" fill="#2a2740" opacity=".95"/>
<!-- far ridge -->
<path d="M0 132 L34 118 L62 126 L96 106 L128 120 L166 104 L200 118 L240 108 L240 180 L0 180Z" fill="#3a3346" opacity=".85"/>
<!-- near hill -->
<path d="M0 152 L46 140 L92 148 L140 134 L190 146 L240 138 L240 180 L0 180Z" fill="#221f2c"/>
<!-- the beam, before the building, so the building sits in front of it -->
<path d="M120 92 L206 40 L214 56 L124 100Z" fill="{C['warm']}" opacity=".16"/>
<!-- tower -->
<path d="M104 146 L104 104 L136 104 L136 146Z" fill="#2e2833"/>
<path d="M104 146 L104 104 L118 104 L118 146Z" fill="#3b3440"/>
<rect x="112" y="114" width="6" height="9" rx="2" fill="{C['warm']}" opacity=".9"/>
<rect x="124" y="126" width="6" height="9" rx="2" fill="{C['warm']}" opacity=".55"/>
<!-- the dome, built as a drum: shell, hoop, lugs, tension rods -->
<path d="M98 104 A22 20 0 0 1 142 104 Z" fill="#4a4150"/>
<path d="M98 104 A22 20 0 0 1 120 84 L120 104 Z" fill="#574d5e"/>
<ellipse cx="120" cy="104" rx="22" ry="3.4" fill="{C['brassdk']}"/>
<ellipse cx="120" cy="101.5" rx="22" ry="3.4" fill="{C['brass']}"/>
<path d="M100 92 A21 19 0 0 1 140 92" fill="none" stroke="{C['brasslt']}" stroke-width="1.5" opacity=".8"/>
''' + ''.join(
    f'<rect x="{120+22*math.cos(math.radians(a))-1.4:.1f}" y="{101-8-3*abs(math.cos(math.radians(a))):.1f}" '
    f'width="2.8" height="9" rx="1" fill="{C["brass"]}" opacity=".9"/>'
    for a in (14, 46, 78, 102, 134, 166)
) + f'''
<!-- the slit -->
<path d="M120 84 L120 101" stroke="{C['warm']}" stroke-width="2.6" opacity=".75"/>
<path d="M0 152 L46 140 L92 148 L140 134 L190 146 L240 138" fill="none" stroke="#4a4150" stroke-width=".8" opacity=".5"/>
''' + veil(w, h, 1) + '</svg>'

# ── ARTWORK ──────────────────────────────────────────────────────────────────
# The Inbox Archive: a wall of opened letters. Her real installation.
w, h = 180, 220
letters = []
random.seed(11)
for r in range(5):
    for c in range(3):
        x = 16 + c * 52 + random.uniform(-3, 3)
        y = 22 + r * 38 + random.uniform(-3, 3)
        rot = random.uniform(-6, 6)
        tone = random.choice([C['parch'], C['cream'], '#d6c8a8', '#cabb99'])
        letters.append(
            f'<g transform="translate({x:.1f} {y:.1f}) rotate({rot:.1f})">'
            f'<rect width="42" height="30" rx="1.5" fill="{tone}"/>'
            f'<path d="M0 0 L21 15 L42 0" fill="none" stroke="#0000" />'
            f'<path d="M0 0 L21 13 L42 0 L42 2 L21 15 L0 2Z" fill="#000" opacity=".16"/>'
            + ''.join(f'<rect x="6" y="{18+i*4}" width="{28-i*7}" height="1.1" fill="#3b3128" opacity=".38"/>' for i in range(2))
            + f'<circle cx="21" cy="-2" r="1.6" fill="{C["brass"]}"/>'
            f'</g>')
files['letters'] = head(w, h) + grain(2) + f'''
<linearGradient id="wl" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#3a2b31"/><stop offset="1" stop-color="#241a1f"/></linearGradient>
<rect width="{w}" height="{h}" fill="url(#wl)"/>
<path d="M0 14 H180 M0 52 H180 M0 90 H180 M0 128 H180 M0 166 H180"
      stroke="{C['brassdk']}" stroke-width=".7" opacity=".45"/>
''' + ''.join(letters) + veil(w, h, 2) + '</svg>'

# ── PROJECTS ─────────────────────────────────────────────────────────────────
# A brass machine, half of it still only a drawing.
w, h = 220, 170
files['machine'] = head(w, h) + grain(3) + f'''
<rect width="{w}" height="{h}" fill="#2a2531"/>
<rect width="{w}" height="{h}" fill="#161320" opacity=".35"/>
<!-- blueprint half -->
<g stroke="{C['bluelt']}" fill="none" opacity=".5" stroke-width=".8" stroke-dasharray="3 2.5">
  <rect x="14" y="52" width="86" height="72" rx="4"/>
  <circle cx="57" cy="88" r="26"/><circle cx="57" cy="88" r="14"/>
  <path d="M57 40 V52 M57 124 V138 M8 88 H14 M100 88 H112"/>
  <path d="M20 44 H96 M20 40 V48 M96 40 V48"/>
</g>
<text x="24" y="38" font-family="Georgia,serif" font-size="7" fill="{C['bluelt']}" opacity=".55">fig. ii</text>
<!-- built half -->
<rect x="104" y="56" width="82" height="66" rx="5" fill="{C['brassdk']}"/>
<rect x="104" y="56" width="82" height="66" rx="5" fill="none" stroke="{C['brasslt']}" stroke-width="1.2" opacity=".7"/>
<rect x="110" y="62" width="70" height="20" rx="3" fill="#241f27"/>
<circle cx="122" cy="72" r="5" fill="{C['warm']}" opacity=".9"/>
<circle cx="138" cy="72" r="3" fill="{C['rose']}" opacity=".7"/>
<circle cx="152" cy="72" r="3" fill="{C['sagelt']}" opacity=".6"/>
<circle cx="145" cy="102" r="15" fill="#332b22" stroke="{C['brass']}" stroke-width="1.4"/>
<path d="M145 92 L149 102 L145 102Z" fill="{C['brasslt']}"/>
''' + ''.join(
    f'<rect x="{145+15*math.cos(math.radians(a))-1.6:.1f}" y="{102+15*math.sin(math.radians(a))-1.6:.1f}" '
    f'width="3.2" height="3.2" rx=".6" fill="{C["brass"]}" transform="rotate({a} {145+15*math.cos(math.radians(a)):.1f} {102+15*math.sin(math.radians(a)):.1f})"/>'
    for a in range(0, 360, 30)
) + f'''
<path d="M186 78 q16 6 16 22 q0 14 -12 18" fill="none" stroke="{C['brass']}" stroke-width="3.4" stroke-linecap="round"/>
<path d="M100 88 H104" stroke="{C['brasslt']}" stroke-width="2"/>
<ellipse cx="110" cy="132" rx="52" ry="5" fill="#000" opacity=".3"/>
''' + veil(w, h, 3) + '</svg>'

# ── PHOTOGRAPHY ──────────────────────────────────────────────────────────────
# Her magnolia photograph, hung as a picture.
w, h = 180, 220
def blossom(cx, cy, s, rot, op=1.0):
    pet = ''.join(
        f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{5.2*s:.1f}" ry="{11*s:.1f}" fill="{C["cream"]}" '
        f'opacity="{0.72*op:.2f}" transform="rotate({rot+a} {cx:.1f} {cy:.1f}) translate(0 {-7*s:.1f})"/>'
        for a in (0, 60, 120, 180, 240, 300))
    return (f'<g>{pet}<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{2.4*s:.1f}" fill="{C["rose"]}" opacity="{0.8*op:.2f}"/></g>')
files['magnolia'] = head(w, h) + grain(4) + f'''
<linearGradient id="sk4" x1="0" y1="0" x2=".3" y2="1">
  <stop offset="0" stop-color="#c9c3b4"/><stop offset=".55" stop-color="#a99f92"/>
  <stop offset="1" stop-color="#7d7368"/></linearGradient>
<rect width="{w}" height="{h}" fill="url(#sk4)"/>
<path d="M-6 206 C40 176 58 150 74 108 C86 76 92 40 88 -6" fill="none" stroke="#43382f" stroke-width="7" stroke-linecap="round"/>
<path d="M74 112 C96 100 118 96 146 92" fill="none" stroke="#43382f" stroke-width="4.2" stroke-linecap="round"/>
<path d="M82 62 C104 56 122 44 134 26" fill="none" stroke="#4d4137" stroke-width="3.2" stroke-linecap="round"/>
<path d="M52 158 C74 152 92 156 112 166" fill="none" stroke="#4d4137" stroke-width="3" stroke-linecap="round"/>
{blossom(140, 90, 1.5, 12)}
{blossom(90, 44, 1.25, -20)}
{blossom(112, 168, 1.15, 30, .92)}
{blossom(58, 122, .85, 6, .8)}
{blossom(150, 30, .7, 44, .62)}
''' + veil(w, h, 4) + '</svg>'

# ── THE STUDY ────────────────────────────────────────────────────────────────
# A formal portrait, an ink plum branch beside it. About + CV.
w, h = 170, 215
files['portrait'] = head(w, h) + grain(5) + f'''
<radialGradient id="pb" cx="50%" cy="36%" r="70%">
  <stop offset="0" stop-color="#5d5344"/><stop offset="1" stop-color="#241f1c"/></radialGradient>
<rect width="{w}" height="{h}" fill="url(#pb)"/>
<!-- shoulders -->
<path d="M28 215 C34 158 58 138 85 138 C112 138 136 158 142 215Z" fill="#20242b"/>
<path d="M85 138 C74 150 70 166 72 215 L98 215 C100 166 96 150 85 138Z" fill="#2b3039"/>
<path d="M85 140 L78 154 L85 168 L92 154Z" fill="{C['cream']}" opacity=".85"/>
<!-- head -->
<ellipse cx="85" cy="102" rx="26" ry="31" fill="#c4a189"/>
<path d="M59 100 C58 70 72 58 85 58 C98 58 112 70 111 100 C111 84 100 76 85 76 C70 76 59 84 59 100Z" fill="#2a2028"/>
<path d="M59 96 C52 122 56 146 62 152 C56 130 60 112 62 104Z" fill="#2a2028"/>
<path d="M111 96 C118 122 114 146 108 152 C114 130 110 112 108 104Z" fill="#2a2028"/>
<ellipse cx="76" cy="104" rx="2.4" ry="1.7" fill="#3a2c26" opacity=".8"/>
<ellipse cx="94" cy="104" rx="2.4" ry="1.7" fill="#3a2c26" opacity=".8"/>
<path d="M80 118 q5 3 10 0" fill="none" stroke="#7d4f47" stroke-width="1.4" stroke-linecap="round" opacity=".75"/>
<!-- ink plum branch, lower left -->
<path d="M4 212 C18 190 22 172 20 152" fill="none" stroke="#171418" stroke-width="2.6" stroke-linecap="round"/>
<path d="M20 176 C30 170 38 162 42 150" fill="none" stroke="#171418" stroke-width="1.8" stroke-linecap="round"/>
<path d="M18 196 C28 194 34 190 40 182" fill="none" stroke="#171418" stroke-width="1.5" stroke-linecap="round"/>
''' + ''.join(
    f'<g>' + ''.join(
        f'<circle cx="{px+3.2*math.cos(math.radians(a)):.1f}" cy="{py+3.2*math.sin(math.radians(a)):.1f}" r="2.5" fill="{C["rose"]}" opacity=".85"/>'
        for a in range(0, 360, 72)) + f'<circle cx="{px}" cy="{py}" r="1.2" fill="#f0e0d4" opacity=".9"/></g>'
    for px, py in ((42, 149), (21, 151), (40, 181), (30, 168))
) + veil(w, h, 5) + '</svg>'

# ── CONTACT ──────────────────────────────────────────────────────────────────
# A distant lit window at night. Somewhere, someone is in.
w, h = 160, 160
files['window'] = head(w, h) + grain(6) + f'''
<linearGradient id="n6" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#141726"/><stop offset="1" stop-color="#242131"/></linearGradient>
<rect width="{w}" height="{h}" fill="url(#n6)"/>
{stars(22, w, h, 9, 70)}
<path d="M0 126 L34 120 L74 128 L120 118 L160 126 L160 160 L0 160Z" fill="#15121c"/>
<path d="M46 128 L46 62 L114 62 L114 128Z" fill="#1d1a26"/>
<path d="M46 62 L80 40 L114 62Z" fill="#231f2d"/>
<rect x="70" y="82" width="20" height="26" rx="1.5" fill="{C['warm']}"/>
<rect x="70" y="82" width="20" height="26" rx="1.5" fill="none" stroke="#3a3040" stroke-width="1.6"/>
<path d="M80 82 V108 M70 95 H90" stroke="#3a3040" stroke-width="1.4"/>
<rect x="66" y="78" width="28" height="34" rx="2" fill="{C['warm']}" opacity=".18"/>
<circle cx="80" cy="95" r="30" fill="{C['warm']}" opacity=".09"/>
<circle cx="80" cy="95" r="52" fill="{C['warm']}" opacity=".05"/>
<path d="M62 160 L74 128 L86 128 L98 160Z" fill="{C['warm']}" opacity=".07"/>
<rect x="56" y="116" width="48" height="3" fill="#120f19"/>
''' + veil(w, h, 6) + '</svg>'

# ── ORBITERS ─────────────────────────────────────────────────────────────────
w, h = 100, 130
files['beetle'] = head(w, h) + grain(7) + f'''
<rect width="{w}" height="{h}" fill="{C['parch']}"/>
<rect width="{w}" height="{h}" fill="#8a7856" opacity=".2"/>
<ellipse cx="50" cy="64" rx="20" ry="28" fill="#2e2620"/>
<ellipse cx="50" cy="60" rx="19" ry="26" fill="#3d3128"/>
<path d="M50 34 v52" stroke="#191410" stroke-width="1.6"/>
<ellipse cx="50" cy="34" rx="9" ry="8" fill="#241d18"/>
<ellipse cx="50" cy="26" rx="5.4" ry="5" fill="#191410"/>
<path d="M45 21 l-6 -9 M55 21 l6 -9" stroke="#191410" stroke-width="1.6" stroke-linecap="round"/>
<path d="M32 46 l-16 -8 M32 62 l-18 2 M32 76 l-15 10
         M68 46 l16 -8 M68 62 l18 2 M68 76 l15 10"
      stroke="#241d18" stroke-width="1.9" stroke-linecap="round"/>
<ellipse cx="42" cy="50" rx="4" ry="9" fill="{C['brasslt']}" opacity=".28"/>
<line x1="50" y1="6" x2="50" y2="96" stroke="#6e5f45" stroke-width="1.1"/>
<circle cx="50" cy="6" r="2.6" fill="{C['brass']}"/>
<rect x="30" y="100" width="40" height="14" rx="1" fill="#efe6cd" stroke="#9b8b68" stroke-width=".6"/>
<path d="M35 105 h26 M35 109 h18" stroke="#6b5c44" stroke-width="1" opacity=".6"/>
''' + veil(w, h, 7) + '</svg>'

w, h = 130, 110
files['butterfly'] = head(w, h) + grain(8) + f'''
<rect width="{w}" height="{h}" fill="{C['cream']}"/>
<rect width="{w}" height="{h}" fill="#8f7f5e" opacity=".18"/>
<g transform="translate(65 56)">
  <path d="M-2 -4 C-30 -40 -58 -32 -52 -8 C-48 8 -24 12 -2 4Z" fill="{C['burg']}" opacity=".82"/>
  <path d="M2 -4 C30 -40 58 -32 52 -8 C48 8 24 12 2 4Z" fill="{C['burg']}" opacity=".82"/>
  <path d="M-2 4 C-24 22 -34 40 -18 44 C-8 46 -2 24 -2 8Z" fill="#8f4a4a" opacity=".8"/>
  <path d="M2 4 C24 22 34 40 18 44 C8 46 2 24 2 8Z" fill="#8f4a4a" opacity=".8"/>
  <circle cx="-32" cy="-16" r="5" fill="{C['cream']}" opacity=".6"/>
  <circle cx="32" cy="-16" r="5" fill="{C['cream']}" opacity=".6"/>
  <circle cx="-20" cy="30" r="3" fill="{C['cream']}" opacity=".45"/>
  <circle cx="20" cy="30" r="3" fill="{C['cream']}" opacity=".45"/>
  <ellipse cx="0" cy="6" rx="2.6" ry="22" fill="#241d18"/>
  <path d="M-1 -14 C-6 -26 -12 -30 -16 -31 M1 -14 C6 -26 12 -30 16 -31"
        stroke="#241d18" stroke-width="1.3" fill="none" stroke-linecap="round"/>
</g>
<circle cx="65" cy="14" r="2.2" fill="{C['brass']}"/>
''' + veil(w, h, 8) + '</svg>'

w, h = 160, 120
files['cottage'] = head(w, h) + grain(9) + f'''
<linearGradient id="n9" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#1b1f2e"/><stop offset="1" stop-color="#2e2a34"/></linearGradient>
<rect width="{w}" height="{h}" fill="url(#n9)"/>
{stars(16, w, h, 21, 56)}
<path d="M0 96 C40 88 60 92 90 86 C120 80 140 86 160 82 L160 120 L0 120Z" fill="#191722"/>
<path d="M58 96 L58 62 L104 62 L104 96Z" fill="#26222e"/>
<path d="M52 64 L81 42 L110 64Z" fill="#332c38"/>
<rect x="72" y="76" width="14" height="20" rx="1" fill="{C['warm']}" opacity=".92"/>
<path d="M79 76 V96 M72 86 H86" stroke="#2a2430" stroke-width="1.2"/>
<circle cx="79" cy="86" r="20" fill="{C['warm']}" opacity=".1"/>
<rect x="92" y="46" width="7" height="16" fill="#2b2531"/>
<path d="M18 104 C22 84 26 78 28 66 C30 78 34 84 38 104Z" fill="#1d1b26"/>
<path d="M126 102 C130 84 133 78 135 68 C137 78 140 84 144 102Z" fill="#1d1b26"/>
''' + veil(w, h, 9) + '</svg>'

w, h = 130, 170
files['vase'] = head(w, h) + grain(10) + f'''
<linearGradient id="b10" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#4b3f42"/><stop offset="1" stop-color="#2a2226"/></linearGradient>
<rect width="{w}" height="{h}" fill="url(#b10)"/>
<path d="M50 104 C40 116 40 140 48 152 L82 152 C90 140 90 116 80 104 C74 100 56 100 50 104Z" fill="#5e4a3c"/>
<path d="M50 104 C44 114 43 134 47 148 C52 132 52 116 58 104Z" fill="#7a6250" opacity=".8"/>
<ellipse cx="65" cy="104" rx="15" ry="4" fill="#3d3026"/>
<path d="M65 100 C60 82 52 70 44 58 M65 100 C70 84 80 74 88 64 M65 100 C64 84 64 72 65 56"
      fill="none" stroke="{C['sage']}" stroke-width="1.8" stroke-linecap="round"/>
''' + ''.join(
    f'<g>' + ''.join(
        f'<ellipse cx="{px}" cy="{py}" rx="4" ry="7" fill="{col}" opacity=".85" '
        f'transform="rotate({a} {px} {py}) translate(0 -5)"/>' for a in (0, 72, 144, 216, 288))
    + f'<circle cx="{px}" cy="{py}" r="2" fill="{C["brasslt"]}" opacity=".9"/></g>'
    for px, py, col in ((44, 56, C['rose']), (88, 62, '#c9a3a8'), (65, 52, C['cream']))
) + f'''
<path d="M54 78 q-8 4 -10 12 M76 82 q8 4 10 12" fill="none" stroke="{C['sagelt']}" stroke-width="1.4" stroke-linecap="round"/>
''' + veil(w, h, 10) + '</svg>'

w, h = 80, 110
files['key'] = head(w, h) + grain(11) + f'''
<radialGradient id="k11" cx="50%" cy="40%" r="70%">
  <stop offset="0" stop-color="#3a3038"/><stop offset="1" stop-color="#1d181f"/></radialGradient>
<rect width="{w}" height="{h}" fill="url(#k11)"/>
<g transform="translate(40 55) rotate(-18)">
  <circle cx="0" cy="-26" r="12" fill="none" stroke="{C['brass']}" stroke-width="5"/>
  <circle cx="0" cy="-26" r="12" fill="none" stroke="{C['brasslt']}" stroke-width="1.4" opacity=".7"/>
  <path d="M0 -14 V30" stroke="{C['brass']}" stroke-width="5" stroke-linecap="round"/>
  <path d="M0 -14 V30" stroke="{C['brasslt']}" stroke-width="1.4" opacity=".5"/>
  <path d="M0 16 H13 M0 24 H10" stroke="{C['brass']}" stroke-width="4.4" stroke-linecap="round"/>
  <circle cx="0" cy="-26" r="4.6" fill="#1d181f"/>
</g>
<ellipse cx="44" cy="92" rx="22" ry="4" fill="#000" opacity=".35"/>
''' + veil(w, h, 11) + '</svg>'

for name, svg in files.items():
    with open(os.path.join(OUT, name + '.svg'), 'w') as f:
        f.write(svg)
    print(f'  {name}.svg  {len(svg):>6} bytes')
print(f'\n{len(files)} pictures painted.')
