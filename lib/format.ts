/** Форматирование чисел и цен по-русски: 58 900 ₽/т. */
const rub = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export function formatPrice(value: number, unit?: string): string {
  return `${rub.format(value)} ₽${unit ? `/${unit}` : ""}`;
}

const dec = (digits: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits, minimumFractionDigits: 0 });

/** Число по-русски: 1 234,5. */
export function formatNumber(value: number, digits = 2): string {
  return dec(digits).format(value);
}

/** Масса: до тонны — «860 кг», дальше — «1,24 т». */
export function formatWeight(kg: number): string {
  return kg < 1000 ? `${dec(kg < 10 ? 1 : 0).format(kg)} кг` : `${dec(kg < 100_000 ? 2 : 1).format(kg / 1000)} т`;
}

/** Склонение: plural(3, ["позиция", "позиции", "позиций"]) → «позиции». */
export function plural(n: number, forms: [string, string, string]): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
  return forms[2];
}

/** Срок звонка словами: «сегодня до 14:30», «завтра до 10:00», «в понедельник до 10:00». */
export function callbackText(at: Date): string {
  const NB = "\u00a0";
  const time = at.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const days = Math.round((new Date(at).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
  if (days === 0) return `сегодня до${NB}${time}`;
  if (days === 1) return `завтра до${NB}${time}`;
  const weekday = ["в воскресенье", "в понедельник", "во вторник", "в среду", "в четверг", "в пятницу", "в субботу"];
  return `${weekday[at.getDay()]} до${NB}${time}`;
}
