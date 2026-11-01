"use client";

import Link from "next/link";
import { getDocuments, getKpRequests, getOrders } from "@/lib/api";
import { formatNumber, plural } from "@/lib/format";
import { KpRequestRow } from "./KpRequestRow";
import { OrderCard, useRepeatItems } from "./OrderCard";
import { useApi } from "./useApi";
import s from "./Account.module.css";

const NB = " ";

/** Обзор: цифры полосой, заказы в работе, последние запросы КП и быстрые действия. */
export function AccountOverview() {
  const data = useApi(() => Promise.all([getOrders(), getKpRequests(), getDocuments()]));
  const repeat = useRepeatItems();
  if (!data) return <div className={s.loading} aria-busy="true" />;

  const [orders, requests, documents] = data;
  const active = orders.filter((o) => o.status !== "shipped");
  const openRequests = requests.filter((r) => r.status === "sent" || r.status === "in-work");
  const activeTons = active.reduce((sum, o) => sum + o.totalWeightKg, 0) / 1000;
  const lastOrder = orders[0];
  const lastInvoice = documents.find((d) => d.kind === "invoice");

  const stats = [
    { value: String(active.length), label: `${plural(active.length, ["заказ", "заказа", "заказов"])} в${NB}работе` },
    { value: `${formatNumber(activeTons, 1)}${NB}т`, label: "металла к отгрузке" },
    { value: String(openRequests.length), label: `${plural(openRequests.length, ["запрос", "запроса", "запросов"])} КП ждут ответа` },
    { value: String(documents.length), label: `${plural(documents.length, ["документ", "документа", "документов"])} в${NB}PDF` },
  ];

  return (
    <div className={s.sections}>
      <dl className={s.stats}>
        {stats.map((st) => (
          <div key={st.label}>
            <dt>{st.label}</dt>
            <dd>{st.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="active-title">
        <div className={s.sectionHead}>
          <h2 id="active-title" className="t-h2">
            Заказы в работе
          </h2>
          <Link href="/account/orders/" className={s.actionLink}>
            Все заказы · {orders.length}
          </Link>
        </div>
        <div className={s.orders}>
          {active.map((o) => (
            <OrderCard key={o.id} order={o} products={null} documents={documents} compact />
          ))}
        </div>
      </section>

      <div className={s.halves}>
        <section aria-labelledby="req-title">
          <div className={s.sectionHead}>
            <h2 id="req-title" className="t-h2">
              Запросы КП
            </h2>
            <Link href="/account/requests/" className={s.actionLink}>
              Все · {requests.length}
            </Link>
          </div>
          <ul className={s.requests}>
            {requests.slice(0, 3).map((r) => (
              <KpRequestRow key={r.id} request={r} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="quick-title">
          <h2 id="quick-title" className={`t-h2 ${s.sectionTitle}`}>
            Быстрые действия
          </h2>
          <ul className={s.quick}>
            <li>
              <Link href="/catalog/">
                <span className={s.quickTitle}>Новый запрос КП</span>
                <span className={s.meta}>Каталог: 70{NB}позиций, цены за{NB}тонну, калькулятор массы</span>
              </Link>
            </li>
            {lastOrder && (
              <li>
                <button type="button" onClick={() => repeat(lastOrder.items, `Заказ ${lastOrder.id} снова в списке КП`)}>
                  <span className={s.quickTitle}>Повторить заказ {lastOrder.id}</span>
                  <span className={s.meta}>
                    Те же {lastOrder.items.length}{NB}{plural(lastOrder.items.length, ["позиция", "позиции", "позиций"])} и{NB}длины — в{NB}список КП
                  </span>
                </button>
              </li>
            )}
            <li>
              <Link href="/constructions/#drawing">
                <span className={s.quickTitle}>Отправить чертёж</span>
                <span className={s.meta}>Расчёт металлоконструкций по{NB}КМ или эскизу за{NB}1–2{NB}дня</span>
              </Link>
            </li>
            {lastInvoice && (
              <li>
                <Link href="/account/documents/">
                  <span className={s.quickTitle}>{lastInvoice.title}</span>
                  <span className={s.meta}>Скачать PDF для{NB}бухгалтерии</span>
                </Link>
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
