import { Search } from "lucide-react";
import { asset } from "@/lib/asset";
import { cx } from "@/lib/cx";
import s from "./HeaderSearch.module.css";

/**
 * Поиск по каталогу в шапке. Обычная GET-форма на /catalog/?q=… — работает без JS;
 * страница каталога (чат 6) читает q и фильтрует.
 * Цвета берёт из переменных шапки (--field-*), поэтому одинаково живёт на белом и на видео.
 */
export function HeaderSearch({ className, id = "header-search" }: { className?: string; id?: string }) {
  return (
    <form className={cx(s.search, className)} action={asset("/catalog/")} method="get" role="search">
      <label htmlFor={id} className="visually-hidden">
        Поиск по каталогу
      </label>
      <Search className={s.icon} aria-hidden="true" />
      <input
        id={id}
        name="q"
        type="search"
        className={s.input}
        placeholder="Арматура 12 А500С, балка 20Б1"
        autoComplete="off"
      />
      <button type="submit" className={s.submit}>
        <span className="caps-center">Найти</span>
      </button>
    </form>
  );
}
