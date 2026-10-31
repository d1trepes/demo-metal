"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import s from "./GeoSection.module.css";

const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), { ssr: false });

/** Слабое устройство или экономия трафика — остаёмся на картинке. */
function prefersStatic(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return true;
  return (nav.hardwareConcurrency ?? 8) <= 4;
}

/**
 * Глобус: сначала статичная картинка того же вида (она же заглушка), canvas подгружается,
 * когда блок подходит к экрану (за 400 px), и плавно проявляется поверх.
 */
export function GlobeStage() {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersStatic()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setLoad(true);
        io.disconnect();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={s.globe} data-ready={ready || undefined}>
      <img
        src={asset("/globe/globe-static.webp")}
        alt="Глобус: склад в Екатеринбурге и направления отгрузки по России, Казахстану, Узбекистану и Беларуси"
        width={1600}
        height={1600}
        loading="lazy"
        decoding="async"
        className={s.still}
      />
      {load && <GlobeCanvas onReady={onReady} />}
    </div>
  );
}
