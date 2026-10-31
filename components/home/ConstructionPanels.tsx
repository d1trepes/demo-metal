"use client";

import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { asset } from "@/lib/asset";
import { cx } from "@/lib/cx";
import { constructionTypes } from "./constructionTypes";
import s from "./ConstructionPanels.module.css";

const DESKTOP = "(min-width: 1025px)";
const CAN_HOVER = "(min-width: 1025px) and (hover: hover)";
const HOVER_DELAY = 120; // мс: не дёргать панели, когда курсор просто проходит мимо

/**
 * Раскрывающиеся панели 01–05 (реф. docs/refs/05-accordion-panels.png).
 * Десктоп: одна активная — тёмная и широкая, остальные светлые с «рентгеном» рендера;
 * раскрытие по наведению, клику и фокусу. ≤ 1024 px — список, раскрытие по нажатию.
 */
export function ConstructionPanels() {
  const [active, setActive] = useState<number | null>(0);
  const hoverTimer = useRef<number | undefined>(undefined);

  const open = (index: number) => {
    window.clearTimeout(hoverTimer.current);
    setActive(index);
  };
  // На телефоне повторное нажатие сворачивает; на десктопе одна панель открыта всегда.
  const toggle = (index: number) => {
    const isDesktop = window.matchMedia(DESKTOP).matches;
    open(index);
    if (!isDesktop && active === index) setActive(null);
  };
  const hoverOpen = (index: number) => {
    if (!window.matchMedia(CAN_HOVER).matches) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActive(index), HOVER_DELAY);
  };

  return (
    <>
      <XrayFilter />
      <ul
        className={s.panels}
        onMouseLeave={() => window.clearTimeout(hoverTimer.current)}
      >
        {constructionTypes.map((item, index) => {
          const isActive = active === index;
          const detailsId = `construction-${item.slug}`;
          const src = asset(`/constructions/${item.slug}.webp`);
          return (
            <li
              key={item.slug}
              className={cx(s.panel, isActive && s.active)}
              onMouseEnter={() => hoverOpen(index)}
              onClick={(event) => {
                // клик по ссылке внутри панели — не перехватываем
                if ((event.target as HTMLElement).closest("a, button")) return;
                if (!isActive) open(index);
              }}
            >
              <span className={s.number} aria-hidden="true">
                {item.number}
              </span>

              <div className={s.art} aria-hidden="true">
                <img
                  className={s.xray}
                  src={src}
                  alt=""
                  {...item.image}
                  loading="lazy"
                  decoding="async"
                />
                <img
                  className={s.render}
                  src={src}
                  alt=""
                  {...item.image}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <h3 className={s.heading}>
                <button
                  type="button"
                  className={s.trigger}
                  aria-expanded={isActive}
                  aria-controls={detailsId}
                  onClick={() => toggle(index)}
                  onFocus={() => {
                    if (window.matchMedia(DESKTOP).matches) open(index);
                  }}
                >
                  <span className={s.mobileNumber} aria-hidden="true">
                    {item.number}
                  </span>
                  <span className={s.title}>{item.title}</span>
                  <ChevronDown className={s.chevron} aria-hidden="true" />
                </button>
              </h3>

              <div className={s.details} id={detailsId} inert={!isActive}>
                <div className={s.detailsInner}>
                  <div className={s.detailsBody}>
                    <p className={s.text}>{item.text}</p>
                    <dl className={s.specs}>
                      {item.specs.map((spec) => (
                        <div key={spec.label} className={s.spec}>
                          <dt>{spec.label}</dt>
                          <dd>{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <Button
                      href={`/constructions/#${item.slug}`}
                      variant="onInkOutline"
                      size="sm"
                    >
                      Рассчитать по чертежу
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/**
 * «Рентген» кодом: контуры рендера (Лаплас по яркости) тёмной линией
 * + полупрозрачная заливка самого объекта. Цвет линий — --color-ink-900 (#0e1013).
 */
function XrayFilter() {
  return (
    <svg className={s.filterDefs} aria-hidden="true" focusable="false">
      <filter id="xray" colorInterpolationFilters="sRGB">
        <feColorMatrix
          in="SourceGraphic"
          type="saturate"
          values="0"
          result="grayRaw"
        />
        {/* сглаживаем фактуру металла, иначе вместо контуров — шум */}
        <feGaussianBlur in="grayRaw" stdDeviation="1.2" result="gray" />
        <feConvolveMatrix
          in="gray"
          order="3"
          kernelMatrix="-1 -1 -1  -1 8 -1  -1 -1 -1"
          preserveAlpha="true"
          result="edgesA"
        />
        <feConvolveMatrix
          in="gray"
          order="3"
          kernelMatrix="1 1 1  1 -8 1  1 1 1"
          preserveAlpha="true"
          result="edgesB"
        />
        <feComposite
          in="edgesA"
          in2="edgesB"
          operator="arithmetic"
          k2="1"
          k3="1"
          result="edges"
        />
        {/* яркость краёв → непрозрачность тёмной линии */}
        <feColorMatrix
          in="edges"
          type="matrix"
          values="0 0 0 0 0.055  0 0 0 0 0.063  0 0 0 0 0.075  1.1 1.1 1.1 0 -0.04"
          result="lines"
        />
        <feComposite
          in="lines"
          in2="SourceAlpha"
          operator="in"
          result="linesIn"
        />
        {/* лёгкая «плёнка» объекта */}
        <feColorMatrix
          in="gray"
          type="matrix"
          values="0 0 0 0 0.055  0 0 0 0 0.063  0 0 0 0 0.075  0 0 0 0.07 0"
          result="film"
        />
        <feMerge>
          <feMergeNode in="film" />
          <feMergeNode in="linesIn" />
        </feMerge>
      </filter>
    </svg>
  );
}
