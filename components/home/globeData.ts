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

/**
 * Ракурс карты «Горизонт» (чат 5д). Кадр W × H, шар радиуса R, верх шара — на `top` от верха кадра,
 * поэтому виден только «горизонт». Выбранный регион подлетает в точку (W/2, targetY).
 * Широта центра вида ограничена: шар нельзя «опрокинуть» полюсом в кадр. Вид по умолчанию = заглушка
 * (те же числа в scripts/build-globe.mjs).
 */
export const GLOBE_VIEW = {
  width: 1300,
  height: 700,
  radius: 1700,
  top: 30,
  /** Куда подлетает регион: по высоте — у нижней трети кадра (там меньше всего сжатие у горизонта). */
  targetY: 480,
  /** По ширине: на широком экране — правее панели, на узком — по центру. */
  targetXWide: 0.64,
  latMin: -10,
  latMax: 30,
};

const RAD = Math.PI / 180;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Центр вида (lon, lat), при котором точка (lon, lat) встаёт в (tx, targetY) кадра — точное решение для orthographic.
 * Та же формула — в scripts/build-globe.mjs (вид заглушки).
 */
export function viewFor(lon: number, lat: number, tx: number): { lon: number; lat: number } {
  const { width, radius: R, top, targetY, latMin, latMax } = GLOBE_VIEW;
  const phi = lat * RAD;
  const dLambda = Math.asin(clamp((tx - width / 2) / (R * Math.cos(phi)), -1, 1));
  const c = (top + R - targetY) / R;
  const A = Math.sin(phi);
  const B = Math.cos(phi) * Math.cos(dLambda);
  const phi0 = Math.acos(clamp(c / Math.hypot(A, B), -1, 1)) - Math.atan2(B, A);
  return { lon: lon - dLambda / RAD, lat: clamp(phi0 / RAD, latMin, latMax) };
}

/** Регион в списке панели (одна строка на имя; Москва и СПб — вместе с областью). */
export type GeoRegion = {
  name: string;
  /** 0 — регион РФ без регулярных отгрузок (по запросу). */
  zone: 0 | 1 | 2 | 3;
  /** Областной центр и крупные города через запятую — для поиска. */
  cities: string;
  /** Центр самого крупного контура — сюда поворачиваем шар. */
  lon: number;
  lat: number;
};

/** Формат public/globe/geo.json (scripts/build-globe.mjs). Топология в долготах/широтах, проекция — в браузере. */
export type GeoData = {
  topo: import("topojson-specification").Topology;
  regions: GeoRegion[];
  /** Точки; arc: true — к городу идёт дуга от склада. */
  cities: { name: string; lon: number; lat: number; arc?: boolean }[];
  warehouse: { name: string; lon: number; lat: number };
  defaultRegion: string;
};
