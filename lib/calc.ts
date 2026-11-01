/**
 * Расчёт массы и стоимости позиции (паспорт §5). Один источник формул для калькулятора в карточке,
 * списка для КП и кабинета.
 *
 * - Длинномер (unit «м»): масса = масса 1 м × длина × количество.
 * - Лист и сетка (unit «м²»): масса = масса 1 м² × площадь одной штуки × количество.
 *   Площадь листа — из size.w × size.l (мм), карты сетки — 2 × 6 м.
 * - Стоимость = масса / 1000 × цена за тонну.
 */
import { formatNumber, plural } from "./format";
import type { KpItem, Product } from "./types";

/** Карта сварной сетки 2 × 6 м (паспорт поставки в data/products.json). */
const MESH_CARD_M2 = 12;

/** Площадь одной штуки для листа и сетки, м². */
export function pieceArea(product: Product): number {
  const { w, l } = product.size;
  if (typeof w === "number" && typeof l === "number") return (w * l) / 1_000_000;
  return MESH_CARD_M2;
}

/**
 * Длины хлыстов со склада, м: «6 / 11,7 м» → [6, 11.7], «10–12 м» → [10, 12].
 * Пусто — товар в бухтах или листах: считаем метрами (длинномер) или штуками (лист, сетка).
 */
export function stockLengths(product: Product): number[] {
  if (product.unit !== "м") return [];
  return (product.length.match(/\d+(?:,\d+)?/g) ?? []).map((n) => Number(n.replace(",", ".")));
}

/** Длина одной штуки по умолчанию, м: первая складская длина; для бухты — 1 м (количество = метры). */
export function defaultLength(product: Product): number {
  return stockLengths(product)[0] ?? 1;
}

/** Масса одной штуки (хлыста длиной length, листа, карты), кг. */
export function pieceWeight(product: Product, length = defaultLength(product)): number {
  return product.unit === "м" ? product.weightPerMeter * length : product.weightPerMeter * pieceArea(product);
}

export type CalcResult = { weightKg: number; priceRub: number; meters?: number; squareMeters?: number };

export function calcItem(product: Product, item: Pick<KpItem, "quantity" | "length">): CalcResult {
  const qty = Math.max(0, item.quantity || 0);
  const weightKg = pieceWeight(product, item.length ?? defaultLength(product)) * qty;
  const priceRub = (weightKg / 1000) * product.pricePerTon;
  return product.unit === "м"
    ? { weightKg, priceRub, meters: (item.length ?? defaultLength(product)) * qty }
    : { weightKg, priceRub, squareMeters: pieceArea(product) * qty };
}

/** Сколько штук нужно, чтобы набрать массу в тоннах (обратный расчёт «нужно 2 т»). */
export function piecesForTons(product: Product, tons: number, length = defaultLength(product)): number {
  const piece = pieceWeight(product, length);
  return piece > 0 ? Math.ceil((tons * 1000) / piece) : 0;
}

/** Цена за м² для сетки и листа (на сайте показываем рядом с ₽/т). */
export function pricePerSquareMeter(product: Product): number {
  return (product.weightPerMeter / 1000) * product.pricePerTon;
}

/** Итог по списку позиций. Позиции без товара (удалён из каталога) пропускаются. */
export function calcTotal(items: KpItem[], products: Map<string, Product>): CalcResult {
  return items.reduce<CalcResult>(
    (sum, item) => {
      const product = products.get(item.productId);
      if (!product) return sum;
      const r = calcItem(product, item);
      return { weightKg: sum.weightKg + r.weightKg, priceRub: sum.priceRub + r.priceRub };
    },
    { weightKg: 0, priceRub: 0 },
  );
}

/** Бухта: длинномер без складских длин (арматура ⌀6) — количество считаем метрами. */
export function isCoil(product: Product): boolean {
  return product.unit === "м" && stockLengths(product).length === 0;
}

/** Как называем штуку: хлыст, лист, карта; для бухты — метры. */
export function pieceForms(product: Product): [string, string, string] {
  if (isCoil(product)) return ["метр", "метра", "метров"];
  if (product.category === "list") return ["лист", "листа", "листов"];
  if (product.category === "setka") return ["карта", "карты", "карт"];
  return ["хлыст", "хлыста", "хлыстов"];
}

/** Подпись для уведомления «Добавлено: Труба 60×60×3 мм, 16 хлыстов». */
export function kpItemLabel(product: Product, quantity: number): string {
  return `${product.name}, ${formatNumber(quantity, 0)} ${plural(quantity, pieceForms(product))}`;
}
