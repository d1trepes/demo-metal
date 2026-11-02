import type { Metadata, Viewport } from "next";
import { fontFaceCss, fontPreloads } from "@/lib/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Пролёт — металлопрокат и металлоконструкции в Екатеринбурге",
    template: "%s — Пролёт",
  },
  description:
    "Металлобаза и цех металлоконструкций: 12 400 т проката на складе, резка в размер, отгрузка в день оплаты. Демо-проект студии, компания вымышлена.",
  robots: { index: false, follow: false },
};

/*
 * 11в: theme-color белый — верх окна на белых страницах белый (тёмный низ даёт слой
 * за подвалом в globals.css). Safari 26 theme-color не читает, берёт цвет с краёв страницы.
 */
export const viewport: Viewport = {
  themeColor: "#ffffff",
};

/*
 * 11в: --vh-fixed = innerHeight в px до первой отрисовки. Пересчёт только при смене ширины
 * (поворот, окно на десктопе): WebView Telegram и Safari меняют высоту, пряча панели при
 * прокрутке, — из-за этого hero и блоки на 100svh «дышали».
 */
const fixedVhScript = `(function(){var d=document.documentElement,w=-1;function s(){if(innerWidth===w)return;w=innerWidth;d.style.setProperty("--vh-fixed",innerHeight+"px")}s();addEventListener("resize",s);addEventListener("orientationchange",function(){w=-1;setTimeout(s,250)})})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: fixedVhScript }} />
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
      </body>
    </html>
  );
}
