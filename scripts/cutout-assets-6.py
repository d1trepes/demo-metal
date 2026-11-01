"""Картинки по брифу «чаты 6–9»: вырезает фон и сохраняет WebP в public/.

    python3 scripts/cutout-assets-6.py   (нужен rembg[cpu] и Pillow)
    python3 scripts/make-variants.py     (уменьшенные копии для srcset)

- ends/       торцы крупным планом для карточки товара. Объект во весь кадр и уходит за край —
              rembg режет такие неуверенно (трубы темнеют), поэтому фон НЕ вырезаем: белый фон
              убирается на сайте через mix-blend-mode: multiply поверх подложки.
- equipment/  оборудование цеха — кадрируем по объекту.
- pages/      иллюстрации страниц — кадрируем по объекту; kmd (чертёж на столе) — без вырезки,
              стол занимает весь кадр.
- renders/balka.jpg → public/catalog/balka.webp — новая плитка балки, кадр в пропорции
              остальных плиток каталога.
"""
from pathlib import Path

from PIL import Image

from cutout_lib import cutout

MARGIN = 0.04
TILE_SIZE = (1049, 812)  # размер остальных плиток public/catalog/*.webp


def save(img: Image.Image, dst: Path, width: int) -> None:
    if img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, "WEBP", quality=82, method=6, alpha_quality=90)
    print(dst, img.size, f"{dst.stat().st_size // 1024} КБ")


def crop_to_object(img: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    x0, y0, x1, y1 = box
    pad = int(img.width * MARGIN)
    # тень лежит ниже объекта — снизу поле чуть больше
    return img.crop((max(0, x0 - pad), max(0, y0 - pad), min(img.width, x1 + pad), min(img.height, y1 + int(pad * 1.5))))


def rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


# Торцы: полный кадр, белый фон оставляем (см. выше)
for path in sorted(Path("docs/assets-src/ends").glob("*.jpg")):
    img = rgb(path)
    save(img, Path("public/ends") / f"{path.stem}.webp", 1200)

# Оборудование: по объекту
for path in sorted(Path("docs/assets-src/equipment").glob("*.jpg")):
    img, box = cutout(rgb(path))
    save(crop_to_object(img, box), Path("public/equipment") / f"{path.stem}.webp", 1200)

# Страницы
for path in sorted(Path("docs/assets-src/pages").glob("*.jpg")):
    if path.stem == "kmd":
        save(rgb(path), Path("public/pages/kmd.webp"), 1600)
        continue
    img, box = cutout(rgb(path))
    save(crop_to_object(img, box), Path("public/pages") / f"{path.stem}.webp", 1600)

# Плитка балки: кадр по объекту, дополняем до пропорции плиток каталога
img, (x0, y0, x1, y1) = cutout(rgb(Path("docs/assets-src/renders/balka.jpg")))
pad = int(img.width * MARGIN)
x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(img.width, x1 + pad), min(img.height, y1 + pad)
tw, th = TILE_SIZE
need_h = round((x1 - x0) * th / tw)
if need_h > y1 - y0:  # объект широкий — добираем высоту поровну сверху и снизу
    extra = need_h - (y1 - y0)
    y0 = max(0, y0 - extra // 2)
    y1 = min(img.height, y0 + need_h)
else:
    need_w = round((y1 - y0) * tw / th)
    extra = need_w - (x1 - x0)
    x0 = max(0, x0 - extra // 2)
    x1 = min(img.width, x0 + need_w)
tile = img.crop((x0, y0, x1, y1)).resize(TILE_SIZE, Image.LANCZOS)
save(tile, Path("public/catalog/balka.webp"), tw)
