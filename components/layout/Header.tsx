import Link from "next/link";
import { ClipboardList, Phone, UserRound } from "lucide-react";
import { mainNav } from "@/lib/nav";
import { cx } from "@/lib/cx";
import { Button } from "@/components/ui/Button";
import { Container } from "./Grid";
import { HeaderSearch } from "./HeaderSearch";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import s from "./Header.module.css";

type HeaderProps = {
  /** solid — белая липкая шапка страниц; glass — внутри стеклянной панели hero. */
  variant?: "solid" | "glass";
};

/**
 * Шапка: логотип · меню · поиск по каталогу · Список КП · кабинет · «Заказать звонок».
 * Телефон номером не показываем — вместо него акцентная кнопка (решение чата 2б).
 */
export function Header({ variant = "solid" }: HeaderProps) {
  const glass = variant === "glass";

  const bar = (
    <div className={s.bar}>
      <Logo className={s.logo} />

      <nav className={s.nav} aria-label="Основное меню">
        {mainNav.map((item) => (
          <Link key={item.href} href={item.href} className={s.pill}>
            {item.label}
          </Link>
        ))}
      </nav>

      <HeaderSearch className={s.search} id={glass ? "hero-search" : "header-search"} />

      <div className={s.actions}>
        <Link href="/kp/" className={cx(s.pill, s.iconPill)}>
          <ClipboardList aria-hidden="true" />
          <span className={s.hideMd}>Список КП</span>
          <span className="visually-hidden">— запрос коммерческого предложения</span>
        </Link>
        <Link href="/account/" className={cx(s.pill, s.iconPill, s.account)} aria-label="Личный кабинет">
          <UserRound aria-hidden="true" />
        </Link>
        <Button href="/contacts/#callback" variant={glass ? "onInk" : "primary"} size="sm" className={s.call}>
          <Phone aria-hidden="true" className={s.callIcon} />
          <span className={cx(s.callText, "caps-center")}>Заказать звонок</span>
        </Button>
        <MobileMenu />
      </div>
    </div>
  );

  return (
    <header className={cx(s.header, glass ? s.glass : s.solid)}>{glass ? bar : <Container>{bar}</Container>}</header>
  );
}
