import { getCategories, getProducts } from "@/lib/api";
import type { CategoryLink } from "@/components/catalog/CatalogFilters";

/** Данные для обеих страниц каталога: все позиции и категории со счётчиками. Выполняется при сборке. */
export async function loadCatalog() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const links: CategoryLink[] = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    count: products.filter((p) => p.category === c.slug).length,
  }));
  return { categories, products, links };
}
