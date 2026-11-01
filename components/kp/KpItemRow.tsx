"use client";

import Link from "next/link";
import { ChevronDown, Minus, Plus, X } from "lucide-react";
import { asset, srcSet } from "@/lib/asset";
import { calcItem, defaultLength, isCoil, pieceForms, stockLengths } from "@/lib/calc";
import { formatNumber, formatPrice, formatWeight, plural } from "@/lib/format";
import { useKpStore } from "@/lib/stores/kp";
import type { KpItem, Product } from "@/lib/types";
import s from "./Kp.module.css";

const MAX_QTY = 9999;

/**
 * Строка списка КП: рендер · наименование, марка, ГОСТ · длина и количество · масса и сумма · удалить.
 * Под строкой — комментарий к позиции («резка по 3 м», «можно замену на 09Г2С»).
 */
export function KpItemRow({ item, product }: { item: KpItem; product: Product }) {
  const update = useKpStore((st) => st.update);
  const remove = useKpStore((st) => st.remove);

  const lengths = stockLengths(product);
  const length = item.length ?? defaultLength(product);
  const custom = lengths.length > 0 && !lengths.includes(length);
  const { weightKg, priceRub } = calcItem(product, item);
  const forms = pieceForms(product);
  const qtyId = `kp-qty-${product.id}`;

  const setQty = (q: number) => update(product.id, { quantity: Math.min(MAX_QTY, Math.max(1, Math.round(q) || 1)) });

  return (
    <li className={s.row}>
      <Link href={`/product/${product.slug}/`} className={s.thumb} tabIndex={-1} aria-hidden="true">
        <img src={asset(product.image)} srcSet={srcSet(product.image, 1049, [400])} sizes="96px" alt="" width={1049} height={812} decoding="async" />
      </Link>

      <div className={s.name}>
        <Link href={`/product/${product.slug}/`} className={s.title}>
          {product.name}
        </Link>
        <p className={s.meta}>
          {product.steelGrade} · {product.gost} · <span className={s.nowrap}>{formatPrice(product.pricePerTon, "т")}</span>
          {!product.inStock && <span className={s.order}> · под заказ</span>}
        </p>
      </div>

      <div className={s.params}>
        {lengths.length > 0 ? (
          <label className={s.param}>
            <span>Длина</span>
            <span className={s.selectWrap}>
              <select
                className={s.select}
                value={custom ? "custom" : String(length)}
                onChange={(e) => e.target.value !== "custom" && update(product.id, { length: Number(e.target.value) })}
              >
                {lengths.map((l) => (
                  <option key={l} value={l}>
                    {formatNumber(l)} м
                  </option>
                ))}
                {custom && <option value="custom">{formatNumber(length)} м, резка</option>}
              </select>
              <ChevronDown className={s.chevron} aria-hidden="true" />
            </span>
          </label>
        ) : (
          <p className={s.param}>
            <span>{isCoil(product) ? "Поставка" : "Размер"}</span>
            <strong>{isCoil(product) ? "бухта" : product.length}</strong>
          </p>
        )}

        <div className={s.param}>
          <label htmlFor={qtyId}>{isCoil(product) ? "Метров" : forms[2][0].toUpperCase() + forms[2].slice(1)}</label>
          <div className={s.stepper}>
            <button type="button" onClick={() => setQty(item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Меньше">
              <Minus aria-hidden="true" />
            </button>
            <input
              id={qtyId}
              className={s.qty}
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_QTY}
              value={item.quantity}
              onChange={(e) => setQty(Number(e.target.value))}
              aria-describedby={`${qtyId}-unit`}
            />
            <button type="button" onClick={() => setQty(item.quantity + 1)} aria-label="Больше">
              <Plus aria-hidden="true" />
            </button>
          </div>
          <span id={`${qtyId}-unit`} className="visually-hidden">
            {plural(item.quantity, forms)}
          </span>
        </div>
      </div>

      <p className={s.sum}>
        <strong className="t-nums">{formatPrice(priceRub)}</strong>
        <span className="t-nums">{formatWeight(weightKg)}</span>
      </p>

      <button type="button" className={s.remove} onClick={() => remove(product.id)} aria-label={`Убрать «${product.name}» из списка`}>
        <X aria-hidden="true" />
      </button>

      <input
        className={s.comment}
        type="text"
        value={item.comment ?? ""}
        onChange={(e) => update(product.id, { comment: e.target.value })}
        placeholder="Комментарий: резка по 3 м, можно замену марки…"
        aria-label={`Комментарий к позиции «${product.name}»`}
        maxLength={200}
      />
    </li>
  );
}
