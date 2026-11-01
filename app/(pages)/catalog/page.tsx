import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { plural } from "@/lib/format";
import { typo } from "@/lib/typo";
import { loadCatalog } from "./catalogData";
import s from "./catalog.module.css";

export const metadata: Metadata = {
  title: "Каталог металлопроката",
  description: "Арматура, трубы, лист, уголок, швеллер, балка, круг, полоса и сетка со склада в Екатеринбурге. Цены за тонну с НДС.",
};

export default async function CatalogPage() {
  const { products, links } = await loadCatalog();
  const inStock = products.filter((p) => p.inStock).length;
  return (
    <Container className={s.page}>
      <Grid className={s.head}>
        <Col area="head">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Каталог" }]} />
          <h1 className="t-h1">Каталог металлопроката</h1>
        </Col>
        <Col area="aside" className={s.lead}>
          <p>
            {typo(
              `${products.length} ${plural(products.length, ["позиция", "позиции", "позиций"])} по ГОСТ, ${inStock} — на складе в Екатеринбурге. Отгрузка на следующий день после оплаты, резка в размер — в день заказа.`,
            )}
          </p>
        </Col>
      </Grid>
      <CatalogView products={products} categories={links} />
    </Container>
  );
}
