import { Header } from "@/components/layout/Header";

/** Все страницы, кроме главной: белая липкая шапка. На главной шапка живёт в стеклянной панели hero. */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="solid" />
      <main id="main">{children}</main>
    </>
  );
}
