#!/usr/bin/env python3
"""
The damask. A 160px tile with the motif at the centre and quartered at all four
corners, which is what makes it seamless without any hand-nudging.

Vector rather than a raster tile on purpose: the camera dollies ~6x into the wall,
and a 512px raster would visibly soften at exactly the moment the visitor is closest
to it.
"""
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'scene')
os.makedirs(OUT, exist_ok=True)

T = 160
GROUND, LIGHT, DARK, HAIR = '#4d3039', '#573742', '#42282f', '#5e3d49'

def motif(cx, cy, s=1.0):
    return f'''<g transform="translate({cx} {cy}) scale({s})" >
  <path d="M0 -30 C7 -19 10 -7 0 7 C-10 -7 -7 -19 0 -30Z" fill="var(--m1)"/>
  <path d="M-3 3 C-16 -4 -23 -16 -19 -26 C-10 -21 -4 -10 -3 3Z" fill="var(--m2)"/>
  <path d="M3 3 C16 -4 23 -16 19 -26 C10 -21 4 -10 3 3Z" fill="var(--m2)"/>
  <path d="M-9 6 L9 6 L7 13 L-7 13Z" fill="var(--m1)"/>
  <path d="M0 13 C4 20 3 27 0 31 C-3 27 -4 20 0 13Z" fill="var(--m2)"/>
  <path d="M-16 12 C-24 18 -26 27 -21 32 C-16 27 -16 19 -16 12Z" fill="var(--m2)" opacity=".8"/>
  <path d="M16 12 C24 18 26 27 21 32 C16 27 16 19 16 12Z" fill="var(--m2)" opacity=".8"/>
  <circle cx="0" cy="-33" r="2.4" fill="var(--m3)"/>
</g>'''

tile = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{T}" height="{T}" viewBox="0 0 {T} {T}">
<style>:root{{--m1:{LIGHT};--m2:{DARK};--m3:{HAIR}}}</style>
<rect width="{T}" height="{T}" fill="{GROUND}"/>
<g opacity=".85">
{motif(80, 80)}
{motif(0, 0)}{motif(T, 0)}{motif(0, T)}{motif(T, T)}
{motif(0, 80, .42)}{motif(T, 80, .42)}{motif(80, 0, .42)}{motif(80, T, .42)}
</g>
</svg>'''

open(os.path.join(OUT, 'damask.svg'), 'w').write(tile)
print('damask.svg', len(tile), 'bytes')

# paper tooth, laid over everything at very low opacity
grain = '''<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" seed="7"/>
<feColorMatrix type="saturate" values="0"/></filter>
<rect width="180" height="180" filter="url(#n)" opacity="1"/></svg>'''
open(os.path.join(OUT, 'grain.svg'), 'w').write(grain)
print('grain.svg', len(grain), 'bytes')
