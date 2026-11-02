"use client";

import { type RefObject, useEffect } from "react";

/**
 * 11в: заранее загружает картинки скрытых частей блока (панели, портфолио, галереи),
 * когда блок подходит к экрану, — чтобы при раскрытии картинка уже была в кэше и раскодирована.
 * Берёт все `img[loading="lazy"]` внутри блока. Картинку с `data-preload-media="<media query>"`
 * грузит, только если запрос сейчас выполняется (не тянуть десктопные фото на телефон).
 * Браузер выбирает размер из того же srcset/sizes, поэтому на телефоне идут копии -640.
 */
export function usePreloadImages(ref: RefObject<HTMLElement | null>, rootMargin = "800px 0px") {
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
          const media = img.dataset.preloadMedia;
          if (media && !window.matchMedia(media).matches) return;
          const pre = new Image();
          if (img.sizes) pre.sizes = img.sizes;
          if (img.srcset) pre.srcset = img.srcset;
          pre.src = img.getAttribute("src") ?? "";
          pre.decode?.().catch(() => {});
          img.loading = "eager";
        });
      },
      { rootMargin },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [ref, rootMargin]);
}
