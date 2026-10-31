/**
 * Готовит данные глобуса (чат 5): точки суши на равномерной сетке + отметка «страна отгрузки».
 * Запуск: node scripts/build-globe.mjs  →  public/globe/land.bin
 *
 * Формат land.bin: Int16Array, тройки [широта×100, долгота×100, флаг], флаг 1 — страна отгрузки.
 * Браузер не тянет ни карту, ни d3: только этот файл (~60 КБ) и свою проекцию (GlobeCanvas.tsx).
 * Пакеты world-atlas, topojson-client, d3-geo нужны только этому скрипту (devDependencies).
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";

const topo = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/countries-110m.json", import.meta.url)));
const countries = feature(topo, topo.objects.countries).features;

/** Куда отгружаем: Россия + СНГ (ISO 3166 numeric). Тот же список — в components/home/globeData.ts. */
const SHIP = new Set(["643", "398", "112", "417", "860"]); // Россия, Казахстан, Беларусь, Киргизия, Узбекистан

const STEP = 1.25; // шаг сетки по широте, градусы
const out = [];
for (let lat = -58; lat <= 82; lat += STEP) {
  // На параллели шаг по долготе растёт к полюсам — точки ложатся равномерно по шару.
  const lonStep = STEP / Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
  for (let lon = -180; lon < 180; lon += lonStep) {
    const hit = countries.find((c) => geoContains(c, [lon, lat]));
    if (!hit) continue;
    out.push(Math.round(lat * 100), Math.round(lon * 100), SHIP.has(String(hit.id)) ? 1 : 0);
  }
}

mkdirSync(new URL("../public/globe/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/globe/land.bin", import.meta.url), Buffer.from(new Int16Array(out).buffer));
console.log(`точек: ${out.length / 3}, отгрузка: ${out.filter((v, i) => i % 3 === 2 && v).length}`);
