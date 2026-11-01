"""Чат 7б: перевырезка картинок /constructions с запасом по краям.

    python3 scripts/cutout-7b.py   (нужен Pillow, numpy, scipy; rembg — только для kmd)
    python3 scripts/make-variants.py

В чате 6 rembg резал по объекту, поле упиралось в край исходника — тень и угол плиты
срезались ровной линией, а бетонную плиту каркаса rembg считал тенью и усиливал до чёрного.
Теперь «обратный multiply»: альфа из яркости (белый фон → прозрачно), цвет пересчитан так,
что на белом странице картинка совпадает с исходником пиксель в пиксель — без ореола,
с родной тенью. Края исходника растворяются (FEATHER), кадр — по видимому с запасом.
Картинки рассчитаны только на белый фон.
kmd (чертёж на столе) теперь тоже вырезается — остаётся только лист и рулоны, без серого стола.
"""
from pathlib import Path

from PIL import Image

import sys

PAD = 0.08  # белое поле вокруг исходника, доля ширины
MARGIN = 0.04  # воздух вокруг объекта в готовом кадре
WHITE = 248  # светлее — считаем фоном (у исходников фон 249–255)
FEATHER = 0.03  # растворение у краёв исходника, доля ширины

JOBS = {
    "docs/assets-src/pages/frame.jpg": "public/pages/frame.webp",
    "docs/assets-src/pages/pack.jpg": "public/pages/pack.webp",
    "docs/assets-src/equipment/plasma.jpg": "public/equipment/plasma.webp",
    "docs/assets-src/equipment/welding.jpg": "public/equipment/welding.webp",
    "docs/assets-src/equipment/paint.jpg": "public/equipment/paint.webp",
    # чат 8: остальное оборудование для /about — тем же способом
    "docs/assets-src/equipment/saw.jpg": "public/equipment/saw.webp",
    "docs/assets-src/equipment/drill.jpg": "public/equipment/drill.webp",
    "docs/assets-src/equipment/crane.jpg": "public/equipment/crane.webp",
}


def padded(path: str) -> Image.Image:
    src = Image.open(path).convert("RGB")
    pad = int(src.width * PAD)
    canvas = Image.new("RGB", (src.width + 2 * pad, src.height + 2 * pad), (255, 255, 255))
    canvas.paste(src, (pad, pad))
    return canvas


def unmultiply(path: str) -> Image.Image:
    import numpy as np

    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    h, w, _ = rgb.shape
    alpha = np.clip((WHITE - rgb.min(axis=2)) / WHITE, 0, 1)
    # растворяем края исходника: объект, упёршийся в край кадра, не обрывается линией
    f = max(1, int(w * FEATHER))
    ramp = lambda n: np.minimum(1, np.minimum(np.arange(n), np.arange(n)[::-1]) / f)
    alpha *= ramp(h)[:, None] * ramp(w)[None, :]
    if "pack" in path:  # жёлтые ленты и рулетка → серые (монохром, как в чате 7)
        yellow = (rgb[..., :2].mean(axis=2) - rgb[..., 2]) > 30
        lum = (rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32))[..., None]
        rgb = np.where(yellow[..., None], lum, rgb)
    safe = np.maximum(alpha, 1e-3)[..., None]
    color = np.clip(255 - (255 - rgb) / safe, 0, 255)
    out = np.dstack([color, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    pad = int(w * PAD)
    canvas = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    canvas.paste(img, (pad, pad))
    return canvas


# Аргументы — части имён: `python3 cutout-7b.py saw drill crane` перевырежет только их (без kmd и rembg).
ONLY = sys.argv[1:]

for src, dst in JOBS.items():
    if ONLY and not any(o in src for o in ONLY):
        continue
    img = unmultiply(src)
    # рамка по видимому (объект + тень), чтобы не срезать тень
    vx0, vy0, vx1, vy1 = img.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    pad = int(img.width * MARGIN)
    img = img.crop((max(0, vx0 - pad), max(0, vy0 - pad), min(img.width, vx1 + pad), min(img.height, vy1 + pad)))
    if img.width > 1600:
        img = img.resize((1600, round(img.height * 1600 / img.width)), Image.LANCZOS)
    img.save(dst, "WEBP", quality=82, method=6, alpha_quality=90)
    print(dst, img.size, f"{Path(dst).stat().st_size // 1024} КБ")


# kmd: rembg оставляет серый стол с ровными срезами по краю кадра. Берём только лист с рулонами:
# светлее стола (стол ≈ 216, бумага ≥ 235) → крупнейшая область внутри → закрыть линии чертежа
# → мягкая тень под листом.
def kmd_paper() -> None:
    import numpy as np
    from PIL import ImageFilter
    from scipy import ndimage
    from cutout_lib import cutout  # rembg — только здесь

    src = padded("docs/assets-src/pages/kmd.jpg")
    gray = np.array(src.convert("L"))
    _, (x0, y0, x1, y1) = cutout(src)  # рамка стола (rembg) — бумага только внутри неё
    light = gray > 232
    inside = np.zeros_like(light)
    inside[y0 + 4 : y1 - 4, x0 + 4 : x1 - 4] = True
    light &= inside
    light = ndimage.binary_closing(light, iterations=6)
    labels, n = ndimage.label(light)
    sizes = ndimage.sum(light, labels, range(1, n + 1))
    paper = labels == (int(np.argmax(sizes)) + 1)
    paper = ndimage.binary_fill_holes(paper)
    paper = ndimage.binary_opening(paper, iterations=3)
    mask = Image.fromarray((paper * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.2))

    shadow = mask.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.22))
    out = Image.new("RGBA", src.size, (14, 16, 19, 0))
    out.putalpha(Image.new("L", src.size, 0))
    out.paste((14, 16, 19, 255), (8, 14), shadow)  # тень чуть ниже и правее
    obj = src.copy()
    obj.putalpha(mask)
    out.alpha_composite(obj)
    vx0, vy0, vx1, vy1 = out.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    pad = int(out.width * MARGIN)
    out = out.crop((vx0 - pad, vy0 - pad, vx1 + pad, vy1 + pad))
    out.save("public/pages/kmd.webp", "WEBP", quality=82, method=6, alpha_quality=90)
    print("public/pages/kmd.webp", out.size)


if not ONLY or "kmd" in ONLY:
    kmd_paper()
