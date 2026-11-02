"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type PointerEvent, type RefObject } from "react";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import { presimplify, quantile, simplify } from "topojson-simplify";
import type { Feature, Geometry } from "geojson";
import { Minus, Move, Plus } from "lucide-react";
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
/** Приближение (11г): щипок двумя пальцами или кнопки «+ / −». Колесо мыши листает страницу (чат 10). */
const ZOOM_MIN = 1;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 1.5;
const ZOOM_MS = 280;
const clampZoom = (k: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, k));
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
 * Мышью и пальцем — тянуть в любую сторону (11г: на кадре touch-action: none, страницу листают за поля и панель регионов).
 * Приближение 1×–2,5× — щипком или кнопками; точка приближения — центр видимой части кадра.
 */
export function GlobeMap({ data, zones, initialView, apiRef, shown, zone, onHover, onPick }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
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
  const zoom = useRef(ZOOM_MIN);
  const zoomAnim = useRef(0);
  /** Пальцы на кадре (для щипка) и щипок: расстояние и масштаб в начале. */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist0: number; k0: number } | null>(null);
  const shownRef = useRef(shown);

  /** Упрощённые контуры (половина точек) — рисуются только во время перетаскивания: кадр в ~2 раза дешевле. */
  const coarse = useRef<{ regions: RegionFeature[]; land: ReturnType<typeof feature> } | null>(null);

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
    const k = zoom.current;
    const { scale, offY } = box.current;
    const anchorY = (H - offY / scale) / 2; // центр видимой части кадра (SVG прижат к низу)
    projection
      .scale(R * k)
      .translate([CX, anchorY + (CY - anchorY) * k])
      .rotate([-view.current.lon, -view.current.lat]);
    sphereRef.current?.setAttribute("d", path({ type: "Sphere" }) ?? "");
    gratRef.current?.setAttribute("d", path(GRATICULE) ?? "");
    const rough = drag.current?.moved || pinch.current ? coarse.current : null;
    landRef.current?.setAttribute("d", path(rough?.land ?? land) ?? "");
    (rough?.regions ?? regions).forEach((f, i) => regionRefs.current[i]?.setAttribute("d", path(f) ?? ""));
    if (!drag.current?.moved && !pinch.current) drawMarks();
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

  // Упрощённая топология — в простое браузера после первого кадра (~30 мс), чтобы не тормозить появление карты
  useEffect(() => {
    const build = () => {
      const pre = presimplify(data.topo as Parameters<typeof presimplify>[0]);
      const t = simplify(pre, quantile(pre, 0.5));
      coarse.current = {
        regions: (feature(t, t.objects.regions) as unknown as { features: RegionFeature[] }).features,
        land: feature(t, t.objects.land),
      };
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(build, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = globalThis.setTimeout(build, 300); // Safari без requestIdleCallback
    return () => globalThis.clearTimeout(id);
  }, [data.topo]);

  // Масштаб кадра: SVG вписан «cover» по низу (xMidYMax slice)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      const scale = Math.max(w / W, h / H);
      box.current = { scale, offX: (w - W * scale) / 2, offY: h - H * scale, w };
      if (zoom.current > ZOOM_MIN) requestDraw(); // точка приближения зависит от видимой части кадра
      placeTip();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [placeTip, requestDraw]);

  // Телеграм (и другие webview со «свайпом вниз — закрыть»): touch-action: none им мало —
  // жест по карте явно забираем себе, иначе потянул шар вниз — окно сворачивается (11г).
  // Pointer-события (поворот, щипок, выбор региона по pointerup) при этом работают.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const stop = (e: TouchEvent) => e.cancelable && e.preventDefault();
    el.addEventListener("touchstart", stop, { passive: false });
    el.addEventListener("touchmove", stop, { passive: false });
    return () => {
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("touchmove", stop);
    };
  }, []);

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
          zoom.current = ZOOM_MIN;
          setView(to);
          return;
        }
        cancelAnimationFrame(zoomAnim.current);
        const from = view.current;
        const k0 = zoom.current; // цель подлёта считается для 1× — по пути возвращаемся к нему
        const dLon = ((to.lon - from.lon + 540) % 360) - 180; // короткой дорогой
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / FLY_MS);
          const e = 1 - Math.pow(1 - t, 3);
          zoom.current = k0 + (ZOOM_MIN - k0) * e;
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

  /** Плавно к масштабу k (кнопки «+ / −»). */
  const zoomTo = (k: number) => {
    cancelAnimationFrame(zoomAnim.current);
    const from = zoom.current;
    const to = clampZoom(k);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      zoom.current = to;
      requestDraw();
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ZOOM_MS);
      zoom.current = from + (to - from) * (1 - Math.pow(1 - t, 3));
      draw();
      if (t < 1) zoomAnim.current = requestAnimationFrame(step);
    };
    zoomAnim.current = requestAnimationFrame(step);
  };

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()];
    pinch.current = { dist0: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), k0: zoom.current };
    drag.current = null;
    cancelAnimationFrame(fly.current);
    cancelAnimationFrame(zoomAnim.current);
    boxRef.current?.setAttribute("data-dragging", "");
    onHover(null);
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    if (e.pointerType !== "mouse") {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size === 2) {
        e.currentTarget.setPointerCapture(e.pointerId);
        startPinch();
        return;
      }
      if (pinch.current) return;
    }
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      view: view.current,
      moved: false,
      target: (e.target as SVGElement).dataset.name ?? null,
    };
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = pinch.current;
    if (p) {
      const pts = [...pointers.current.values()];
      if (pts.length < 2) return;
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      zoom.current = clampZoom((p.k0 * dist) / p.dist0);
      requestDraw();
      return;
    }
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
    const deg = DEG_PER_UNIT / zoom.current; // приближенный шар крутится медленнее — под пальцем
    const lat = d.view.lat + dy * deg;
    setView({ lon: d.view.lon - dx * deg, lat: Math.min(latMax, Math.max(latMin, lat)) });
  };
  const endDrag = (e: PointerEvent<SVGSVGElement>, pick: boolean) => {
    pointers.current.delete(e.pointerId);
    if (pinch.current) {
      if (pointers.current.size < 2) {
        pinch.current = null;
        pointers.current.clear(); // оставшийся палец не продолжает поворот — только новое касание
        boxRef.current?.removeAttribute("data-dragging");
        requestDraw();
      }
      return;
    }
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      boxRef.current?.removeAttribute("data-dragging");
      requestDraw(); // точные контуры, дуги и точки — на новое место, затем плавно проявляются
    }
    if (pick && d && !d.moved && d.target) onPick(d.target);
  };

  const shownZone = zones.find((z) => z.zone === shown?.zone);

  return (
    <div ref={boxRef} className={s.globe}>
      <svg
        ref={svgRef}
        className={s.map}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, true)}
        onPointerCancel={(e) => endDrag(e, false)}
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

      <div className={s.tools}>
        <p className={cx("t-small", s.hint)}>
          <Move size={14} strokeWidth={1.75} aria-hidden="true" />
          Потяните, чтобы повернуть
        </p>
        <div className={s.zoom}>
          <button type="button" className={s.zoomBtn} onClick={() => zoomTo(zoom.current / ZOOM_STEP)}>
            <Minus size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="visually-hidden">Отдалить карту</span>
          </button>
          <button type="button" className={s.zoomBtn} onClick={() => zoomTo(zoom.current * ZOOM_STEP)}>
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="visually-hidden">Приблизить карту</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Дуга склад → город: большой круг, приподнятый над шаром (чем дальше город, тем выше). */
function arcPath(
  projection: GeoProjection,
  from: [number, number],
  to: [number, number],
): string {
  const interp = geoInterpolate(from, to);
  const h0 = 0.006 + Math.hypot(to[0] - from[0], to[1] - from[1]) * 0.0004;
  const pts: string[] = [];
  const [ox, oy] = projection.translate(); // центр шара: при приближении он сдвигается (11г)
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const p = projection(interp(t) as [number, number]);
    if (!p) continue;
    const k = 1 + h0 * Math.sin(Math.PI * t);
    pts.push(`${(ox + (p[0] - ox) * k).toFixed(1)},${(oy + (p[1] - oy) * k).toFixed(1)}`);
  }
  return `M${pts.join("L")}`;
}
