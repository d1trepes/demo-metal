"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type PointerEvent, type RefObject } from "react";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";
import { MoveHorizontal } from "lucide-react";
import { cx } from "@/lib/cx";
import { GLOBE_VIEW, type DeliveryZone, type GeoData, type GeoRegion } from "./globeData";
import s from "./GeoSection.module.css";

export type View = { lon: number; lat: number };
/** Управление шаром снаружи (поиск в панели): плавный поворот к виду. */
export type GlobeApi = { flyTo: (view: View) => void };
type RegionFeature = Feature<Geometry, { name: string; zone: GeoRegion["zone"] }>;

const { width: W, height: H, radius: R, top: TOP, latMin, latMax } = GLOBE_VIEW;
const CX = W / 2;
const CY = TOP + R;
/** Градусов поворота на единицу кадра при перетаскивании (≈ на высоте склада). */
const DEG_PER_UNIT = 180 / (Math.PI * R * 0.72);
const DRAG_THRESHOLD = 5;
const FLY_MS = 700;
const TIP_W = 280;
const GRATICULE = geoGraticule10();

type Props = {
  data: GeoData;
  zones: DeliveryZone[];
  initialView: View;
  apiRef: RefObject<GlobeApi | null>;
  /** Регион, показанный в метке (наведённый или выбранный). */
  shown: GeoRegion | undefined;
  /** Зона, выбранная над картой: остальные приглушаются. */
  zone: number | null;
  onHover: (name: string | null) => void;
  onPick: (name: string) => void;
};

/**
 * Карта «Горизонт» (чаты 5д, 5е). Пути регионов рендерит React один раз; при повороте `d`, точки и метка
 * обновляются напрямую через refs не чаще раза за кадр (requestAnimationFrame). React-состояние — только выбор/наведение.
 * Во время перетаскивания дуги и точки скрыты (плавно возвращаются после отпускания), hover и transition отключены.
 * Мышью — тянуть в любую сторону; пальцем — по горизонтали (вертикальный жест — прокрутка страницы).
 */
export function GlobeMap({ data, zones, initialView, apiRef, shown, zone, onHover, onPick }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<SVGPathElement>(null);
  const gratRef = useRef<SVGPathElement>(null);
  const landRef = useRef<SVGPathElement>(null);
  const regionRefs = useRef<(SVGPathElement | null)[]>([]);
  const arcRefs = useRef<(SVGGElement | null)[]>([]);
  const cityRefs = useRef<(SVGCircleElement | null)[]>([]);
  const homeRef = useRef<SVGCircleElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const view = useRef<View>(initialView);
  const frame = useRef(0);
  const fly = useRef(0);
  const box = useRef({ scale: 1, offX: 0, offY: 0, w: W });
  const drag = useRef<{ x: number; y: number; view: View; moved: boolean; target: string | null } | null>(null);
  const shownRef = useRef(shown);

  const { regions, land, arcCities } = useMemo(() => {
    const t = data.topo;
    return {
      regions: (feature(t, t.objects.regions) as unknown as { features: RegionFeature[] }).features,
      land: feature(t, t.objects.land),
      arcCities: data.cities.filter((c) => c.arc),
    };
  }, [data]);

  const projection = useMemo(
    () =>
      geoOrthographic()
        .scale(R)
        .translate([CX, CY])
        .clipAngle(90)
        .clipExtent([
          [0, 0],
          [W, H],
        ])
        .precision(0), // без адаптивной пересборки: при R 1700 шаг исходных точек и так мельче пикселя
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  /** Метка: только позиция (transform) и сторона плашки — без React. */
  const placeTip = useCallback(() => {
    const tip = tipRef.current;
    const r = shownRef.current;
    if (!tip) return;
    const center: [number, number] = [view.current.lon, view.current.lat];
    const p = r && geoDistance([r.lon, r.lat], center) < Math.PI / 2 - 0.02 ? projection([r.lon, r.lat]) : null;
    const inFrame = p && p[0] > 24 && p[0] < W - 24 && p[1] > 80 && p[1] < H - 8;
    tip.hidden = !inFrame;
    if (!p || !inFrame) return;
    const { scale, offX, offY, w } = box.current;
    const x = offX + p[0] * scale;
    tip.style.transform = `translate(${x.toFixed(1)}px, ${(offY + p[1] * scale).toFixed(1)}px)`;
    tip.classList.toggle(s.tipFlip, x > w - TIP_W);
  }, [projection]);

  /** Дуги, точки городов и склад — после отпускания и при подлёте, но не во время перетаскивания. */
  const drawMarks = useCallback(() => {
    const center: [number, number] = [view.current.lon, view.current.lat];
    const visible = (lon: number, lat: number) => geoDistance([lon, lat], center) < Math.PI / 2 - 0.02;
    const wh: [number, number] = [data.warehouse.lon, data.warehouse.lat];
    const homeOn = visible(...wh);
    arcCities.forEach((c, i) => {
      const g = arcRefs.current[i];
      if (!g) return;
      const on = homeOn && visible(c.lon, c.lat);
      g.style.display = on ? "" : "none";
      if (!on) return;
      const d = arcPath(projection, wh, [c.lon, c.lat]);
      for (const el of Array.from(g.children)) el.setAttribute("d", d);
    });
    data.cities.forEach((c, i) => {
      const el = cityRefs.current[i];
      if (!el) return;
      const on = visible(c.lon, c.lat);
      el.style.display = on ? "" : "none";
      if (!on) return;
      const [x, y] = projection([c.lon, c.lat]) ?? [0, 0];
      el.setAttribute("cx", x.toFixed(1));
      el.setAttribute("cy", y.toFixed(1));
    });
    const home = homeRef.current;
    const hp = projection(wh);
    if (home) {
      home.style.display = homeOn && hp ? "" : "none";
      if (hp) {
        home.setAttribute("cx", hp[0].toFixed(1));
        home.setAttribute("cy", hp[1].toFixed(1));
      }
    }
  }, [arcCities, data, projection]);

  /** Один кадр: поворот проекции и пересчёт `d` всех контуров. */
  const draw = useCallback(() => {
    frame.current = 0;
    projection.rotate([-view.current.lon, -view.current.lat]);
    sphereRef.current?.setAttribute("d", path({ type: "Sphere" }) ?? "");
    gratRef.current?.setAttribute("d", path(GRATICULE) ?? "");
    landRef.current?.setAttribute("d", path(land) ?? "");
    regions.forEach((f, i) => regionRefs.current[i]?.setAttribute("d", path(f) ?? ""));
    if (!drag.current?.moved) drawMarks();
    placeTip();
  }, [drawMarks, land, path, placeTip, projection, regions]);

  const requestDraw = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(draw);
  }, [draw]);

  const setView = useCallback(
    (v: View) => {
      view.current = v;
      requestDraw();
    },
    [requestDraw],
  );

  // Первый кадр — до показа, чтобы не мигнуть пустой картой
  useLayoutEffect(() => {
    draw();
  }, [draw]);

  // Метка следует за выбором/наведением сразу, без ожидания кадра
  useLayoutEffect(() => {
    shownRef.current = shown;
    placeTip();
  }, [shown, placeTip]);

  // Масштаб кадра: SVG вписан «cover» по низу (xMidYMax slice)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      const scale = Math.max(w / W, h / H);
      box.current = { scale, offX: (w - W * scale) / 2, offY: h - H * scale, w };
      placeTip();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [placeTip]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      cancelAnimationFrame(fly.current);
    },
    [],
  );

  // Плавный поворот к виду (при reduced-motion — сразу)
  useEffect(() => {
    apiRef.current = {
      flyTo(to) {
        cancelAnimationFrame(fly.current);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setView(to);
          return;
        }
        const from = view.current;
        const dLon = ((to.lon - from.lon + 540) % 360) - 180; // короткой дорогой
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / FLY_MS);
          const e = 1 - Math.pow(1 - t, 3);
          setView({ lon: from.lon + dLon * e, lat: from.lat + (to.lat - from.lat) * e });
          if (t < 1) fly.current = requestAnimationFrame(step);
        };
        fly.current = requestAnimationFrame(step);
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, setView]);

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      view: view.current,
      moved: false,
      target: (e.target as SVGElement).dataset.name ?? null,
    };
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) {
      if (e.pointerType === "mouse") onHover((e.target as SVGElement).dataset.name ?? null);
      return;
    }
    const { scale } = box.current;
    const dx = (e.clientX - d.x) / scale;
    const dy = (e.clientY - d.y) / scale;
    if (!d.moved) {
      if (Math.hypot(dx, dy) * scale < DRAG_THRESHOLD) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      boxRef.current?.setAttribute("data-dragging", "");
      cancelAnimationFrame(fly.current);
      onHover(null);
    }
    const lat = e.pointerType === "mouse" ? d.view.lat + dy * DEG_PER_UNIT : d.view.lat;
    setView({ lon: d.view.lon - dx * DEG_PER_UNIT, lat: Math.min(latMax, Math.max(latMin, lat)) });
  };
  const endDrag = (pick: boolean) => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      boxRef.current?.removeAttribute("data-dragging");
      drawMarks(); // дуги и точки — на новое место, затем плавно проявляются
    }
    if (pick && d && !d.moved && d.target) onPick(d.target);
  };

  const shownZone = zones.find((z) => z.zone === shown?.zone);

  return (
    <div ref={boxRef} className={s.globe}>
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
        <path ref={sphereRef} className={s.sphere} />
        <path ref={gratRef} className={s.graticule} />
        <path ref={landRef} className={s.land} />
        {regions.map((f, i) => {
          const z = f.properties.zone;
          return (
            <path
              key={i}
              ref={(el) => {
                regionRefs.current[i] = el;
              }}
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
        <g className={s.marks}>
          <g className={s.arcs}>
            {arcCities.map((c, i) => (
              <g
                key={c.name}
                ref={(el) => {
                  arcRefs.current[i] = el;
                }}
              >
                <path className={s.arcHalo} />
                <path className={s.arc} />
              </g>
            ))}
          </g>
          {data.cities.map((c, i) => (
            <circle
              key={c.name}
              ref={(el) => {
                cityRefs.current[i] = el;
              }}
              r={4.5}
              className={s.city}
            />
          ))}
          <circle ref={homeRef} r={9} className={s.home} />
        </g>
      </svg>

      {shown && (
        <div ref={tipRef} className={s.tip} aria-hidden="true" hidden>
          <span className={s.tipLabel}>
            <b>{shown.name}</b>
            <span>{shownZone ? `${shownZone.term} · ${shownZone.method}` : "по запросу"}</span>
          </span>
        </div>
      )}

      <p className={cx("t-small", s.hint)}>
        <MoveHorizontal size={16} strokeWidth={1.75} aria-hidden="true" />
        Потяните, чтобы повернуть
      </p>
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
