import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/** Все страницы, кроме главной: белая липкая шапка и подвал. Корневой layout пустой — 404 живёт без них. На главной шапка живёт в стеклянной панели hero. */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="solid" />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
