"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { Grid } from "@/components/layout/Grid";
import { cx } from "@/lib/cx";
import type { DeliveryZone, GeoRegion } from "./globeData";
import s from "./GeoSection.module.css";

type Props = {
  zones: DeliveryZone[];
  /** null — регионы ещё грузятся. */
  regions: GeoRegion[] | null;
  zone: number | null;
  onZone: (zone: number | null) => void;
  onPick: (name: string) => void;
};

const MAX_OPTIONS = 6;
const norm = (v: string) => v.toLowerCase().replace(/ё/g, "е").trim();

/**
 * Строка над картой (чат 5е): поиск-комбобокс (колонки 1–4) и три зоны-фильтра справа от него.
 * Выбор в списке поворачивает шар к региону; срок показывает метка на карте (на узком экране — строка под поиском).
 */
export function ShippingPanel({ zones, regions, zone, onZone, onPick }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const q = norm(query);
  const options = q
    ? (regions ?? [])
        .filter((r) => norm(`${r.name} ${r.cities}`).includes(q))
        .sort((a, b) => (a.zone || 9) - (b.zone || 9))
        .slice(0, MAX_OPTIONS)
    : [];
  const expanded = open && q.length > 0;
  const termOf = (r: GeoRegion) => zones.find((z) => z.zone === r.zone)?.term ?? "по запросу";

  const choose = (r: GeoRegion) => {
    setQuery(r.name);
    setOpen(false);
    onPick(r.name);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!expanded) return setOpen(true);
      if (!options.length) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + options.length) % options.length);
    } else if (e.key === "Enter" && expanded && options[active]) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === "Escape") {
      if (expanded) setOpen(false);
      else setQuery("");
    }
  };

  return (
    <Grid className={s.controls}>
      <div className={s.searchBox}>
        <label className={s.search}>
          <Search size={18} strokeWidth={1.75} aria-hidden="true" />
          <input
            type="text"
            role="combobox"
            aria-expanded={expanded}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={expanded && options[active] ? `${listId}-${active}` : undefined}
            aria-label="Найти город или регион"
            placeholder="Город или регион"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
          />
        </label>

        <ul id={listId} role="listbox" aria-label="Регионы" className={s.options} hidden={!expanded}>
          {regions === null && <li className={s.optionEmpty}>Загружаем регионы…</li>}
          {regions !== null && options.length === 0 && (
            <li className={s.optionEmpty}>По запросу — укажите город в заявке</li>
          )}
          {options.map((r, i) => (
            <li
              key={r.name}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={s.option}
              onMouseDown={(e) => e.preventDefault()} // не терять фокус поля до выбора
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(r)}
            >
              <span className={cx(s.swatch, s[`swatch${r.zone}`])} aria-hidden="true" />
              <b>{r.name}</b>
              <span className={s.optionMeta}>
                {r.cities && r.cities !== r.name ? `${r.cities} · ` : ""}
                {termOf(r)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={s.zoneTabs} role="group" aria-label="Зоны доставки">
        {zones.map((z) => (
          <button
            key={z.zone}
            type="button"
            className={s.zoneTab}
            aria-pressed={zone === z.zone}
            onClick={() => onZone(zone === z.zone ? null : z.zone)}
          >
            <span className={cx(s.swatch, s[`swatch${z.zone}`])} aria-hidden="true" />
            <b>{z.term}</b>
          </button>
        ))}
      </div>
    </Grid>
  );
}
