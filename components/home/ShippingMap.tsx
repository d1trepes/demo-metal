"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { GlobeMap } from "./GlobeMap";
import { ShippingPanel } from "./ShippingPanel";
import { GLOBE_VIEW, viewFor, type DeliveryZone, type GeoData } from "./globeData";
import s from "./GeoSection.module.css";

type View = { lon: number; lat: number };

const WAREHOUSE = { lon: 60.6, lat: 56.84 };
const FLY_MS = 700;
const WIDE = "(min-width: 1025px)";

/** Куда по ширине кадра ставить выбранный регион: правее панели на широком экране, по центру на узком. */
function targetX() {
  const wide = typeof window !== "undefined" && window.matchMedia(WIDE).matches;
  return GLOBE_VIEW.width * (wide ? GLOBE_VIEW.targetXWide : 0.5);
}

/**
 * Карта отгрузок «Горизонт» (чат 5д): панель (поиск, зоны, список) + крутящийся шар.
 * До загрузки geo.json (~80 КБ, за 400 px до блока) стоит заглушка globe-static.webp того же вида.
 */
export function ShippingMap({ zones }: { zones: DeliveryZone[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const fly = useRef(0);
  const [data, setData] = useState<GeoData | null>(null);
  const [view, setView] = useState<View>(() => viewFor(WAREHOUSE.lon, WAREHOUSE.lat, GLOBE_VIEW.width * GLOBE_VIEW.targetXWide));
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  const [selected, setSelected] = useState("Свердловская область");
  const [hovered, setHovered] = useState<string | null>(null);
  const [zone, setZone] = useState<number | null>(null);
  const [query, setQuery] = useState("");

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
            setData(json);
            setView(viewFor(WAREHOUSE.lon, WAREHOUSE.lat, targetX())); // на узком экране склад — по центру
          })
          .catch(() => {}); // нет данных — остаётся картинка того же вида
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      cancelAnimationFrame(fly.current);
    };
  }, []);

  /** Плавный поворот к региону (при reduced-motion — сразу). */
  const flyTo = useCallback((to: View) => {
    cancelAnimationFrame(fly.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setView(to);
      return;
    }
    const from = viewRef.current;
    const dLon = ((to.lon - from.lon + 540) % 360) - 180; // короткой дорогой
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / FLY_MS);
      const e = 1 - Math.pow(1 - t, 3);
      setView({ lon: from.lon + dLon * e, lat: from.lat + (to.lat - from.lat) * e });
      if (t < 1) fly.current = requestAnimationFrame(step);
    };
    fly.current = requestAnimationFrame(step);
  }, []);

  const pick = (name: string) => {
    const region = data?.regions.find((r) => r.name === name);
    if (!region) return;
    setSelected(name);
    flyTo(viewFor(region.lon, region.lat, targetX()));
  };
  const pickFromMap = (name: string) => {
    setSelected(name);
    setHovered(null);
  };

  const shownName = hovered ?? selected;
  const shown = data?.regions.find((r) => r.name === shownName);

  return (
    <div ref={ref} className={s.stage}>
      <ShippingPanel
        zones={zones}
        regions={data?.regions ?? null}
        shown={shown}
        selected={selected}
        zone={zone}
        query={query}
        onZone={(z) => {
          setZone(z);
          setQuery("");
        }}
        onQuery={setQuery}
        onPick={pick}
      />
      <div className={s.mapBox}>
        {/* eslint-disable-next-line @next/next/no-img-element -- статичный экспорт, картинка уже оптимизирована */}
        <img
          src={asset("/globe/globe-static.webp")}
          alt="Карта: склад в Екатеринбурге и зоны доставки по России, Казахстану, Беларуси и Средней Азии"
          width={1300}
          height={700}
          loading="lazy"
          decoding="async"
          className={s.still}
          data-hidden={data ? "" : undefined}
        />
        {data && (
          <GlobeMap
            data={data}
            zones={zones}
            view={view}
            onViewChange={setView}
            onDragStart={() => cancelAnimationFrame(fly.current)}
            shown={shown}
            zone={query ? null : zone}
            onHover={setHovered}
            onPick={pickFromMap}
          />
        )}
      </div>
    </div>
  );
}
