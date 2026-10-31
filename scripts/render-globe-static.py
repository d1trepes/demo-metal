"""
Статичная картинка глобуса (чат 5): заглушка до загрузки canvas и вид для reduced-motion / слабых устройств.
Тот же вид и та же математика, что в components/home/GlobeCanvas.tsx (без покачивания, дуги целиком).

Запуск (после scripts/build-globe.mjs):  python3 scripts/render-globe-static.py  →  public/globe/globe-static.webp
Цвета повторяют styles/tokens.css — при смене токенов перезапустить.
"""
import math
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
TOKENS = (ROOT / "styles/tokens.css").read_text()
DATA = (ROOT / "components/home/globeData.ts").read_text()


def token(name):
    return re.search(rf"{name}:\s*(#[0-9a-fA-F]{{6}})", TOKENS).group(1)


SPHERE, LAND, SHIP, WHITE = token("--color-surface"), token("--globe-land"), token("--color-accent"), token("--color-white")
OUT = 1600
SS = 2  # суперсэмплинг
W = OUT * SS
R = W / 2 - SS
CX = CY = W / 2


def point(src, name):
    m = re.search(rf'name: "{name}", lat: ([\d.-]+), lon: ([\d.-]+)', src)
    return float(m.group(1)), float(m.group(2))


view_lat, view_lon = map(float, re.search(r"globeView = \{ lon: ([\d.-]+), lat: ([\d.-]+)", DATA).groups()[::-1])
home = point(DATA, "Екатеринбург")
dests = [(float(a), float(b)) for a, b in re.findall(r'\{ name: "[^"]+", lat: ([\d.-]+), lon: ([\d.-]+) \}', DATA.split("destinations")[1].split("];")[0])]


def to_vec(lat, lon):
    p, l = math.radians(lat), math.radians(lon)
    return np.array([math.cos(p) * math.cos(l), math.cos(p) * math.sin(l), math.sin(p)])


cl, sl = math.cos(math.radians(-view_lon)), math.sin(math.radians(-view_lon))
cp, sp = math.cos(math.radians(view_lat)), math.sin(math.radians(view_lat))


def rot(v):
    x1 = v[..., 0] * cl - v[..., 1] * sl
    y1 = v[..., 0] * sl + v[..., 1] * cl
    z1 = v[..., 2]
    return np.stack([y1, -x1 * sp + z1 * cp, x1 * cp + z1 * sp], axis=-1)


def arc(a, b, steps=40):
    omega = math.acos(max(-1, min(1, float(a @ b))))
    lift = 0.04 + omega * 0.25
    pts = []
    for i in range(steps + 1):
        t = i / steps
        k1 = math.sin((1 - t) * omega) / math.sin(omega)
        k2 = math.sin(t * omega) / math.sin(omega)
        pts.append((a * k1 + b * k2) * (1 + lift * math.sin(math.pi * t)))
    return np.array(pts)


img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.ellipse([CX - R, CY - R, CX + R, CY + R], fill=SPHERE)

raw = np.frombuffer((ROOT / "public/globe/land.bin").read_bytes(), dtype=np.int16).reshape(-1, 3)
vecs = np.stack([to_vec(la / 100, lo / 100) for la, lo, _ in raw])
proj = rot(vecs)
dot = max(1.5, W / 230)
for flag, color in ((0, LAND), (1, SHIP)):
    for (x, y, z), f in zip(proj, raw[:, 2]):
        if f != flag or z <= 0.02:
            continue
        sz = dot * (0.45 + 0.55 * z)
        px, py = CX + x * R, CY - y * R
        d.rectangle([px - sz / 2, py - sz / 2, px + sz / 2, py + sz / 2], fill=color)

hv = to_vec(*home)
lw = max(1, round(W / 900))
for lat, lon in dests:
    pts = rot(arc(hv, to_vec(lat, lon)))
    seg = []
    for x, y, z in pts:
        if z > 0 or x * x + y * y > 1:
            seg.append((CX + x * R, CY - y * R))
        elif seg:
            d.line(seg, fill=SHIP, width=lw)
            seg = []
    if len(seg) > 1:
        d.line(seg, fill=SHIP, width=lw)
    x, y, z = rot(to_vec(lat, lon))
    if z > 0:
        r = dot * 1.1
        d.ellipse([CX + x * R - r, CY - y * R - r, CX + x * R + r, CY - y * R + r], fill=SHIP)

x, y, z = rot(hv)
r = dot * 2.4
d.ellipse([CX + x * R - r, CY - y * R - r, CX + x * R + r, CY - y * R + r], fill=WHITE, outline=SHIP, width=round(dot * 1.1))

out = ROOT / "public/globe/globe-static.webp"
img.resize((OUT, OUT), Image.LANCZOS).save(out, "WEBP", quality=82, method=6)
print(out, out.stat().st_size // 1024, "КБ")
