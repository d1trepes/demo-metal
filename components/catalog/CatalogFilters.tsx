import Link from "next/link";
import { Checkbox } from "@/components/ui/Field";
import { cx } from "@/lib/cx";
import type { Facet } from "@/lib/catalog";
import s from "./CatalogFilters.module.css";

export type CategoryLink = { slug: string; name: string; count: number };

export type FilterState = { q: string; grades: string[]; gosts: string[]; sizes: string[]; inStockOnly: boolean };

type Props = {
  categories: CategoryLink[];
  activeCategory?: string;
  facets: { grades: Facet[]; gosts: Facet[]; sizes: Facet[] };
  value: FilterState;
  onChange: (value: FilterState) => void;
  /** Есть активные фильтры — показываем «Сбросить». */
  onReset?: () => void;
};

/** Колонка фильтров: категория (ссылками), наличие, размер (внутри категории), марка, ГОСТ. */
export function CatalogFilters({ categories, activeCategory, facets, value, onChange, onReset }: Props) {
  const toggle = (key: "grades" | "gosts" | "sizes", item: string) =>
    onChange({ ...value, [key]: value[key].includes(item) ? value[key].filter((v) => v !== item) : [...value[key], item] });

  return (
    <div className={s.filters}>
      <section className={s.group}>
        <h2 className={s.title}>Категория</h2>
        <ul className={s.cats}>
          <li>
            <Link href="/catalog/" className={cx(s.cat, !activeCategory && s.catActive)} aria-current={!activeCategory ? "page" : undefined}>
              Все позиции
              <span>{categories.reduce((n, c) => n + c.count, 0)}</span>
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/catalog/${c.slug}/`}
                className={cx(s.cat, c.slug === activeCategory && s.catActive)}
                aria-current={c.slug === activeCategory ? "page" : undefined}
              >
                {c.name}
                <span>{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.group}>
        <h2 className={s.title}>Наличие</h2>
        <Checkbox checked={value.inStockOnly} onChange={(e) => onChange({ ...value, inStockOnly: e.target.checked })}>
          Только в наличии на складе
        </Checkbox>
      </section>

      {facets.sizes.length > 0 && (
        <section className={s.group}>
          <h2 className={s.title}>Размер</h2>
          <div className={s.chips}>
            {facets.sizes.map((f) => (
              <button
                key={f.value}
                type="button"
                className={s.chip}
                aria-pressed={value.sizes.includes(f.value)}
                onClick={() => toggle("sizes", f.value)}
              >
                {f.value}
              </button>
            ))}
          </div>
        </section>
      )}

      <FacetGroup title="Марка стали" items={facets.grades} selected={value.grades} onToggle={(v) => toggle("grades", v)} />
      <FacetGroup title="ГОСТ" items={facets.gosts} selected={value.gosts} onToggle={(v) => toggle("gosts", v)} />

      {onReset && (
        <button type="button" className={s.reset} onClick={onReset}>
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}

function FacetGroup({ title, items, selected, onToggle }: { title: string; items: Facet[]; selected: string[]; onToggle: (v: string) => void }) {
  if (items.length < 2) return null; // один вариант — фильтровать нечем
  return (
    <section className={s.group}>
      <h2 className={s.title}>{title}</h2>
      <ul className={s.checks}>
        {items.map((f) => (
          <li key={f.value}>
            <Checkbox checked={selected.includes(f.value)} onChange={() => onToggle(f.value)}>
              {f.value} <span className={s.count}>{f.count}</span>
            </Checkbox>
          </li>
        ))}
      </ul>
    </section>
  );
}
