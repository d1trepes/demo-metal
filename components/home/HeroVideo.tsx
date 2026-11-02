"use client";

import { useEffect, useRef, useState } from "react";
import { canPlayVideo, isSlowConnection } from "@/lib/device";
import { asset } from "@/lib/asset";
import s from "./Hero.module.css";

const POSTER = asset("/video/hero-poster.webp");
const POSTER_MOBILE = asset("/video/hero-poster-mobile.webp");
const VIDEO_DESKTOP = asset("/video/hero-1080.mp4");
const VIDEO_MOBILE = asset("/video/hero-720.mp4");
const MOBILE_QUERY = "(max-width: 768px)";

/**
 * Фон hero. Сначала постер (он же LCP), видео начинает грузиться сразу после первой отрисовки
 * (не ждём загрузки всех картинок страницы — чат 10) и проявляется, когда реально заиграло.
 * Вне экрана — на паузе.
 */
export function HeroVideo() {
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Выбираем файл после первого кадра с постером: постер остаётся LCP, видео не ждёт картинок ниже.
  useEffect(() => {
    if (!canPlayVideo()) return;
    const mobile = window.matchMedia(MOBILE_QUERY).matches;
    // Телефон на 2g/3g — только постер; на 4g — 720p после первого кадра (чат 11б)
    if (mobile && isSlowConnection()) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setSrc(mobile ? VIDEO_MOBILE : VIDEO_DESKTOP));
    });
    return () => cancelAnimationFrame(frame);
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
