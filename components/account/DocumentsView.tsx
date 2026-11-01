"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Table } from "@/components/ui/Table";
import { DOC_KIND, formatDate } from "@/lib/account";
import { getDocuments } from "@/lib/api";
import { asset } from "@/lib/asset";
import { formatPrice } from "@/lib/format";
import type { DocumentFile, DocumentKind } from "@/lib/types";
import { useApi } from "./useApi";
import s from "./Account.module.css";

const FILTERS: { key: DocumentKind | "all"; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "kp", label: "КП" },
  { key: "invoice", label: "Счета" },
  { key: "upd", label: "УПД" },
];

/** Документы: фильтр по типу и таблица со ссылками на PDF (в демо — образцы из public/docs/). */
export function DocumentsView() {
  const [kind, setKind] = useState<DocumentKind | "all">("all");
  const documents = useApi(getDocuments);
  if (!documents) return <div className={s.loading} aria-busy="true" />;

  const rows = documents.filter((d) => kind === "all" || d.kind === kind);
  return (
    <div className={s.sections}>
      <div className={s.chips} role="group" aria-label="Тип документа">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" aria-pressed={kind === f.key} onClick={() => setKind(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      <Table<DocumentFile>
        caption="Документы"
        rowKey={(d) => d.id}
        rows={rows}
        columns={[
          { key: "kind", title: "Тип", render: (d) => <span className={s.docKind}>{DOC_KIND[d.kind]}</span> },
          { key: "title", title: "Документ", render: (d) => d.title },
          { key: "order", title: "Заказ", render: (d) => d.orderId ?? "—" },
          { key: "date", title: "Дата", render: (d) => formatDate(d.date) },
          { key: "sum", title: "Сумма", numeric: true, render: (d) => formatPrice(d.totalRub) },
          {
            key: "pdf",
            title: "PDF",
            numeric: true,
            render: (d) => (
              <a href={asset(d.url)} download className={s.docLink} aria-label={`Скачать: ${d.title}`}>
                <FileDown aria-hidden="true" />
                <span>Скачать</span>
              </a>
            ),
          },
        ]}
      />
      <p className={s.meta}>Оригиналы с подписью и печатью — в пакете с металлом или через ЭДО (Диадок, СБИС).</p>
    </div>
  );
}
