"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Search } from "lucide-react";
import { getSearchSuggestions } from "@/lib/api";
import { asset } from "@/lib/asset";
import { highlightParts } from "@/lib/catalog";
import { cx } from "@/lib/cx";
import { formatPrice, plural } from "@/lib/format";
import type { SearchSuggestions } from "@/lib/types";
import { isSearchPinned, useMobileSearch } from "./SearchToggle";
import s from "./HeaderSearch.module.css";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 150;

/** Совпадения запроса — жирным. */
function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((part, i) =>
        part.hit ? <b key={i}>{part.text}</b> : part.text,
      )}
    </>
  );
}

/**
 * Поиск по каталогу в шапке с выпадающими подсказками (чат 6б).
 * С 2 символов: категории с числом позиций, до 6 позиций и строка «Все результаты» на /catalog/?q=….
 * ↑↓ — выбор, Enter — перейти (без выбора — обычная отправка формы), Esc и клик мимо — закрыть.
 * Без JS остаётся обычной GET-формой. Цвета поля — из переменных шапки (--field-*),
 * выпадашка всегда белая, чтобы читаться и на видео hero. На телефоне — во всю ширину под шапкой.
 */
export function HeaderSearch({
  className,
  id = "header-search",
}: {
  className?: string;
  id?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<SearchSuggestions | null>(null);
  const [active, setActive] = useState(-1);
  const [mobileTop, setMobileTop] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Телефон: вне главной и каталога строка поиска свёрнута до лупы (SearchToggle)
  const collapsible = !isSearchPinned(pathname);
  const expanded = useMobileSearch((st) => st.open);
  const setExpanded = useMobileSearch((st) => st.setOpen);
  useEffect(() => {
    if (expanded && collapsible) inputRef.current?.focus();
  }, [expanded, collapsible]);

  const trimmed = query.trim();
  const ready = trimmed.length >= MIN_CHARS;
  const allHref = `/catalog/?q=${encodeURIComponent(trimmed)}`;

  // Плоский список пунктов для стрелок: категории → позиции → «Все результаты»
  const options = data
    ? [
        ...data.categories.map(
          (c) => `/catalog/${c.slug}/?q=${encodeURIComponent(trimmed)}`,
        ),
        ...data.products.map((p) => `/product/${p.slug}/`),
        ...(data.total > 0 ? [allHref] : []),
      ]
    : [];
  const optionId = (i: number) => `${listId}-${i}`;

  // Запрос подсказок с паузой; устаревшие ответы отбрасываем
  useEffect(() => {
    if (!ready) {
      setData(null);
      return;
    }
    const request = ++requestRef.current;
    const timer = setTimeout(async () => {
      const result = await getSearchSuggestions(trimmed);
      if (request === requestRef.current) {
        setData(result);
        setActive(-1);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmed, ready]);

  // Клик мимо — закрыть
  useEffect(() => {
    if (!open && !expanded) return;
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      const inside =
        formRef.current?.contains(target) || dropdownRef.current?.contains(target);
      if (!inside) setOpen(false);
      // Свёрнутый поиск закрываем тапом мимо шапки (лупа сама переключает)
      if (!inside && !(target as Element).closest?.("header")) setExpanded(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, expanded, setExpanded]);

  // Переход на другую страницу — закрыть
  useEffect(() => {
    setOpen(false);
    setExpanded(false);
  }, [pathname, setExpanded]);

  // Телефон: выпадашка от нижнего края шапки до низа экрана
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const header = formRef.current?.closest("header");
      setMobileTop(
        window.matchMedia("(max-width: 640px)").matches && header
          ? header.getBoundingClientRect().bottom
          : null,
      );
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { passive: true });
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place);
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    setExpanded(false);
    router.push(href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setExpanded(false);
      setActive(-1);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!options.length) return;
      e.preventDefault();
      setOpen(true);
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => {
        const next = i + delta;
        return next >= options.length
          ? 0
          : next < 0
            ? options.length - 1
            : next;
      });
      return;
    }
    if (e.key === "Enter" && open && active >= 0 && options[active]) {
      e.preventDefault();
      go(options[active]);
    }
  };

  const shown = open && ready && data !== null;
  let index = -1;
  const optionProps = (href: string, extra?: string) => {
    index += 1;
    const i = index;
    return {
      id: optionId(i),
      role: "option" as const,
      "aria-selected": active === i,
      className: cx(s.option, extra, active === i && s.active),
      href,
      onMouseEnter: () => setActive(i),
      onClick: () => setOpen(false),
    };
  };

  // Телефон: порталом в body — у предков шапки есть backdrop-filter/transform, они ломают position: fixed
  const dropdown = (
    <div
      ref={dropdownRef}
      id={listId}
      role="listbox"
      aria-label="Подсказки поиска"
      className={cx(s.dropdown, mobileTop !== null && s.mobile)}
      hidden={!shown}
      style={mobileTop !== null ? { top: mobileTop } : undefined}
    >
      {data && data.total === 0 && (
        <p className={s.empty}>
          Ничего не нашли по «{trimmed}».{" "}
          <Link href="/#calc" onClick={() => setOpen(false)}>
            Пришлите спецификацию
          </Link>{" "}
          — подберём замену из наличия.
        </p>
      )}

      {data && data.categories.length > 0 && (
        <div role="group" aria-label="Категории" className={s.group}>
          <p className={s.groupTitle} aria-hidden="true">
            Категории
          </p>
          {data.categories.map((c) => (
            <Link
              key={c.slug}
              {...optionProps(
                `/catalog/${c.slug}/?q=${encodeURIComponent(trimmed)}`,
              )}
            >
              <span className={s.name}>
                <Highlight text={c.name} query={trimmed} />
              </span>
              <span className={s.muted}>
                {c.count} {plural(c.count, ["позиция", "позиции", "позиций"])}
              </span>
            </Link>
          ))}
        </div>
      )}

      {data && data.products.length > 0 && (
        <div role="group" aria-label="Позиции" className={s.group}>
          <p className={s.groupTitle} aria-hidden="true">
            Позиции
          </p>
          {data.products.map((p) => (
            <Link key={p.id} {...optionProps(`/product/${p.slug}/`, s.product)}>
              <span className={s.name}>
                <Highlight text={p.name} query={trimmed} />
              </span>
              <span className={s.muted}>
                <Highlight text={p.steelGrade} query={trimmed} />
              </span>
              <span className={s.price}>{formatPrice(p.pricePerTon, "т")}</span>
              <span className={p.inStock ? s.inStock : s.onOrder}>
                {p.inStock ? "В наличии" : "Под заказ"}
              </span>
            </Link>
          ))}
        </div>
      )}

      {data && data.total > 0 && (
        <Link {...optionProps(allHref, s.all)}>
          <span>
            Все результаты по «{trimmed}» — {data.total}{" "}
            {plural(data.total, ["позиция", "позиции", "позиций"])}
          </span>
          <ArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );

  return (
    <form
      ref={formRef}
      className={cx(
        s.search,
        shown && s.open,
        collapsible && s.collapsible,
        collapsible && expanded && s.expanded,
        className,
      )}
      action={asset("/catalog/")}
      method="get"
      role="search"
      onSubmit={(e) => {
        if (!ready) return;
        e.preventDefault();
        go(allHref);
      }}
    >
      <label htmlFor={id} className="visually-hidden">
        Поиск по каталогу
      </label>
      <Search className={s.icon} aria-hidden="true" />
      <input
        ref={inputRef}
        id={id}
        name="q"
        type="search"
        className={s.input}
        placeholder="Арматура 12, балка 20Б1"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={shown}
        aria-controls={listId}
        aria-activedescendant={
          shown && active >= 0 ? optionId(active) : undefined
        }
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <button type="submit" className={s.submit}>
        <span className="caps-center">Найти</span>
      </button>

      {mobileTop !== null ? createPortal(dropdown, document.body) : dropdown}
    </form>
  );
}
