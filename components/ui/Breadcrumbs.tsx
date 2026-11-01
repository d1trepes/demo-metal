import Link from "next/link";
import s from "./Breadcrumbs.module.css";

export type Crumb = { href?: string; label: string };

/** Хлебные крошки над заголовком страницы. Последний пункт — текущая страница, без ссылки. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Навигация по разделам" className={s.crumbs}>
      <ol>
        {items.map((item, i) => (
          <li key={item.label}>
            {item.href && i < items.length - 1 ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
