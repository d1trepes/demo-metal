/**
 * Единственная точка обращения к «серверу».
 * Сейчас — заглушки на JSON из data/. Программист заменяет только этот файл
 * (описание каждой функции — docs/HANDOFF.md).
 *
 * Чат 2: только getCategories (для плитки на главной).
 * Чат 5: sendQuoteRequest (форма расчёта на главной).
 * Чат 6 добавит товары, список КП, заказы, документы, вход.
 */
import categoriesData from "@/data/categories.json";
import type { Category, QuoteRequest, QuoteRequestResult } from "./types";

/** Имитация сети, чтобы интерфейс честно показывал загрузку. */
const FAKE_DELAY_MS = 600;
const wait = (ms = FAKE_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

/** Категории каталога в порядке показа. */
export async function getCategories(): Promise<Category[]> {
  await wait();
  return categoriesData as Category[];
}

/**
 * Заявка на расчёт с главной: контакты + что нужно + файл спецификации.
 * Заглушка: ждёт 600 мс и возвращает номер. Бэкенд — отправить менеджеру (Telegram/почта), файл приложить.
 */
export async function sendQuoteRequest(request: QuoteRequest): Promise<QuoteRequestResult> {
  await wait();
  void request;
  const now = new Date();
  const id = `Р-${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getTime() % 10000,
  ).padStart(4, "0")}`;
  return { id, callbackBy: nextCallback(now).toISOString() };
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
