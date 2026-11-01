"use client";

import { ProductTile } from "@/components/catalog/ProductTile";
import { Button } from "@/components/ui/Button";
import { getCategories, getProductsByIds } from "@/lib/api";
import { useFavoritesStore } from "@/lib/stores/favorites";
import { useApi } from "./useApi";
import s from "./Account.module.css";

const NB = " ";

/** Избранное: позиции из стора (localStorage) плиткой каталога. Снятое сердечко убирает плитку сразу. */
export function FavoritesView() {
  const ids = useFavoritesStore((st) => st.ids);
  const data = useApi(() => Promise.all([getProductsByIds(ids), getCategories()]), [ids.join(",")]);

  if (ids.length === 0)
    return (
      <div className={s.empty}>
        <h2 className="t-h3">Избранного пока нет</h2>
        <p className={s.meta}>
          Отмечайте позиции, которые берёте постоянно, — сердечком в{NB}каталоге или в{NB}карточке. Отсюда их удобно добавлять в{NB}запрос КП.
        </p>
        <Button href="/catalog/">Открыть каталог</Button>
      </div>
    );
  if (!data) return <div className={s.loading} aria-busy="true" />;

  const [products, categories] = data;
  const names = new Map(categories.map((c) => [c.slug, c.name]));
  return (
    <ul className={s.tiles}>
      {products.map((p) => (
        <li key={p.id}>
          <ProductTile product={p} categoryName={names.get(p.category) ?? ""} />
        </li>
      ))}
    </ul>
  );
}
