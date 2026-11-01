import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { defaultLength } from "@/lib/calc";
import { formatNumber, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToKpButton } from "./AddToKpButton";
import s from "./ProductTable.module.css";

/** Вид «Таблица»: как прайс металлобазы. На телефоне прокручивается внутри себя. */
export function ProductTable({ products }: { products: Product[] }) {
  const columns: Column<Product>[] = [
    {
      key: "name",
      title: "Наименование",
      render: (p) => (
        <Link href={`/product/${p.slug}/`} className={s.name}>
          {p.name}
        </Link>
      ),
    },
    { key: "grade", title: "Марка", render: (p) => p.steelGrade },
    { key: "gost", title: "ГОСТ", render: (p) => <span className={s.nowrap}>{p.gost}</span> },
    { key: "weight", title: "Масса", numeric: true, render: (p) => <span className={s.nowrap}>{formatNumber(p.weightPerMeter, 2)} кг/{p.unit}</span> },
    { key: "length", title: "Длина / формат", render: (p) => <span className={s.nowrap}>{p.length}</span> },
    { key: "stock", title: "Наличие", render: (p) => <Badge tone={p.inStock ? "success" : "warning"}>{p.inStock ? "В наличии" : "Под заказ"}</Badge> },
    { key: "price", title: "Цена с НДС", numeric: true, render: (p) => <strong className={s.nowrap}>{formatPrice(p.pricePerTon, "т")}</strong> },
    {
      key: "kp",
      title: "",
      render: (p) => <AddToKpButton item={{ productId: p.id, quantity: 1, length: defaultLength(p) }} label="В КП" />,
    },
  ];
  return <Table columns={columns} rows={products} rowKey={(p) => p.id} caption="Позиции каталога" />;
}
