/**
 * Фильтры и сортировка каталога — чистые функции без сети.
 * Их использует заглушка getProducts() в lib/api.ts и страница каталога (фильтрует в браузере
 * уже загруженный список, чтобы фильтры срабатывали мгновенно). См. docs/HANDOFF.md → getProducts.
 */
import type { Category, Product, ProductFilter, ProductSort, SearchSuggestions } from "./types";

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/[×x*]/g, "х").replace(/\s+/g, " ").trim();

/** Поиск по названию, ГОСТу, марке, размеру и коду. «труба 40х40» находит «Труба профильная 40×40×2». */
export function matchesQuery(product: Product, query: string): boolean {
  const haystack = norm(`${product.name} ${product.gost} ${product.steelGrade} ${product.size.label} ${product.id}`);
  return norm(query)
    .split(" ")
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function filterProducts(products: Product[], filter: ProductFilter): Product[] {
  const result = products.filter(
    (p) =>
      (!filter.category || p.category === filter.category) &&
      (!filter.q || matchesQuery(p, filter.q)) &&
      (!filter.steelGrades?.length || filter.steelGrades.includes(p.steelGrade)) &&
      (!filter.gosts?.length || filter.gosts.includes(p.gost)) &&
      (!filter.inStockOnly || p.inStock),
  );
  return sortProducts(result, filter.sort ?? "default");
}

export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const list = [...products];
  if (sort === "price-asc") list.sort((a, b) => a.pricePerTon - b.pricePerTon);
  if (sort === "price-desc") list.sort((a, b) => b.pricePerTon - a.pricePerTon);
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "ru", { numeric: true }));
  return list;
}

export type Facet = { value: string; count: number };

/** Значения фильтра с количеством позиций, по убыванию количества. */
export function facet(products: Product[], key: "steelGrade" | "gost"): Facet[] {
  const counts = new Map<string, number>();
  for (const p of products) counts.set(p[key], (counts.get(p[key]) ?? 0) + 1);
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "ru"));
}

/** Похожие позиции: та же категория, ближайшие по массе 1 м. */
export function similarProducts(products: Product[], product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .sort((a, b) => Math.abs(a.weightPerMeter - product.weightPerMeter) - Math.abs(b.weightPerMeter - product.weightPerMeter))
    .slice(0, limit);
}

/**
 * Подсказки поиска: категории с совпадениями (по названию категории или по позициям в ней)
 * и первые подходящие позиции — сначала в наличии.
 */
export function searchSuggestions(products: Product[], categories: Category[], query: string, limit = 6): SearchSuggestions {
  const q = norm(query);
  if (q.length < 2) return { categories: [], products: [], total: 0 };
  const byName = (c: Category) => q.split(" ").every((w) => norm(c.name).includes(w));
  const found = products.filter((p) => matchesQuery(p, q) || byName(categories.find((c) => c.slug === p.category)!));
  const cats = categories
    .map((c) => ({ slug: c.slug, name: c.name, count: found.filter((p) => p.category === c.slug).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  const sorted = [...found].sort((a, b) => Number(b.inStock) - Number(a.inStock));
  return { categories: cats, products: sorted.slice(0, limit), total: found.length };
}

/**
 * Куски текста для подсветки совпадений: [{ text, hit }]. Сравнение — как в поиске
 * (регистр, ё/е, ×/x/х), поэтому «40х40» подсвечивает «40×40».
 */
export function highlightParts(text: string, query: string): { text: string; hit: boolean }[] {
  const words = norm(query).split(" ").filter(Boolean);
  const hay = text.toLowerCase().replace(/ё/g, "е").replace(/[×x*]/g, "х");
  const marks = new Array<boolean>(text.length).fill(false);
  for (const w of words) {
    let i = hay.indexOf(w);
    while (i !== -1) {
      marks.fill(true, i, i + w.length);
      i = hay.indexOf(w, i + w.length);
    }
  }
  const parts: { text: string; hit: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.hit === marks[i]) last.text += text[i];
    else parts.push({ text: text[i], hit: marks[i] });
  }
  return parts;
}
