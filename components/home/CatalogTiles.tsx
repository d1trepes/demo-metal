import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Button } from "@/components/ui/Button";
import { getCategories } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { company } from "@/lib/nav";
import type { Category } from "@/lib/types";
import { ProfileDrawing } from "./ProfileDrawing";
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
              <ArrowRight aria-hidden="true" />
            </Link>
          </Col>
        </Grid>

        <ul className={s.tiles}>
          {categories.map((category) => (
            <li key={category.slug}>
              <CategoryTile category={category} />
            </li>
          ))}
          <li className={s.ctaCell}>
            <div className={s.cta}>
              <h3 className="t-h3">Нет нужной позиции?</h3>
              <p className={s.ctaText}>
                Пришлите спецификацию в Excel или фото накладной. Подберём аналоги по ГОСТ и пришлём КП за 2 часа в
                рабочее время.
              </p>
              <div className={s.ctaActions}>
                <Button href="/kp/" variant="onInk">
                  Отправить спецификацию
                </Button>
                <a href={company.phoneHref} className={s.ctaPhone}>
                  {company.phone}
                </a>
              </div>
            </div>
          </li>
        </ul>
      </Container>
    </section>
  );
}

function CategoryTile({ category }: { category: Category }) {
  return (
    <Link href={`/catalog/${category.slug}/`} className={s.tile}>
      <div className={s.art}>
        <ProfileDrawing shape={category.profile} />
      </div>
      <div className={s.body}>
        <h3 className={s.name}>{category.name}</h3>
        <p className={s.caption}>{category.caption}</p>
      </div>
      <p className={s.spec}>
        <span>{category.gost}</span>
        <span>{category.sizes}</span>
        <span className={s.price}>от {formatPrice(category.priceFrom, category.unit)}</span>
      </p>
    </Link>
  );
}
