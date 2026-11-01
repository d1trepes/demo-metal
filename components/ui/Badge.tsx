import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import s from "./Badge.module.css";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "ink";

/** Бейдж статуса: «В наличии», «Под заказ», «Отгружен». Цвет — только из токенов состояний. */
export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  // Заглавные Condensed центрируем по высоте прописных, как в кнопках (.caps-center)
  return (
    <span className={cx(s.badge, s[tone], className)}>
      <span className="caps-center">{children}</span>
    </span>
  );
}
