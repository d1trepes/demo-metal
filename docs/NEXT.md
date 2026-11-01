# Следующий чат — 6: тестовые данные + `lib/api.ts` + сторы

Если по карте отгрузок (5д) есть правки — сначала они: `components/home/ShippingMap.tsx`, `ShippingPanel.tsx`, `GlobeMap.tsx`, `GeoSection.module.css`, `scripts/build-globe.mjs` (после правок зон: `node scripts/build-globe.mjs && python3 scripts/render-globe-static.py`).

Дальше — по паспорту, пункт 6: `data/*.json` (товары 50–70, категории, заказы, документы, пользователь), `lib/api.ts` с задержкой 600 мс, сторы Zustand (список КП, избранное, вход) с localStorage в try/catch, `docs/HANDOFF.md`.
