"use client";
import { useState } from "react";
import { asset, srcSet } from "@/lib/asset";
import { cx } from "@/lib/cx";
import s from "./ProductGallery.module.css";

type Props = { image: string; imageEnd: string; name: string };

/**
 * Галерея карточки: 1 — рендер позиции (прозрачный фон), 2 — торец крупным планом (белый фон
 * растворяется в подложке через mix-blend-mode: multiply, см. scripts/cutout-assets-6.py).
 */
export function ProductGallery({ image, imageEnd, name }: Props) {
  const slides = [
    { src: image, full: 1049, h: 812, alt: name, kind: "render" as const, label: "Общий вид" },
    { src: imageEnd, full: 1200, h: 896, alt: `${name}: сечение крупным планом`, kind: "end" as const, label: "Сечение" },
  ];
  const [active, setActive] = useState(0);
  const current = slides[active];

  return (
    <div className={s.gallery}>
      <div className={cx(s.stage, current.kind === "end" && s.stageEnd)}>
        <img
          key={current.src}
          src={asset(current.src)}
          srcSet={srcSet(current.src, current.full, [640])}
          sizes="(max-width: 1024px) 100vw, 56vw"
          alt={current.alt}
          width={current.full}
          height={current.h}
          fetchPriority={active === 0 ? "high" : undefined}
          decoding="async"
        />
      </div>
      <div className={s.thumbs} role="group" aria-label="Изображения позиции">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            className={cx(s.thumb, slide.kind === "end" && s.thumbEnd)}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
          >
            <img src={asset(slide.src.replace(/\.webp$/, slide.kind === "end" ? "-640.webp" : "-400.webp"))} alt="" width={120} height={90} loading="lazy" />
            <span>{slide.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
