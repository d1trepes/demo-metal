"use client";

import { useEffect, useRef, useState } from "react";
import { asset, srcSet } from "@/lib/asset";
import { GlobeMap, type GlobeApi, type View } from "./GlobeMap";
import { ShippingPanel } from "./ShippingPanel";
import { GLOBE_VIEW, viewFor, type DeliveryZone, type GeoData } from "./globeData";
import s from "./GeoSection.module.css";

const WAREHOUSE = { lon: 60.6, lat: 56.84 };
const WIDE = "(min-width: 1025px)";

/** Куда по ширине кадра ставить выбранный регион: чуть правее центра на широком экране (метка уходит вправо), по центру на узком. */
function targetX() {
  const wide = typeof window !== "undefined" && window.matchMedia(WIDE).matches;
  return GLOBE_VIEW.width * (wide ? GLOBE_VIEW.targetXWide : 0.5);
}

/**
 * Карта отгрузок «Горизонт» (чаты 5д, 5е): над картой строка «поиск + зоны», карта на всю ширину контейнера.
 * До загрузки geo.json (~80 КБ, за 400 px до блока) стоит заглушка globe-static.webp того же вида.
 */
export function ShippingMap({ zones }: { zones: DeliveryZone[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const globe = useRef<GlobeApi | null>(null);
  const [data, setData] = useState<GeoData | null>(null);
  const [initialView, setInitialView] = useState<View | null>(null);
  const [selected, setSelected] = useState("Свердловская область");
  const [hovered, setHovered] = useState<string | null>(null);
  const [zone, setZone] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        fetch(asset("/globe/geo.json"))
          .then((r) => (r.ok ? r.json() : null))
          .then((json: GeoData | null) => {
            if (cancelled || !json) return;
            setInitialView(viewFor(WAREHOUSE.lon, WAREHOUSE.lat, targetX()));
            setData(json);
          })
          .catch(() => {}); // нет данных — остаётся картинка того же вида
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  const pick = (name: string) => {
    const region = data?.regions.find((r) => r.name === name);
    if (!region) return;
    setSelected(name);
    setZone(null); // иначе найденный регион может оказаться приглушённым
    globe.current?.flyTo(viewFor(region.lon, region.lat, targetX()));
  };

  const shown = data?.regions.find((r) => r.name === (hovered ?? selected));
  const chosen = data?.regions.find((r) => r.name === selected);
  const chosenZone = zones.find((z) => z.zone === chosen?.zone);

  return (
    <div ref={ref} className={s.stage}>
      <ShippingPanel zones={zones} regions={data?.regions ?? null} zone={zone} onZone={setZone} onPick={pick} />

      {/* На узком экране метка скрыта — срок выбранного региона строкой под поиском */}
      <p className={s.result} role="status">
        {chosen && (
          <>
            <b>{chosen.name}</b> — {chosenZone ? `${chosenZone.term}, ${chosenZone.method}` : "по запросу, ТК или ж/д"}
          </>
        )}
      </p>

      <div className={s.mapBox}>
        {/* eslint-disable-next-line @next/next/no-img-element -- статичный экспорт, картинка уже оптимизирована */}
        <img
          src={asset("/globe/globe-static.webp")}
          srcSet={srcSet("/globe/globe-static.webp", 1300)}
          sizes="(max-width: 1024px) 160vw, 1370px"
          alt="Карта: склад в Екатеринбурге и зоны доставки по России, Казахстану, Беларуси и Средней Азии"
          width={1300}
          height={700}
          loading="lazy"
          decoding="async"
          className={s.still}
          data-hidden={data ? "" : undefined}
        />
        {data && initialView && (
          <GlobeMap
            data={data}
            zones={zones}
            initialView={initialView}
            apiRef={globe}
            shown={shown}
            zone={zone}
            onHover={setHovered}
            onPick={(name) => {
              setSelected(name);
              setHovered(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
