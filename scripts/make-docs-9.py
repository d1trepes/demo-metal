"""
PDF-образцы для кабинета → public/docs/ (чат 9): КП, счёт, УПД.
Данные берутся из data/*.json, суммы совпадают с documents.json. Шрифт — Sofia Sans (статичные TTF,
собранные из @fontsource-variable через fontTools: instancer wght 400/700 + merge latin+cyrillic).

Запуск: python3 scripts/make-docs-9.py docs/assets-src/pdf-fonts
В TTF русские формы букв (у Sofia Sans по умолчанию болгарские, русские — через locl RUS) подставлены прямо в cmap.
"""
import json
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path(sys.argv[1])
pdfmetrics.registerFont(TTFont("S", FONTS / "SofiaSans-400.ttf"))
pdfmetrics.registerFont(TTFont("SB", FONTS / "SofiaSans-700.ttf"))
pdfmetrics.registerFont(TTFont("C", FONTS / "SofiaSansCond-700.ttf"))

INK = HexColor("#0e1013")
MUTED = HexColor("#5b6169")
LINE = HexColor("#d5d8dc")
VAT = 22  # НДС с 01.01.2026

products = {p["id"]: p for p in json.loads((ROOT / "data/products.json").read_text())}
orders = {o["id"]: o for o in json.loads((ROOT / "data/orders.json").read_text())}
kps = {k["id"]: k for k in json.loads((ROOT / "data/kp-requests.json").read_text())}
user = json.loads((ROOT / "data/user.json").read_text())

SELLER = {
    "name": "ООО «Пролёт»",
    "inn": "6670000000",
    "kpp": "667001001",
    "address": "620088, Екатеринбург, ул. Монтажников, 26, офис 2",
    "bank": "АО «Банк Пример», г. Екатеринбург (условный)",
    "bik": "046500000",
    "account": "40702810816540000000",
    "corr": "30101810000000000000",
    "director": "Горбунов П. А.",
}


def rub(v: float) -> str:
    return f"{v:,.2f}".replace(",", " ").replace(".", ",")


def num(v: float, d: int = 3) -> str:
    return f"{v:,.{d}f}".replace(",", " ").replace(".", ",")


def lines_for(items, total_rub):
    """Строки документа: масса и сумма как в калькуляторе сайта; копейки подгоняем в последней строке под итог."""
    rows = []
    for it in items:
        p = products[it["productId"]]
        if p["unit"] == "м²":
            area = 12 * it["quantity"]  # карта 2×6 м
            weight = p["weightPerMeter"] * area
        else:
            weight = p["weightPerMeter"] * (it.get("length") or 12) * it["quantity"]
        t = weight / 1000
        rows.append({"name": f'{p["name"]}, {p["steelGrade"]}, {p["gost"]}'.replace("⌀", "d "), "qty": t, "price": p["pricePerTon"], "sum": round(t * p["pricePerTon"])})
    diff = total_rub - sum(r["sum"] for r in rows)
    rows[-1]["sum"] += diff  # расхождение — рубли округления массы
    return rows


class Doc:
    W, H = A4
    L, R = 18 * mm, A4[0] - 18 * mm

    def __init__(self, path: Path, title: str):
        self.c = canvas.Canvas(str(path), pagesize=A4)
        self.c.setTitle(title)
        self.c.setAuthor("Пролёт (демо)")
        self.y = self.H - 18 * mm

    def text(self, x, s, font="S", size=9, color=INK, right=False):
        self.c.setFont(font, size)
        self.c.setFillColor(color)
        (self.c.drawRightString if right else self.c.drawString)(x, self.y, s)

    def rule(self, color=LINE, w=0.6):
        self.c.setStrokeColor(color)
        self.c.setLineWidth(w)
        self.c.line(self.L, self.y, self.R, self.y)

    def header(self):
        self.text(self.L, "ПРОЛЁТ", "C", 20)
        self.text(self.R, "Металлобаза и цех металлоконструкций · Екатеринбург", "S", 8, MUTED, right=True)
        self.y -= 5 * mm
        self.text(self.R, "+7 343 300-14-26 · zakaz@prolet-metall.ru", "S", 8, MUTED, right=True)
        self.y -= 4 * mm
        self.rule(INK, 1)
        self.y -= 4 * mm
        self.text(self.L, "ОБРАЗЕЦ. Демо-проект студии: компания и данные вымышлены, документ не имеет силы.", "S", 7.5, MUTED)
        self.y -= 12 * mm

    def title(self, s, sub=None):
        self.text(self.L, s.upper(), "C", 18)
        self.y -= 6 * mm
        if sub:
            self.text(self.L, sub, "S", 9, MUTED)
            self.y -= 8 * mm

    def pairs(self, rows, label_w=42 * mm):
        for k, v in rows:
            self.text(self.L, k, "S", 8.5, MUTED)
            self.text(self.L + label_w, v, "S", 8.5)
            self.y -= 5 * mm
        self.y -= 3 * mm

    def table(self, rows):
        cols = [(self.L, "№", False), (self.L + 8 * mm, "Наименование", False), (self.R - 62 * mm, "Кол-во, т", True), (self.R - 32 * mm, "Цена, руб./т", True), (self.R, "Сумма, руб.", True)]
        self.rule(LINE)
        self.y -= 5 * mm
        for x, h, r in cols:
            self.text(x, h, "SB", 8, MUTED, right=r)
        self.y -= 3 * mm
        self.rule()
        for i, row in enumerate(rows, 1):
            self.y -= 6 * mm
            vals = [str(i), row["name"], num(row["qty"]), rub(row["price"]), rub(row["sum"])]
            for (x, _, r), v in zip(cols, vals):
                self.text(x, v, "S", 8.5, right=r)
            self.y -= 3 * mm
            self.rule()
        total = sum(r["sum"] for r in rows)
        vat = total * VAT / (100 + VAT)
        self.y -= 7 * mm
        self.text(self.R - 32 * mm, "Итого:", "SB", 9, right=True)
        self.text(self.R, rub(total), "SB", 9, right=True)
        self.y -= 5 * mm
        self.text(self.R - 32 * mm, f"В том числе НДС {VAT}%:", "S", 8.5, MUTED, right=True)
        self.text(self.R, rub(vat), "S", 8.5, right=True)
        self.y -= 5 * mm
        weight = sum(r["qty"] for r in rows)
        self.text(self.R - 32 * mm, "Масса:", "S", 8.5, MUTED, right=True)
        self.text(self.R, f"{num(weight)} т", "S", 8.5, right=True)
        self.y -= 12 * mm

    def notes(self, items):
        for s in items:
            self.text(self.L, s, "S", 8.5)
            self.y -= 5 * mm
        self.y -= 6 * mm

    def signs(self, roles):
        x = self.L
        step = (self.R - self.L) / len(roles)
        for role, name in roles:
            self.c.setStrokeColor(INK)
            self.c.setLineWidth(0.6)
            self.c.line(x, self.y, x + step - 10 * mm, self.y)
            self.c.setFont("S", 8)
            self.c.setFillColor(MUTED)
            self.c.drawString(x, self.y - 4 * mm, f"{role} — {name}")
            x += step
        self.y -= 14 * mm

    def save(self):
        self.c.showPage()
        self.c.save()


buyer = user["company"]
out = ROOT / "public/docs"
out.mkdir(exist_ok=True)

# КП
kp = kps["КП-2810-0377"]
d = Doc(out / "kp-sample.pdf", "КП-2810-0377")
d.header()
d.title("Коммерческое предложение КП-2810-0377", "от 28.10.2026 · действительно 3 рабочих дня")
d.pairs([("Покупатель", f'{buyer["name"]}, ИНН {buyer["inn"]}'), ("Контакт", f'{user["name"]}, {user["phone"]}'), ("Доставка", user["deliveryAddresses"][0])])
d.table(lines_for(kp["items"], 241320))
d.notes(["Металл со склада в Екатеринбурге, сертификаты завода — с отгрузкой.", "Резка в размер ±2 мм — бесплатно от 1 т. Отгрузка — на следующий день после оплаты.", "Доставка длинномером до 13,6 м по Екатеринбургу — 6 500 руб. за рейс, в сумму не включена."])
d.signs([("Менеджер", "Захаров А. В.")])
d.save()

# Счёт
o = orders["З-2910-0341"]
d = Doc(out / "invoice-sample.pdf", "Счёт № 341")
d.header()
d.title("Счёт на оплату № 341 от 29.10.2026", "к заказу З-2910-0341 · оплатить до 03.11.2026")
d.pairs([
    ("Получатель", f'{SELLER["name"]}, ИНН {SELLER["inn"]}, КПП {SELLER["kpp"]}'),
    ("Банк", SELLER["bank"]),
    ("БИК / к/с", f'{SELLER["bik"]} / {SELLER["corr"]}'),
    ("Р/с", SELLER["account"]),
    ("Покупатель", f'{buyer["name"]}, ИНН {buyer["inn"]}, КПП {buyer["kpp"]}'),
    ("Адрес покупателя", buyer["address"]),
])
d.table(lines_for(o["items"], o["totalRub"]))
d.notes(["Счёт действителен 3 рабочих дня: цены на металл держим на этот срок.", "Отгрузка — на следующий день после поступления оплаты."])
d.signs([("Руководитель", SELLER["director"]), ("Главный бухгалтер", "Корнилова Е. Н.")])
d.save()

# УПД
o = orders["З-0210-0231"]
d = Doc(out / "upd-sample.pdf", "УПД № 231")
d.header()
d.title("Универсальный передаточный документ № 231", "от 07.10.2026 · статус 1 (счёт-фактура и передаточный документ) · заказ З-0210-0231")
d.pairs([
    ("Продавец", f'{SELLER["name"]}, ИНН/КПП {SELLER["inn"]}/{SELLER["kpp"]}'),
    ("Адрес продавца", SELLER["address"]),
    ("Покупатель", f'{buyer["name"]}, ИНН/КПП {buyer["inn"]}/{buyer["kpp"]}'),
    ("Адрес покупателя", buyer["address"]),
    ("Грузополучатель", o["delivery"]),
])
d.table(lines_for(o["items"], o["totalRub"]))
d.signs([("Товар передал", "завскладом Данилов О. И."), ("Товар получил", "________________")])
d.save()

print("ok:", *sorted(p.name for p in out.glob("*.pdf")))
