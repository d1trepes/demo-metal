"use client";

import { useEffect, useMemo, useState } from "react";
import { Grid } from "@/components/layout/Grid";
import { Button } from "@/components/ui/Button";
import { asset, srcSet } from "@/lib/asset";
import { getProductsByIds, sendKpRequest } from "@/lib/api";
import { calcTotal } from "@/lib/calc";
import { formatPrice, formatWeight, plural } from "@/lib/format";
import { useAuthStore } from "@/lib/stores/auth";
import { useKpStore } from "@/lib/stores/kp";
import { useHydrated } from "@/lib/stores/useHydrated";
import type { KpItem, KpRequest, KpRequestResult, Product } from "@/lib/types";
import { KpForm } from "./KpForm";
import { KpItemRow } from "./KpItemRow";
import { KpSteps } from "./KpSteps";
import s from "./Kp.module.css";

const NB = " ";
type Sent = { result: KpRequestResult; count: number; weightKg: number; priceRub: number; email: string };

/**
 * Страница «Список для КП»: позиции слева (1–8), сводка с кнопкой отправки справа (9–12, липкая).
 * Список живёт в localStorage (lib/stores/kp.ts), поэтому всё рисуется после гидратации.
 * После отправки список очищается, показываем номер запроса и статусы.
 */
export function KpView() {
  const hydrated = useHydrated();
  const items = useKpStore((st) => st.items);
  const clear = useKpStore((st) => st.clear);
  const user = useAuthStore((st) => st.user);
  const [products, setProducts] = useState<Map<string, Product> | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);

  // Догружаем только те позиции, которых ещё нет (изменение количества не вызывает загрузку)
  const idsKey = items.map((i) => i.productId).join(",");
  useEffect(() => {
    if (!hydrated) return;
    const ids = idsKey ? idsKey.split(",") : [];
    if (products && ids.every((id) => products.has(id))) return;
    let alive = true;
    getProductsByIds(ids).then((list) => alive && setProducts(new Map(list.map((p) => [p.id, p]))));
    return () => {
      alive = false;
    };
  }, [hydrated, idsKey, products]);

  const rows = useMemo(
    () => (products ? items.flatMap((item) => (products.has(item.productId) ? [{ item, product: products.get(item.productId)! }] : [])) : []),
    [items, products],
  );
  const total = useMemo(() => (products ? calcTotal(items, products) : { weightKg: 0, priceRub: 0 }), [items, products]);

  const submit = async (data: Omit<KpRequest, "items">) => {
    setSending(true);
    try {
      const sentItems: KpItem[] = rows.map((r) => r.item);
      const result = await sendKpRequest({ ...data, items: sentItems });
      setSent({ result, count: sentItems.length, ...total, email: data.contact.email });
      clear();
      window.scrollTo({ top: 0 });
    } finally {
      setSending(false);
    }
  };

  if (sent) return <KpSent sent={sent} />;
  if (!hydrated || (items.length > 0 && !products)) return <div className={s.loading} aria-busy="true" />;
  if (rows.length === 0) return <KpEmpty />;

  const count = rows.length;
  return (
    <Grid className={s.layout}>
      <div className={s.main}>
        <div className={s.listHead}>
          <h2 className="t-h3">
            {count} {plural(count, ["позиция", "позиции", "позиций"])}
          </h2>
          <button type="button" className={s.textButton} onClick={clear}>
            Очистить список
          </button>
        </div>
        <ul className={s.list}>
          {rows.map(({ item, product }) => (
            <KpItemRow key={item.productId} item={item} product={product} />
          ))}
        </ul>

        <h2 className={s.formTitle}>Реквизиты и контакты</h2>
        <KpForm key={user?.id ?? "guest"} user={user} onSubmit={submit} />
      </div>

      <aside className={s.summary} aria-label="Итого по запросу">
        <dl className={s.totals}>
          <div>
            <dt>Позиций</dt>
            <dd className="t-nums">{count}</dd>
          </div>
          <div>
            <dt>Масса, теоретическая</dt>
            <dd className="t-nums">{formatWeight(total.weightKg)}</dd>
          </div>
          <div className={s.totalSum}>
            <dt>По ценам сайта, с{NB}НДС</dt>
            <dd className="t-nums">{formatPrice(total.priceRub)}</dd>
          </div>
        </dl>
        <p className={s.summaryNote}>Резку, доставку и{NB}скидку от{NB}объёма менеджер посчитает в{NB}КП.</p>
        <Button type="submit" form="kp-form" block disabled={sending}>
          {sending ? "Отправляем…" : "Запросить КП"}
        </Button>
        <KpSteps className={s.summarySteps} />
      </aside>
    </Grid>
  );
}

function KpEmpty() {
  return (
    <Grid className={s.empty}>
      <img
        src={asset("/pages/empty.webp")}
        srcSet={srcSet("/pages/empty.webp", 1023, [800])}
        sizes="(max-width: 640px) 100vw, 40vw"
        alt=""
        width={1023}
        height={723}
        className={s.emptyArt}
      />
      <div className={s.emptyText}>
        <h2 className="t-h2">Список пуст</h2>
        <p className="t-muted">
          Добавляйте позиции из{NB}каталога кнопкой «В{NB}список КП» — количество и{NB}длину можно поправить здесь. Одним запросом —
          сколько угодно позиций.
        </p>
        <div className={s.emptyActions}>
          <Button href="/catalog/">Открыть каталог</Button>
          <Button href="/#calc" variant="secondary">
            Отправить спецификацию файлом
          </Button>
        </div>
      </div>
    </Grid>
  );
}

function KpSent({ sent }: { sent: Sent }) {
  return (
    <Grid className={s.sent} role="status">
      <div className={s.sentHead}>
        <p className="t-label t-muted">Запрос {sent.result.id}</p>
        <h2 className="t-h2">Запрос отправлен</h2>
        <p className="t-muted">
          {sent.count} {plural(sent.count, ["позиция", "позиции", "позиций"])} · {formatWeight(sent.weightKg)} · {formatPrice(sent.priceRub)} по
          ценам сайта. КП в{NB}PDF придёт на{NB}{sent.email}.
        </p>
        <div className={s.emptyActions}>
          <Button href="/catalog/">Вернуться в каталог</Button>
          <Button href="/account/requests/" variant="secondary">
            Мои запросы
          </Button>
        </div>
      </div>
      <KpSteps current={sent.result.status} className={s.sentSteps} />
    </Grid>
  );
}
