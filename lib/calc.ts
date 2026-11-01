/**
 * Расчёт массы и стоимости позиции (паспорт §5). Один источник формул для калькулятора в карточке,
 * списка для КП и кабинета.
 *
 * - Длинномер (unit «м»): масса = масса 1 м × длина × количество.
 * - Лист и сетка (unit «м²»): масса = масса 1 м² × площадь одной штуки × количество.
 *   Площадь листа — из size.w × size.l (мм), карты сетки — 2 × 6 м.
 * - Стоимость = масса / 1000 × цена за тонну.
 */
import type { KpItem, Product } from "./types";

/** Карта сварной сетки 2 × 6 м (паспорт поставки в data/products.json). */
const MESH_CARD_M2 = 12;

/** Площадь одной штуки для листа и сетки, м². */
export function pieceArea(product: Product): number {
  const { w, l } = product.size;
  if (typeof w === "number" && typeof l === "number") return (w * l) / 1_000_000;
  return MESH_CARD_M2;
}

/** Стандартная длина хлыста для длинномера, м: первое число из «6 / 11,7 м». */
export function defaultLength(product: Product): number {
  const match = product.length.match(/\d+(?:,\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : 6;
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
