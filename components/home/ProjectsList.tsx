"use client";

import { useRef, useState } from "react";
import { asset, srcSet } from "@/lib/asset";
import { cx } from "@/lib/cx";
import type { Project } from "./projectsData";
import s from "./ProjectsList.module.css";

const NB = " ";
const tons = (n: number) => n.toLocaleString("ru-RU").replace(/\s/g, NB);
const HOVER_DELAY = 120; // мс, как у панелей: строки не мигают при пролёте курсора

/**
 * Портфолио, вариант Б (чат 5б): слева список объектов, справа липкое фото и отзыв выбранного.
 * Выбор — наведением, фокусом, кликом. ≤ 1024 px липкой колонки нет: фото и отзыв раскрываются под строкой.
 * Тексты приходят уже после типографа (ProjectsSection).
 */
export function ProjectsList({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const current = projects[active];

  const select = (index: number, delay = 0) => {
    window.clearTimeout(timer.current);
    if (delay) timer.current = window.setTimeout(() => setActive(index), delay);
    else setActive(index);
  };

  return (
    <div className={s.layout}>
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
                onClick={() => select(index)}
                onFocus={() => select(index)}
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
              className={cx(index === active && s.shown)}
              src={asset(`/objects/${p.image}.webp`)}
              srcSet={srcSet(`/objects/${p.image}.webp`, 1312)}
              sizes="560px"
              alt={index === active ? p.name : ""}
              width={1312}
              height={816}
              loading="lazy"
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
