"""
Заглушка глобуса (чат 5б): public/globe/globe.svg → public/globe/globe-static.webp, 1300 × 700 (кадр «Горизонт», чат 5д).
Показывается до загрузки интерактивного слоя (GlobeMap.tsx) и без JS. Вид тот же — оба из scripts/build-globe.mjs.

Запуск (после node scripts/build-globe.mjs):  python3 scripts/render-globe-static.py
Нужны playwright + Chrome и Pillow.
"""
import asyncio
import io
from pathlib import Path

from PIL import Image
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/globe/globe.svg"
OUT = ROOT / "public/globe/globe-static.webp"
W, H = 1300, 700


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        page = await browser.new_page(viewport={"width": W, "height": H})
        await page.set_content(
            f'<body style="margin:0;background:transparent">'
            f'<img src="data:image/svg+xml;base64,{__import__("base64").b64encode(SRC.read_bytes()).decode()}" '
            f'width="{W}" height="{H}" style="display:block"></body>'
        )
        png = await page.screenshot(omit_background=True)
        await browser.close()
    Image.open(io.BytesIO(png)).save(OUT, "WEBP", quality=82, method=6)
    print(f"{OUT.relative_to(ROOT)}: {OUT.stat().st_size // 1024} КБ")


asyncio.run(main())
