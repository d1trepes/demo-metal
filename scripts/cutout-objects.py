"""Вырезает фон у одиночных 3D-рендеров (фура, конструкции, спецификация) и кадрирует каждый по объекту.

    python3 scripts/cutout-objects.py

Для плитки каталога (одна общая рамка на все) — scripts/cutout-renders.py.
"""
from pathlib import Path

from PIL import Image

from cutout_lib import cutout

JOBS = [  # (папка исходников, папка результата, ширина WebP)
    ("docs/assets-src/cta", "public/cta", 1000),
    ("docs/assets-src/truck", "public/truck", 1600),
    ("docs/assets-src/constructions", "public/constructions", 1200),
]
MARGIN = 0.04  # поле вокруг объекта, доля ширины

for src, dst, width in JOBS:
    Path(dst).mkdir(parents=True, exist_ok=True)
    for path in sorted(Path(src).glob("*.jpg")):
        img, (x0, y0, x1, y1) = cutout(Image.open(path).convert("RGB"))
        pad = int(img.width * MARGIN)
        # тень лежит ниже объекта — снизу поле чуть больше
        box = (max(0, x0 - pad), max(0, y0 - pad), min(img.width, x1 + pad), min(img.height, y1 + int(pad * 1.5)))
        crop = img.crop(box)
        if crop.width > width:
            crop = crop.resize((width, round(crop.height * width / crop.width)), Image.LANCZOS)
        out = Path(dst) / f"{path.stem}.webp"
        crop.save(out, "WEBP", quality=82, method=6)
        print(out, crop.size, f"{out.stat().st_size // 1024} КБ")
