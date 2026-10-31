import type { Metadata, Viewport } from "next";
// Шрифты Sofia Sans (variable, latin + cyrillic) раздаются со своего домена.
// Подключены через @fontsource, а не next/font/google: сборка не зависит от доступа к Google Fonts.
import "@fontsource-variable/sofia-sans";
import "@fontsource-variable/sofia-sans-condensed";
import "@fontsource-variable/sofia-sans-extra-condensed";
import "@/styles/globals.css";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Пролёт — металлопрокат и металлоконструкции в Екатеринбурге",
    template: "%s — Пролёт",
  },
  description:
    "Металлобаза и цех металлоконструкций: 12 400 т проката на складе, резка в размер, отгрузка в день оплаты. Демо-проект студии, компания вымышлена.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0e1013",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <a href="#main" className="skip-link">
          К содержанию
        </a>
        {children}
        <Footer />
      </body>
    </html>
  );
}
