import Link from "next/link";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Button } from "@/components/ui/Button";
import { getCategories } from "@/lib/api";
import { asset, srcSet } from "@/lib/asset";
import { formatPrice } from "@/lib/format";
import { typo, typoAll } from "@/lib/typo";
import type { Category } from "@/lib/types";
import { RevealList } from "./RevealList";
import s from "./CatalogTiles.module.css";

/** Условия в тёмной плитке «Нет нужной позиции?»: метка — значение. */
const ctaFacts = typoAll([
  { label: "Ответ", value: "КП с ценами за 2 часа" },
  { label: "Формат", value: "XLS, PDF, фото от руки" },
  { label: "Замена", value: "аналог по ГОСТ и марке стали" },
]);

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
              {typo("1 860 позиций по ГОСТ и ТУ. Цены за тонну с НДС, обновляем каждый день в 10:00 по Екатеринбургу.")}
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
                <div>
                  <h3 className="t-h3">Нет нужной позиции?</h3>
                  <p className={s.ctaText}>{typo("Пришлите спецификацию — подберём замену по ГОСТ и марке стали.")}</p>
                </div>
                <dl className={s.ctaFacts}>
                  {ctaFacts.map((fact) => (
                    <div key={fact.label} className={s.ctaFact}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <Button href="/kp/" variant="onInkOutline">
                  Отправить спецификацию
                </Button>
              </div>
              <img
                className={s.ctaArt}
                src={asset("/cta/spec.webp")}
                srcSet={srcSet("/cta/spec.webp", 1000)}
                sizes="(max-width: 640px) 100vw, 490px"
                alt=""
                width={1000}
                height={779}
                loading="lazy"
                decoding="async"
              />
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
          srcSet={srcSet(`/catalog/${category.slug}.webp`, 1049, [400, 640])}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 330px"
          alt=""
          width={1049}
          height={812}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className={s.body}>
        <span className={s.rule} aria-hidden="true" />
        <h3 className={s.name}>{category.name}</h3>
        <p className={s.caption}>{typo(category.caption)}</p>
        <p className={s.price}>от {formatPrice(category.priceFrom, category.unit)}</p>
      </div>
    </Link>
  );
}
