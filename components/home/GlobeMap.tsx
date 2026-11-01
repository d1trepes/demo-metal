"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { asset } from "@/lib/asset";
import { cx } from "@/lib/cx";
import type { DeliveryZone, GlobeData } from "./globeData";
import s from "./GeoSection.module.css";

type Hover = { name: string; zone: DeliveryZone; x: number; y: number; flip: boolean } | null;

/**
 * Глобус отгрузок (чат 5б). Ракурс фиксированный, без вращения: контуры посчитаны при сборке
 * (scripts/build-globe.mjs → public/globe/globe.json), браузер только рисует SVG — без canvas, WebGL и d3.
 *
 * Сначала стоит заглушка globe-static.webp того же вида (она же — вид без JS). JSON (~90 КБ, gzip ~30)
 * грузится, когда блок подходит к экрану (за 400 px), интерактивный слой проявляется поверх.
 * Hover по региону — срок и способ доставки. Дуги прорисовываются один раз (выключено при reduced-motion).
 */
export function GlobeMap({ zones }: { zones: DeliveryZone[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<GlobeData | null>(null);
  const [hover, setHover] = useState<Hover>(null);

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

  const onMove = (event: MouseEvent<SVGSVGElement>) => {
    const target = event.target as SVGElement;
    const zoneNum = Number(target.dataset.zone);
    const zone = zones.find((z) => z.zone === zoneNum);
    if (!zone || !ref.current) {
      if (hover) setHover(null);
      return;
    }
    const box = ref.current.getBoundingClientRect();
    const x = event.clientX - box.left;
    // в правой половине подсказка уходит влево от курсора, чтобы не вылезать за край экрана
    setHover({ name: target.dataset.name ?? "", zone, x, y: event.clientY - box.top, flip: x > box.width / 2 });
  };

  return (
    <div ref={ref} className={s.globe} data-ready={data ? "" : undefined}>
      <img
        src={asset("/globe/globe-static.webp")}
        alt="Глобус: склад в Екатеринбурге и зоны доставки по России, Казахстану, Беларуси и Средней Азии"
        width={1200}
        height={1200}
        loading="lazy"
        decoding="async"
        className={s.still}
      />

      {data && (
        <svg
          className={s.map}
          viewBox={`0 0 ${data.size} ${data.size}`}
          aria-hidden="true"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <path d={data.sphere} className={s.sphere} />
          <path d={data.graticule} className={s.graticule} />
          <path d={data.land} className={s.land} />
          {data.regions.map((r) => (
            <path
              key={r.id}
              d={r.d}
              className={cx(s.region, s[`zone${r.zone}`], hover?.name === r.name && s.regionOn)}
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
          {data.arcs.map((a) => (
            <circle key={a.name} cx={a.x} cy={a.y} r={4} className={s.city} />
          ))}
          <circle cx={data.warehouse.x} cy={data.warehouse.y} r={8} className={s.home} />
        </svg>
      )}

      {hover && (
        <div className={cx(s.tip, hover.flip && s.tipFlip)} style={{ left: hover.x, top: hover.y }} role="status">
          <b>{hover.name}</b>
          <span>
            {hover.zone.term} · {hover.zone.method}
          </span>
        </div>
      )}
    </div>
  );
}
