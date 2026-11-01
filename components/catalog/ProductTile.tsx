import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { asset, srcSet } from "@/lib/asset";
import { defaultLength, pricePerSquareMeter } from "@/lib/calc";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToKpButton } from "./AddToKpButton";
import s from "./ProductTile.module.css";

/**
 * Плитка позиции. Главное в плитке — размер (у позиций одной категории рендер одинаковый):
 * крупно размер, под ним марка и ГОСТ, цена за тонну, наличие и «В список КП».
 * Вся плитка — ссылка на карточку (растянутая ссылка на заголовке), кнопка лежит поверх.
 */
export function ProductTile({ product, categoryName }: { product: Product; categoryName: string }) {
  return (
    <article className={s.tile}>
      <div className={s.art}>
        <img
          src={asset(product.image)}
          srcSet={srcSet(product.image, 1049, [400, 640])}
          sizes="(max-width: 640px) 120px, (max-width: 1024px) 33vw, 300px"
          alt=""
          width={1049}
          height={812}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className={s.body}>
        <p className={s.category}>{categoryName}</p>
        <h3 className={s.size}>
          <Link href={`/product/${product.slug}/`} className={s.link}>
            {product.size.label}
          </Link>
        </h3>
        <p className={s.meta}>
          {product.steelGrade} · {product.gost}
        </p>
        <div className={s.foot}>
          <div className={s.price}>
            <strong>{formatPrice(product.pricePerTon, "т")}</strong>
            {product.unit === "м²" && <span>≈ {formatPrice(pricePerSquareMeter(product), "м²")}</span>}
          </div>
          <Badge tone={product.inStock ? "success" : "warning"}>{product.inStock ? "В наличии" : "Под заказ"}</Badge>
        </div>
        <AddToKpButton item={{ productId: product.id, quantity: 1, length: defaultLength(product) }} block className={s.add} />
      </div>
    </article>
  );
}
