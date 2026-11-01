import Link from "next/link";
import { getCategories } from "@/lib/api";
import { company, mainNav } from "@/lib/nav";
import { typo } from "@/lib/typo";
import { Container, Grid } from "./Grid";
import { Logo } from "./Logo";
import s from "./Footer.module.css";

export async function Footer() {
  const categories = await getCategories();

  return (
    <footer className={s.footer}>
      <Container>
        <Grid className={s.top}>
          <div className={s.brand}>
            <Logo />
            <p className={s.muted}>
              {typo(
                "Металлобаза и цех металлоконструкций в Екатеринбурге. Прокат со склада, резка в размер, изготовление по КМ и КМД.",
              )}
            </p>
          </div>

          <nav className={s.colCatalog} aria-label="Каталог">
            <p className={s.colTitle}>Каталог</p>
            <ul className={s.listTwo}>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/catalog/${c.slug}/`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={s.colCompany} aria-label="Компания">
            <p className={s.colTitle}>Компания</p>
            <ul className={s.list}>
              {mainNav.slice(1).map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/account/">Личный кабинет</Link>
              </li>
            </ul>
          </nav>

          <address className={s.colContacts}>
            <p className={s.colTitle}>Связаться</p>
            <a href={company.phoneHref} className={s.phone}>
              {company.phone}
            </a>
            <a href={`mailto:${company.email}`}>{company.email}</a>
            <p className={s.muted}>{typo(company.address)}</p>
            <p className={s.muted}>{company.hours}</p>
          </address>
        </Grid>

        <div className={s.bottom}>
          <p>
            © 2008–2026 {company.legalName}. ИНН {company.inn}
          </p>
          <Link href="/privacy/">Политика обработки персональных данных</Link>
          <p className={s.demo}>Демо-проект студии. Компания и данные вымышлены.</p>
        </div>
      </Container>
    </footer>
  );
}
