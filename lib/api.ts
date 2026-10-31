/**
 * Единственная точка обращения к «серверу».
 * Сейчас — заглушки на JSON из data/. Программист заменяет только этот файл
 * (описание каждой функции — docs/HANDOFF.md).
 *
 * Чат 2: только getCategories (для плитки на главной).
 * Чат 3 добавит товары, список КП, заказы, документы, вход.
 */
import categoriesData from "@/data/categories.json";
import type { Category } from "./types";

/** Имитация сети, чтобы интерфейс честно показывал загрузку. */
const FAKE_DELAY_MS = 600;
const wait = (ms = FAKE_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

/** Категории каталога в порядке показа. */
export async function getCategories(): Promise<Category[]> {
  await wait();
  return categoriesData as Category[];
}
