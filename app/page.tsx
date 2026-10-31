import { CatalogTiles } from "@/components/home/CatalogTiles";
import { Hero } from "@/components/home/Hero";

/** Главная. Чат 2: hero + каталог-плитка. Остальные блоки — чаты 4–5 (docs/PASSPORT.md §4). */
export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <CatalogTiles />
    </main>
  );
}
