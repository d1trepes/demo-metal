import Link from "next/link";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Button } from "@/components/ui/Button";
import { getCategories } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Category } from "@/lib/types";
import { ProfileDrawing } from "./ProfileDrawing";
import s from "./CatalogTiles.module.css";

/** Условия плитки «Нет нужной позиции?»: срок, форматы, что делаем. */
const ctaFacts: [string, string][] = [
  ["КП", "за 2 часа в рабочее время"],
  ["Принимаем", "Excel, PDF, фото накладной"],
  ["Аналоги", "по ГОСТ и ТУ с пересчётом массы"],
];

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

        <ul className={s.tiles}>
          {categories.map((category) => (
            <li key={category.slug}>
              <CategoryTile category={category} />
            </li>
          ))}
          <li className={s.ctaCell}>
            <div className={s.cta}>
              <div className={s.ctaMain}>
                <h3 className="t-h3">Нет нужной позиции?</h3>
                <p className={s.ctaText}>
                  Пришлите спецификацию или фото накладной — подберём аналоги по ГОСТ и пришлём КП.
                </p>
              </div>
              <dl className={s.ctaFacts}>
                {ctaFacts.map(([term, value]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className={s.ctaActions}>
                <Button href="/kp/" variant="onInk">
                  Отправить спецификацию
                </Button>
                <Button href="/contacts/#callback" variant="onInkOutline">
                  Заказать звонок
                </Button>
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
