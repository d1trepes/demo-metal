/**
 * Один раз: упрощает контуры регионов РФ для глобуса (чат 5б).
 * Источник: click_that_hood / russia.geojson (CartoDB, 83 субъекта, CC BY) — 3,5 МБ, в репозиторий не кладём.
 * Запуск: node scripts/prepare-regions.mjs <путь к russia.geojson>
 *   → docs/assets-src/geo/russia-regions.topo.json (упрощённая TopoJSON, её читает scripts/build-globe.mjs)
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { topology } from "topojson-server";
import { presimplify, simplify, quantile } from "topojson-simplify";

const src = JSON.parse(readFileSync(process.argv[2], "utf8"));
src.features = src.features.map((f) => ({
  type: "Feature",
  properties: { name: f.properties.name },
  geometry: f.geometry,
}));

let topo = topology({ regions: src }, 1e5);
topo = presimplify(topo);
topo = simplify(topo, quantile(topo, 0.04)); // оставляем ~4 % самых значимых точек: на шаре 600 px этого хватает

mkdirSync(new URL("../docs/assets-src/geo/", import.meta.url), { recursive: true });
const out = new URL("../docs/assets-src/geo/russia-regions.topo.json", import.meta.url);
writeFileSync(out, JSON.stringify(topo));
console.log(`регионов: ${src.features.length}, файл: ${(JSON.stringify(topo).length / 1024).toFixed(0)} КБ`);
