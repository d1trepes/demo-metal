/** Общие типы данных. Совпадают с тем, что должен возвращать бэкенд (docs/HANDOFF.md). */

/** Сечение профиля — по нему рисуется заглушка-чертёж, пока нет рендеров. */
export type ProfileShape =
  | "rebar"
  | "rect-tube"
  | "round-tube"
  | "sheet"
  | "angle"
  | "channel"
  | "ibeam"
  | "bar"
  | "flat"
  | "mesh";

export type Category = {
  slug: string;
  name: string;
  /** Подпись в плитке, 1 строка. */
  caption: string;
  /** Основной ГОСТ категории. */
  gost: string;
  /** Диапазон размеров текстом: «⌀ 6–40 мм». */
  sizes: string;
  /** Минимальная цена, ₽ за unit, с НДС. */
  priceFrom: number;
  unit: "т" | "м²";
  profile: ProfileShape;
};

/** Заявка на расчёт с главной (форма «Расчёт заявки»). */
export type QuoteRequest = {
  name: string;
  phone: string;
  email?: string;
  /** Компания или ИНН — как ввёл человек. */
  company?: string;
  /** Город доставки — как ввёл человек. */
  city?: string;
  /** Когда нужно — свободным текстом: «к 15.11», «срочно». */
  deadline?: string;
  /** Что нужно: позиции, объёмы, сроки — свободным текстом. */
  message: string;
  /** Спецификация или чертёж (PDF, XLSX, DWG, JPG), до 20 МБ. */
  file?: File;
};

export type QuoteRequestResult = {
  /** Номер заявки для клиента, например «Р-2611-0147». */
  id: string;
  /** До какого времени перезвонит менеджер, ISO-строка. */
  callbackBy: string;
};

/* ---------- Каталог (чат 6) ---------- */

/** Размер позиции: label — как показываем («40×40×2 мм»), остальные поля — числа для фильтров, мм. */
export type ProductSize = { label: string; [dimension: string]: string | number };

export type Product = {
  /** Внутренний код позиции, «P-0204». */
  id: string;
  /** Для адреса /product/<slug>/. */
  slug: string;
  /** slug категории. */
  category: string;
  name: string;
  gost: string;
  /** Марка стали или класс арматуры: «Ст3сп», «09Г2С», «А500С». */
  steelGrade: string;
  size: ProductSize;
  /** Масса 1 м (unit = «м») или 1 м² (unit = «м²»), кг. */
  weightPerMeter: number;
  /** Цена, ₽ за тонну с НДС. */
  pricePerTon: number;
  /** Мера массы: погонный метр или квадратный метр (лист, сетка). */
  unit: "м" | "м²";
  /** Длина или формат поставки текстом: «6 / 11,7 м», «1,5×6 м», «карта 2×6 м». */
  length: string;
  inStock: boolean;
  /** Рендер для плитки и галереи, путь в public/. */
  image: string;
  /** Торец крупным планом (вторая картинка галереи), путь в public/. */
  imageEnd: string;
};

/** Подсказки поиска в шапке (getSearchSuggestions). */
export type SearchSuggestions = {
  /** Категории, где есть совпадения: count — сколько подходящих позиций в категории. */
  categories: { slug: string; name: string; count: number }[];
  /** Первые подходящие позиции (до limit). */
  products: Product[];
  /** Всего подходящих позиций — для строки «Все результаты». */
  total: number;
};

/** Фильтры каталога. Пустое значение — фильтр не задан. */
export type ProductFilter = {
  category?: string;
  q?: string;
  steelGrades?: string[];
  gosts?: string[];
  inStockOnly?: boolean;
  sort?: ProductSort;
};

export type ProductSort = "default" | "price-asc" | "price-desc" | "name";

/* ---------- Список для КП (чат 6–8) ---------- */

/** Строка списка для КП. Количество — в штуках/листах/картах длиной length метров (для листа/сетки — площадь одной штуки). */
export type KpItem = {
  productId: string;
  /** Сколько штук (хлыстов, листов, карт). */
  quantity: number;
  /** Длина одной штуки, м (для листа и сетки — не используется). */
  length?: number;
  comment?: string;
};

export type KpRequest = {
  items: KpItem[];
  company: { inn: string; name: string; kpp?: string; address?: string };
  contact: { name: string; phone: string; email: string };
  delivery?: string;
  comment?: string;
};

export type KpStatus = "sent" | "in-work" | "kp-ready" | "invoiced";

export type KpRequestResult = { id: string; status: KpStatus; createdAt: string };

/** Ответ проверки ИНН (заглушка; в бою — DaData или ФНС). */
export type CompanyLookup = { inn: string; name: string; kpp: string; address: string };

/* ---------- Кабинет (чат 9) ---------- */

export type User = { id: string; name: string; email: string; phone: string; company: CompanyLookup; deliveryAddresses: string[] };

/** Регистрация закупщика (страница /login/, вкладка «Регистрация»). */
export type RegisterRequest = { inn: string; name: string; phone: string; email: string; password: string };

/** Запрос КП в кабинете. totalRub — только когда КП готово (сумма из КП). items — позиции, для «Повторить запрос». */
export type KpRequestSummary = KpRequestResult & { itemsCount: number; totalWeightKg: number; totalRub?: number; items?: KpItem[] };

export type OrderStatus = "paid" | "production" | "ready" | "shipped";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  /** Даты прохождения этапов, ISO; у ещё не пройденных — нет. */
  timeline: Partial<Record<OrderStatus, string>>;
  items: KpItem[];
  totalRub: number;
  totalWeightKg: number;
  delivery: string;
};

export type DocumentKind = "kp" | "invoice" | "upd";

export type DocumentFile = { id: string; kind: DocumentKind; title: string; date: string; orderId?: string; totalRub: number; url: string };

/** Чертёж для расчёта металлоконструкций (страница /constructions). */
export type DrawingRequest = { name: string; phone: string; email?: string; company?: string; description: string; file: File };
