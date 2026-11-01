"use client";

import { FileDown } from "lucide-react";
import { KP_STEPS } from "@/components/kp/KpSteps";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { KP_STATUS, formatDate } from "@/lib/account";
import { asset } from "@/lib/asset";
import { formatPrice, formatWeight, plural } from "@/lib/format";
import type { KpRequestSummary } from "@/lib/types";
import { useRepeatItems } from "./OrderCard";
import s from "./Account.module.css";

const NB = " ";
/** Образец PDF для готового КП (в бою url придёт с сервера в документах). */
const KP_PDF = "/docs/kp-sample.pdf";

/** Запрос КП строкой: номер и дата · позиции и масса · сумма · статус с полосой 4 шагов · действие. */
export function KpRequestRow({ request }: { request: KpRequestSummary }) {
  const repeat = useRepeatItems();
  const status = KP_STATUS[request.status];
  const step = KP_STEPS.findIndex((st) => st.status === request.status);

  return (
    <li className={s.request}>
      <div className={s.requestId}>
        <span className={s.orderId}>{request.id}</span>
        <span className={s.meta}>от{NB}{formatDate(request.createdAt)}</span>
      </div>
      <div className={`${s.meta} ${s.requestMeta}`}>
        {request.itemsCount}{NB}{plural(request.itemsCount, ["позиция", "позиции", "позиций"])} · {formatWeight(request.totalWeightKg)}
      </div>
      <div className={s.requestSum}>{request.totalRub ? formatPrice(request.totalRub) : <span className={s.meta}>сумма в{NB}КП</span>}</div>
      <div className={s.requestStatus}>
        <Badge tone={status.tone}>{status.label}</Badge>
        <span className={s.progress} aria-label={`Шаг ${step + 1} из ${KP_STEPS.length}`}>
          {KP_STEPS.map((st, i) => (
            <i key={st.status} className={i <= step ? s.progressDone : undefined} />
          ))}
        </span>
      </div>
      <div className={s.requestAction}>
        {request.status === "kp-ready" || request.status === "invoiced" ? (
          <a href={asset(KP_PDF)} download className={s.docLink}>
            <FileDown aria-hidden="true" />
            <span>КП в{NB}PDF</span>
          </a>
        ) : request.items?.length ? (
          <Button size="sm" variant="ghost" onClick={() => repeat(request.items ?? [], `Запрос ${request.id} снова в списке КП`)}>
            Повторить
          </Button>
        ) : null}
      </div>
    </li>
  );
}
