"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { company, mainNav } from "@/lib/nav";
import { Button } from "@/components/ui/Button";
import { Container } from "./Grid";
import { Logo } from "./Logo";
import s from "./MobileMenu.module.css";

/** Меню на телефоне и планшете (≤ 1024 px): тёмный экран поверх страницы. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button type="button" className={s.toggle} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
        <Menu aria-hidden="true" />
        <span className="visually-hidden">Открыть меню</span>
      </button>

      {open && (
        <div id="mobile-menu" className={s.sheet} role="dialog" aria-modal="true" aria-label="Меню">
          <Container className={s.inner}>
            <div className={s.top}>
              <Logo />
              <button type="button" className={s.toggle} onClick={close} autoFocus>
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
      )}
    </>
  );
}
