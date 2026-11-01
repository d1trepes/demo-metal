"use client";

import { useEffect, useState, type RefObject } from "react";
import { imagesReady } from "@/lib/imagesReady";

export type RevealState = "rest" | "waiting" | "in";

/**
 * Общая логика появления при прокрутке (Reveal, RevealList), чат 10:
 * 1. За ~экран до блока снимаем loading="lazy" с его картинок и раскодируем их заранее;
 * 2. когда блок входит в экран — показываем; картинки к этому моменту уже готовы,
 *    ждём их не дольше 250 мс (раньше было 700 мс и блок висел пустым).
 * Без JS, при reduced-motion и если блок уже на экране — просто виден.
 */
export function useReveal(ref: RefObject<HTMLElement | null>): RevealState {
  const [state, setState] = useState<RevealState>("rest");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setState("waiting");
    let ready: Promise<void> | null = null;
    const warm = () => {
      if (ready) return ready;
      el.querySelectorAll("img[loading='lazy']").forEach((img) => img.setAttribute("loading", "eager"));
      ready = imagesReady(el, 2000);
      return ready;
    };

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        warm();
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    const inView = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        inView.disconnect();
        const timeout = new Promise<void>((r) => window.setTimeout(r, 250));
        Promise.race([warm(), timeout]).then(() => setState("in"));
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    near.observe(el);
    inView.observe(el);
    return () => {
      near.disconnect();
      inView.disconnect();
    };
  }, [ref]);

  return state;
}
