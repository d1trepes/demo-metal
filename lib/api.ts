/**
 * Единственная точка обращения к «серверу».
 * Сейчас — заглушки на JSON из data/. Программист заменяет только этот файл
 * (описание каждой функции — docs/HANDOFF.md). Сигнатуры и типы (lib/types.ts) не менять.
 *
 * Чтение данных (каталог, кабинет, подсказки) — без искусственной задержки: данные локальные,
 * интерфейс должен открываться мгновенно (чат 10). Действия (отправка, вход, загрузка) ждут
 * ACTION_DELAY_MS — только в браузере, чтобы кнопка успела показать «Отправляем…».
 */
import categoriesData from "@/data/categories.json";
import productsData from "@/data/products.json";
import userData from "@/data/user.json";
import ordersData from "@/data/orders.json";
import kpRequestsData from "@/data/kp-requests.json";
import documentsData from "@/data/documents.json";
import { calcTotal } from "./calc";
import { filterProducts, searchSuggestions, similarProducts } from "./catalog";
import type {
  Category,
  CompanyLookup,
  DocumentFile,
  DrawingRequest,
  KpRequest,
  KpRequestResult,
  KpRequestSummary,
  Order,
  Product,
  ProductFilter,
  QuoteRequest,
  QuoteRequestResult,
  RegisterRequest,
  SearchSuggestions,
  User,
} from "./types";

const ACTION_DELAY_MS = 450;
/** Пауза «сервера» для действий. ms = 0 — без таймера (чтение данных). */
const wait = (ms = ACTION_DELAY_MS) =>
  typeof window === "undefined" || ms === 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms));
/** Чтение локальных данных — без задержки. */
const read = () => Promise.resolve();

const products = productsData as unknown as Product[];

/** Номер документа вида «Р-0111-0412»: префикс, день и месяц, 4 цифры. */
function docNumber(prefix: string, now = new Date()): string {
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${prefix}-${dd}${mm}-${String(now.getTime() % 10000).padStart(4, "0")}`;
}

/* ---------- Каталог ---------- */

/** Категории каталога в порядке показа. */
export async function getCategories(): Promise<Category[]> {
  await read();
  return categoriesData as Category[];
}

/** Одна категория по slug или null. */
export async function getCategory(slug: string): Promise<Category | null> {
  await read();
  return (categoriesData as Category[]).find((c) => c.slug === slug) ?? null;
}

/** Позиции каталога с фильтром и сортировкой. Без фильтра — все позиции. */
export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  await read();
  return filterProducts(products, filter);
}

/** Карточка товара по slug или null. */
export async function getProduct(slug: string): Promise<Product | null> {
  await read();
  return products.find((p) => p.slug === slug) ?? null;
}

/** Позиции по id (список КП, избранное, заказы). Порядок — как в ids; неизвестные id пропускаются. */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  await read();
  const byId = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

/** Похожие позиции для карточки: та же категория, близкие размеры. */
export async function getSimilarProducts(product: Product, limit = 4): Promise<Product[]> {
  await read();
  return similarProducts(products, product, limit);
}

/**
 * Подсказки поиска в шапке: с 2 символов, до 3 категорий и до limit позиций.
 * Вызывается на каждый ввод (с паузой 150 мс), поэтому задержка заглушки короче обычной.
 */
export async function getSearchSuggestions(query: string, limit = 6): Promise<SearchSuggestions> {
  await read();
  return searchSuggestions(products, categoriesData as Category[], query, limit);
}

/* ---------- Список для КП ---------- */

/**
 * Реквизиты по ИНН (автоподстановка в форме КП). Заглушка: любой ИНН из 10 или 12 цифр
 * даёт тестовую компанию. В бою — DaData «Организация по ИНН» или ФНС.
 */
export async function lookupCompanyByInn(inn: string): Promise<CompanyLookup | null> {
  await wait(250);
  if (!/^\d{10}(\d{2})?$/.test(inn)) return null;
  if (inn === userData.company.inn) return userData.company;
  return { inn, name: "ООО «Тестовая компания»", kpp: inn.length === 10 ? `${inn.slice(0, 4)}01001` : "", address: "620000, Екатеринбург, ул. Примерная, 1" };
}

/** Отправка запроса КП. Заглушка возвращает номер «КП-ДДММ-NNNN» и статус «отправлен». */
export async function sendKpRequest(request: KpRequest): Promise<KpRequestResult> {
  await wait();
  const result: KpRequestResult = { id: docNumber("КП"), status: "sent", createdAt: new Date().toISOString() };
  rememberSentKp(result, request);
  return result;
}

/* Демо: отправленные с /kp запросы видны в кабинете («Мои запросы»). В бою не нужно — список отдаёт сервер. */
const SENT_KP_KEY = "prolet-sent-kp";

function readSentKp(): KpRequestSummary[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(SENT_KP_KEY) ?? "[]") as KpRequestSummary[];
  } catch {
    return [];
  }
}

function rememberSentKp(result: KpRequestResult, request: KpRequest) {
  const map = new Map(products.map((p) => [p.id, p]));
  const { weightKg } = calcTotal(request.items, map);
  const summary: KpRequestSummary = {
    ...result,
    items: request.items,
    itemsCount: request.items.length,
    totalWeightKg: Math.round(weightKg),
  };
  try {
    window.localStorage.setItem(SENT_KP_KEY, JSON.stringify([summary, ...readSentKp()].slice(0, 10)));
  } catch {
    /* хранилище недоступно — в демо просто не покажем */
  }
}

/* ---------- Заявки с форм ---------- */

/**
 * Заявка на расчёт с главной: контакты + что нужно + файл спецификации.
 * Заглушка: ждёт ACTION_DELAY_MS и возвращает номер. Бэкенд — отправить менеджеру (Telegram/почта), файл приложить.
 */
export async function sendQuoteRequest(request: QuoteRequest): Promise<QuoteRequestResult> {
  await wait();
  void request;
  const now = new Date();
  return { id: docNumber("Р", now), callbackBy: nextCallback(now).toISOString() };
}

/** Чертёж на расчёт металлоконструкций (страница /constructions). */
export async function uploadDrawing(request: DrawingRequest): Promise<QuoteRequestResult> {
  await wait(900);
  void request;
  const now = new Date();
  return { id: docNumber("Ч", now), callbackBy: nextCallback(now).toISOString() };
}

/** Срок звонка: +2 часа в рабочее время (Пн–Пт 8–18), иначе 10:00 ближайшего рабочего дня. */
function nextCallback(now: Date): Date {
  const working = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;
  if (working(now) && now.getHours() >= 8 && now.getHours() < 16) return new Date(now.getTime() + 2 * 3600 * 1000);
  const d = new Date(now);
  if (now.getHours() >= 8) d.setDate(d.getDate() + 1);
  while (!working(d)) d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d;
}

/* ---------- Вход и кабинет ---------- */

/** Вход по почте и паролю. Заглушка: любой непустой пароль пускает в демо-кабинет. Ошибка — исключение. */
export async function login(email: string, password: string): Promise<User> {
  await wait();
  if (!email.includes("@") || !password) throw new Error("Неверная почта или пароль");
  return userData as User;
}

/**
 * Регистрация закупщика: компания по ИНН + контакт + пароль. Заглушка сразу пускает в кабинет
 * (заказы и документы в демо — общие). В бою: создать учётку, письмо с подтверждением почты, менеджеру — новый клиент.
 */
export async function register(request: RegisterRequest): Promise<User> {
  await wait();
  const company = await lookupCompanyByInn(request.inn);
  if (!company) throw new Error("Проверьте ИНН: 10 цифр для организации, 12 для ИП");
  if (!request.email.includes("@") || request.password.length < 6) throw new Error("Почта и пароль от 6 символов обязательны");
  return { ...(userData as User), id: "U-NEW", name: request.name, email: request.email, phone: request.phone, company, deliveryAddresses: [] };
}

/** Кнопка «Войти в демо-кабинет» — без пароля. */
export async function loginDemo(): Promise<User> {
  await wait();
  return userData as User;
}

/** Выход. В бою — сбросить сессию на сервере. */
export async function logout(): Promise<void> {
  await wait(200);
}

/** Запросы КП текущего пользователя, новые сверху. */
export async function getKpRequests(): Promise<KpRequestSummary[]> {
  await read();
  return [...readSentKp(), ...(kpRequestsData as KpRequestSummary[])];
}

/** Заказы текущего пользователя, новые сверху. */
export async function getOrders(): Promise<Order[]> {
  await read();
  return [...(ordersData as Order[])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Один заказ по номеру или null. */
export async function getOrder(id: string): Promise<Order | null> {
  await read();
  return (ordersData as Order[]).find((o) => o.id === id) ?? null;
}

/** Документы (КП, счета, УПД). url — путь к PDF; в демо — образцы из public/docs/. */
export async function getDocuments(): Promise<DocumentFile[]> {
  await read();
  return documentsData as DocumentFile[];
}

/** Реквизиты и адреса доставки (кабинет → «Реквизиты»). */
export async function updateCompany(company: User["company"], deliveryAddresses: string[]): Promise<User> {
  await wait();
  return { ...(userData as User), company, deliveryAddresses };
}
