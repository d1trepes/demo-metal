"""Чат 8: картинка базы для /about — обесцветить (монохром, жёлтый кран) и стереть кривую надпись на вывеске.
Запуск: python3 scripts/fix-base-8.py → public/pages/base.webp, затем scripts/make-variants.py.
Работает от текущего public/pages/base.webp (вырезанного), альфу не трогает."""
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PATH = ROOT / "public/pages/base.webp"

im = np.array(Image.open(PATH).convert("RGBA"))
rgb, alpha = im[..., :3].copy(), im[..., 3]

# 1. Надпись на вывеске: тёмные буквы внутри наклонной плашки → inpaint.
plate = np.array([(341, 482), (424, 511), (424, 528), (341, 498)], np.int32)
mask = np.zeros(alpha.shape, np.uint8)
cv2.fillPoly(mask, [plate], 255)
gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
letters = ((gray < 150) & (mask > 0)).astype(np.uint8) * 255
letters = cv2.dilate(letters, np.ones((3, 3), np.uint8), iterations=1)
rgb = cv2.inpaint(rgb, letters, 4, cv2.INPAINT_TELEA)
# Плашку внутри — ровной заливкой (размытие без краёв), чтобы не было пятен.
inner = cv2.erode(mask, np.ones((3, 3), np.uint8), iterations=1)
smooth = cv2.GaussianBlur(cv2.medianBlur(rgb, 7), (0, 0), 3)
rgb[inner > 0] = smooth[inner > 0]

# 2. Обесцветить, с лёгким холодным оттенком как у остальных рендеров.
lum = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
tint = np.array([0.985, 1.0, 1.02], np.float32)
out = np.clip(lum[..., None] * tint, 0, 255).astype(np.uint8)

Image.fromarray(np.dstack([out, alpha])).save(PATH, "WEBP", quality=86, method=6, alpha_quality=90)
print("ok", PATH)
