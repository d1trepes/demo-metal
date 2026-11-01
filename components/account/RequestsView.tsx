"use client";

import { KpSteps } from "@/components/kp/KpSteps";
import { Button } from "@/components/ui/Button";
import { getKpRequests } from "@/lib/api";
import { KpRequestRow } from "./KpRequestRow";
import { useApi } from "./useApi";
import s from "./Account.module.css";

/** Запросы КП: список строками 1–8, справа 9–12 — что значит каждый статус (те же шаги, что на /kp/). */
export function RequestsView() {
  const requests = useApi(getKpRequests);
  if (!requests) return <div className={s.loading} aria-busy="true" />;

  return (
    <div className={s.withAside}>
      <ul className={s.requests}>
        {requests.map((r) => (
          <KpRequestRow key={r.id} request={r} />
        ))}
      </ul>
      <aside className={s.aside}>
        <h2 className="t-h3">Как идёт запрос</h2>
        <KpSteps />
        <Button href="/catalog/" block>
          Новый запрос КП
        </Button>
      </aside>
    </div>
  );
}
