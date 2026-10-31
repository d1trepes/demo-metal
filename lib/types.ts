/** Общие типы данных. Совпадают с тем, что должен возвращать бэкенд (docs/HANDOFF.md). */

/** Сечение профиля — по нему рисуется заглушка-чертёж, пока нет рендеров. */
export type ProfileShape =
  | "rebar"
  | "rect-tube"
  | "round-tube"
  | "sheet"
  | "angle"
  | "channel"
  | "ibeam"
  | "bar"
  | "flat"
  | "mesh";

export type Category = {
  slug: string;
  name: string;
  /** Подпись в плитке, 1 строка. */
  caption: string;
  /** Основной ГОСТ категории. */
  gost: string;
  /** Диапазон размеров текстом: «⌀ 6–40 мм». */
  sizes: string;
  /** Минимальная цена, ₽ за unit, с НДС. */
  priceFrom: number;
  unit: "т" | "м²";
  profile: ProfileShape;
};

/** Заявка на расчёт с главной (форма «Расчёт заявки»). */
export type QuoteRequest = {
  name: string;
  phone: string;
  email?: string;
  /** Компания или ИНН — как ввёл человек. */
  company?: string;
  /** Что нужно: позиции, объёмы, сроки — свободным текстом. */
  message: string;
  /** Спецификация или чертёж (PDF, XLSX, DWG, JPG), до 20 МБ. */
  file?: File;
};

export type QuoteRequestResult = {
  /** Номер заявки для клиента, например «Р-2611-0147». */
  id: string;
  /** До какого времени перезвонит менеджер, ISO-строка. */
  callbackBy: string;
};
