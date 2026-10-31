import Link from "next/link";
import { ClipboardList, UserRound } from "lucide-react";
import { company, mainNav } from "@/lib/nav";
import { cx } from "@/lib/cx";
import { Container } from "./Grid";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import s from "./Header.module.css";

type HeaderProps = {
  /** solid — белая липкая шапка страниц; glass — внутри стеклянной панели hero. */
  variant?: "solid" | "glass";
};

export function Header({ variant = "solid" }: HeaderProps) {
  const bar = (
    <div className={s.bar}>
      <Logo />

      <nav className={s.nav} aria-label="Основное меню">
        {mainNav.map((item) => (
          <Link key={item.href} href={item.href} className={s.pill}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={s.actions}>
        <a href={company.phoneHref} className={cx(s.phone, "t-nums")}>
          {company.phone}
        </a>
        <Link href="/kp/" className={cx(s.pill, s.iconPill)}>
          <ClipboardList aria-hidden="true" />
          <span className={s.hideMd}>Список КП</span>
          <span className="visually-hidden">— запрос коммерческого предложения</span>
        </Link>
        <Link href="/account/" className={cx(s.pill, s.iconPill)} aria-label="Личный кабинет">
          <UserRound aria-hidden="true" />
        </Link>
        <MobileMenu />
      </div>
    </div>
  );

  if (variant === "glass") {
    return <header className={cx(s.header, s.glass)}>{bar}</header>;
  }
  return (
    <header className={cx(s.header, s.solid)}>
      <Container>{bar}</Container>
    </header>
  );
}
