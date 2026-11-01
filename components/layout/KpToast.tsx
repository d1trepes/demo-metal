"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cx } from "@/lib/cx";
import { useKpStore } from "@/lib/stores/kp";
import s from "./KpToast.module.css";

const SHOW_MS = 4000;

/**
 * Уведомление «Добавлено: … · Открыть список» (чат 6б). Чёрная плашка выезжает из-под нижнего края шапки
 * под кнопкой «Список КП», через 4 с уезжает обратно (наведение — пауза). Телефон — во всю ширину под шапкой.
 * Событие — lastAdded в сторе КП (lib/stores/kp.ts). На главной две шапки — показывает только та, что видна.
 */
export function KpToast() {
  const rootRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastAdded = useKpStore((st) => st.lastAdded);
  const dismiss = useKpStore((st) => st.dismissAdded);
  const [shown, setShown] = useState(false);
  const [right, setRight] = useState(0);

  const schedule = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown(false), SHOW_MS);
  };

  useEffect(() => {
    const root = rootRef.current;
    const header = root?.closest("header");
    if (!lastAdded || !root || !header) return;
    // Скрытая шапка (липкая шапка главной, пока виден hero) не показывает
    if (header.closest("[inert]") || header.getBoundingClientRect().bottom <= 0) return;
    const button = header.querySelector<HTMLElement>("[data-kp-link]");
    if (button) setRight(header.getBoundingClientRect().right - button.getBoundingClientRect().right);
    setShown(true);
    schedule();
    return () => clearTimeout(timer.current);
  }, [lastAdded]);

  const close = () => {
    clearTimeout(timer.current);
    setShown(false);
    dismiss();
  };

  return (
    <div ref={rootRef} className={s.clip} style={{ "--toast-right": `${right}px` } as React.CSSProperties}>
      <div
        className={cx(s.toast, shown && s.shown)}
        role="status"
        aria-live="polite"
        inert={!shown}
        onMouseEnter={() => clearTimeout(timer.current)}
        onMouseLeave={() => shown && schedule()}
      >
        {lastAdded && (
          <>
            <p className={s.text}>
              Добавлено: {lastAdded.label} ·{" "}
              <Link href="/kp/" className={s.link} onClick={close}>
                Открыть список
              </Link>
            </p>
            <button type="button" className={s.close} onClick={close} aria-label="Закрыть уведомление">
              <X aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
