import { CatalogTiles } from "@/components/home/CatalogTiles";
import { ConstructionsSection } from "@/components/home/ConstructionsSection";
import { Hero } from "@/components/home/Hero";
import { TruckDivider } from "@/components/home/TruckDivider";

/** Главная. Чат 4: + фура-разделитель и панели металлоконструкций. Дальше — чат 5 (docs/PASSPORT.md §11). */
export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <CatalogTiles />
      <TruckDivider />
      <ConstructionsSection />
    </main>
  );
}
