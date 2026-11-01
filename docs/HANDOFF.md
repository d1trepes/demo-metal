# Передача программисту

Все обращения к «серверу» — только в `lib/api.ts`. Сейчас внутри заглушки: JSON из `data/`; чтение — без задержки, действия (отправка, вход, загрузка) — пауза 450 мс. Замените тела функций на реальные запросы, сигнатуры и типы (`lib/types.ts`) оставьте.

Сайт собирается статично (`output: 'export'`). Функции, вызываемые в серверных компонентах (например, `getCategories` в шапке/подвале и на главной), выполняются **при сборке**. Если данные должны обновляться без пересборки — перенесите вызов в клиентский компонент или включите пересборку по расписанию.

## Функции

### `getCategories(): Promise<Category[]>`
Категории каталога в порядке показа. Используется: главная (плитка), подвал.
Поля `Category`: `slug`, `name`, `caption`, `gost`, `sizes` (текстом), `priceFrom` (₽ с НДС за `unit`), `unit` (`"т"` | `"м²"`), `profile` (форма сечения для иллюстрации).

### `sendQuoteRequest(request: QuoteRequest): Promise<QuoteRequestResult>`
Заявка на расчёт с главной (форма «Посчитаем вашу заявку», якорь `#calc`) и с `/contacts/` (блок «Написать нам», та же форма `QuoteForm`). Вызывается в браузере.
Вход `QuoteRequest`: `name`, `phone` (как ввёл человек, ≥ 10 цифр), `email?`, `company?` (компания или ИНН строкой), `city?` (город доставки), `deadline?` (когда нужно, свободным текстом: «к 15.11», «срочно»), `message` (позиции свободным текстом; может быть пустым, если приложен файл), `file?` (`File`: PDF, Excel, Word, DWG/DXF, JPG/PNG, до 20 МБ — проверяется в форме).
Выход `QuoteRequestResult`: `id` — номер заявки для клиента (`Р-ДДММ-NNNN`), `callbackBy` — ISO-время, до которого перезвонит менеджер (заглушка: +2 ч в рабочее время Пн–Пт 8–18, иначе 10:00 ближайшего рабочего дня).
Бэкенд: отправить менеджеру (Telegram/почта) с файлом, записать заявку в админку. Отправлять `multipart/form-data`. При ошибке — бросить исключение (форма сейчас ошибку не показывает — добавить сообщение «Не отправилось, позвоните …» при подключении).

> Пауза у действий — только в браузере (`typeof window`); чтение и сборка отвечают сразу. Реальный бэкенд медленнее локального JSON — для чтения кабинета держите ответы быстрыми или кэшируйте (страницы показывают скелетон, пока ждут).
> Типы — `lib/types.ts`. Формулы массы и цены — `lib/calc.ts` (бэкенду считать так же, чтобы КП совпадало с калькулятором).

### Каталог (чат 6)

#### `getCategory(slug): Promise<Category | null>`
Категория по slug. Страница `/catalog/<slug>/` (при сборке).

#### `getProducts(filter?: ProductFilter): Promise<Product[]>`
Позиции каталога. `filter`: `category`, `q` (поиск по названию, ГОСТу, марке, размеру, коду; «40х40» = «40×40»), `steelGrades[]`, `gosts[]`, `inStockOnly`, `sort` (`default` — порядок склада по размеру, `price-asc`, `price-desc`, `name`). Логика фильтра — `lib/catalog.ts`.
Сейчас каталог (`/catalog/`, `/catalog/<slug>/`) загружает **все** позиции при сборке и фильтрует в браузере — мгновенно и без сервера. Для каталога больше ~2 000 позиций: в `components/catalog/CatalogView.tsx` вызывать `getProducts(filter)` при смене фильтра, а фасеты (марки, ГОСТы с количеством) отдавать с бэкенда.
Поля `Product`: `id` (код позиции, «P-0204»), `slug`, `category`, `name`, `gost`, `steelGrade`, `size` (`label` для показа + числа в мм: `d`, `a`, `b`, `t`, `h`, `w`, `l`, `cell`, `no`), `weightPerMeter` (кг на 1 м или на 1 м² — по `unit`), `pricePerTon` (₽/т с НДС), `unit` (`"м"` — длинномер, `"м²"` — лист и сетка), `length` (длины хлыстов или формат текстом: «6 / 11,7 м», «1,5×6 м», «карта 2×6 м», «бухта»; калькулятор берёт из строки числа), `inStock`, `image` (рендер, `public/catalog/`), `imageEnd` (торец крупно, `public/ends/`).
Тестовые данные — `data/products.json` (70 позиций), генерирует `python3 scripts/gen-products.py` (он же пересчитывает `priceFrom` в `data/categories.json`).

#### `getProduct(slug): Promise<Product | null>`
Карточка `/product/<slug>/` (при сборке, `generateStaticParams` по `getProducts()`). При живых ценах — либо пересборка по расписанию, либо догружать цену и наличие в браузере.

#### `getProductsByIds(ids): Promise<Product[]>`
Позиции по `id` в том же порядке; неизвестные пропускаются. Для списка КП, избранного, заказов (чаты 7–8).

#### `getSimilarProducts(product, limit = 4): Promise<Product[]>`
Похожие в карточке: та же категория, ближайшие по массе 1 м.

#### `getSearchSuggestions(query, limit = 6): Promise<SearchSuggestions>`
Подсказки в поиске шапки (`components/layout/HeaderSearch.tsx`). Вызывается с 2 символов, с паузой 150 мс после ввода; устаревшие ответы интерфейс отбрасывает сам.
Возвращает `{ categories: [{ slug, name, count }] (до 3, count — подходящих позиций в категории), products: Product[] (до limit, сначала в наличии), total }`.
Сравнение без учёта регистра, ё/е и ×/x/х; запрос «арма» находит категорию «Арматура» и её позиции. В бою — полнотекстовый поиск (Postgres FTS, Meilisearch и т. п.), ответ до 200 мс.

### Список для КП

#### `lookupCompanyByInn(inn): Promise<CompanyLookup | null>`
Автоподстановка реквизитов по ИНН (10 или 12 цифр) → `{ inn, name, kpp, address }`, `null` — не найдено. Заглушка отвечает тестовой компанией. В бою — DaData «Организация по ИНН» (ключ держать на сервере, не в браузере).

#### `sendKpRequest(request: KpRequest): Promise<KpRequestResult>`
Запрос КП со страницы `/kp/`. Вход: `items[]` (`productId`, `quantity` — штук/листов/карт, `length` — длина штуки в м для длинномера, `comment?`), `company` (`inn`, `name`, `kpp?`, `address?`), `contact` (`name`, `phone`, `email`), `delivery?`, `comment?`. Выход: `id` («КП-ДДММ-NNNN»), `status: "sent"`, `createdAt`. Бэкенд: в админку + уведомление менеджеру.
Демо: заглушка запоминает отправленный запрос в localStorage (`prolet-sent-kp`, до 10 шт.), `getKpRequests` показывает его первым — в бою эти две функции (`readSentKp`, `rememberSentKp`) удалить.
Статусы КП: `sent` → `in-work` → `kp-ready` → `invoiced`.
Сам список хранится в браузере: `lib/stores/kp.ts` (Zustand + localStorage, ключ `prolet-kp`). После входа можно синхронизировать с сервером — добавить функцию в api.

### Формы

#### `uploadDrawing(request: DrawingRequest): Promise<QuoteRequestResult>`
«Расчёт по чертежу» на `/constructions/`: `name`, `phone`, `email?`, `company?`, `description`, `file` (обязателен). Номер «Ч-ДДММ-NNNN». Отправлять `multipart/form-data`, файл — менеджеру и в админку. На сайте лимит файла 50 МБ (форма проверяет до отправки) — сервер должен принимать столько же или больше.

### Вход и кабинет (вёрстка — чат 9)

#### `login(email, password): Promise<User>` · `loginDemo(): Promise<User>` · `logout(): Promise<void>`
Заглушка пускает с любым паролем; ошибка — исключение с текстом для формы. Пользователь кэшируется в `lib/stores/auth.ts` (ключ `prolet-auth`). В бою: сессия в httpOnly-cookie, `login` возвращает профиль, `logout` гасит сессию; `loginDemo` убрать.
`User`: `id`, `name`, `email`, `phone`, `company` (`CompanyLookup`), `deliveryAddresses[]`.

#### `register(request: RegisterRequest): Promise<User>`
Регистрация с `/login/?mode=register`: `inn`, `name`, `phone`, `email`, `password`. Заглушка находит компанию по ИНН (`lookupCompanyByInn`) и сразу пускает в кабинет. В бою: создать учётку, письмо подтверждения, менеджеру — «новый клиент, проверить ИНН, подключить цены по договору». Ошибка — исключение с текстом для формы.

#### `getKpRequests(): Promise<KpRequestSummary[]>`
Запросы КП пользователя: поля `KpRequestResult` + `itemsCount`, `totalWeightKg`, `totalRub?` (есть, когда КП готово), `items?` (для «Повторить»). `data/kp-requests.json`. Кабинет: без входа `/account/*` редиректит на `/login/?next=…` (`components/account/AccountShell.tsx`).

#### `getOrders(): Promise<Order[]>` · `getOrder(id): Promise<Order | null>`
Заказы, новые сверху. `status`: `paid` → `production` → `ready` → `shipped`; `timeline` — даты пройденных этапов (ISO); `items` как в КП; `totalRub`, `totalWeightKg`, `delivery`. «Повторить заказ» = положить `items` в список КП. `data/orders.json`.

#### `getDocuments(): Promise<DocumentFile[]>`
КП, счета, УПД: `kind` (`kp` | `invoice` | `upd`), `title`, `date`, `orderId?`, `totalRub`, `url` (PDF). В демо — образцы `public/docs/*.pdf` (появятся в чате 8). В бою — ссылки с проверкой доступа.

#### `updateCompany(company, deliveryAddresses): Promise<User>`
Сохранение реквизитов и адресов доставки (кабинет → «Реквизиты»).

## Состояние в браузере (не через API)
`lib/stores/`: `kp.ts` (список КП), `favorites.ts` (избранное, `prolet-favorites`), `auth.ts` (вход). Все через `safeStorage.ts` — localStorage в try/catch. Счётчики из сторов рисуются после гидратации (`useHydrated`), иначе статичный HTML не совпадёт.

## Статичные данные главной (не через API)
- Глобус: `public/globe/globe.json` (SVG-контуры регионов по зонам доставки, дуги), `globe.svg` и заглушка `globe-static.webp` — генерируются `node scripts/build-globe.mjs` и `python3 scripts/render-globe-static.py`. Зоны регионов и города — в `scripts/build-globe.mjs`, подписи зон и цифры — `components/home/globeData.ts`. Контуры регионов РФ — `docs/assets-src/geo/russia-regions.topo.json` (`scripts/prepare-regions.mjs`). Сервер не нужен: при смене зон перезапустить скрипты.
- Типограф: `lib/typo.ts` (`typo`, `typoAll`) — только в серверных компонентах; клиентские получают тексты пропсами. Тексты из будущей админки прогонять через `typo()` при рендере.
- Объекты и отзывы — `components/home/projectsData.ts`. Если появится админка объектов — вынести в `getProjects()`.
