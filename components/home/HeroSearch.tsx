import { Search } from "lucide-react";
import { asset } from "@/lib/asset";
import s from "./Hero.module.css";

/**
 * Поиск по каталогу. Обычная GET-форма на /catalog/?q=… — работает без JS;
 * страница каталога (чат 6) читает q и фильтрует.
 */
export function HeroSearch() {
  return (
    <form className={s.search} action={asset("/catalog/")} method="get" role="search">
      <label htmlFor="hero-search" className="visually-hidden">
        Поиск по каталогу
      </label>
      <Search className={s.searchIcon} aria-hidden="true" />
      <input
        id="hero-search"
        name="q"
        type="search"
        className={s.searchInput}
        placeholder="Арматура 12 А500С, балка 20Б1, лист 10 мм"
        autoComplete="off"
      />
      <button type="submit" className={s.searchSubmit}>
        Найти
      </button>
    </form>
  );
}
