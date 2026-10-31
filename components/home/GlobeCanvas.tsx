"use client";

import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";
import { arcPoints, isVisible, makeRotation, toVec, type Vec3 } from "./globeMath";
import { destinations, globeView, warehouse } from "./globeData";
import s from "./GeoSection.module.css";

/** Покачивание вокруг вида по умолчанию: ±ROCK° по долготе, период PERIOD мс. Россия всегда в кадре. */
const ROCK = 18;
const PERIOD = 60000;
/** Дуги прорисовываются при первом показе. */
const ARC_DRAW_MS = 1400;

type Land = { vecs: Vec3[]; ship: Uint8Array };

/**
 * 3D-глобус на canvas 2D (чат 5): точки суши, страны отгрузки темнее, дуги от склада.
 * Грузится лениво (GlobeStage → dynamic, ssr: false). Медленно покачивается, на наведении стоит,
 * вне экрана не рисует. Цвета берёт из токенов.
 */
export default function GlobeCanvas({ onReady }: { onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let land: Land | null = null;
    let raf = 0;
    let visible = true;
    let hovered = false;
    let phase = 0; // накопленное время покачивания, мс
    let last = 0;
    let started = 0;
    let readySent = false;

    const css = getComputedStyle(canvas);
    const color = (name: string) => css.getPropertyValue(name).trim();
    const c = {
      sphere: color("--color-surface"),
      land: color("--globe-land"),
      ship: color("--color-accent"),
      arc: color("--color-text"),
      white: color("--color-white"),
    };

    const home = toVec(warehouse.lat, warehouse.lon);
    const arcs = destinations.map((d) => arcPoints(home, toVec(d.lat, d.lon)));
    const cities = destinations.map((d) => toVec(d.lat, d.lon));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = canvas.clientWidth;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
    };

    const draw = (now: number) => {
      if (!land) return;
      const dt = last ? Math.min(now - last, 50) : 0;
      last = now;
      if (!hovered) phase += dt;
      if (!started) started = now;

      const W = canvas.width;
      const R = W / 2 - 1;
      const cx = W / 2;
      const cy = W / 2;
      const rot = makeRotation(globeView.lat, globeView.lon + ROCK * Math.sin((phase / PERIOD) * Math.PI * 2));
      const dot = Math.max(1.5, W / 230);

      ctx.clearRect(0, 0, W, W);
      ctx.fillStyle = c.sphere;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Суша: сначала обычные страны, потом страны отгрузки (поверх, темнее)
      for (const pass of [0, 1]) {
        ctx.fillStyle = pass ? c.ship : c.land;
        for (let i = 0; i < land.vecs.length; i++) {
          if (land.ship[i] !== pass) continue;
          const p = rot(land.vecs[i]);
          if (p[2] <= 0.02) continue;
          const sz = dot * (0.45 + 0.55 * p[2]); // к краю точки мельче — объём
          ctx.fillRect(cx + p[0] * R - sz / 2, cy - p[1] * R - sz / 2, sz, sz);
        }
      }

      // Дуги: прорисовываются один раз, дальше стоят
      const progress = Math.min(1, (now - started) / ARC_DRAW_MS);
      ctx.strokeStyle = c.arc;
      ctx.lineWidth = Math.max(1, W / 900);
      for (const arc of arcs) {
        const n = Math.max(1, Math.round(arc.length * progress));
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i < n; i++) {
          const p = rot(arc[i]);
          if (!isVisible(p)) {
            pen = false;
            continue;
          }
          const x = cx + p[0] * R;
          const y = cy - p[1] * R;
          if (pen) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
          pen = true;
        }
        ctx.stroke();
      }

      // Города — чёрные точки, склад — белая с чёрной обводкой (DESIGN.md)
      ctx.fillStyle = c.ship;
      for (const v of cities) {
        const p = rot(v);
        if (p[2] <= 0) continue;
        ctx.beginPath();
        ctx.arc(cx + p[0] * R, cy - p[1] * R, dot * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      const h = rot(home);
      if (h[2] > 0) {
        ctx.beginPath();
        ctx.arc(cx + h[0] * R, cy - h[1] * R, dot * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = c.white;
        ctx.fill();
        ctx.lineWidth = dot * 1.1;
        ctx.strokeStyle = c.ship;
        ctx.stroke();
      }

      if (!readySent) {
        readySent = true;
        onReady();
      }
    };

    const loop = (now: number) => {
      draw(now);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!raf && land) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);

    const onEnter = () => (hovered = true);
    const onLeave = () => (hovered = false);
    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);

    let cancelled = false;
    fetch(asset("/globe/land.bin"))
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (cancelled) return;
        const raw = new Int16Array(buf);
        const count = raw.length / 3;
        const vecs: Vec3[] = new Array(count);
        const ship = new Uint8Array(count);
        for (let i = 0; i < count; i++) {
          vecs[i] = toVec(raw[i * 3] / 100, raw[i * 3 + 1] / 100);
          ship[i] = raw[i * 3 + 2];
        }
        land = { vecs, ship };
        start();
      })
      .catch(() => {
        /* остаётся статичная картинка */
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [onReady]);

  return <canvas ref={canvasRef} className={s.canvas} aria-hidden="true" />;
}
