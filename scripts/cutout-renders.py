"""Вырезает фон у рендеров каталога: docs/assets-src/renders/*.jpg → public/catalog/<slug>.webp

Запуск (нужен rembg[cpu] и Pillow):
    python3 scripts/cutout-renders.py

Как работает:
1. rembg (модель isnet-general-use) даёт маску объекта.
2. Мягкая тень: вне маски берём затемнение белого фона (255 - яркость) и превращаем его
   в полупрозрачный чёрный слой — тень ложится на любую подложку (--color-surface и т. п.).
3. Все рендеры сняты одной камерой, поэтому обрезаем их ОДНОЙ общей рамкой (объединение
   объектов + поля; сетку не учитываем — она шире и обрезается). Масштаб и ракурс у всех одинаковые.
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter
from rembg import new_session, remove

SRC = Path("docs/assets-src/renders")
OUT = Path("public/catalog")
OUT_WIDTH = 1200
MARGIN = 0.05  # поле вокруг общей рамки, доля ширины
# Сетка шире остальных — в общую рамку не входит, её края просто обрезаются плиткой.
FRAME_EXCLUDE = {"setka"}
SHADOW_GAIN = 2.2  # усиление тени (фон почти белый, затемнение слабое)

session = new_session("isnet-general-use")
layers = {}

for path in sorted(SRC.glob("*.jpg")):
    rgb = Image.open(path).convert("RGB")
    mask = remove(rgb, session=session, only_mask=True).convert("L")
    # чуть подрезаем ореол по краю маски
    mask = mask.point(lambda v: 0 if v < 24 else min(255, int((v - 24) * 255 / 200)))

    lum = rgb.convert("L")
    shadow = lum.point(lambda v: max(0, min(255, int((250 - v) * SHADOW_GAIN))))
    shadow = shadow.filter(ImageFilter.GaussianBlur(2))
    shadow = ImageChops.multiply(shadow, ImageChops.invert(mask))

    obj = rgb.copy()
    obj.putalpha(mask)
    black = Image.new("RGBA", rgb.size, (14, 16, 19, 0))
    black.putalpha(shadow)
    black.alpha_composite(obj)
    layers[path.stem] = (black, mask.getbbox())

boxes = [b for slug, (_, b) in layers.items() if slug not in FRAME_EXCLUDE]
w, h = next(iter(layers.values()))[0].size
pad = int(w * MARGIN)
box = (
    max(0, min(b[0] for b in boxes) - pad),
    max(0, min(b[1] for b in boxes) - pad),
    min(w, max(b[2] for b in boxes) + pad),
    min(h, max(b[3] for b in boxes) + pad),
)
print("общая рамка", box)

OUT.mkdir(parents=True, exist_ok=True)
for slug, (img, _) in layers.items():
    crop = img.crop(box)
    ratio = OUT_WIDTH / crop.width
    if ratio < 1:
        crop = crop.resize((OUT_WIDTH, round(crop.height * ratio)), Image.LANCZOS)
    dst = OUT / f"{slug}.webp"
    crop.save(dst, "WEBP", quality=82, method=6)
    print(dst, crop.size, f"{dst.stat().st_size // 1024} КБ")
