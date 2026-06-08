#!/usr/bin/env python3
"""Generate themed SVG cover placeholders for portfolio cards.

Each SVG is a 600x400 gradient card with a faint geometric motif evoking the
project's domain, plus a title and category pill. This removes the site's
dependency on external dummyimage.com calls and broken raw.githubusercontent
links, and gives every card a crisp, theme-consistent cover that works offline.
"""
import math
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# key -> (title, tag, color_a, color_b, accent, motif)
CARDS = {
    "veritas":         ("AI Courtroom · VERITAS",       "Multi-Agent LLM",      "#6d28d9", "#4338ca", "#e2d8ff", "nodes"),
    "hidden":          ("Hidden Connections",           "Embeddings · UMAP",    "#0d9488", "#0ea5e9", "#c7f0ec", "scatter"),
    "neuron-art":      ("Neural Illumination",          "Neural Net · p5.js",   "#312e81", "#06b6d4", "#a5f3fc", "nodes"),
    "poem-gen":        ("Personalized Poem Generation", "Generative AI · LoRA", "#ff7f00", "#c1185b", "#ffe1c2", "verse"),
    "ev-charging":     ("EV Charging Optimization",      "Operational Research", "#0f766e", "#155e75", "#bdf0e6", "grid"),
    "sentiment":       ("Sentiment Classification",      "NLP · Transformers",   "#4338ca", "#7c3aed", "#dcd6ff", "nodes"),
    "grid-frequency":  ("Power-Grid Anomaly Detection",  "Time Series",          "#1d4ed8", "#0ea5e9", "#cfe4ff", "wave"),
    "rock-detection":  ("YOLOv9 Rock Detection",         "Computer Vision",      "#b45309", "#7c2d12", "#ffe2bd", "bbox"),
    "ida":             ("Incomplete Data Analysis",      "Statistics",           "#15803d", "#0f766e", "#c9f2d4", "scatter"),
    "stat-methods":    ("Statistical Methods",           "Imputation",           "#0d9488", "#0369a1", "#c7f0ec", "scatter"),
    "dreamfusion":     ("3D Object Generation",          "Text-to-3D Diffusion", "#6d28d9", "#9333ea", "#e7d8ff", "cube"),
    "stable-diffusion":("Stable Diffusion",              "Image Generation",     "#be185d", "#9d174d", "#ffd7ea", "diffusion"),
    "textile":         ("Textile Design Portfolio",      "Creative Practice",    "#db2777", "#ea580c", "#ffe0ef", "weave"),
    "content":         ("Content Creation",              "Writing · Photography","#16a34a", "#0f766e", "#ccf3d8", "pen"),
}


def motif(kind, accent):
    """Return SVG fragment for a faint domain motif, drawn in the accent colour."""
    s = []
    op = 0.16
    stroke = f'stroke="{accent}" stroke-opacity="{op}" fill="none" stroke-width="2"'
    fill = f'fill="{accent}" fill-opacity="{op}"'
    if kind == "nodes":  # neural network
        layers = [(150, [120, 200, 280]), (300, [90, 170, 250, 330]), (450, [150, 230, 310])]
        pts = []
        for x, ys in layers:
            pts.append([(x, y) for y in ys])
        for a, b in zip(pts, pts[1:]):
            for (x1, y1) in a:
                for (x2, y2) in b:
                    s.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" {stroke}/>')
        for layer in pts:
            for (x, y) in layer:
                s.append(f'<circle cx="{x}" cy="{y}" r="9" {fill}/>')
    elif kind == "wave":  # signal / time series
        for off, amp in ((210, 60), (230, 38)):
            d = f'M0 {off} '
            for x in range(0, 601, 20):
                d += f'L{x} {off + amp * math.sin(x / 46.0)} '
            s.append(f'<path d="{d}" {stroke}/>')
        for x in range(40, 601, 80):
            s.append(f'<line x1="{x}" y1="120" x2="{x}" y2="300" stroke="{accent}" stroke-opacity="0.06" stroke-width="1"/>')
    elif kind == "grid":  # optimization grid
        for x in range(60, 561, 50):
            s.append(f'<line x1="{x}" y1="90" x2="{x}" y2="330" stroke="{accent}" stroke-opacity="0.10" stroke-width="1"/>')
        for y in range(90, 331, 48):
            s.append(f'<line x1="60" y1="{y}" x2="540" y2="{y}" stroke="{accent}" stroke-opacity="0.10" stroke-width="1"/>')
        for (cx, cy) in ((160, 186), (310, 282), (410, 138), (260, 138)):
            s.append(f'<circle cx="{cx}" cy="{cy}" r="11" {fill}/>')
            s.append(f'<circle cx="{cx}" cy="{cy}" r="20" {stroke}/>')
    elif kind == "bbox":  # detection bounding boxes
        for (x, y, w, h) in ((120, 130, 150, 110), (320, 200, 120, 90), (250, 110, 80, 70)):
            s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" {stroke}/>')
            s.append(f'<rect x="{x}" y="{y-14}" width="46" height="14" {fill}/>')
    elif kind == "scatter":  # statistics scatter + trend
        import_pts = [(90, 300), (150, 250), (200, 270), (250, 210), (300, 220),
                      (350, 170), (400, 180), (450, 130), (500, 150)]
        for (x, y) in import_pts:
            s.append(f'<circle cx="{x}" cy="{y}" r="8" {fill}/>')
        s.append(f'<line x1="80" y1="300" x2="520" y2="140" {stroke} stroke-dasharray="6 6"/>')
    elif kind == "cube":  # 3D wireframe cube
        cx, cy, d = 300, 210, 80
        o = 46
        front = [(cx-d, cy-d), (cx+d, cy-d), (cx+d, cy+d), (cx-d, cy+d)]
        back = [(x+o, y-o) for (x, y) in front]
        for poly in (front, back):
            pts = " ".join(f"{x},{y}" for x, y in poly)
            s.append(f'<polygon points="{pts}" {stroke}/>')
        for (x1, y1), (x2, y2) in zip(front, back):
            s.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" {stroke}/>')
    elif kind == "diffusion":  # noise resolving to a frame
        import_seed = 1
        for i in range(120):
            import_seed = (import_seed * 1103515245 + 12345) & 0x7fffffff
            x = 70 + (import_seed % 460)
            import_seed = (import_seed * 1103515245 + 12345) & 0x7fffffff
            y = 90 + (import_seed % 240)
            r = 1.5 + (i % 3)
            o = op * (1 - i / 160.0)
            s.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{accent}" fill-opacity="{o:.3f}"/>')
        s.append(f'<rect x="210" y="135" width="180" height="150" rx="10" {stroke}/>')
    elif kind == "verse":  # poetry lines
        ys = [140, 168, 196, 224, 252, 280]
        widths = [320, 260, 300, 210, 280, 180]
        for y, w in zip(ys, widths):
            s.append(f'<rect x="150" y="{y}" width="{w}" height="7" rx="3.5" {fill}/>')
        s.append(f'<rect x="120" y="140" width="6" height="147" rx="3" fill="{accent}" fill-opacity="0.28"/>')
    elif kind == "weave":  # textile weave
        for x in range(80, 521, 26):
            s.append(f'<line x1="{x}" y1="100" x2="{x}" y2="320" stroke="{accent}" stroke-opacity="0.12" stroke-width="6"/>')
        for i, y in enumerate(range(110, 321, 26)):
            dash = "13 13" if i % 2 == 0 else "13 13"
            off = 0 if i % 2 == 0 else 13
            s.append(f'<line x1="80" y1="{y}" x2="520" y2="{y}" stroke="{accent}" stroke-opacity="0.18" stroke-width="6" stroke-dasharray="{dash}" stroke-dashoffset="{off}"/>')
    elif kind == "pen":  # writing / nib
        s.append(f'<path d="M170 280 L300 150 L340 190 L210 320 Z" {stroke}/>')
        s.append(f'<path d="M300 150 L320 130 L360 170 L340 190 Z" {fill}/>')
        s.append(f'<line x1="255" y1="195" x2="295" y2="235" {stroke}/>')
        for y in (150, 180, 210):
            s.append(f'<rect x="380" y="{y}" width="120" height="6" rx="3" {fill}/>')
    return "\n  ".join(s)


def make_svg(key, title, tag, ca, cb, accent, kind):
    body = motif(kind, accent)
    # word-wrap title to ~18 chars/line
    words, lines, cur = title.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 <= 20:
            cur = (cur + " " + w).strip()
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    title_tspans = "".join(
        f'<tspan x="40" dy="{0 if i == 0 else 38}">{ln}</tspan>' for i, ln in enumerate(lines)
    )
    title_y = 330 - (len(lines) - 1) * 38
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400" role="img" aria-label="{title}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{ca}"/>
      <stop offset="1" stop-color="{cb}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.75" cy="0.2" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="400" fill="url(#g)"/>
  <rect width="600" height="400" fill="url(#glow)"/>
  {body}
  <rect x="40" y="44" width="{max(120, len(tag) * 8 + 28)}" height="28" rx="14" fill="#000000" fill-opacity="0.18"/>
  <text x="54" y="63" font-family="'Segoe UI', Roboto, system-ui, sans-serif" font-size="14" font-weight="600" letter-spacing="0.4" fill="#ffffff" fill-opacity="0.92">{tag}</text>
  <text x="40" y="{title_y}" font-family="'Georgia', 'Times New Roman', serif" font-size="32" font-weight="700" fill="#ffffff">{title_tspans}</text>
</svg>
'''


def main():
    for key, (title, tag, ca, cb, accent, kind) in CARDS.items():
        svg = make_svg(key, title, tag, ca, cb, accent, kind)
        path = os.path.join(OUT, f"ph-{key}.svg")
        with open(path, "w") as f:
            f.write(svg)
        print(f"wrote {path} ({len(svg)} bytes)")


if __name__ == "__main__":
    main()
