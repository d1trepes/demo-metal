"use client";

import { useRef, useState } from "react";
import { asset, srcSet } from "@/lib/asset";
import { cx } from "@/lib/cx";
import { usePreloadImages } from "@/lib/usePreloadImages";
import type { Project } from "./projectsData";
import s from "./ProjectsList.module.css";

const NB = " ";
const tons = (n: number) => n.toLocaleString("ru-RU").replace(/\s/g, NB);
const DESKTOP = "(min-width: 1025px)";
const HOVER_DELAY = 120; // мс, как у панелей: строки не мигают при пролёте курсора

/**
 * Портфолио, вариант Б (чат 5б): слева список объектов, справа липкое фото и отзыв выбранного.
 * Выбор — наведением, фокусом, кликом. ≤ 1024 px липкой колонки нет: фото и отзыв раскрываются под строкой.
 * Тексты приходят уже после типографа (ProjectsSection).
 */
export function ProjectsList({ projects }: { projects: Project[] }) {
  // null — все строки свёрнуты (только ≤ 1024 px); липкая колонка десктопа показывает последнюю выбранную
  const [active, setActive] = useState<number | null>(0);
  const [shown, setShown] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const layoutRef = useRef<HTMLDivElement>(null);
  const current = projects[shown];
  // 11в: фото скрытых строк — заранее, при подходе блока к экрану
  usePreloadImages(layoutRef);

  const select = (index: number, delay = 0) => {
    window.clearTimeout(timer.current);
    const apply = () => {
      setActive(index);
      setShown(index);
    };
    if (delay) timer.current = window.setTimeout(apply, delay);
    else apply();
  };
  // 11в: на телефоне и планшете повторное нажатие на открытую строку её закрывает
  const toggle = (index: number) => {
    if (active === index && !window.matchMedia(DESKTOP).matches) {
      window.clearTimeout(timer.current);
      setActive(null);
    } else select(index);
  };

  return (
    <div ref={layoutRef} className={s.layout}>
      <ul className={s.list} onMouseLeave={() => window.clearTimeout(timer.current)}>
        {projects.map((p, index) => {
          const isActive = index === active;
          return (
            <li
              key={p.slug}
              className={cx(s.item, isActive && s.active)}
              onMouseEnter={() => {
                if (window.matchMedia("(hover: hover) and (min-width: 1025px)").matches) select(index, HOVER_DELAY);
              }}
            >
              <button
                type="button"
                className={s.row}
                aria-expanded={isActive}
                aria-controls={`project-${p.slug}`}
                onClick={() => toggle(index)}
                // фокус с клавиатуры выбирает строку; от нажатия пальцем — нет, иначе клик сразу закрыл бы её
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) select(index);
                }}
              >
                <span className={s.where}>
                  {p.year} · {p.city}
                </span>
                <span className={s.name}>{p.name}</span>
                <span className={s.scope}>{p.scope}</span>
                <span className={s.tons}>
                  {tons(p.tonnage)}
                  <small>т</small>
                </span>
              </button>

              {/* ≤ 1024 px: фото и отзыв под строкой */}
              <div id={`project-${p.slug}`} className={s.inline} hidden={!isActive}>
                <img
                  className={s.inlinePhoto}
                  src={asset(`/objects/${p.image}.webp`)}
                  srcSet={srcSet(`/objects/${p.image}.webp`, 1312)}
                  sizes="100vw"
                  alt={p.name}
                  width={1312}
                  height={816}
                  loading="lazy"
                  data-preload-media="(max-width: 1024px)"
                  decoding="async"
                />
                <Review project={p} />
              </div>
            </li>
          );
        })}
      </ul>

      {/* ≥ 1025 px: липкая колонка. Все фото лежат стопкой, меняется только opacity — без перезагрузки */}
      <div className={s.aside} aria-live="polite">
        <div className={s.photo}>
          {projects.map((p, index) => (
            <img
              key={p.slug}
              className={cx(index === shown && s.shown)}
              src={asset(`/objects/${p.image}.webp`)}
              srcSet={srcSet(`/objects/${p.image}.webp`, 1312)}
              sizes="560px"
              alt={index === shown ? p.name : ""}
              width={1312}
              height={816}
              loading="lazy"
              data-preload-media={DESKTOP}
              decoding="async"
            />
          ))}
        </div>
        <Review key={current.slug} project={current} className={s.fade} />
      </div>
    </div>
  );
}

function Review({ project, className }: { project: Project; className?: string }) {
  const { review } = project;
  return (
    <figure className={cx(s.review, className)}>
      <blockquote className={s.quote}>«{review.text}»</blockquote>
      <figcaption className={s.who}>
        <b>{review.author}</b>, {review.role}, {review.company}
      </figcaption>
    </figure>
  );
}
