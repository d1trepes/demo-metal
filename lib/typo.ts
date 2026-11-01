import Typograf from "typograf";

/**
 * Типограф для всех текстов сайта (чат 5б). Одна точка входа: typo(text) и typoAll(data).
 *
 * Только для серверных компонентов и данных, которые сервер передаёт в клиентские компоненты пропсами:
 * сам typograf весит ~100 КБ, в браузерный бандл он попадать не должен.
 *
 * Что делает:
 * - typograf (ru): неразрывные пробелы перед тире и после коротких слов (в, и, с, к, по, на, о, у…),
 *   кавычки «ёлочки», тире, многоточие;
 * - свои правила: число + единица (12 400 т, 6 мм, 2 дня, 15:00 ₽), разряды числа (12 400),
 *   номер ГОСТа не отрывается от слова «ГОСТ».
 */
const tp = new Typograf({ locale: ["ru", "en-US"] });
// typograf ставит неразрывный пробел после «т» в «12 400 т на складе» как после короткого слова —
// единицы склеиваем со своим числом сами (ниже), а это правило отключаем.
tp.disableRule(["ru/nbsp/afterShortWord", "common/nbsp/afterShortWord"]);

const NBSP = " ";
const UNITS =
  "т|кг|г|мм|см|м|м²|м³|км|пог\\.|₽|%|ч|мин|с|дн\\.|день|дня|дней|мес\\.|месяц|месяцев|лет|года?|шт\\.?|штук|МБ|ГБ|объектов|позиций|регионов|рабочих";
const SHORT_WORDS = "в|и|с|к|по|на|о|у|а|от|до|за|из|не|для|без|при|под|над|об|во|со|ко";

const rules: [RegExp, string][] = [
  // разряды: 12 400, 1 860
  [/(\d) (?=\d{3}(?!\d))/g, `$1${NBSP}`],
  // число (и диапазон 1–2) + единица
  [new RegExp(`(\\d) (?=(?:${UNITS})(?=[\\s.,;:!?)»]|$))`, "g"), `$1${NBSP}`],
  // ГОСТ 8509, ТУ 14-1, СП 16, А500С не отрывается от слова
  [/(ГОСТ|ТУ|СП|СНиП|ФЗ|№) (?=[\dА-Я])/g, `$1${NBSP}`],
  // «пог. м», «т. д.»
  [/(пог|т)\. (?=[мд])/g, `$1.${NBSP}`],
  // короткие слова в начале строки и после пробела
  [new RegExp(`(^|[\\s(«${NBSP}])(${SHORT_WORDS}) `, "gi"), `$1$2${NBSP}`],
];

export function typo(text: string): string {
  let out = tp.execute(text);
  for (const [pattern, replacement] of rules) out = out.replace(pattern, replacement);
  return out;
}

/** Прогоняет через typo() все строки в объекте/массиве (данные для клиентских компонентов). */
export function typoAll<T>(data: T, skip: string[] = ["slug", "id", "href", "src", "number"]): T {
  if (typeof data === "string") return typo(data) as T;
  if (Array.isArray(data)) return data.map((item) => typoAll(item, skip)) as T;
  if (data && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, skip.includes(key) ? value : typoAll(value, skip)]),
    ) as T;
  }
  return data;
}
