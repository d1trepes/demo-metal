/**
 * Данные карты отгрузок «Горизонт» (чат 5д). Шар крутится в браузере, поэтому отдаём не готовые пути,
 * а упрощённую топологию (lon/lat) — проекцию считает GlobeMap.tsx (d3-geo, orthographic).
 *
 * Запуск: node scripts/build-globe.mjs
 *   → public/globe/geo.json   — топология (суша, регионы РФ, страны СНГ) + список регионов для панели
 *   → public/globe/globe.svg  — вид по умолчанию без интерактива; из него scripts/render-globe-static.py делает заглушку WebP
 *
 * Источники (devDependencies): world-atlas (суша и страны 110m), d3-geo, topojson-*,
 * docs/assets-src/geo/russia-regions.topo.json (регионы РФ, scripts/prepare-regions.mjs).
 * Подписи зон — components/home/globeData.ts. Ракурс по умолчанию — там же (GLOBE_VIEW), здесь он повторён для заглушки.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { feature, quantize } from "topojson-client";
import { topology } from "topojson-server";
import { presimplify, simplify, quantile } from "topojson-simplify";
import { geoArea, geoCentroid, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";

/** Регионы РФ по зонам: [имя в источнике, областной центр]. 8 + 18 + 12 = 38 регионов. */
const ZONE_1 = [
  ["Свердловская область", "Екатеринбург"], ["Челябинская область", "Челябинск"], ["Тюменская область", "Тюмень"],
  ["Курганская область", "Курган"], ["Пермский край", "Пермь"], ["Башкортостан", "Уфа"],
  ["Ханты-Мансийский автономный округ - Югра", "Ханты-Мансийск, Сургут"], ["Удмуртская республика", "Ижевск"],
];
const ZONE_2 = [
  ["Ямало-Ненецкий автономный округ", "Салехард, Новый Уренгой"], ["Оренбургская область", "Оренбург"],
  ["Татарстан", "Казань, Набережные Челны"], ["Омская область", "Омск"], ["Новосибирская область", "Новосибирск"],
  ["Томская область", "Томск"], ["Кемеровская область", "Кемерово, Новокузнецк"], ["Алтайский край", "Барнаул"],
  ["Самарская область", "Самара, Тольятти"], ["Кировская область", "Киров"], ["Республика Коми", "Сыктывкар"],
  ["Ульяновская область", "Ульяновск"], ["Чувашия", "Чебоксары"], ["Марий Эл", "Йошкар-Ола"],
  ["Нижегородская область", "Нижний Новгород"], ["Пензенская область", "Пенза"], ["Саратовская область", "Саратов"],
  ["Республика Мордовия", "Саранск"],
];
const ZONE_3 = [
  ["Москва", "Москва"], ["Московская область", "Москва"], ["Санкт-Петербург", "Санкт-Петербург"],
  ["Ленинградская область", "Санкт-Петербург"], ["Красноярский край", "Красноярск, Норильск"],
  ["Иркутская область", "Иркутск, Братск"], ["Волгоградская область", "Волгоград"],
  ["Ростовская область", "Ростов-на-Дону"], ["Воронежская область", "Воронеж"], ["Ярославская область", "Ярославль"],
  ["Владимирская область", "Владимир"], ["Тверская область", "Тверь"],
];
/** Страны СНГ (ISO 3166 numeric → зона, название, города для поиска). */
const CIS = {
  398: [2, "Казахстан", "Астана, Алматы, Караганда"],
  112: [3, "Беларусь", "Минск"],
  860: [3, "Узбекистан", "Ташкент"],
  417: [3, "Киргизия", "Бишкек"],
};
/** Короткие имена. Москва и СПб — одна цель с областью (город слишком мелкий для пальца). */
const SHORT = {
  "Ханты-Мансийский автономный округ - Югра": "ХМАО — Югра",
  "Ямало-Ненецкий автономный округ": "ЯНАО",
  "Ненецкий автономный округ": "НАО",
  "Чукотский автономный округ": "Чукотка",
  "Удмуртская республика": "Удмуртия",
  "Москва": "Москва и область",
  "Московская область": "Москва и область",
  "Санкт-Петербург": "Санкт-Петербург и область",
  "Ленинградская область": "Санкт-Петербург и область",
};
const WAREHOUSE = [60.6, 56.84];
/** Точки и дуги: [город, долгота, широта, дуга?]. Дуги — только к дальним опорным городам. */
const CITIES = [
  ["Челябинск", 61.4, 55.16], ["Тюмень", 65.53, 57.15], ["Курган", 65.34, 55.44], ["Пермь", 56.25, 58.01],
  ["Уфа", 55.97, 54.74], ["Ханты-Мансийск", 69.02, 61.0], ["Ижевск", 53.2, 56.85],
  ["Салехард", 66.6, 66.53, 1], ["Оренбург", 55.1, 51.77], ["Казань", 49.12, 55.79], ["Омск", 73.37, 54.99],
  ["Новосибирск", 82.92, 55.03, 1], ["Томск", 84.95, 56.48], ["Кемерово", 86.09, 55.35], ["Барнаул", 83.78, 53.35],
  ["Самара", 50.1, 53.2], ["Киров", 49.67, 58.6], ["Сыктывкар", 50.84, 61.67], ["Ульяновск", 48.4, 54.32],
  ["Чебоксары", 47.25, 56.13], ["Йошкар-Ола", 47.89, 56.63], ["Нижний Новгород", 44.0, 56.33],
  ["Пенза", 45.0, 53.2], ["Саратов", 46.03, 51.53], ["Саранск", 45.18, 54.19],
  ["Москва", 37.62, 55.76, 1], ["Санкт-Петербург", 30.31, 59.94, 1], ["Красноярск", 92.85, 56.01, 1],
  ["Иркутск", 104.3, 52.29], ["Волгоград", 44.5, 48.71], ["Ростов-на-Дону", 39.7, 47.23, 1],
  ["Воронеж", 39.2, 51.66], ["Ярославль", 39.87, 57.63], ["Владимир", 40.4, 56.13], ["Тверь", 35.9, 56.86],
  ["Астана", 71.43, 51.17, 1], ["Алматы", 76.9, 43.24], ["Минск", 27.56, 53.9, 1], ["Ташкент", 69.24, 41.3, 1],
  ["Бишкек", 74.6, 42.87],
];
const DEFAULT_REGION = "Свердловская область";

const ZONES = new Map([...ZONE_1.map((r) => [r[0], [1, r[1]]]), ...ZONE_2.map((r) => [r[0], [2, r[1]]]), ...ZONE_3.map((r) => [r[0], [3, r[1]]])]);

/** d3 ждёт внешние кольца по часовой; «вывернутый» полигон (площадь > полушария) разворачиваем. */
function rewind(f) {
  if (geoArea(f) <= 2 * Math.PI) return f;
  const g = f.geometry;
  const rev = (poly) => poly.map((ring) => ring.slice().reverse());
  const geometry =
    g.type === "Polygon" ? { ...g, coordinates: rev(g.coordinates) } : { ...g, coordinates: g.coordinates.map(rev) };
  return { ...f, geometry };
}

// ---------- Исходные контуры ----------
const read = (file) => JSON.parse(readFileSync(new URL(`../node_modules/world-atlas/${file}`, import.meta.url)));
const landTopo = read("land-110m.json");
const land = feature(landTopo, landTopo.objects.land);
const worldTopo = read("countries-110m.json");
const ruTopo = JSON.parse(readFileSync(new URL("../docs/assets-src/geo/russia-regions.topo.json", import.meta.url)));

/** Регион = контур + имя + зона; id — для связи с панелью. */
const features = [];
feature(ruTopo, ruTopo.objects.regions).features.map(rewind).forEach((f) => {
  const src = f.properties.name;
  const [zone, cities] = ZONES.get(src) ?? [0, ""];
  features.push({ type: "Feature", geometry: f.geometry, properties: { name: SHORT[src] ?? src, zone, cities } });
});
for (const c of feature(worldTopo, worldTopo.objects.countries).features) {
  const meta = CIS[String(Number(c.id))];
  if (meta) features.push({ type: "Feature", geometry: c.geometry, properties: { name: meta[1], zone: meta[0], cities: meta[2] } });
}

// ---------- Топология: упрощаем и квантуем (~60–80 КБ) ----------
let topo = topology({ land, regions: { type: "FeatureCollection", features } }, 1e4);
topo = presimplify(topo);
topo = quantize(simplify(topo, quantile(topo, 0.6)), 1e4);

/** Список для панели: одна строка на имя (Москва + область — одна), точка для «подлёта» — центр самого крупного контура. */
const byName = new Map();
for (const f of features) {
  const area = geoArea(f);
  const prev = byName.get(f.properties.name);
  if (prev && prev.area >= area) continue;
  const [lon, lat] = geoCentroid(f);
  byName.set(f.properties.name, { ...f.properties, lon: +lon.toFixed(2), lat: +lat.toFixed(2), area });
}
const regions = [...byName.values()].map(({ area, ...r }) => r).sort((a, b) => a.name.localeCompare(b.name, "ru"));

const data = {
  topo,
  regions,
  cities: CITIES.map(([name, lon, lat, arc]) => (arc ? { name, lon, lat, arc: true } : { name, lon, lat })),
  warehouse: { name: "Екатеринбург", lon: WAREHOUSE[0], lat: WAREHOUSE[1] },
  defaultRegion: DEFAULT_REGION,
};
mkdirSync(new URL("../public/globe/", import.meta.url), { recursive: true });
const json = JSON.stringify(data);
writeFileSync(new URL("../public/globe/geo.json", import.meta.url), json);

// ---------- Заглушка: тот же ракурс, что GLOBE_VIEW в globeData.ts ----------
const V = { w: 1300, h: 700, r: 1700, top: 30 };
{
  // = viewFor() из globeData.ts: склад встаёт в (0,64 W; 480) — вид на широком экране
  const RAD = Math.PI / 180, phi = WAREHOUSE[1] * RAD;
  const dL = Math.asin((0.64 * V.w - V.w / 2) / (V.r * Math.cos(phi)));
  const A = Math.sin(phi), B = Math.cos(phi) * Math.cos(dL), c = (V.top + V.r - 480) / V.r;
  V.lon = WAREHOUSE[0] - dL / RAD;
  V.lat = Math.min(30, Math.max(-10, (Math.acos(c / Math.hypot(A, B)) - Math.atan2(B, A)) / RAD));
}
const projection = geoOrthographic()
  .rotate([-V.lon, -V.lat])
  .scale(V.r)
  .translate([V.w / 2, V.top + V.r])
  .clipAngle(90)
  .clipExtent([[0, 0], [V.w, V.h]])
  .precision(0.3);
const path = geoPath(projection).digits(1);
const simple = feature(topo, topo.objects.regions).features;
const C = { ocean: "#ffffff", grid: "#f2f3f5", land: "#f2f3f5", border: "#ffffff", arc: "#0e1013" };
const fill = (z) => ["#e7e9ec", "#0e1013", "#5b6169", "#a3a9b1"][z];
const cx = V.w / 2, cy = V.top + V.r;
const arcPath = ([lon, lat]) => {
  const interp = geoInterpolate(WAREHOUSE, [lon, lat]);
  const h0 = 0.006 + Math.hypot(lon - WAREHOUSE[0], lat - WAREHOUSE[1]) * 0.0004;
  const pts = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const p = projection(interp(t));
    const k = 1 + h0 * Math.sin(Math.PI * t);
    pts.push([cx + (p[0] - cx) * k, cy + (p[1] - cy) * k].map((n) => n.toFixed(1)).join(","));
  }
  return `M${pts.join("L")}`;
};
const home = projection(WAREHOUSE);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${V.w} ${V.h}">
<path d="${path({ type: "Sphere" })}" fill="${C.ocean}" stroke="#d5d8dc"/>
<path d="${path(geoGraticule10())}" fill="none" stroke="${C.grid}"/>
<path d="${path(feature(topo, topo.objects.land))}" fill="${C.land}"/>
${simple.map((f) => `<path d="${path(f)}" fill="${fill(f.properties.zone)}" stroke="${C.border}" stroke-width="0.6"/>`).join("\n")}
<g fill="none" stroke-linecap="round">${CITIES.filter((c) => c[3])
  .map((c) => { const d = arcPath([c[1], c[2]]); return `<path d="${d}" stroke="${C.ocean}" stroke-width="3.5"/><path d="${d}" stroke="${C.arc}" stroke-width="1.3"/>`; })
  .join("")}</g>
${CITIES.map(([, lon, lat]) => projection([lon, lat])).filter((p) => p && p[0] > 0 && p[0] < V.w && p[1] > 0 && p[1] < V.h)
  .map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${C.arc}" stroke="${C.ocean}" stroke-width="1.5"/>`).join("")}
<circle cx="${home[0].toFixed(1)}" cy="${home[1].toFixed(1)}" r="9" fill="${C.ocean}" stroke="${C.arc}" stroke-width="3.5"/>
</svg>`;
writeFileSync(new URL("../public/globe/globe.svg", import.meta.url), svg);

console.log(
  `регионов в списке: ${regions.length} (зоны: ${[0, 1, 2, 3].map((z) => regions.filter((r) => r.zone === z).length).join(" / ")}), ` +
    `geo.json ${(json.length / 1024).toFixed(0)} КБ, globe.svg ${(svg.length / 1024).toFixed(0)} КБ`,
);
const missing = [...ZONES.keys()].filter((n) => !features.some((f) => f.properties.name === (SHORT[n] ?? n)));
if (missing.length) console.warn("Нет в источнике:", missing);
for (const n of ["Чувашия", "Марий Эл", "Республика Мордовия", "Удмуртия"]) {
  const f = simple.find((x) => x.properties.name === n);
  const [[x0, y0], [x1, y1]] = path.bounds(f);
  console.log(`${n}: ${Math.round((x1 - x0) * 1.01)} × ${Math.round((y1 - y0) * 1.01)} px при карте 1312 px`);
}
