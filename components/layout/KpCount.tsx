"use client";
import { useKpStore } from "@/lib/stores/kp";
import { useHydrated } from "@/lib/stores/useHydrated";
import s from "./KpCount.module.css";

/** Число позиций в списке КП рядом с пунктом шапки. Пустой список — ничего не показываем. */
export function KpCount() {
  const hydrated = useHydrated();
  const count = useKpStore((st) => st.items.length);
  if (!hydrated || count === 0) return null;
  return (
    <span className={s.count} aria-label={`позиций: ${count}`}>
      {count}
    </span>
  );
}
