"""«Рентген» для неактивных панелей металлоконструкций (чат 4).

Раньше это был SVG-фильтр в браузере, но он пересчитывался на каждом кадре
раскрытия панелей (20–46 мс на кадр вместо 16). Теперь тот же алгоритм считается
один раз здесь:
  яркость → размытие 1,2 px → |Лаплас| → тёмные контуры (#0e1013, --color-ink-900)
  + плёнка объекта 7 % непрозрачности.

    python3 scripts/xray-renders.py   # public/constructions/*.webp → public/constructions/xray/
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SRC = Path("public/constructions")
OUT = SRC / "xray"
INK = (14, 16, 19)
LINE_GAIN = 1.1 * 3   # как в SVG-фильтре: сумма каналов × 1,1
LINE_FLOOR = 0.04
FILM = 0.07


def xray(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    alpha = np.asarray(im.getchannel("A")).astype(np.float32) / 255
    gray = im.convert("L").filter(ImageFilter.GaussianBlur(1.2))
    g = np.asarray(gray).astype(np.float32) / 255

    p = np.pad(g, 1, mode="edge")
    neighbours = sum(p[1 + dy : 1 + dy + g.shape[0], 1 + dx : 1 + dx + g.shape[1]]
                     for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
    edges = np.abs(8 * g - neighbours)

    lines = np.clip(edges * LINE_GAIN - LINE_FLOOR, 0, 1) * alpha
    film = g * FILM * alpha
    a = np.clip(lines + film * (1 - lines), 0, 1)

    out = np.zeros((*g.shape, 4), np.uint8)
    out[..., :3] = INK
    out[..., 3] = (a * 255).round()
    return Image.fromarray(out, "RGBA")


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for src in sorted(SRC.glob("*.webp")):
        dst = OUT / src.name
        xray(src).save(dst, "WEBP", quality=82, method=6)
        print(dst, dst.stat().st_size // 1024, "КБ")
