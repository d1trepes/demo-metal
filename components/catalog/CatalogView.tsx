"use client";
import { LayoutGrid, Rows3, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import { facet, filterProducts } from "@/lib/catalog";
import { plural } from "@/lib/format";
import type { Product, ProductSort } from "@/lib/types";
import { CatalogFilters, type CategoryLink, type FilterState } from "./CatalogFilters";
import { ProductTable } from "./ProductTable";
import { ProductTile } from "./ProductTile";
import s from "./CatalogView.module.css";

type View = "tiles" | "table";

type Props = {
  /** Все позиции страницы (на странице категории — только её). Загружены при сборке через getProducts(). */
  products: Product[];
  categories: CategoryLink[];
  /** slug категории на /catalog/<slug>/; на /catalog/ — нет. */
  activeCategory?: string;
};

const EMPTY: FilterState = { q: "", grades: [], gosts: [], sizes: [], inStockOnly: false };

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "default", label: "По размеру" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
  { value: "name", label: "По названию" },
];

/**
 * Каталог: фильтры слева (на планшете и телефоне — панель по кнопке), сверху поиск, сортировка, вид.
 * Фильтрует уже загруженный список в браузере (lib/catalog.ts) — без задержки на каждый щелчок.
 * Состояние фильтров повторяется в адресе (?q=…&grade=…&view=table), ссылкой можно поделиться.
 */
export function CatalogView({ products, categories, activeCategory }: Props) {
  const [filter, setFilter] = useState<FilterState>(EMPTY);
  const [sort, setSort] = useState<ProductSort>("default");
  const [view, setView] = useState<View>("tiles");
  const [panelOpen, setPanelOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Начальное состояние из адреса (поиск в шапке ведёт на /catalog/?q=…)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const list = (key: string) => params.getAll(key).filter(Boolean);
    setFilter({ q: params.get("q") ?? "", grades: list("grade"), gosts: list("gost"), sizes: list("size"), inStockOnly: params.get("stock") === "1" });
    setSort((params.get("sort") as ProductSort) || "default");
    setView(params.get("view") === "table" ? "table" : "tiles");
    setReady(true);
  }, []);

  // Состояние → адрес (без перезагрузки и без записи в историю)
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (filter.q) params.set("q", filter.q);
    filter.grades.forEach((v) => params.append("grade", v));
    filter.gosts.forEach((v) => params.append("gost", v));
    filter.sizes.forEach((v) => params.append("size", v));
    if (filter.inStockOnly) params.set("stock", "1");
    if (sort !== "default") params.set("sort", sort);
    if (view === "table") params.set("view", "table");
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [filter, sort, view, ready]);

  // Закрыть панель фильтров по Esc
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanelOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  const facets = useMemo(
    () => ({
      grades: facet(products, "steelGrade"),
      gosts: facet(products, "gost"),
      sizes: activeCategory ? products.map((p) => ({ value: p.size.label, count: 1 })) : [],
    }),
    [products, activeCategory],
  );

  const result = useMemo(() => {
    const list = filterProducts(products, {
      q: filter.q,
      steelGrades: filter.grades,
      gosts: filter.gosts,
      inStockOnly: filter.inStockOnly,
      sort,
    });
    return filter.sizes.length ? list.filter((p) => filter.sizes.includes(p.size.label)) : list;
  }, [products, filter, sort]);

  const categoryNames = useMemo(() => new Map(categories.map((c) => [c.slug, c.name])), [categories]);
  const activeCount = filter.grades.length + filter.gosts.length + filter.sizes.length + Number(filter.inStockOnly);
  const reset = () => setFilter({ ...EMPTY, q: filter.q });
  const count = `${result.length} ${plural(result.length, ["позиция", "позиции", "позиций"])}`;

  return (
    <div className={s.layout}>
      <aside className={cx(s.aside, panelOpen && s.asideOpen)} aria-label="Фильтры">
        <div className={s.panelHead}>
          <p className="t-h3">Фильтры</p>
          <button type="button" className={s.close} onClick={() => setPanelOpen(false)} aria-label="Закрыть фильтры">
            <X aria-hidden="true" />
          </button>
        </div>
        <CatalogFilters
          categories={categories}
          activeCategory={activeCategory}
          facets={facets}
          value={filter}
          onChange={setFilter}
          onReset={activeCount ? reset : undefined}
        />
        <div className={s.panelFoot}>
          <Button block onClick={() => setPanelOpen(false)}>
            Показать {count}
          </Button>
        </div>
      </aside>

      <div className={s.results}>
        <div className={s.toolbar}>
          <label className={s.search}>
            <Search aria-hidden="true" />
            <span className="visually-hidden">Поиск по позициям</span>
            <input
              type="search"
              value={filter.q}
              onChange={(e) => setFilter({ ...filter, q: e.target.value })}
              placeholder="Размер, марка, ГОСТ: 40×40, 09Г2С, 8509"
              enterKeyHint="search"
            />
          </label>
          <button type="button" className={s.filtersBtn} onClick={() => setPanelOpen(true)} aria-expanded={panelOpen}>
            <SlidersHorizontal aria-hidden="true" />
            Фильтры{activeCount ? ` · ${activeCount}` : ""}
          </button>
          <p className={s.count} aria-live="polite">
            {count}
          </p>
          <label className={s.sort}>
            <span className="visually-hidden">Сортировка</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as ProductSort)}>
              {SORTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className={s.views} role="group" aria-label="Вид списка">
            <button type="button" aria-pressed={view === "tiles"} onClick={() => setView("tiles")} title="Плитка">
              <LayoutGrid aria-hidden="true" />
              <span className="visually-hidden">Плитка</span>
            </button>
            <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")} title="Таблица">
              <Rows3 aria-hidden="true" />
              <span className="visually-hidden">Таблица</span>
            </button>
          </div>
        </div>

        {result.length === 0 ? (
          <div className={s.empty}>
            <p className="t-h3">Ничего не нашли</p>
            <p className="t-muted">
              На складе более 1 800 позиций, на сайте — ходовые. Пришлите спецификацию: подберём аналог или привезём под заказ за 5–7 дней.
            </p>
            <div className={s.emptyActions}>
              <Button variant="secondary" onClick={() => setFilter(EMPTY)}>
                Сбросить фильтры
              </Button>
              <Button href="/#calc">Отправить спецификацию</Button>
            </div>
          </div>
        ) : view === "tiles" ? (
          <ul className={s.tiles}>
            {result.map((p, i) => (
              <li key={p.id}>
                <ProductTile product={p} categoryName={categoryNames.get(p.category) ?? ""} eager={i < 8} />
              </li>
            ))}
          </ul>
        ) : (
          <ProductTable products={result} />
        )}
        <p className={s.note}>
          Цены с НДС за тонну при отгрузке со склада в Екатеринбурге. Окончательная цена — в КП: зависит от объёма, резки и доставки.
        </p>
      </div>
      {panelOpen && <div className={s.backdrop} onClick={() => setPanelOpen(false)} aria-hidden="true" />}
    </div>
  );
}
