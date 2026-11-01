import type { Metadata } from "next";
import { Container } from "@/components/layout/Grid";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { typo } from "@/lib/typo";
import s from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false },
};

/**
 * 404 (паспорт §4, решение 01.11): без шапки и подвала — только логотип сверху и чистый экран.
 * Статичный экспорт кладёт её в out/404.html — GitHub Pages отдаёт её на любой несуществующий адрес.
 */
export default function NotFound() {
  return (
    <div className={s.page}>
      <Container className={s.top}>
        <Logo />
      </Container>
      <main id="main" className={s.main}>
        <Container>
          <p className={s.code}>404</p>
          <h1 className={`t-h1 ${s.title}`}>Такой страницы нет</h1>
          <p className={s.lead}>{typo("Ссылка устарела или в адресе опечатка.")}</p>
          <div className={s.actions}>
            <Button href="/">На главную</Button>
            <Button href="/catalog/" variant="secondary">
              В каталог
            </Button>
          </div>
        </Container>
      </main>
    </div>
  );
}
