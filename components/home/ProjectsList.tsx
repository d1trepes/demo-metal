"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { projects, type Project } from "./projectsData";
import s from "./ProjectsList.module.css";

const tons = (n: number) => `${n.toLocaleString("ru-RU")} т`;

/**
 * Список объектов слева, карточка выбранного справа (≥ 1025 px).
 * ≤ 1024 px карточка раскрывается под строкой. Выбор — наведением (как панели), кликом, фокусом.
 */
export function ProjectsList() {
  const [active, setActive] = useState(projects[0].slug);
  const current = projects.find((p) => p.slug === active) ?? projects[0];

  return (
    <div className={s.layout}>
      <ul className={s.list}>
        {projects.map((p) => {
          const isActive = p.slug === active;
          return (
            <li key={p.slug} className={cx(s.item, isActive && s.active)}>
              <button
                type="button"
                className={s.row}
                aria-expanded={isActive}
                aria-controls={`project-${p.slug}`}
                onClick={() => setActive(p.slug)}
                onFocus={() => setActive(p.slug)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.slug)}
              >
                <span className={cx("t-label", s.year)}>
                  {p.year} · {p.city}
                </span>
                <span className={s.name}>{p.name}</span>
                <span className={s.scope}>{p.scope}</span>
                <span className={cx("t-nums", s.tons)}>{tons(p.tonnage)}</span>
              </button>
              {/* Телефон и планшет: подробности под строкой */}
              <div id={`project-${p.slug}`} className={s.inline} hidden={!isActive}>
                <ProjectDetails project={p} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className={s.panel} aria-live="polite">
        <ProjectDetails key={current.slug} project={current} big />
      </div>
    </div>
  );
}

function ProjectDetails({ project, big }: { project: Project; big?: boolean }) {
  return (
    <article className={cx(s.details, big && s.detailsBig)}>
      {big && (
        <p className={cx("t-nums", s.bigTons)}>
          {project.tonnage.toLocaleString("ru-RU")}
          <span>т</span>
        </p>
      )}
      <dl className={s.facts}>
        {project.facts.map((f) => (
          <div key={f.label} className={s.fact}>
            <dt className={cx("t-label", s.factLabel)}>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      <figure className={s.review}>
        <blockquote className={s.quote}>
          <p>«{project.review.text}»</p>
        </blockquote>
        <figcaption className={s.author}>
          <strong>{project.review.author}</strong>
          <span className="t-muted">
            {project.review.role}, {project.review.company}
          </span>
        </figcaption>
      </figure>
    </article>
  );
}
