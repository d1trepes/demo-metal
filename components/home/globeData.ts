/**
 * Блок «География отгрузок» (чат 5б): зоны доставки, цифры.
 * Какие регионы в какой зоне и города с дугами — scripts/build-globe.mjs (контуры считаются там же).
 * Тексты отсюда проходят типограф на сервере (GeoSection) и пропсами идут в GlobeMap.
 */

export type DeliveryZone = {
  zone: 1 | 2 | 3;
  term: string;
  method: string;
  /** Коротко, куда — для легенды. */
  where: string;
};

export const deliveryZones: DeliveryZone[] = [
  { zone: 1, term: "1–2 дня", method: "свой длинномер 13,6 м", where: "УрФО, Пермский край, Башкортостан, Удмуртия" },
  { zone: 2, term: "3–5 дней", method: "транспортная компания", where: "Поволжье, Западная Сибирь, ЯНАО, Казахстан" },
  { zone: 3, term: "7+ дней", method: "ТК или ж/д", where: "Центр, Северо-Запад, Красноярск, Беларусь, Средняя Азия" },
];

/** Цифры блока: только измеримое. Метка — подпись к данным, не надзаголовок. */
export const geoStats = [
  { label: "Отгрузка", value: "В день", unit: "оплаты до 15:00" },
  { label: "Регионов отгрузки", value: "38", unit: "+ 4 страны" },
  { label: "На складе", value: "12 400", unit: "тонн проката по ГОСТ" },
  { label: "Сдано объектов", value: "340", unit: "с 2008 года" },
];

/** Формат public/globe/globe.json (scripts/build-globe.mjs). viewBox 0 0 size size. */
export type GlobeData = {
  size: number;
  sphere: string;
  graticule: string;
  land: string;
  /** zone 0 — регион РФ, куда регулярно не возим (без подсказки). */
  /** cx, cy — центр видимой части региона: туда привязана метка. Москва и СПб — одно имя с областью. */
  regions: { id: string; name: string; zone: 0 | 1 | 2 | 3; d: string; cx: number; cy: number }[];
  /** Дуги от склада — к опорным городам. */
  arcs: { name: string; d: string }[];
  /** Точки: областные центры зон 1–3 и столицы СНГ. */
  cities: { name: string; x: number; y: number }[];
  warehouse: { name: string; x: number; y: number };
  /** Регион, метка которого видна по умолчанию и куда она возвращается (склад). */
  defaultRegion: string;
};
