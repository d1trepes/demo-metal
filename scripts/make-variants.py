"""Уменьшенные копии картинок для srcset (чат 5ж): name.webp → name-640.webp (+ name-400.webp для плитки каталога).
Запуск: python3 scripts/make-variants.py. Повторный запуск перезаписывает копии. Исходники не трогает."""
from pathlib import Path
from PIL import Image

PUBLIC = Path(__file__).resolve().parent.parent / "public"
JOBS = {
    "catalog": (400, 640),
    "constructions": (640,),
    "constructions/xray": (640,),
    "objects": (640,),
    "cta": (640,),
    "truck": (640,),
    "globe": (640,),
    "workshop": (800,),
    "ends": (640,),
    "equipment": (640,),
    "pages": (800,),
}
for folder, widths in JOBS.items():
    for src in sorted((PUBLIC / folder).glob("*.webp")):
        if src.stem.rsplit("-", 1)[-1].isdigit():
            continue  # уже копия
        im = Image.open(src)
        for w in widths:
            if w >= im.width:
                continue
            small = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            small.save(src.with_name(f"{src.stem}-{w}.webp"), "WEBP", quality=82, method=6, alpha_quality=90)
print("ok")
