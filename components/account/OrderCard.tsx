"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ORDER_STATUS, ORDER_STEPS, formatDate, formatShortDate } from "@/lib/account";
import { asset } from "@/lib/asset";
import { calcItem, pieceForms } from "@/lib/calc";
import { formatNumber, formatPrice, formatWeight, plural } from "@/lib/format";
import { useKpStore } from "@/lib/stores/kp";
import type { DocumentFile, KpItem, Order, Product } from "@/lib/types";
import s from "./Account.module.css";

const NB = " ";

/** Этапы заказа строкой (телефон — столбиком): пройденные с датой, текущий отмечен. */
export function OrderTimeline({ order }: { order: Order }) {
  const current = ORDER_STEPS.findIndex((st) => st.status === order.status);
  return (
    <ol className={s.timeline} aria-label="Этапы заказа">
      {ORDER_STEPS.map((step, i) => {
        const date = order.timeline[step.status];
        return (
          <li key={step.status} className={i <= current ? s.timelineDone : undefined} aria-current={i === current ? "step" : undefined}>
            <span className={s.timelineTitle}>{step.title}</span>
            <span className={s.timelineDate}>{date ? formatShortDate(date) : i === current + 1 ? "далее" : "—"}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** «Повторить»: те же позиции и длины — в список КП, переход на /kp/. */
export function useRepeatItems() {
  const add = useKpStore((st) => st.add);
  const router = useRouter();
  return (items: KpItem[], label: string) => {
    items.forEach((item, i) => add({ productId: item.productId, quantity: item.quantity, length: item.length }, i === items.length - 1 ? label : undefined));
    router.push("/kp/");
  };
}

type Props = { order: Order; products: Map<string, Product> | null; documents: DocumentFile[]; compact?: boolean };

/** Заказ: номер, сумма и адрес, этапы; в полном виде — позиции и кнопки «Повторить заказ», документы. */
export function OrderCard({ order, products, documents, compact }: Props) {
  const repeat = useRepeatItems();
  const status = ORDER_STATUS[order.status];
  const docs = documents.filter((d) => d.orderId === order.id);

  return (
    <article className={s.order} aria-labelledby={`order-${order.id}`}>
      <header className={s.orderHead}>
        <div>
          <h3 id={`order-${order.id}`} className={s.orderId}>
            Заказ {order.id}
          </h3>
          <p className={s.meta}>
            от{NB}{formatDate(order.createdAt)} · {order.items.length}{NB}
            {plural(order.items.length, ["позиция", "позиции", "позиций"])} · {formatWeight(order.totalWeightKg)}
          </p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
        <p className={s.orderSum}>{formatPrice(order.totalRub)}</p>
      </header>

      <OrderTimeline order={order} />

      {!compact && (
        <>
          <ul className={s.items}>
            {order.items.map((item) => {
              const p = products?.get(item.productId);
              const calc = p ? calcItem(p, item) : null;
              return (
                <li key={item.productId}>
                  <span className={s.itemName}>{p ? p.name : "…"}</span>
                  <span className={s.itemQty}>
                    {p &&
                      `${formatNumber(item.quantity, 0)}${NB}${plural(item.quantity, pieceForms(p))}${item.length ? ` по${NB}${formatNumber(item.length, 1)}${NB}м` : ""}`}
                  </span>
                  <span className={s.itemWeight}>{calc ? formatWeight(calc.weightKg) : ""}</span>
                </li>
              );
            })}
          </ul>
          <p className={s.meta}>Доставка: {order.delivery}</p>
        </>
      )}

      <div className={s.orderActions}>
        {compact ? (
          <Link href="/account/orders/" className={s.actionLink}>
            Состав и{NB}документы
          </Link>
        ) : (
          <>
            <Button size="sm" onClick={() => repeat(order.items, `Заказ ${order.id}: ${order.items.length} ${plural(order.items.length, ["позиция", "позиции", "позиций"])}`)}>
              Повторить заказ
            </Button>
            {docs.map((d) => (
              <a key={d.id} href={asset(d.url)} download className={s.docLink}>
                <FileDown aria-hidden="true" />
                <span>{d.title}</span>
              </a>
            ))}
          </>
        )}
      </div>
    </article>
  );
}
