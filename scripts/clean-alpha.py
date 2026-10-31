"""Чистка прозрачности готовых WebP (чат 4).

После вырезки фона вокруг объекта остаётся «дымка» с альфой 1–6 по всему кадру:
на цветном фоне секции она видна как прямоугольник. Скрипт обнуляет слабую альфу
и плавно гасит её к краям кадра, чтобы край картинки нигде не читался.

    python3 scripts/clean-alpha.py public/truck/truck.webp public/cta/spec.webp ...
"""
import sys

import numpy as np
from PIL import Image

FLOOR = 8      # альфа ниже — считаем шумом
EDGE = 0.06    # доля ширины/высоты кадра, на которой альфа гаснет к краю


def clean(path: str) -> None:
    im = Image.open(path).convert("RGBA")
    arr = np.asarray(im).astype(np.float32)
    a = arr[:, :, 3]
    a = np.clip((a - FLOOR) * 255 / (255 - FLOOR), 0, 255)

    h, w = a.shape
    ramp = lambda n: np.clip(np.minimum(np.arange(n), np.arange(n)[::-1]) / (EDGE * n), 0, 1)
    a *= np.outer(ramp(h), ramp(w))

    arr[:, :, 3] = a
    Image.fromarray(arr.round().astype(np.uint8), "RGBA").save(path, "WEBP", quality=86, method=6)
    print(path, f"{np.count_nonzero(a) / a.size:.0%} непрозрачных")


if __name__ == "__main__":
    for p in sys.argv[1:]:
        clean(p)
