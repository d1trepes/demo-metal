import Link from "next/link";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Button } from "@/components/ui/Button";
import { getCategories } from "@/lib/api";
import { asset } from "@/lib/asset";
import { formatPrice } from "@/lib/format";
import type { Category } from "@/lib/types";
import { RevealList } from "./RevealList";
import { SectionHatch } from "./SectionHatch";
import s from "./CatalogTiles.module.css";

/** Главная: сетка категорий проката (реф. 02) + плитка «нет позиции — пришлите спецификацию». */
export async function CatalogTiles() {
  const categories = await getCategories();

  return (
    <section className="section" aria-labelledby="catalog-title">
      <Container>
        <Grid className={s.head}>
          <Col area="head">
            <h2 id="catalog-title" className="t-h2">
              Металлопрокат
              <br />в наличии на складе
            </h2>
          </Col>
          <Col area="aside" className={s.aside}>
            <p className="t-muted">
              1 860 позиций по ГОСТ и ТУ. Цены за тонну с НДС, обновляем каждый день в 10:00 по Екатеринбургу.
            </p>
            <Link href="/catalog/" className={s.allLink}>
              Весь каталог
            </Link>
          </Col>
        </Grid>

        <RevealList className={s.tiles}>
          {categories.map((category) => (
            <li key={category.slug}>
              <CategoryTile category={category} />
            </li>
          ))}
          <li className={s.ctaCell}>
            <div className={s.cta}>
              <div className={s.ctaMain}>
                <h3 className="t-h3">Нет нужной позиции?</h3>
                <p className={s.ctaText}>Пришлите спецификацию — подберём аналог по ГОСТ за 2 часа.</p>
                <Button href="/kp/" variant="onInkOutline" className={s.ctaButton}>
                  Отправить спецификацию
                </Button>
              </div>
              <SectionHatch className={s.ctaArt} />
            </div>
          </li>
        </RevealList>
      </Container>
    </section>
  );
}

/** Плитка категории. Hover — вариант A «Линия разметки» (DESIGN.md → Каталог-плитка). */
function CategoryTile({ category }: { category: Category }) {
  return (
    <Link href={`/catalog/${category.slug}/`} className={s.tile}>
      <div className={s.art}>
        <img
          src={asset(`/catalog/${category.slug}.webp`)}
          alt=""
          width={1012}
          height={788}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className={s.body}>
        <span className={s.rule} aria-hidden="true" />
        <h3 className={s.name}>{category.name}</h3>
        <p className={s.caption}>{category.caption}</p>
        <p className={s.price}>от {formatPrice(category.priceFrom, category.unit)}</p>
      </div>
    </Link>
  );
}
