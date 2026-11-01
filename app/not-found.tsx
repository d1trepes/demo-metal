import type { Metadata } from "next";
import { Container, Grid } from "@/components/layout/Grid";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { asset, srcSet } from "@/lib/asset";
import { company } from "@/lib/nav";
import { typo } from "@/lib/typo";
import s from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false },
};

/**
 * 404 (паспорт §4, решения 01.11): без шапки и подвала, логотип сверху; согнутая балка 1–6, текст 8–12.
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
          <Grid className={s.grid}>
            <img
              className={s.art}
              src={asset("/pages/bent.webp")}
              srcSet={srcSet("/pages/bent.webp", 1014, [800])}
              sizes="(max-width: 1024px) 100vw, 50vw"
              alt="Двутавровая балка, согнутая посередине"
              width={1014}
              height={616}
            />
            <div className={s.text}>
              <p className={s.code}>404</p>
              <h1 className="t-h2">Такой страницы нет</h1>
              <p>{typo("Ссылка устарела или в адресе опечатка. Позицию проще найти поиском в каталоге — по ГОСТу, марке стали или размеру.")}</p>
              <div className={s.actions}>
                <Button href="/catalog/">В каталог</Button>
                <Button href="/" variant="secondary">
                  На главную
                </Button>
              </div>
              <p className="t-muted">
                {typo("Или позвоните:")}{" "}
                <a className="link" href={company.phoneHref}>
                  {company.phone}
                </a>
              </p>
            </div>
          </Grid>
        </Container>
      </main>
    </div>
  );
}
