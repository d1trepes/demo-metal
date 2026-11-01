"""
Заглушка глобуса (чат 5б): public/globe/globe.svg → public/globe/globe-static.webp, 1200 × 1200.
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
SIZE = 1200


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        page = await browser.new_page(viewport={"width": SIZE, "height": SIZE})
        await page.set_content(
            f'<body style="margin:0;background:transparent">'
            f'<img src="data:image/svg+xml;base64,{__import__("base64").b64encode(SRC.read_bytes()).decode()}" '
            f'width="{SIZE}" height="{SIZE}"></body>'
        )
        png = await page.screenshot(omit_background=True)
        await browser.close()
    Image.open(io.BytesIO(png)).save(OUT, "WEBP", quality=82, method=6)
    print(f"{OUT.relative_to(ROOT)}: {OUT.stat().st_size // 1024} КБ")


asyncio.run(main())
