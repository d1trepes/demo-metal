"""Тестовые товары каталога: data/products.json (+ обновляет priceFrom в data/categories.json).

    python3 scripts/gen-products.py

Массы — по таблицам ГОСТ или по формулам через плотность стали 7850 кг/м³ (точность ±2 %, для демо достаточно).
Цены условные, ₽ за тонну с НДС. Для сетки в категории показываем цену за м² (masses × price).
Повторный запуск даёт тот же файл. Когда появится бэкенд — файл не нужен (см. docs/HANDOFF.md).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RHO = 0.00785  # кг на мм² сечения на метр длины


def translit(text: str) -> str:
    table = dict(zip("абвгдеёжзийклмнопрстуфхцчшщъыьэюя", ["a", "b", "v", "g", "d", "e", "e", "zh", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "f", "h", "ts", "ch", "sh", "sch", "", "y", "", "e", "yu", "ya"]))
    out = "".join(table.get(ch, ch) for ch in text.lower())
    return "".join(ch if ch.isalnum() else "-" for ch in out).strip("-").replace("--", "-").replace("--", "-")


def num(x: float) -> str:
    """12.5 → «12,5»; 12.0 → «12»."""
    return f"{x:g}".replace(".", ",")


products: list[dict] = []


def add(category: str, name: str, gost: str, grade: str, size: dict, weight: float, price: int,
        length: str, in_stock: bool, unit: str = "м") -> None:
    n = sum(1 for p in products if p["category"] == category) + 1
    cat_no = CATEGORY_ORDER.index(category) + 1
    products.append({
        "id": f"P-{cat_no:02d}{n:02d}",
        "slug": translit(f"{name} {grade}"),
        "category": category,
        "name": name,
        "gost": gost,
        "steelGrade": grade,
        "size": size,
        "weightPerMeter": round(weight, 3),
        "pricePerTon": price,
        "unit": unit,
        "length": length,
        "inStock": in_stock,
        "image": f"/catalog/{category}.webp",
        "imageEnd": f"/ends/{category}.webp",
    })


CATEGORY_ORDER = ["armatura", "truba-profilnaya", "truba-kruglaya", "list", "ugolok", "shveller", "balka", "krug", "polosa", "setka"]

# --- Арматура, ГОСТ 34028-2016, масса 1 м по ГОСТ ---
for d, w, price, stock in [(6, 0.222, 63900, True), (8, 0.395, 61200, True), (10, 0.617, 59800, True), (12, 0.888, 58900, True),
                           (14, 1.21, 58900, True), (16, 1.58, 59400, True), (20, 2.47, 60100, True), (25, 3.85, 61500, False)]:
    grade = "А240" if d == 6 else "А500С"
    add("armatura", f"Арматура ⌀{d} мм", "ГОСТ 34028-2016", grade, {"label": f"⌀{d} мм", "d": d}, w, price,
        "6 / 11,7 м" if d > 6 else "бухта", stock)

# --- Труба профильная, ГОСТ 30245-2003: площадь ≈ 2t(a+b−2t) ---
for a, b, t, grade, price, stock in [(20, 20, 2, "Ст3сп", 79500, True), (40, 20, 2, "Ст3сп", 76800, True), (40, 40, 2, "Ст3сп", 74900, True),
                                    (60, 60, 3, "Ст3сп", 73200, True), (80, 80, 4, "Ст3сп", 72400, True), (100, 100, 4, "Ст3сп", 72400, True),
                                    (120, 80, 5, "09Г2С", 81600, False), (150, 150, 6, "09Г2С", 82900, False)]:
    add("truba-profilnaya", f"Труба профильная {a}×{b}×{t} мм", "ГОСТ 30245-2003", grade, {"label": f"{a}×{b}×{t} мм", "a": a, "b": b, "t": t},
        RHO * 2 * t * (a + b - 2 * t), price, "6 / 12 м", stock)

# --- Труба круглая, ГОСТ 10704-91: 0,02466·t·(D−t) ---
for dd, t, grade, price, stock in [(57, 3, "Ст3сп", 71900, True), (76, 3.5, "Ст3сп", 70900, True), (89, 4, "Ст3сп", 69800, True), (108, 4, "Ст3сп", 69800, True),
                                  (159, 5, "Ст20", 74600, True), (219, 6, "Ст20", 75900, False)]:
    add("truba-kruglaya", f"Труба электросварная {num(dd)}×{num(t)} мм", "ГОСТ 10704-91", grade, {"label": f"{num(dd)}×{num(t)} мм", "d": dd, "t": t},
        0.02466 * t * (dd - t), price, "10–12 м", stock)

# --- Лист: масса 1 м² = 7,85·t; length — формат листа ---
for t, kind, gost, grade, fmt, price, stock in [
    (0.8, "х/к", "ГОСТ 19904-90", "08пс", (1250, 2500), 79400, True), (1.5, "х/к", "ГОСТ 19904-90", "08пс", (1250, 2500), 77800, True),
    (3, "г/к", "ГОСТ 19903-2015", "Ст3сп", (1500, 6000), 63900, True), (4, "г/к", "ГОСТ 19903-2015", "Ст3сп", (1500, 6000), 62700, True),
    (6, "г/к", "ГОСТ 19903-2015", "Ст3сп", (1500, 6000), 61500, True), (10, "г/к", "ГОСТ 19903-2015", "Ст3сп", (1500, 6000), 61500, True),
    (12, "г/к", "ГОСТ 19903-2015", "09Г2С", (2000, 6000), 69900, True), (20, "г/к", "ГОСТ 19903-2015", "09Г2С", (2000, 6000), 70800, False)]:
    w, l = fmt
    add("list", f"Лист {kind} {num(t)} мм", gost, grade, {"label": f"{num(t)}×{w}×{l} мм", "t": t, "w": w, "l": l},
        7.85 * t, price, f"{num(w / 1000)}×{num(l / 1000)} м", stock, unit="м²")

# --- Уголок равнополочный, ГОСТ 8509-93, масса по ГОСТ ---
for a, t, w, grade, price, stock in [(25, 3, 1.12, "Ст3сп", 69900, True), (32, 4, 1.91, "Ст3сп", 68400, True), (40, 4, 2.42, "Ст3сп", 67300, True),
                                    (50, 5, 3.77, "Ст3сп", 66300, True), (63, 6, 5.72, "Ст3сп", 66300, True), (75, 6, 6.89, "Ст3сп", 66900, True),
                                    (100, 8, 12.25, "09Г2С", 74800, False)]:
    add("ugolok", f"Уголок {a}×{a}×{t} мм", "ГОСТ 8509-93", grade, {"label": f"{a}×{a}×{t} мм", "a": a, "t": t}, w, price, "6 / 11,7 м", stock)

# --- Швеллер, ГОСТ 8240-97, серия П ---
for no, h, w, price, stock in [(8, 80, 7.05, 71500, True), (10, 100, 8.59, 70200, True), (12, 120, 10.4, 68900, True), (14, 140, 12.3, 68900, True),
                               (16, 160, 14.2, 69400, True), (20, 200, 18.4, 70100, True), (24, 240, 24.0, 72800, False)]:
    add("shveller", f"Швеллер {no}П", "ГОСТ 8240-97", "Ст3сп", {"label": f"№ {no}П, h {h} мм", "no": f"{no}П", "h": h}, w, price, "11,7 / 12 м", stock)

# --- Балка двутавровая, ГОСТ Р 57837-2017 ---
for no, h, w, grade, price, stock in [(10, 100, 8.1, "С255", 76900, True), (12, 117.6, 8.7, "С255", 75600, True), (16, 157, 12.7, "С255", 74200, True),
                                      (20, 200, 21.3, "С255", 74200, True), (25, 248, 25.7, "С255", 74800, True), (30, 298, 32.9, "С345", 81900, True),
                                      (35, 346, 38.9, "С345", 82400, False), (40, 396, 48.1, "С345", 83600, False)]:
    add("balka", f"Балка {no}Б1", "ГОСТ Р 57837-2017", grade, {"label": f"{no}Б1, h {num(h)} мм", "no": f"{no}Б1", "h": h}, w, price, "12 м", stock)

# --- Круг, ГОСТ 2590-2006: 0,00617·d² ---
for d, grade, price, stock in [(10, "Ст3сп", 66800, True), (16, "Ст3сп", 65400, True), (20, "Ст3сп", 64700, True), (30, "45", 79800, True),
                               (40, "45", 79800, True), (50, "40Х", 94600, False)]:
    add("krug", f"Круг ⌀{d} мм", "ГОСТ 2590-2006", grade, {"label": f"⌀{d} мм", "d": d}, 0.006165 * d * d, price, "6 м", stock)

# --- Полоса, ГОСТ 103-2006: 0,00785·b·t ---
for b, t, price, stock in [(20, 4, 69900, True), (40, 4, 68400, True), (50, 5, 67500, True), (60, 6, 67500, True), (80, 8, 68100, True), (100, 10, 69300, False)]:
    add("polosa", f"Полоса {b}×{t} мм", "ГОСТ 103-2006", "Ст3сп", {"label": f"{b}×{t} мм", "b": b, "t": t}, RHO * b * t, price, "6 м", stock)

# --- Сетка сварная, ГОСТ 23279-2012, проволока Вр-1: масса 1 м² ≈ 2 · масса 1 м проволоки / шаг ---
for d, cell, price, stock in [(3, 50, 92600, True), (4, 100, 84500, True), (4, 150, 72700, True), (5, 100, 81900, True), (5, 150, 79800, True), (4, 50, 86400, False)]:
    wire = 0.006165 * d * d
    add("setka", f"Сетка сварная {d} мм, ячейка {cell}×{cell}", "ГОСТ 23279-2012", "Вр-1", {"label": f"⌀{d}, {cell}×{cell} мм", "d": d, "cell": cell},
        2 * wire * 1000 / cell, price, "карта 2×6 м", stock, unit="м²")

(ROOT / "data/products.json").write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Цена «от» в категориях = минимальная цена товара (для сетки — ₽ за м²)
cats = json.loads((ROOT / "data/categories.json").read_text(encoding="utf-8"))
for c in cats:
    items = [p for p in products if p["category"] == c["slug"]]
    if c["unit"] == "м²":
        c["priceFrom"] = min(round(p["pricePerTon"] * p["weightPerMeter"] / 1000) for p in items)
    else:
        c["priceFrom"] = min(p["pricePerTon"] for p in items)
(ROOT / "data/categories.json").write_text(json.dumps(cats, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(len(products), "товаров;", {c["slug"]: c["priceFrom"] for c in cats})
