import { pieceArea } from "@/lib/calc";
import { formatNumber, formatPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

/** Подписи размеров из product.size. Для уголка «a» — полка, для профильной трубы — сторона. */
const DIMENSION_LABELS: Record<string, string> = {
  d: "Диаметр, мм",
  a: "Сторона a, мм",
  b: "Сторона b, мм",
  t: "Толщина, мм",
  h: "Высота сечения, мм",
  w: "Ширина листа, мм",
  l: "Длина листа, мм",
  cell: "Ячейка, мм",
  no: "Номер профиля",
};
const OVERRIDES: Record<string, Record<string, string>> = {
  ugolok: { a: "Ширина полки, мм" },
  polosa: { b: "Ширина, мм" },
  setka: { d: "Диаметр проволоки, мм" },
  "truba-kruglaya": { d: "Наружный диаметр, мм", t: "Стенка, мм" },
  "truba-profilnaya": { t: "Стенка, мм" },
};

export type SpecRow = { name: string; value: string };

/** Таблица ТТХ карточки: идентификация, размеры, масса, поставка, цена. */
export function productSpecs(product: Product, category: Category): SpecRow[] {
  const dims = Object.entries(product.size)
    .filter(([key]) => key !== "label")
    .map(([key, value]) => ({
      name: OVERRIDES[product.category]?.[key] ?? DIMENSION_LABELS[key] ?? key,
      value: typeof value === "number" ? formatNumber(value, 1) : value,
    }));
  const perTon = 1000 / product.weightPerMeter;
  const rows: SpecRow[] = [
    { name: "Код позиции", value: product.id },
    { name: "Категория", value: category.name },
    { name: "Размер", value: product.size.label },
    ...dims,
    { name: "Марка стали / класс", value: product.steelGrade },
    { name: "Стандарт", value: product.gost },
    { name: `Масса 1 ${product.unit}`, value: `${formatNumber(product.weightPerMeter, 3)} кг` },
    { name: `${product.unit === "м" ? "Метров" : "Квадратных метров"} в тонне`, value: formatNumber(perTon, perTon < 100 ? 1 : 0) },
    { name: product.unit === "м" ? "Длина хлыста" : "Формат", value: product.length },
  ];
  if (product.unit === "м²") rows.push({ name: "Масса одной штуки", value: `${formatNumber(product.weightPerMeter * pieceArea(product), 1)} кг` });
  rows.push(
    { name: "Цена с НДС", value: formatPrice(product.pricePerTon, "т") },
    { name: "Наличие", value: product.inStock ? "На складе в Екатеринбурге" : "Под заказ, 5–7 рабочих дней" },
  );
  return rows;
}
