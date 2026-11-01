import type { Metadata, Viewport } from "next";
import { fontFaceCss, fontPreloads } from "@/lib/fonts";
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
      <head>
        {/* Шрифты со своего домена (файлы из @fontsource-variable): предзагрузка + @font-face до первой отрисовки */}
        {fontPreloads.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        <style dangerouslySetInnerHTML={{ __html: fontFaceCss }} />
      </head>
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
