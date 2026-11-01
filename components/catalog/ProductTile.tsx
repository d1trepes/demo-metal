import { HoverLink } from "@/components/ui/HoverLink";
import { Badge } from "@/components/ui/Badge";
import { asset, srcSet } from "@/lib/asset";
import { defaultLength, kpItemLabel, pricePerSquareMeter } from "@/lib/calc";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToKpButton } from "./AddToKpButton";
import { FavoriteToggle } from "./FavoriteToggle";
import s from "./ProductTile.module.css";

/**
 * Плитка позиции. Главное в плитке — размер (у позиций одной категории рендер одинаковый):
 * крупно размер, под ним марка и ГОСТ, цена за тонну, наличие и «В список КП».
 * Вся плитка — ссылка на карточку (растянутая ссылка на заголовке), кнопка и сердце лежат поверх.
 */
export function ProductTile({ product, categoryName, eager = false }: { product: Product; categoryName: string; eager?: boolean }) {
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
          loading={eager ? undefined : "lazy"}
          decoding="async"
        />
      </div>
      <FavoriteToggle productId={product.id} productName={product.name} className={s.favorite} />
      <div className={s.body}>
        <p className={s.category}>{categoryName}</p>
        <h3 className={s.size}>
          <HoverLink href={`/product/${product.slug}/`} className={s.link}>
            {product.size.label}
          </HoverLink>
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
        <AddToKpButton
          item={{ productId: product.id, quantity: 1, length: defaultLength(product) }}
          notice={kpItemLabel(product, 1)}
          block
          className={s.add}
        />
      </div>
    </article>
  );
}
