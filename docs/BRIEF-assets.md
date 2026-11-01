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

Позже (не сейчас), тоже 3D-рендерами, не фото: объекты — 3–4 рендера готовых каркасов/зданий (чат 5), оборудование цеха — 3–4 рендера станков для «О производстве» (чат 9).

Переделать: `balka.png` (сейчас похожа на швеллер) — `2 short pieces of steel I-beam lying parallel, I-shaped cross-section with a thin vertical web and two wide flanges clearly visible on the cut ends`.

# Бриф: чат 5б — портфолио объектов и фото цеха (01.11.2026)

Один стиль на все 6 картинок, одна сессия генерации. Фон не вырезаем — это полноразмерные фото. На сайте лёгкая обесцветка до монохрома.

Общий шаблон:
```
Documentary architectural photograph of [OBJECT], [TIME]. Shot on a full-frame camera, 35 mm lens,
eye level, natural overcast daylight, muted desaturated colors close to black and white, cool steel-grey
tones, crisp detail, real construction site texture. No people facing the camera, no hard hats close-up,
no text, no logos, no signs, no watermarks. Wide horizontal composition, 16:10.
```

| Файл | Где | [OBJECT] / [TIME] |
| --- | --- | --- |
| `public/objects/iset-park.webp` | Объект 1, Екатеринбург | a large logistics warehouse 24 × 144 m under construction: exposed steel frame of columns and roof trusses, mobile crane lifting a truss / late autumn afternoon |
| `public/objects/beregovoy.webp` | Объект 2, Тюмень | a residential high-rise under construction, monolithic concrete floors with bundles of rebar on the deck, tower crane / cold morning |
| `public/objects/surgut-gsm.webp` | Объект 3, Сургут | an oil storage depot: large steel vertical tanks connected by steel walkways, service platforms, stairs and handrails / winter, light snow on the ground |
| `public/objects/magistral.webp` | Объект 4, Челябинск | a shopping center steel frame: rows of steel columns and I-beams before cladding, view from the ground between columns / clear day |
| `public/objects/perm-plant.webp` | Объект 5, Пермь | an industrial production hall: steel portal frames and crane runway beams installed, roof partly clad with sandwich panels / overcast |
| `public/workshop/hall.webp` | Полноширинная полоса между глобусом и объектами | inside a steel fabrication workshop: long hall, overhead gantry crane, welded steel beams and trusses on supports, a welder working in the far background with small sparks, light from high windows / daytime. Composition 21:9, extra wide |

Прислать: PNG/JPG от 2400 px по длинной стороне, 2 варианта на каждый.

# Бриф: чаты 6–9 — карточка товара, оборудование, страницы (01.11.2026)

Стиль — **как у рендеров каталога и конструкций** (§2): студийный 3D-рендер, вид 3/4 сверху, чистый белый фон, мягкий свет слева сверху, холодный серый металл. Фон вырезаем сами. Одна сессия генерации на группу, менять только [OBJECT]. Людей нет нигде.

Шаблон:
```
Photorealistic studio product render of [OBJECT]. Isometric 3/4 view from above, camera about 35°
elevation. Matte cold-grey steel, primed grey paint where noted, clean sharp edges, no rust.
Isolated on pure white seamless background, soft diffuse studio light from top-left, subtle soft
contact shadow. Centered, generous empty margins, landscape 4:3.
No text, no labels, no logos, no people, no readable markings.
```

Прислать: PNG от 2000 px по длинной стороне. Папки — `docs/assets-src/<папка>/`.

## А. Карточка товара — торцы крупным планом (чат 6, нужны первыми) → `ends/`
Вторая картинка в галерее карточки: сечение профиля крупно, чтобы снабженец видел форму и толщину стенки. В [OBJECT] добавить: `close-up macro view of the cut end, cross-section fills the center, shallow depth of field, landscape 4:3`.

| Файл | [OBJECT] |
| --- | --- |
| `armatura.png` | cut ends of a bundle of ribbed steel rebar rods, ribs visible on the sides |
| `truba-profilnaya.png` | cut end of a rectangular hollow steel tube, wall thickness and rounded corners clearly visible |
| `truba-kruglaya.png` | cut end of a round welded steel pipe, wall thickness and weld seam visible |
| `list.png` | edge of a stack of 3 hot-rolled steel plates, thickness of each plate clearly visible |
| `ugolok.png` | cut end of an equal-leg steel angle, L-shaped section |
| `shveller.png` | cut end of a steel channel, U-shaped section with tapered flanges |
| `balka.png` | cut end of a steel I-beam: thin vertical web and two wide flanges, I-shape unmistakable |
| `krug.png` | cut ends of a bundle of solid round steel bars, saw marks on the faces |
| `polosa.png` | cut ends of a stack of flat steel bars, rectangular sections |
| `setka.png` | corner of a welded wire mesh sheet, weld points at the crossings |

Плюс переделать плитку каталога (известная проблема): `../catalog/balka.png` — `2 short pieces of steel I-beam lying parallel, I-shaped cross-section with a thin vertical web and two wide flanges clearly visible on the cut ends`.

## Б. Оборудование цеха (чаты 7 и 9: «О производстве» и этапы на «Металлоконструкциях») → `equipment/`
| Файл | [OBJECT] |
| --- | --- |
| `saw.png` | an industrial band saw machine cutting a steel I-beam, roller conveyor on both sides |
| `plasma.png` | a CNC plasma cutting table with a steel plate, several cut-out flat steel parts lying on it |
| `drill.png` | a CNC beam drilling line with a steel H-beam passing through it |
| `welding.png` | a welding station: a steel truss node clamped in a jig on a steel welding table, welding torch resting on the table |
| `paint.png` | primed grey steel beams resting on painting supports in a row, freshly painted, spray gun on a stand |
| `crane.png` | an overhead bridge crane section with a hook lifting a bundle of steel pipes on slings |

## В. Страницы (чаты 7–9) → `pages/`
| Файл | Где | [OBJECT] |
| --- | --- | --- |
| `base.png` | «О производстве», первый экран; вход в кабинет | a miniature isometric diorama of a steel stockholding base: a long fabrication hall with grey sandwich-panel walls, an open-air steel yard with a gantry crane over stacks of beams and pipes, a flatbed truck at the gate. Clean architectural model look, landscape 16:9 |
| `frame.png` | «Металлоконструкции», первый экран | a large primed grey steel frame of a production hall, three bays, columns, roof trusses and bracing, on a concrete slab, landscape 16:9 |
| `kmd.png` | Этап «Чертёж и КМД» | a rolled-out large technical drawing sheet with steel structure drawings on a desk, a steel square and a pencil on top, lines only, no readable text |
| `pack.png` | Этап «Отгрузка» | finished welded steel structures (trusses and columns) bundled and strapped on wooden skids, ready for loading |
| `bent.png` | Страница 404 | a single steel I-beam bent and kinked in the middle |
| `empty.png` | Пустые состояния (нет позиций в КП, нет заказов) | an empty wooden pallet with two loose steel straps lying on it |

Итого 23 картинки. Порядок: сначала **А** (нужна в чате 6), **Б** и **В** — к чату 7.
