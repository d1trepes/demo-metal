import { Header } from "@/components/layout/Header";
import { CatalogTiles } from "@/components/home/CatalogTiles";
import { ConstructionsSection } from "@/components/home/ConstructionsSection";
import { GeoSection } from "@/components/home/GeoSection";
import { Hero } from "@/components/home/Hero";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { QuoteSection } from "@/components/home/QuoteSection";
import { StickyHeader } from "@/components/home/StickyHeader";
import { TruckDivider } from "@/components/home/TruckDivider";

/** Главная целиком (чат 5). Порядок блоков — docs/PASSPORT.md §4. */
export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <StickyHeader>
        <Header />
      </StickyHeader>
      <CatalogTiles />
      <TruckDivider />
      <ConstructionsSection />
      <GeoSection />
      <ProjectsSection />
      <QuoteSection />
    </main>
  );
}
