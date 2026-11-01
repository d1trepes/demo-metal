"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { asset } from "@/lib/asset";
import { cx } from "@/lib/cx";
import type { DeliveryZone, GlobeData } from "./globeData";
import s from "./GeoSection.module.css";

type Region = GlobeData["regions"][number];

/**
 * Карта отгрузок (чат 5г). Фрагмент шара крупно: от Минска до Красноярска; края кадра растворяются в фон
 * CSS-маской, так что рамки-квадрата не видно.
 * Контуры посчитаны при сборке (scripts/build-globe.mjs → public/globe/globe.json), браузер только рисует SVG.
 *
 * Сначала стоит заглушка globe-static.webp того же вида (она же — вид без JS). JSON (~36 КБ) грузится,
 * когда блок подходит к экрану (за 400 px), интерактивный слой проявляется поверх.
 * Метка всегда видна: по умолчанию — регион склада; при наведении плавно переезжает к центру региона,
 * при уходе курсора с карты возвращается. Дуги прорисовываются один раз (выключено при reduced-motion).
 */
export function GlobeMap({ zones }: { zones: DeliveryZone[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<GlobeData | null>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        fetch(asset("/globe/globe.json"))
          .then((r) => (r.ok ? r.json() : null))
          .then((json: GlobeData | null) => {
            if (!cancelled && json) setData(json);
          })
          .catch(() => {}); // нет данных — остаётся картинка, она того же вида
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  /** Регион с зоной доставки под курсором; над морем и «пустыми» регионами метка остаётся, где была. */
  const onMove = (event: MouseEvent<SVGSVGElement>) => {
    const { zone, name } = (event.target as SVGElement).dataset;
    if (zone && name && name !== active) setActive(name);
  };

  const name = active ?? data?.defaultRegion;
  const region: Region | undefined = data?.regions.find((r) => r.name === name);
  const zone = zones.find((z) => z.zone === region?.zone);

  return (
    <div ref={ref} className={s.globe} data-ready={data ? "" : undefined}>
      <img
        src={asset("/globe/globe-static.webp")}
        alt="Карта: склад в Екатеринбурге и зоны доставки по России, Казахстану, Беларуси и Средней Азии"
        width={1200}
        height={912}
        loading="lazy"
        decoding="async"
        className={s.still}
      />

      {data && (
        <svg
          className={s.map}
          viewBox={`0 0 ${data.width} ${data.height}`}
          aria-hidden="true"
          onMouseMove={onMove}
          onClick={onMove}
          onMouseLeave={() => setActive(null)}
        >
          <path d={data.sphere} className={s.sphere} />
          <path d={data.graticule} className={s.graticule} />
          <path d={data.land} className={s.land} />
          {data.regions.map((r) => (
            <path
              key={r.id}
              d={r.d}
              className={cx(s.region, s[`zone${r.zone}`], r.name === name && s.regionOn)}
              data-zone={r.zone || undefined}
              data-name={r.name}
            />
          ))}
          <g className={s.arcs}>
            {data.arcs.map((a) => (
              <g key={a.name}>
                <path d={a.d} className={s.arcHalo} pathLength={1} />
                <path d={a.d} className={s.arc} pathLength={1} />
              </g>
            ))}
          </g>
          {data.cities.map((c) => (
            <circle key={c.name} cx={c.x} cy={c.y} r={5.5} className={s.city} />
          ))}
          <circle cx={data.warehouse.x} cy={data.warehouse.y} r={10} className={s.home} />
        </svg>
      )}

      {data && region && zone && (
        <div
          className={cx(s.tip, region.cx > data.width * 0.6 && s.tipFlip)}
          style={{ left: `${(region.cx / data.width) * 100}%`, top: `${(region.cy / data.height) * 100}%` }}
          role="status"
        >
          <span className={s.tipLabel}>
            <b>{region.name}</b>
            <span>
              {zone.term} · {zone.method}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
