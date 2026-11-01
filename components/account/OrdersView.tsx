"use client";

import { useState } from "react";
import { getDocuments, getOrders, getProductsByIds } from "@/lib/api";
import type { Product } from "@/lib/types";
import { OrderCard } from "./OrderCard";
import { useApi } from "./useApi";
import s from "./Account.module.css";

const FILTERS = [
  { key: "active", label: "В работе" },
  { key: "shipped", label: "Отгруженные" },
  { key: "all", label: "Все" },
] as const;

/** Заказы: фильтр «в работе / отгруженные / все», заказ целиком — этапы, состав, «Повторить заказ», счета и УПД. */
export function OrdersView() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const data = useApi(async () => {
    const [orders, documents] = await Promise.all([getOrders(), getDocuments()]);
    const ids = [...new Set(orders.flatMap((o) => o.items.map((i) => i.productId)))];
    const products = new Map<string, Product>((await getProductsByIds(ids)).map((p) => [p.id, p]));
    return { orders, documents, products };
  });
  if (!data) return <div className={s.loading} aria-busy="true" />;

  const shown = data.orders.filter((o) => (filter === "all" ? true : filter === "shipped" ? o.status === "shipped" : o.status !== "shipped"));

  return (
    <div className={s.sections}>
      <div className={s.chips} role="group" aria-label="Какие заказы показать">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className={s.orders}>
        {shown.map((o) => (
          <OrderCard key={o.id} order={o} products={data.products} documents={data.documents} />
        ))}
        {shown.length === 0 && <p className={s.meta}>Таких заказов нет.</p>}
      </div>
    </div>
  );
}
