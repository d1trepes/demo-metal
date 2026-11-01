import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getCategories, getCategory } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { typo } from "@/lib/typo";
import { loadCatalog } from "../catalogData";
import s from "../catalog.module.css";

type Params = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const category = await getCategory((await params).category);
  return category
    ? { title: `${category.name} — цена за тонну`, description: `${category.name}: ${category.caption}. ${category.gost}, ${category.sizes}.` }
    : {};
}

export default async function CategoryPage({ params }: Params) {
  const slug = (await params).category;
  const [{ products, links }, category] = await Promise.all([loadCatalog(), getCategory(slug)]);
  if (!category) notFound();
  const items = products.filter((p) => p.category === slug);

  return (
    <Container className={s.page}>
      <Grid className={s.head}>
        <Col area="head">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { href: "/catalog/", label: "Каталог" }, { label: category.name }]} />
          <h1 className="t-h1">{category.name}</h1>
        </Col>
        <Col area="aside" className={s.lead}>
          <p>{typo(`${category.caption}.`)}</p>
          <dl className={s.facts}>
            <div>
              <dt>ГОСТ</dt>
              <dd>{category.gost}</dd>
            </div>
            <div>
              <dt>Размеры</dt>
              <dd>{category.sizes}</dd>
            </div>
            <div>
              <dt>Цена</dt>
              <dd>от {formatPrice(category.priceFrom, category.unit)}</dd>
            </div>
          </dl>
        </Col>
      </Grid>
      <CatalogView key={slug} products={items} categories={links} activeCategory={slug} />
    </Container>
  );
}
