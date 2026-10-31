# Бриф: логотип и рендеры металла (чат 2б)

Генерирует дизайнер, присылает в чат. Мы вырезаем фон, логотип переводим в SVG и подставляем.

## 1. Логотип «Пролёт»

Идея: «пролёт» — расстояние между колоннами цеха или опорами моста. Знак — портальная рама (ригель над двумя колоннами), монохром, без металла и объёма. Белый на чёрном.

Нейросети часто ломают кириллицу, поэтому **знак генерируем без текста**, надпись ПРОЛЁТ набираем/рисуем сами. Если надпись выйдет ровной — возьмём и её.

Промпт знака (основной):
```
Minimal flat vector logo symbol for a steel stockholder and steel structures fabrication company.
Concept: a structural span — a portal frame: one heavy horizontal beam resting on two columns,
like a factory bay or bridge span, built from I-beam proportions. Bold geometric shapes, straight
cuts, 90° and 45° angles only, strong negative space, works at 24 px. Pure white symbol on solid
black background, centered, large padding. Flat, no gradients, no shadows, no 3D, no metal texture,
no text, no letters.
```

Варианты (если основной не зайдёт):
- B: `... monogram letter "П" (Cyrillic Pe) built from the cross-section of an I-beam ...` — остальное то же.
- C: `... square emblem with the portal frame cut out as negative space ...` — как временный знак на сайте.

Надпись (если хочется попробовать): `wordmark "ПРОЛЁТ" in Cyrillic, custom bold condensed geometric uppercase letters, squared corners, the two dots of Ё are small squares like rivets, white on black, flat vector, no other text`.

Прислать: PNG от 1024 px, 3–4 варианта.

## 2. Рендеры металла для плитки каталога (10 шт.)

Один стиль на все 10 — генерировать в одной сессии, одним промптом, менять только объект. Белый фон (фон вырежем, на сайте подложка `#F2F3F5`).

Шаблон:
```
Photorealistic studio product render of [OBJECT]. Isometric 3/4 view from above, camera about 35°
elevation, objects lying diagonally from bottom-left to top-right, cut ends facing the viewer so the
cross-section profile is clearly readable. Matte cold-grey hot-rolled steel with light mill scale,
clean sharp edges, no rust. Isolated on pure white seamless background, soft diffuse studio light
from top-left, subtle soft contact shadow. Centered, generous empty margins, landscape 4:3.
No text, no labels, no logos, no people, no tools.
```

| Файл | [OBJECT] |
| --- | --- |
| `armatura.png` | a neat bundle of 5 short ribbed steel rebar rods (A500C), visible spiral ribs |
| `truba-profilnaya.png` | 3 short pieces of square and rectangular hollow steel tube stacked |
| `truba-kruglaya.png` | 3 short pieces of round welded steel pipe of different diameters stacked |
| `list.png` | a stack of 3 thick hot-rolled steel plates, slightly offset, thickness visible |
| `ugolok.png` | 3 short pieces of equal-leg steel angle (L-profile) stacked |
| `shveller.png` | 2 short pieces of steel channel (U-profile, C-channel) stacked |
| `balka.png` | 2 short pieces of steel I-beam (H-beam), I-shaped cross-section clearly visible |
| `krug.png` | a bundle of 5 short solid round steel bars |
| `polosa.png` | a stack of 4 flat hot-rolled steel bars (flat strip) |
| `setka.png` | one square sheet of welded steel wire mesh, 100×100 mm cells, lying flat, slightly tilted |

Прислать: PNG от 2000 px по длинной стороне, все 10 сразу. Если на какой-то картинке профиль читается плохо (не видно сечения) — лучше перегенерировать: в плитке это главный смысл.

---

# Бриф: чат 4 — плитка «Нет позиции», фура, металлоконструкции (01.11.2026)

Тот же стиль, что у рендеров металла: шаблон промпта из §2, менять только [OBJECT]. Белый фон — вырежем сами. Прислать PNG от 2000 px, все сразу, в `docs/assets-src/<папка>/`.

| № | Файл → папка | Где стоит | [OBJECT] |
| --- | --- | --- | --- |
| 1 | `spec.png` → `cta/` | Тёмная плитка «Нет нужной позиции?», справа вместо сечения | a neat stack of 3 printed A4 technical specification sheets with tables and a small steel profile drawing, top sheet slightly rotated, a steel tape measure lying on top, paper white, no readable text |
| 2 | `truck.png` → `truck/` | Фура-разделитель между каталогом и металлоконструкциями (реф. 04) | a white European semi-truck with a flatbed trailer loaded with bundles of steel rebar, stacked steel plates and steel pipes secured with straps, side 3/4 view from front-left, whole truck in frame, plain white cab without logos |
| 3 | `fermy.png` → `constructions/` | Панель 01 «Фермы» | a 6-meter welded steel roof truss made of square hollow sections, lying on two wooden blocks, primed grey |
| 4 | `karkas.png` → `constructions/` | Панель 02 «Каркасы зданий» | a steel frame of a small single-storey warehouse: I-beam columns, roof beams and bracing, no cladding, on a concrete slab |
| 5 | `lestnica.png` → `constructions/` | Панель 03 «Лестницы и площадки» | a straight steel stair with checker-plate treads and a landing platform with handrails, primed grey |
| 6 | `ograzhdenie.png` → `constructions/` | Панель 04 «Ограждения» | a 3-meter section of steel handrail fence with posts, top rail and vertical balusters, standing on a small base |
| 7 | `zakladnye.png` → `constructions/` | Панель 05 «Закладные» | 4 steel embedded plates with welded anchor rebar legs, laid out in a neat row |

Фура: если в одной генерации не выходит целиком — можно только прицеп с грузом и кабину отдельно, склеим.
Каркасный «рентген» для неактивных панелей (реф. 05) не генерируем: делаем кодом (рендер в светлой тонировке + линии) — экономим 5 картинок.

Позже (не сейчас): объекты — 3–4 фото готовых зданий/каркасов (чат 5), цех и оборудование — 3–4 фото для «О производстве» (чат 9).
