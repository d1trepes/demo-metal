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

const SIZE = 1000; // viewBox 0 0 1000 1000
const R = 488;
const VIEW = { lon: 68, lat: 56 }; // Евразия: от Минска до Красноярска, Ташкент внизу
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
/** Короткие имена для подсказки. */
const SHORT = {
  "Ханты-Мансийский автономный округ - Югра": "ХМАО — Югра",
  "Ямало-Ненецкий автономный округ": "ЯНАО",
  "Удмуртская республика": "Удмуртия",
};

/** Города с дугами от склада. */
const CITIES = [
  ["Уфа", 55.97, 54.74],
  ["Сургут", 73.4, 61.25], ["Казань", 49.12, 55.79], ["Омск", 73.37, 54.99], ["Новосибирск", 82.92, 55.03],
  ["Новый Уренгой", 76.68, 66.08], ["Астана", 71.43, 51.17], ["Москва", 37.62, 55.76],
  ["Санкт-Петербург", 30.31, 59.94], ["Минск", 27.56, 53.9], ["Ташкент", 69.24, 41.3], ["Красноярск", 92.85, 56.01],
];

const zoneOf = (name) => (ZONE_1.includes(name) ? 1 : ZONE_2.includes(name) ? 2 : ZONE_3.includes(name) ? 3 : 0);

const projection = geoOrthographic()
  .rotate([-VIEW.lon, -VIEW.lat])
  .scale(R)
  .translate([SIZE / 2, SIZE / 2])
  .clipAngle(90)
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
  if (d) regions.push({ id: `c${id}`, name: CIS[id][1], zone: CIS[id][0], d });
}

// ---------- Регионы РФ ----------
const ruTopo = JSON.parse(readFileSync(new URL("../docs/assets-src/geo/russia-regions.topo.json", import.meta.url)));
const ruRegions = feature(ruTopo, ruTopo.objects.regions).features.map(rewind);
ruRegions.forEach((f, i) => {
  const d = path(f);
  if (!d) return;
  const name = f.properties.name;
  regions.push({ id: `r${i}`, name: SHORT[name] ?? name, zone: zoneOf(name), d });
});
// Сначала незакрашенные, потом зоны 3 → 1: тёмные границы ближних зон поверх
regions.sort((a, b) => (a.zone || 9) - (b.zone || 9)).reverse();

// ---------- Дуги и города ----------
const lift = (h, [x, y]) => [SIZE / 2 + (x - SIZE / 2) * h, SIZE / 2 + (y - SIZE / 2) * h];
const home = [WAREHOUSE.lon, WAREHOUSE.lat];
const round = (n) => Math.round(n * 10) / 10;
const arcs = CITIES.map(([name, lon, lat]) => {
  const to = [lon, lat];
  const interp = geoInterpolate(home, to);
  const steps = 32;
  const pts = [];
  const span = Math.hypot(lon - home[0], lat - home[1]);
  const h0 = 0.02 + span * 0.0016; // чем дальше город, тем выше дуга
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = projection(interp(t));
    pts.push(lift(1 + h0 * Math.sin(Math.PI * t), p).map(round));
  }
  const [x, y] = projection(to).map(round);
  return { name, x, y, d: `M${pts.map((p) => p.join(",")).join("L")}` };
});
const [hx, hy] = projection(home).map(round);

const sphere = path({ type: "Sphere" });
const graticule = path(geoGraticule10());

const data = { size: SIZE, sphere, graticule, land, regions, arcs, warehouse: { name: WAREHOUSE.name, x: hx, y: hy } };

mkdirSync(new URL("../public/globe/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/globe/globe.json", import.meta.url), JSON.stringify(data));

// ---------- Статичный SVG того же вида (для заглушки). Цвета = токены из styles/tokens.css ----------
const C = {
  ocean: "#ffffff", grid: "#e7e9ec", edge: "#d5d8dc", land: "#e7e9ec", z0: "#d5d8dc",
  z1: "#0e1013", z2: "#5b6169", z3: "#a3a9b1", border: "#ffffff", arc: "#0e1013",
};
const fill = (z) => [C.z0, C.z1, C.z2, C.z3][z];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
<path d="${sphere}" fill="${C.ocean}" stroke="${C.edge}" stroke-width="1.5"/>
<path d="${graticule}" fill="none" stroke="${C.grid}" stroke-width="1"/>
<path d="${land}" fill="${C.land}" stroke="${C.border}" stroke-width="0.6"/>
${regions.map((r) => `<path d="${r.d}" fill="${fill(r.zone)}" stroke="${C.border}" stroke-width="0.6"/>`).join("\n")}
<g fill="none" stroke-linecap="round">${arcs
  .map((a) => `<path d="${a.d}" stroke="${C.ocean}" stroke-width="3.5"/><path d="${a.d}" stroke="${C.arc}" stroke-width="1.3"/>`)
  .join("")}</g>
${arcs.map((a) => `<circle cx="${a.x}" cy="${a.y}" r="4" fill="${C.arc}" stroke="${C.ocean}" stroke-width="1.5"/>`).join("")}
<circle cx="${hx}" cy="${hy}" r="8" fill="${C.ocean}" stroke="${C.arc}" stroke-width="3.5"/>
</svg>`;
writeFileSync(new URL("../public/globe/globe.svg", import.meta.url), svg);

const kb = (s) => (s.length / 1024).toFixed(0);
console.log(
  `регионов: ${regions.length} (зоны: ${[1, 2, 3].map((z) => regions.filter((r) => r.zone === z).length).join(" / ")}), ` +
    `globe.json ${kb(JSON.stringify(data))} КБ, globe.svg ${kb(svg)} КБ`,
);
const missing = [...ZONE_1, ...ZONE_2, ...ZONE_3].filter((n) => !ruRegions.some((f) => f.properties.name === n));
if (missing.length) console.warn("Нет в источнике:", missing);
