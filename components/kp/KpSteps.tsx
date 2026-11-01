import { cx } from "@/lib/cx";
import type { KpStatus } from "@/lib/types";
import s from "./Kp.module.css";

const NB = " ";

/** Статусы запроса КП (паспорт §5) с тем, что происходит на каждом шаге. Те же статусы — в кабинете. */
export const KP_STEPS: { status: KpStatus; title: string; text: string }[] = [
  { status: "sent", title: "Запрос отправлен", text: `Номер придёт на${NB}почту сразу` },
  { status: "in-work", title: "В работе", text: `Менеджер проверит остатки и${NB}резку — в${NB}течение 2${NB}рабочих часов` },
  { status: "kp-ready", title: "КП готово", text: `PDF на${NB}почту, цены держим 3${NB}рабочих дня` },
  { status: "invoiced", title: "Счёт выставлен", text: `Отгрузка на${NB}следующий день после оплаты` },
];

/** Шаги запроса строками по линиям. current — пройденный статус (на экране «Запрос отправлен» — sent). */
export function KpSteps({ current, className }: { current?: KpStatus; className?: string }) {
  const done = current ? KP_STEPS.findIndex((st) => st.status === current) : -1;
  return (
    <ol className={cx(s.steps, className)}>
      {KP_STEPS.map((step, i) => (
        <li key={step.status} className={cx(i <= done && s.stepDone)} aria-current={i === done ? "step" : undefined}>
          <span className={s.stepNum}>{String(i + 1).padStart(2, "0")}</span>
          <span className={s.stepTitle}>{step.title}</span>
          <span className={s.stepText}>{step.text}</span>
        </li>
      ))}
    </ol>
  );
}
