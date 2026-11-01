"use client";

import { Search } from "lucide-react";
import { cx } from "@/lib/cx";
import type { DeliveryZone, GeoRegion } from "./globeData";
import s from "./GeoSection.module.css";

type Props = {
  zones: DeliveryZone[];
  /** null — список ещё грузится. */
  regions: GeoRegion[] | null;
  /** Регион в карточке: наведённый на карте или выбранный. */
  shown: GeoRegion | undefined;
  selected: string;
  zone: number | null;
  query: string;
  onZone: (zone: number | null) => void;
  onQuery: (query: string) => void;
  onPick: (name: string) => void;
};

const norm = (v: string) => v.toLowerCase().replace(/ё/g, "е").trim();

/**
 * Панель карты (чат 5д): карточка региона → поиск по региону или городу → зоны-фильтры → список.
 * Выбор строки поворачивает шар к региону. Регионы без регулярных отгрузок находятся поиском («по запросу»).
 */
export function ShippingPanel({ zones, regions, shown, selected, zone, query, onZone, onQuery, onPick }: Props) {
  const q = norm(query);
  // Без поиска — регионы с отгрузками по зонам (ближние сверху); поиском находятся и регионы «по запросу»
  const list = (regions ?? [])
    .filter((r) => (q ? norm(`${r.name} ${r.cities}`).includes(q) : r.zone !== 0 && (zone === null || r.zone === zone)))
    .sort((a, b) => (a.zone || 9) - (b.zone || 9));
  const shownZone = zones.find((z) => z.zone === shown?.zone);

  return (
    <div className={s.panel}>
      <div className={s.card} role="status">
        <p className={cx("t-label", s.cardLabel)}>Срок до региона</p>
        <p className={s.cardName}>{shown?.name ?? "Свердловская область"}</p>
        <p className={s.cardTerm}>
          {shownZone ? (
            <>
              <b>{shownZone.term}</b> · {shownZone.method}
            </>
          ) : (
            <>
              <b>По запросу</b> · ТК или ж/д, срок считаем под заказ
            </>
          )}
        </p>
      </div>

      <label className={s.search}>
        <Search size={18} strokeWidth={1.75} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Город или регион"
          aria-label="Найти город или регион"
        />
      </label>

      <div className={s.zoneTabs} role="group" aria-label="Зоны доставки">
        {zones.map((z) => (
          <button
            key={z.zone}
            type="button"
            className={s.zoneTab}
            aria-pressed={zone === z.zone && !q}
            onClick={() => onZone(zone === z.zone ? null : z.zone)}
          >
            <span className={cx(s.swatch, s[`swatch${z.zone}`])} aria-hidden="true" />
            <b>{z.term}</b>
          </button>
        ))}
      </div>

      <ul className={s.list} aria-label="Регионы">
        {regions === null && <li className={s.empty}>Загружаем регионы…</li>}
        {regions !== null && list.length === 0 && (
          <li className={s.empty}>Не нашли. Укажите город в заявке — посчитаем доставку.</li>
        )}
        {list.map((r) => (
          <li key={r.name}>
            <button
              type="button"
              className={s.row}
              aria-current={r.name === selected || undefined}
              onClick={() => onPick(r.name)}
            >
              <span className={cx(s.swatch, s[`swatch${r.zone}`])} aria-hidden="true" />
              <span className={s.rowName}>
                {r.name}
                {r.cities && r.cities !== r.name && <span>{r.cities}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
