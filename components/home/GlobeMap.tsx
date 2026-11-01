"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";
import { cx } from "@/lib/cx";
import { GLOBE_VIEW, type DeliveryZone, type GeoData, type GeoRegion } from "./globeData";
import s from "./GeoSection.module.css";

type View = { lon: number; lat: number };
type RegionFeature = Feature<Geometry, { name: string; zone: GeoRegion["zone"] }>;

const { width: W, height: H, radius: R, top: TOP, latMin, latMax } = GLOBE_VIEW;
const CX = W / 2;
const CY = TOP + R;
/** Градусов поворота на единицу кадра при перетаскивании (≈ на высоте склада). */
const DEG_PER_UNIT = 180 / (Math.PI * R * 0.72);
const DRAG_THRESHOLD = 5;

type Props = {
  data: GeoData;
  zones: DeliveryZone[];
  view: View;
  onViewChange: (view: View) => void;
  /** Начало перетаскивания — родитель останавливает «подлёт». */
  onDragStart: () => void;
  /** Регион, показанный в метке (наведённый или выбранный). */
  shown: GeoRegion | undefined;
  /** Зона, выбранная в панели: остальные приглушаются. */
  zone: number | null;
  onHover: (name: string | null) => void;
  onPick: (name: string) => void;
};

/**
 * Карта «Горизонт» (чат 5д): верх шара, проекция считается в браузере при каждом повороте.
 * Мышью — тянуть в любую сторону; пальцем — по горизонтали (вертикальный жест остаётся прокруткой страницы).
 * Клик/тап по региону — выбрать. Метка — только если центр региона на видимой стороне и в кадре.
 */
export function GlobeMap({ data, zones, view, onViewChange, onDragStart, shown, zone, onHover, onPick }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; view: View; moved: boolean; target: string | null } | null>(null);
  const [box, setBox] = useState({ w: W, h: H });
  const [dragging, setDragging] = useState(false);

  const { regions, land } = useMemo(() => {
    const t = data.topo;
    return {
      regions: (feature(t, t.objects.regions) as unknown as { features: RegionFeature[] }).features,
      land: feature(t, t.objects.land),
    };
  }, [data.topo]);

  // Размер кадра: SVG вписан «cover» по низу (xMidYMax slice) — нужен масштаб для метки и перетаскивания
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = Math.max(box.w / W, box.h / H);
  const offX = (box.w - W * scale) / 2;
  const offY = box.h - H * scale;

  const projection = geoOrthographic()
    .rotate([-view.lon, -view.lat])
    .scale(R)
    .translate([CX, CY])
    .clipAngle(90)
    .clipExtent([[0, 0], [W, H]])
    .precision(0.5);
  const path = geoPath(projection);
  const center: [number, number] = [view.lon, view.lat];
  const visible = (lon: number, lat: number) => geoDistance([lon, lat], center) < Math.PI / 2 - 0.02;

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, view, moved: false, target: (e.target as SVGElement).dataset.name ?? null };
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) {
      if (e.pointerType === "mouse") onHover((e.target as SVGElement).dataset.name ?? null);
      return;
    }
    const dx = (e.clientX - d.x) / scale;
    const dy = (e.clientY - d.y) / scale;
    if (!d.moved) {
      if (Math.hypot(dx, dy) * scale < DRAG_THRESHOLD) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      onDragStart();
      onHover(null);
    }
    const lat = e.pointerType === "mouse" ? d.view.lat + dy * DEG_PER_UNIT : d.view.lat;
    onViewChange({ lon: d.view.lon - dx * DEG_PER_UNIT, lat: Math.min(latMax, Math.max(latMin, lat)) });
  };
  const endDrag = (pick: boolean) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (pick && d && !d.moved && d.target) onPick(d.target);
  };

  const home = projection([data.warehouse.lon, data.warehouse.lat]);
  const shownZone = zones.find((z) => z.zone === shown?.zone);
  const tipPoint = shown && visible(shown.lon, shown.lat) ? projection([shown.lon, shown.lat]) : null;
  const tipInFrame = tipPoint && tipPoint[0] > 24 && tipPoint[0] < W - 24 && tipPoint[1] > 80 && tipPoint[1] < H - 8;
  const tipX = tipPoint ? offX + tipPoint[0] * scale : 0;
  /** На узком экране метку не показываем: срок уже в карточке панели над картой, плашка не влезает. */
  const tipWide = box.w >= 640;
  const TIP_W = 280;

  return (
    <div ref={boxRef} className={s.globe} data-dragging={dragging ? "" : undefined}>
      <svg
        className={s.map}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => endDrag(true)}
        onPointerCancel={() => endDrag(false)}
        onPointerLeave={(e) => e.pointerType === "mouse" && !drag.current && onHover(null)}
      >
        <path d={path({ type: "Sphere" }) ?? ""} className={s.sphere} />
        <path d={path(geoGraticule10()) ?? ""} className={s.graticule} />
        <path d={path(land) ?? ""} className={s.land} />
        {regions.map((f, i) => {
          const z = f.properties.zone;
          return (
            <path
              key={i}
              d={path(f) ?? ""}
              className={cx(
                s.region,
                s[`zone${z}`],
                zone !== null && z !== zone && s.regionDim,
                f.properties.name === shown?.name && s.regionOn,
              )}
              data-name={f.properties.name}
            />
          );
        })}
        <g className={s.arcs}>
          {data.cities
            .filter((c) => c.arc && visible(c.lon, c.lat) && visible(data.warehouse.lon, data.warehouse.lat))
            .map((c) => {
              const d = arcPath(projection, [data.warehouse.lon, data.warehouse.lat], [c.lon, c.lat]);
              return (
                <g key={c.name}>
                  <path d={d} className={s.arcHalo} />
                  <path d={d} className={s.arc} />
                </g>
              );
            })}
        </g>
        {data.cities
          .filter((c) => visible(c.lon, c.lat))
          .map((c) => {
            const [x, y] = projection([c.lon, c.lat]) ?? [0, 0];
            return <circle key={c.name} cx={x} cy={y} r={4.5} className={s.city} />;
          })}
        {home && visible(data.warehouse.lon, data.warehouse.lat) && (
          <circle cx={home[0]} cy={home[1]} r={9} className={s.home} />
        )}
      </svg>

      {tipPoint && tipInFrame && tipWide && shown && (
        <div
          className={cx(s.tip, tipX > box.w - TIP_W && s.tipFlip)}
          style={{ left: tipX, top: offY + tipPoint[1] * scale }}
          aria-hidden="true"
        >
          <span className={s.tipLabel}>
            <b>{shown.name}</b>
            <span>{shownZone ? `${shownZone.term} · ${shownZone.method}` : "по запросу"}</span>
          </span>
        </div>
      )}

      <p className={cx("t-small", s.hint)}>Карту можно повернуть</p>
    </div>
  );
}

/** Дуга склад → город: большой круг, приподнятый над шаром (чем дальше город, тем выше). */
function arcPath(
  projection: (p: [number, number]) => [number, number] | null,
  from: [number, number],
  to: [number, number],
): string {
  const interp = geoInterpolate(from, to);
  const h0 = 0.006 + Math.hypot(to[0] - from[0], to[1] - from[1]) * 0.0004;
  const pts: string[] = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const p = projection(interp(t) as [number, number]);
    if (!p) continue;
    const k = 1 + h0 * Math.sin(Math.PI * t);
    pts.push(`${(CX + (p[0] - CX) * k).toFixed(1)},${(CY + (p[1] - CY) * k).toFixed(1)}`);
  }
  return `M${pts.join("L")}`;
}
