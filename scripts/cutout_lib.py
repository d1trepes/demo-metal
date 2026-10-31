"""Общая функция вырезки фона для рендеров на белом фоне (rembg + мягкая тень)."""
from PIL import Image, ImageChops, ImageFilter
from rembg import new_session, remove

SHADOW_GAIN = 2.2  # усиление тени (фон почти белый, затемнение слабое)
_session = None


def cutout(rgb: Image.Image) -> tuple[Image.Image, tuple[int, int, int, int]]:
    """Возвращает RGBA (объект + полупрозрачная тень) и рамку объекта без тени."""
    global _session
    if _session is None:
        _session = new_session("isnet-general-use")
    mask = remove(rgb, session=_session, only_mask=True).convert("L")
    # чуть подрезаем ореол по краю маски
    mask = mask.point(lambda v: 0 if v < 24 else min(255, int((v - 24) * 255 / 200)))

    # тень: затемнение белого фона вне маски → полупрозрачный чёрный слой
    shadow = rgb.convert("L").point(lambda v: max(0, min(255, int((250 - v) * SHADOW_GAIN))))
    shadow = shadow.filter(ImageFilter.GaussianBlur(2))
    shadow = ImageChops.multiply(shadow, ImageChops.invert(mask))

    obj = rgb.copy()
    obj.putalpha(mask)
    out = Image.new("RGBA", rgb.size, (14, 16, 19, 0))
    out.putalpha(shadow)
    out.alpha_composite(obj)
    return out, mask.getbbox()
