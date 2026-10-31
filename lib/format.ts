/** Форматирование чисел и цен по-русски: 58 900 ₽/т. */
const rub = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export function formatPrice(value: number, unit?: string): string {
  return `${rub.format(value)} ₽${unit ? `/${unit}` : ""}`;
}
