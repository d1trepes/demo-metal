"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { accountNav } from "@/lib/account";
import { useAuthStore } from "@/lib/stores/auth";
import { useHydrated } from "@/lib/stores/useHydrated";
import s from "./Account.module.css";

/**
 * Оболочка кабинета. Без входа — редирект на /login/?next=<раздел>.
 * Вход живёт в localStorage, поэтому до гидратации рисуем пустую заглушку (статичный HTML без данных).
 */
export function AccountShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const user = useAuthStore((st) => st.user);
  const signOut = useAuthStore((st) => st.signOut);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !user) router.replace(`/login/?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, pathname, router]);

  if (!hydrated || !user) return <Container className={s.page} aria-busy="true" />;

  const current = accountNav.find((item) => item.href === pathname || item.href === `${pathname}/`) ?? accountNav[0];

  async function onSignOut() {
    await signOut();
    router.replace("/login/");
  }

  return (
    <Container className={s.page}>
      <Grid className={s.head}>
        <Col area="head">
          <Breadcrumbs
            items={[
              { href: "/", label: "Главная" },
              ...(current.href === "/account/" ? [] : [{ href: "/account/", label: "Личный кабинет" }]),
              { label: current.href === "/account/" ? "Личный кабинет" : current.label },
            ]}
          />
          <h1 className="t-h1">{current.href === "/account/" ? "Личный кабинет" : current.label}</h1>
        </Col>
        <Col area="aside">
          <dl className={s.who}>
            <div>
              <dt>Компания</dt>
              <dd>{user.company.name}</dd>
            </div>
            <div>
              <dt>ИНН</dt>
              <dd className="t-nums">{user.company.inn}</dd>
            </div>
            <div>
              <dt>Закупщик</dt>
              <dd>{user.name}</dd>
            </div>
          </dl>
          <button type="button" className={s.signOut} onClick={onSignOut}>
            Выйти
          </button>
        </Col>
      </Grid>

      <nav className={s.tabs} aria-label="Разделы кабинета">
        <ul>
          {accountNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={item.href === current.href ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {children}
    </Container>
  );
}
