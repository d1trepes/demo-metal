"use client";

import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { asset, srcSet } from "@/lib/asset";
import { cx } from "@/lib/cx";
import type { ConstructionType } from "./constructionTypes";
import s from "./ConstructionPanels.module.css";

const DESKTOP = "(min-width: 1025px)";
/** Рендер в панели: до ~580 px на широком экране, до 90 % ширины на мобилке. */
const RENDER_SIZES = "(max-width: 1024px) 90vw, 580px";
const CAN_HOVER = "(min-width: 1025px) and (hover: hover)";
const HOVER_DELAY = 120; // мс: порог, чтобы панели не дёргались при пролёте курсора

/**
 * Раскрывающиеся панели 01–05 (реф. docs/refs/05-accordion-panels.png).
 * Десктоп: одна активная — тёмная и широкая, остальные светлые с «рентгеном» рендера;
 * раскрытие по наведению, клику и фокусу. ≤ 1024 px — список, раскрытие по нажатию.
 */
export function ConstructionPanels({ items: constructionTypes }: { items: ConstructionType[] }) {
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
    <ul
      className={s.panels}
      onMouseLeave={() => window.clearTimeout(hoverTimer.current)}
    >
      {constructionTypes.map((item, index) => {
        const isActive = active === index;
        const detailsId = `construction-${item.slug}`;
        const src = asset(`/constructions/${item.slug}.webp`);
        // «рентген» посчитан заранее скриптом scripts/xray-renders.py (SVG-фильтр тормозил анимацию)
        const xraySrc = asset(`/constructions/xray/${item.slug}.webp`);
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
                src={xraySrc}
                srcSet={srcSet(`/constructions/xray/${item.slug}.webp`, item.image.width)}
                sizes={RENDER_SIZES}
                alt=""
                {...item.image}
                loading="lazy"
                decoding="async"
              />
              <img
                className={s.render}
                src={src}
                srcSet={srcSet(`/constructions/${item.slug}.webp`, item.image.width)}
                sizes={RENDER_SIZES}
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
                <PanelTitle text={item.title} />
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
  );
}

/**
 * Заголовок панели: перенос фиксирован — первое слово, остальное второй строкой (чат 5е).
 * Так строка не перестраивается 2 → 1 при раскрытии панели. На мобилке строки идут подряд.
 */
function PanelTitle({ text }: { text: string }) {
  const [first, ...rest] = text.split(" ");
  return (
    <span className={s.title}>
      <span className={s.titleLine}>{first}</span>
      {rest.length > 0 && <span className={s.titleLine}> {rest.join(" ")}</span>}
    </span>
  );
}
