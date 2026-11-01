import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductTile } from "@/components/catalog/ProductTile";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { ProductCalculator } from "@/components/product/ProductCalculator";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Table } from "@/components/ui/Table";
import { getCategory, getProduct, getProducts, getSimilarProducts } from "@/lib/api";
import { pricePerSquareMeter } from "@/lib/calc";
import { formatPrice } from "@/lib/format";
import { typo } from "@/lib/typo";
import { productSpecs, type SpecRow } from "./specs";
import s from "./product.module.css";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `${product.name} ${product.steelGrade} — ${formatPrice(product.pricePerTon, "т")}`,
    description: `${product.name}, ${product.steelGrade}, ${product.gost}. Масса 1 ${product.unit} — ${product.weightPerMeter} кг. ${product.inStock ? "В наличии в Екатеринбурге" : "Под заказ"}.`,
  };
}

/** Условия поставки — одинаковые для всех позиций склада. */
const TERMS = [
  { label: "Отгрузка", value: "На следующий рабочий день после оплаты, со склада на ул. Монтажников" },
  { label: "Резка", value: "В размер по чертежу — от 120 ₽ за рез, в день заказа" },
  { label: "Доставка", value: "Свой транспорт по Екатеринбургу от 3 500 ₽ до 20 т, по УрФО — ТК" },
  { label: "Документы", value: "Сертификат качества завода, счёт и УПД в кабинете" },
];

export default async function ProductPage({ params }: Params) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const [category, similar] = await Promise.all([getCategory(product.category), getSimilarProducts(product)]);
  if (!category) notFound();
  const specs = productSpecs(product, category);

  return (
    <Container className={s.page}>
      <Breadcrumbs
        items={[
          { href: "/", label: "Главная" },
          { href: "/catalog/", label: "Каталог" },
          { href: `/catalog/${category.slug}/`, label: category.name },
          { label: product.size.label },
        ]}
      />

      <Grid className={s.main}>
        <div className={s.gallery}>
          <ProductGallery image={product.image} imageEnd={product.imageEnd} name={product.name} />
        </div>

        <div className={s.info}>
          <Link href={`/catalog/${category.slug}/`} className={s.category}>
            {category.name}
          </Link>
          <h1 className={s.title}>{typo(product.name)}</h1>
          <p className={s.meta}>
            {product.steelGrade} · {product.gost} · код {product.id}
          </p>

          {/* Цена — отдельной плашкой, другим начертанием, чтобы не сливалась с заголовком (чат 6б) */}
          <div className={s.priceRow}>
            <span className={s.priceLabel}>Цена с НДС</span>
            <p className={s.price}>
              {formatPrice(product.pricePerTon, "т")}
              {product.unit === "м²" && <span>≈ {formatPrice(pricePerSquareMeter(product), "м²")}</span>}
            </p>
            <Badge tone={product.inStock ? "success" : "warning"}>{product.inStock ? "В наличии" : "Под заказ, 5–7 дней"}</Badge>
          </div>

          <ProductCalculator product={product} />

          <dl className={s.terms}>
            {TERMS.map((t) => (
              <div key={t.label}>
                <dt>{t.label}</dt>
                <dd>{typo(t.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Grid>

      <section className={s.section} aria-labelledby="specs">
        <Grid>
          <Col area="head">
            <h2 id="specs" className="t-h2">
              Характеристики
            </h2>
          </Col>
        </Grid>
        <Grid className={s.specsRow}>
          <div className={s.specs}>
            <Table<SpecRow>
              columns={[
                { key: "name", title: "Параметр", render: (r) => r.name },
                { key: "value", title: "Значение", render: (r) => <strong>{r.value}</strong> },
              ]}
              rows={specs}
              rowKey={(r) => r.name}
              caption="Характеристики позиции"
            />
          </div>
          <div className={s.specsNote}>
            <p>
              {typo(
                `Масса — теоретическая, по ${product.gost}. Фактическую массу партии определяем взвешиванием на автомобильных весах при отгрузке, расхождение обычно до 2 %.`,
              )}
            </p>
            <p>{typo("Нужен другой размер, марка или длина — укажите в комментарии к списку КП, менеджер подберёт замену из наличия.")}</p>
          </div>
        </Grid>
      </section>

      {similar.length > 0 && (
        <section className={s.section} aria-labelledby="similar">
          <Grid className={s.similarHead}>
            <Col area="head">
              <h2 id="similar" className="t-h2">
                Похожие позиции
              </h2>
            </Col>
            <Col area="aside" className={s.allLink}>
              <Link href={`/catalog/${category.slug}/`} className="link">
                Все позиции: {category.name.toLowerCase()}
              </Link>
            </Col>
          </Grid>
          <ul className={s.similar}>
            {similar.map((p) => (
              <li key={p.id}>
                <ProductTile product={p} categoryName={category.name} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
