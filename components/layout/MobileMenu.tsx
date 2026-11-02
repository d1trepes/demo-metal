"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Menu, X } from "lucide-react";
import { company, mainNav } from "@/lib/nav";
import { Button } from "@/components/ui/Button";
import { Container } from "./Grid";
import { Logo } from "./Logo";
import { useSwipeToClose } from "./useSwipeToClose";
import s from "./MobileMenu.module.css";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Меню на телефоне и планшете (≤ 1200 px): тёмная панель выезжает справа («дверь купе»),
 * закрывается крестиком, Esc, тапом по затемнению или свайпом вправо.
 * Панель всегда в DOM (закрытая — inert), чтобы закрытие тоже было анимацией.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const panelId = useId(); // на главной две шапки (в hero и липкая) — id должен быть свой у каждой

  const close = () => setOpen(false);
  const swipe = useSwipeToClose(panelRef, close);
  const pathname = usePathname();

  // Перешли по ссылке (в т. ч. по логотипу) — меню закрывается.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) toggleRef.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  /** Фокус не уходит из открытой панели. */
  const trapFocus = (e: ReactKeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={s.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" />
        <span className="visually-hidden">Открыть меню</span>
      </button>

      <div className={s.root} data-open={open} inert={!open}>
        <div className={s.scrim} onClick={close} aria-hidden="true" />
        <div
          ref={panelRef}
          id={panelId}
          className={s.sheet}
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
          onKeyDown={trapFocus}
          {...swipe}
        >
          <Container className={s.inner}>
            <div className={s.top}>
              <Logo />
              <button ref={closeRef} type="button" className={s.toggle} onClick={close}>
                <X aria-hidden="true" />
                <span className="visually-hidden">Закрыть меню</span>
              </button>
            </div>

            <nav aria-label="Основное меню">
              <ul className={s.list}>
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={s.link} onClick={close}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/account/" className={s.link} onClick={close}>
                    Личный кабинет
                  </Link>
                </li>
              </ul>
            </nav>

            <div className={s.bottom}>
              <a href={company.phoneHref} className={s.phone}>
                {company.phone}
              </a>
              <p className={s.muted}>{company.hours}</p>
              <Button href="/kp/" variant="onInk" block>
                Список для КП
              </Button>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}
