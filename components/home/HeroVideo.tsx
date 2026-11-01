"use client";

import { useEffect, useRef, useState } from "react";
import { canPlayVideo } from "@/lib/device";
import { asset } from "@/lib/asset";
import s from "./Hero.module.css";

const POSTER = asset("/video/hero-poster.webp");
const POSTER_MOBILE = asset("/video/hero-poster-mobile.webp");
const VIDEO_DESKTOP = asset("/video/hero-1440.mp4");
const VIDEO_MOBILE = asset("/video/hero-720.mp4");
const MOBILE_QUERY = "(max-width: 768px)";

/**
 * Фон hero. Сначала постер (он же LCP), видео подгружается после загрузки страницы
 * и проявляется, когда реально заиграло. Вне экрана — на паузе.
 */
export function HeroVideo() {
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Выбираем файл и начинаем грузить только после события load.
  useEffect(() => {
    if (!canPlayVideo()) return;
    const start = () => setSrc(window.matchMedia(MOBILE_QUERY).matches ? VIDEO_MOBILE : VIDEO_DESKTOP);
    if (document.readyState === "complete") {
      const t = window.setTimeout(start, 200);
      return () => window.clearTimeout(t);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  // Пауза, когда hero ушёл с экрана.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => undefined);
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className={s.media} aria-hidden="true">
      <picture>
        <source media={MOBILE_QUERY} srcSet={POSTER_MOBILE} />
        <img src={POSTER} alt="" className={s.mediaItem} fetchPriority="high" decoding="async" />
      </picture>
      {src && (
        <video
          ref={videoRef}
          className={`${s.mediaItem} ${s.video} ${playing ? s.videoOn : ""}`}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onPlaying={() => setPlaying(true)}
        />
      )}
    </div>
  );
}
