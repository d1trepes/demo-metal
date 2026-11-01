/**
 * Готовит глобус «География отгрузок» (чат 5б): ракурс фиксированный, поэтому проекцию считаем здесь,
 * а браузер получает готовые SVG-контуры — без canvas, WebGL и d3.
 *
 * Запуск: node scripts/build-globe.mjs
 *   → public/globe/globe.json  — контуры для интерактивного глобуса (GlobeMap.tsx)
 *   → public/globe/globe.svg   — тот же вид без интерактива; из него scripts/render-globe-static.py делает заглушку WebP
 *
 * Источники (devDependencies, в браузер не попадают): world-atlas (суша и страны 110m), d3-geo, topojson-client,
 * docs/assets-src/geo/russia-regions.topo.json (регионы РФ, scripts/prepare-regions.mjs).
 * Зоны доставки и города — здесь (ZONE_*, CITIES); подписи зон — components/home/globeData.ts.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoArea, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";

const W = 1000; // viewBox 0 0 1000 760: кадр шире, чем выше — сверху и снизу нет пустого моря
const H = 760;
const R = 1380; // чат 5г: шар ×3 — мелкие регионы Поволжья ≥ 24 px; края кадра растворяются в фон (CSS-маска)
const VIEW = { lon: 60, lat: 54.5 }; // от Минска до Красноярска, Казахстан и Средняя Азия внизу
const WAREHOUSE = { name: "Екатеринбург", lon: 60.6, lat: 56.84 };

/** Регионы РФ по зонам доставки (имена — как в источнике). 8 + 18 + 12 = 38 регионов. */
const ZONE_1 = [
  "Свердловская область", "Челябинская область", "Тюменская область", "Курганская область",
  "Пермский край", "Башкортостан", "Ханты-Мансийский автономный округ - Югра", "Удмуртская республика",
];
const ZONE_2 = [
  "Ямало-Ненецкий автономный округ", "Оренбургская область", "Татарстан", "Омская область",
  "Новосибирская область", "Томская область", "Кемеровская область", "Алтайский край",
  "Самарская область", "Кировская область", "Республика Коми", "Ульяновская область",
  "Чувашия", "Марий Эл", "Нижегородская область", "Пензенская область", "Саратовская область",
  "Республика Мордовия",
];
const ZONE_3 = [
  "Москва", "Московская область", "Санкт-Петербург", "Ленинградская область", "Красноярский край",
  "Иркутская область", "Волгоградская область", "Ростовская область", "Воронежская область",
  "Ярославская область", "Владимирская область", "Тверская область",
];
/** Страны СНГ (ISO 3166 numeric → зона, название). */
const CIS = {
  398: [2, "Казахстан"],
  112: [3, "Беларусь"],
  860: [3, "Узбекистан"],
  417: [3, "Киргизия"],
};
/** Короткие имена для подсказки. Москва и СПб — одна цель с областью (город слишком мелкий для курсора). */
const SHORT = {
  "Ханты-Мансийский автономный округ - Югра": "ХМАО — Югра",
  "Ямало-Ненецкий автономный округ": "ЯНАО",
  "Удмуртская республика": "Удмуртия",
  "Москва": "Москва и область",
  "Московская область": "Москва и область",
  "Санкт-Петербург": "Санкт-Петербург и область",
  "Ленинградская область": "Санкт-Петербург и область",
};
/** Регион, активный по умолчанию (склад). */
const DEFAULT_REGION = "Свердловская область";

/** Точки: областные центры зон 1–3 в кадре + столицы СНГ. [имя, долгота, широта] */
const CITIES = [
  // зона 1
  ["Челябинск", 61.4, 55.16], ["Тюмень", 65.53, 57.15], ["Курган", 65.34, 55.44], ["Пермь", 56.25, 58.01],
  ["Уфа", 55.97, 54.74], ["Ханты-Мансийск", 69.02, 61.0], ["Ижевск", 53.2, 56.85],
  // зона 2
  ["Салехард", 66.6, 66.53], ["Оренбург", 55.1, 51.77], ["Казань", 49.12, 55.79], ["Омск", 73.37, 54.99],
  ["Новосибирск", 82.92, 55.03], ["Томск", 84.95, 56.48], ["Кемерово", 86.09, 55.35], ["Барнаул", 83.78, 53.35],
  ["Самара", 50.1, 53.2], ["Киров", 49.67, 58.6], ["Сыктывкар", 50.84, 61.67], ["Ульяновск", 48.4, 54.32],
  ["Чебоксары", 47.25, 56.13], ["Йошкар-Ола", 47.89, 56.63], ["Нижний Новгород", 44.0, 56.33],
  ["Пенза", 45.0, 53.2], ["Саратов", 46.03, 51.53], ["Саранск", 45.18, 54.19],
  // зона 3
  ["Москва", 37.62, 55.76], ["Санкт-Петербург", 30.31, 59.94], ["Красноярск", 92.85, 56.01],
  ["Волгоград", 44.5, 48.71], ["Ростов-на-Дону", 39.7, 47.23], ["Воронеж", 39.2, 51.66],
  ["Ярославль", 39.87, 57.63], ["Владимир", 40.4, 56.13], ["Тверь", 35.9, 56.86],
  // СНГ
  ["Астана", 71.43, 51.17], ["Алматы", 76.9, 43.24], ["Минск", 27.56, 53.9], ["Ташкент", 69.24, 41.3],
  ["Бишкек", 74.6, 42.87],
];
/** Дуги от склада — только к опорным городам, иначе в Поволжье каша. */
const ARC_TO = [
  "Уфа", "Казань", "Омск", "Новосибирск", "Салехард", "Астана", "Москва", "Санкт-Петербург",
  "Минск", "Ташкент", "Красноярск", "Алматы", "Ростов-на-Дону",
];

const zoneOf = (name) => (ZONE_1.includes(name) ? 1 : ZONE_2.includes(name) ? 2 : ZONE_3.includes(name) ? 3 : 0);

const projection = geoOrthographic()
  .rotate([-VIEW.lon, -VIEW.lat])
  .scale(R)
  .translate([W / 2, H / 2])
  .clipAngle(90)
  .clipExtent([[0, 0], [W, H]]) // всё вне квадрата кадра отрезаем — файл меньше
  .precision(0.3);
const path = geoPath(projection).digits(0);

/** d3 ждёт внешние кольца по часовой; если полигон «вывернут» (площадь > полушария) — разворачиваем. */
function rewind(f) {
  if (geoArea(f) <= 2 * Math.PI) return f;
  const g = f.geometry;
  const rev = (poly) => poly.map((ring) => ring.slice().reverse());
  const geometry =
    g.type === "Polygon" ? { ...g, coordinates: rev(g.coordinates) } : { ...g, coordinates: g.coordinates.map(rev) };
  return { ...f, geometry };
}

/** Центр региона для метки (по видимой в кадре части), площадь — для выбора среди одноимённых. */
const clamp = (v, max) => Math.min(max - 40, Math.max(40, Math.round(v)));
function center(f) {
  const [x, y] = path.centroid(f);
  return { cx: clamp(x, W), cy: clamp(y, H), area: path.area(f) };
}

// ---------- Фон суши одним контуром (110m, без границ) + страны СНГ ----------
const read = (file) => JSON.parse(readFileSync(new URL(`../node_modules/world-atlas/${file}`, import.meta.url)));
const landTopo = read("land-110m.json");
const land = path(feature(landTopo, landTopo.objects.land));

const worldTopo = read("countries-110m.json");
const regions = [];
for (const c of feature(worldTopo, worldTopo.objects.countries).features) {
  const id = String(Number(c.id));
  if (!CIS[id]) continue;
  const d = path(c);
  if (d) regions.push({ id: `c${id}`, name: CIS[id][1], zone: CIS[id][0], d, ...center(c) });
}

// ---------- Регионы РФ ----------
const ruTopo = JSON.parse(readFileSync(new URL("../docs/assets-src/geo/russia-regions.topo.json", import.meta.url)));
const ruRegions = feature(ruTopo, ruTopo.objects.regions).features.map(rewind);
ruRegions.forEach((f, i) => {
  const d = path(f);
  if (!d) return;
  const name = f.properties.name;
  regions.push({ id: `r${i}`, name: SHORT[name] ?? name, zone: zoneOf(name), d, ...center(f) });
});
// Регионы с общим именем (Москва и область) — одна метка: центр самого большого
for (const r of regions) {
  const big = regions.filter((o) => o.name === r.name).sort((a, b) => b.area - a.area)[0];
  [r.cx, r.cy] = [big.cx, big.cy];
}
regions.forEach((r) => delete r.area);
// Сначала незакрашенные, потом зоны 3 → 1: тёмные границы ближних зон поверх
regions.sort((a, b) => (a.zone || 9) - (b.zone || 9)).reverse();

// ---------- Дуги и города ----------
const lift = (h, [x, y]) => [W / 2 + (x - W / 2) * h, H / 2 + (y - H / 2) * h];
const home = [WAREHOUSE.lon, WAREHOUSE.lat];
const round = (n) => Math.round(n * 10) / 10;
const inFrame = ([x, y]) => x >= 0 && x <= W && y >= 0 && y <= H;
const cities = CITIES.map(([name, lon, lat]) => ({ name, lon, lat, p: projection([lon, lat]) }))
  .filter((c) => c.p && inFrame(c.p))
  .map(({ name, lon, lat, p }) => ({ name, lon, lat, x: round(p[0]), y: round(p[1]) }));
const arcs = cities.filter((c) => ARC_TO.includes(c.name)).map(({ name, lon, lat }) => {
  const to = [lon, lat];
  const interp = geoInterpolate(home, to);
  const steps = 32;
  const pts = [];
  const span = Math.hypot(lon - home[0], lat - home[1]);
  const h0 = 0.008 + span * 0.0006; // чем дальше город, тем выше дуга (масштаб ×2 — подъём вдвое ниже)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = projection(interp(t));
    pts.push(lift(1 + h0 * Math.sin(Math.PI * t), p).map(round));
  }
  return { name, d: `M${pts.map((p) => p.join(",")).join("L")}` };
});
const [hx, hy] = projection(home).map(round);

const sphere = path({ type: "Sphere" });
const graticule = path(geoGraticule10());

const data = {
  width: W, height: H, sphere, graticule, land, regions, arcs,
  cities: cities.map(({ name, x, y }) => ({ name, x, y })),
  warehouse: { name: WAREHOUSE.name, x: hx, y: hy },
  defaultRegion: DEFAULT_REGION,
};

mkdirSync(new URL("../public/globe/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/globe/globe.json", import.meta.url), JSON.stringify(data));

// ---------- Статичный SVG того же вида (для заглушки). Цвета = токены из styles/tokens.css ----------
const C = {
  ocean: "#ffffff", grid: "#f2f3f5", edge: "#d5d8dc", land: "#f2f3f5", z0: "#e7e9ec",
  z1: "#0e1013", z2: "#5b6169", z3: "#a3a9b1", border: "#ffffff", arc: "#0e1013",
};
const fill = (z) => [C.z0, C.z1, C.z2, C.z3][z];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<path d="${sphere}" fill="${C.ocean}"/>
<path d="${graticule}" fill="none" stroke="${C.grid}" stroke-width="1"/>
<path d="${land}" fill="${C.land}" stroke="${C.border}" stroke-width="0.6"/>
${regions.map((r) => `<path d="${r.d}" fill="${fill(r.zone)}" stroke="${C.border}" stroke-width="0.6"/>`).join("\n")}
<g fill="none" stroke-linecap="round">${arcs
  .map((a) => `<path d="${a.d}" stroke="${C.ocean}" stroke-width="3.5"/><path d="${a.d}" stroke="${C.arc}" stroke-width="1.3"/>`)
  .join("")}</g>
${cities.map((a) => `<circle cx="${a.x}" cy="${a.y}" r="5.5" fill="${C.arc}" stroke="${C.ocean}" stroke-width="1.5"/>`).join("")}
<circle cx="${hx}" cy="${hy}" r="10" fill="${C.ocean}" stroke="${C.arc}" stroke-width="4"/>
</svg>`;
writeFileSync(new URL("../public/globe/globe.svg", import.meta.url), svg);

const kb = (s) => (s.length / 1024).toFixed(0);
console.log(
  `регионов: ${regions.length} (зоны: ${[1, 2, 3].map((z) => regions.filter((r) => r.zone === z).length).join(" / ")}), ` +
    `globe.json ${kb(JSON.stringify(data))} КБ, globe.svg ${kb(svg)} КБ`,
);
const missing = [...ZONE_1, ...ZONE_2, ...ZONE_3].filter((n) => !ruRegions.some((f) => f.properties.name === n));
if (missing.length) console.warn("Нет в источнике:", missing);
console.log(`городов в кадре: ${cities.length} из ${CITIES.length}`, CITIES.filter(([n]) => !cities.some((c) => c.name === n)).map(([n]) => n));
// Проверка: мелкие регионы должны быть ≥ 20 px при показе карты шириной 790 px
const k = 790 / W; // ширина карты на 1440 px (колонки 6–12)
for (const f of ruRegions) {
  const n = f.properties.name;
  if (!["Удмуртская республика", "Чувашия", "Марий Эл", "Московская область", "Республика Мордовия"].includes(n)) continue;
  const [[x0, y0], [x1, y1]] = path.bounds(f);
  console.log(`${n}: ${Math.round((x1 - x0) * k)} × ${Math.round((y1 - y0) * k)} px`);
}
