"use client";

import { useEffect, useRef, useState } from "react";
import { canPlayVideo } from "@/lib/device";
import { asset, srcSet } from "@/lib/asset";
import s from "./WorkshopVideo.module.css";

const POSTER = asset("/workshop/yard-poster.webp");
const VIDEO_DESKTOP = asset("/workshop/yard-1080.mp4");
const VIDEO_MOBILE = asset("/workshop/yard-540.mp4");
const MOBILE_QUERY = "(max-width: 640px)";

/**
 * Полоса во всю ширину между глобусом и объектами (чат 5в): склад металла с кран-эстакадами сверху,
 * ч/б, 21:9, цикл 6 с (Pexels, без подписи). Сетка B — текста внутри нет.
 * Постер сразу; файл выбирается и грузится за полтора экрана до блока; вне этой зоны — пауза.
 */
export function WorkshopVideo() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !canPlayVideo()) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (entry.isIntersecting) {
          setSrc((cur) => cur ?? (window.matchMedia(MOBILE_QUERY).matches ? VIDEO_MOBILE : VIDEO_DESKTOP));
          video?.play().catch(() => undefined);
        } else {
          video?.pause();
        }
      },
      { rootMargin: "150% 0px" } // начинаем грузить за полтора экрана, к подходу видео уже играет,
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure ref={ref} className={s.band} aria-hidden="true">
      <img
        className={s.media}
        src={POSTER}
        srcSet={srcSet("/workshop/yard-poster.webp", 1600, [800])}
        sizes="100vw"
        alt=""
        width={1600}
        height={686}
        decoding="async"
      />
      {src && (
        <video
          ref={videoRef}
          className={`${s.media} ${s.video} ${playing ? s.videoOn : ""}`}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onPlaying={() => setPlaying(true)}
        />
      )}
    </figure>
  );
}
